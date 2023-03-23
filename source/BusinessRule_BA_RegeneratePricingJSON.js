/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegeneratePricingJSON",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_RegeneratePricingJSON",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Equipment_Revision", "Kit_Revision", "Product", "Product_Kit", "Product_Revision", "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "priceUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ItemPriceUpdated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,liveQueue,priceUpdated,BL_Library,BL_MaintenanceWorkflows) {
var wipRevision = BL_MaintenanceWorkflows.getWIPRevision(node);
var revisionsInReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(node, "Revision_Release_Workflow");

if(wipRevision == null && revisionsInReleaseWF.length == 0) {
	liveQueue.queueDerivedEvent(priceUpdated, node);
}
}