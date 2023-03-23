/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Production_Review_Complete",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Production_Review_Complete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "shortNameChange",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ShortNameChange",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "npiRevisionCreated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "NPIRevisionCreated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wipBFQueue,shortNameChange,busCond,npiRevisionCreated) {
var condResult=busCond.evaluate(node);
var isNewWorkflow=condResult.isAccepted();
log.info(" isNewWorkflow "+ isNewWorkflow);

if (isNewWorkflow){
  wipBFQueue.queueDerivedEvent(shortNameChange, node);
  //NPI Revision Created should be added only ,if it is production workflow not on supplychain workflow
	if (node.isInWorkflow("Production_Workflow")) {
	  wipBFQueue.queueDerivedEvent(npiRevisionCreated, node);
	}
}
}