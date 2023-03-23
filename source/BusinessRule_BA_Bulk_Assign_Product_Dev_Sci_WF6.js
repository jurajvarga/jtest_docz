/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Assign_Product_Dev_Sci_WF6",
  "type" : "BusinessAction",
  "setupGroups" : [ "Bulk_Assign_WF6_Content_Review_WF" ],
  "name" : "BA Bulk Assign Product Dev Sci WF6",
  "description" : "Webui Bulk Update rule for reassigning Content Review Workflow, Dev Sci Review state",
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "BL_WorkflowUtil"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Product_Dev_Sci_Assignee",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Product_Dev_Sci_Assignee</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">Product_Dev_Sci_Assignee</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
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
exports.operation0 = function (Product_Dev_Sci_Assignee,node,manager,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_WorkflowUtil) {
var wfID = "WF6_Content_Review_Workflow";
var stateID = "Dev_Sci_Review";
var userID = Product_Dev_Sci_Assignee;

BL_WorkflowUtil.assignToUser(manager, node, wfID, stateID, userID, false, auditEventType, auditQueueMain, auditQueueApproved);
}