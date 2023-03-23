/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CancelAuditAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Workflow Auditing" ],
  "name" : "BA_CancelAuditAction",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
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
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventCreated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditMessageQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditMessageQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,auditEventCreated,auditMessageQueueApproved,auditMessageQueueMain,BL_AuditUtil) {
//STEP-5929
var worflowinstances=node.getWorkflowInstances()
var cValsItr = worflowinstances.iterator();
var workflow;

while (cValsItr.hasNext()) {
   var cVal = cValsItr.next();
   //log.info(cVal.getWorkflow().getID())
   workflow=cVal.getWorkflow();
   break;
}

BL_AuditUtil.buildAndSetAuditMessage(node, manager, workflow, null, true);


//Find Approval Status and post in correct queue
var approvalStatus = node.getApprovalStatus()
if (approvalStatus == "Completely Approved") {
    auditMessageQueueApproved.queueDerivedEvent(auditEventCreated, node);
} else {
    auditMessageQueueMain.queueDerivedEvent(auditEventCreated, node);
}
}