/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_LegalStatementAddItem",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_LegalStatementAddItem",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "ba_approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthrough",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,ba_approve,liveQueue,webPassthrough,bl_library) {
/*
 * STEP-6720
 * 
 * push new item with ID "Alexa License (K-00436) (Sourced Conj)" with appropriate value from the LOV
 * 
 */

var lovID = "PRODSTATEMENTLEGALLOV";
var newLOVItemID = "Alexa License (K-00436) (Sourced Conj)";
//var newLOVItemID = "AL(SC)Test";
var newLOVItem = manager.getListOfValuesHome().getListOfValuesByID(lovID).getListOfValuesValueByID(newLOVItemID);

if (newLOVItem) {
	log.info("New LOV Item exists."+newLOVItem.getValue());
} else {
	log.info("There is no new value in LOV.");
	return;
}

var AttrID = "LEGALSTATEMENT";  // Attribute to search for
var productno = node.getValue("PRODUCTNO").getValue();
var legalStatement = node.getValue(AttrID); 

if(legalStatement){
	legalStatement.addValue(newLOVItem.getValue());
	if(node.getValue("REVISIONSTATUS").getSimpleValue() != "In-process"){
         ba_approve.execute(node);
     }   
 }
	
liveQueue.queueDerivedEvent(webPassthrough, node.getParent());
}