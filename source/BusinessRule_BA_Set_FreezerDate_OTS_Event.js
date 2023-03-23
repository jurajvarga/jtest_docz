/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_FreezerDate_OTS_Event",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Set_FreezerDate_OTS_Event",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "contract" : "EventQueueBinding",
    "alias" : "freezerDateOTSQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "freezerDateOTSUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "FreezerDateOTSUpdated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,freezerDateOTSQueue,freezerDateOTSUpdated,BL_Library) {
//STEP-5854
var workflowType = node.getValue("Workflow_Type").getSimpleValue();
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
var wfInstance = node.getWorkflowInstanceByID("Production_Workflow");
var wfTaskState = "";

if (wfInstance != null) {
   wfTaskState = BL_Library.getCurrentTaskState(wfInstance);
}

if (workflowType == "M" && wfInitiatedNo == "2" && wfInstance && wfTaskState == "Exit") {
   //clear freezer date in IDM - create event
   freezerDateOTSQueue.queueDerivedEvent(freezerDateOTSUpdated, node);
}
}