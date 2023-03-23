/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Generate_Maintenace_Revision_Events",
  "type" : "BusinessAction",
  "setupGroups" : [ "RoutingBR" ],
  "name" : "BA_Generate_Maintenace_Revision_Events",
  "description" : "To Generate Maintenance Events",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
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
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "maintenanceWorkflowInitiated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "MaintenanceWorkflowInitiated",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "maintenanceWorkflowCanceled",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "MaintenanceWorkflowCanceled",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "maintenanceWorkflowCompleted",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "MaintenanceWorkflowCompleted",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,wipBFQueue,maintenanceWorkflowInitiated,maintenanceWorkflowCanceled,maintenanceWorkflowCompleted,LibMaintenance) {
var revisionStatus=node.getValue("REVISIONSTATUS").getSimpleValue();

log.info("revisionStatus"+revisionStatus);

if (revisionStatus=="In-process"){
 //Send to Backfeed queue for capturing Maintenance Start event
    wipBFQueue.queueDerivedEvent(maintenanceWorkflowInitiated, node);
}else if (revisionStatus=="Canceled"){
	 //Send to Backfeed queue for capturing Maintenance Cancel event
    wipBFQueue.queueDerivedEvent(maintenanceWorkflowCanceled, node);
}else if (revisionStatus=="Approved"){
	//Send to Backfeed queue for capturing Maintenance Complete event
    wipBFQueue.queueDerivedEvent(maintenanceWorkflowCompleted, node);
}
}