/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PAG_Updates_Needed",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA PAG Updates Needed",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
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
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "workflow",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,workflow,logger,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil) {
node.getValue("Figure_Status").setSimpleValue("Change Needed");
node.getValue("Figure_AM_Assign").setSimpleValue("");

if (node.isInWorkflow("WF4_App_Mgr_PC_Review_Workflow")){
	//STEP-5929 && 5993
	//Set Audit for Child Figure Folder
	BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"WF4_App_Mgr_PC_Review_Workflow","Submit_Action","PAG_Updates_Needed","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved)
	//STEP-5929 && 5993
	var wf = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
	wf.delete("");
}

var productFolder = node.getParent();

if (!productFolder.isInWorkflow("PAG_App_Mgr_PC_Review_Workflow")){
	productFolder.startWorkflowByID("PAG_App_Mgr_PC_Review_Workflow", "");
}
}