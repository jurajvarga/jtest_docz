/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Regional_Events",
  "type" : "BusinessAction",
  "setupGroups" : [ "OutboundEvents" ],
  "name" : "BA Regional Events Complete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
    "alias" : "regionalRevisionCompleted",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "RegionalRevisionCompleted",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,wipBFQueue,regionalRevisionCompleted,baResetAuditInstanceID,baApprove,LibMaintenance) {
//STEP-6005
baResetAuditInstanceID.execute(node);
baApprove.execute(node);
logger.info(" regionalRevisionCompleted "+node)
//STEP-6005
wipBFQueue.queueDerivedEvent(regionalRevisionCompleted, node);
}