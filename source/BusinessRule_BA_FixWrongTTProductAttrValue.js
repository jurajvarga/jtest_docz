/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_FixWrongTTProductAttrValue",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_FixWrongTTProductAttrValue",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productBGUpdatedQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthroughChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,baApprove,productBGUpdatedQueue,webPassthroughChanges,BL_CopyRevision,BL_MaintenanceWorkflows,libWF) {
//var prodSourcePurif = node.getValue("SOURCEPURIF").getSimpleValue() + "";
//var prodSpecSensiv = node.getValue("SPECIFSENSIV").getSimpleValue() + "";
var prodStorage = node.getValue("STORAGE").getSimpleValue() + "";

//log.info(" prodSourcePurif " + prodSourcePurif);
//log.info(" prodSpecSensiv " + prodSpecSensiv);
log.info(" prodStorage " + prodStorage);

var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);
//var prodCurRevReferences = node.getParent().getReferences(prodCurRevReferenceType);
 if (prodCurRevReferences && prodCurRevReferences.size() > 0) {
             
	 revision = prodCurRevReferences.get(0).getTarget();
	// var revSourcePurif = revision.getValue("SOURCEPURIF").getSimpleValue() + "";
	//var revSpecSensiv = revision.getValue("SPECIFSENSIV").getSimpleValue() + "";
	var revStorage = revision.getValue("STORAGE").getSimpleValue() + "";

	//var revStorage =  "";

	//log.info(" revSourcePurif " + revSourcePurif);
	//log.info(" revSpecSensiv " + revSpecSensiv);
	log.info(" revStorage " + revStorage);
	 if (revStorage!=null && revStorage.toUpperCase()!="see STEP for current information".toUpperCase()){
    log.info(" revStorage in " + revStorage);
	node.getValue("STORAGE").setSimpleValue(revStorage)
	baApprove.execute(node)
	 }
	/*revision.getValue("STORAGE").setSimpleValue(revStorage)
	baApprove.execute(revision)*/
	//productBGUpdatedQueue.queueDerivedEvent(webPassthroughChanges, node);
}
}