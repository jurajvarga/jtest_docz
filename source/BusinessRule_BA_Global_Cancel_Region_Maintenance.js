/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Cancel_Region_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_Global_Cancel_Region_Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
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
exports.operation0 = function (node,manager,webui,BA_Approve,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil) {
var initWF = manager.getWorkflowHome().getWorkflowByID("Regional_Initiation_Workflow");

if (initWF) {
    var workflowInstance = node.getWorkflowInstance(initWF);

    if(workflowInstance) {
        workflowInstance.delete("Success - Maintenance Cancelled - Remove from Regional Maintenance Workflow");

         //STEP-6061
		BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,initWF.getID(),"Cancel_Action","Regional_Initiation_Maintenance_Cancel","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
		//STEP-6061
    }
}

node.getValue("REVISIONSTATUS").setSimpleValue("Canceled");
node.getValue("MasterStock_Selected").setSimpleValue(null);
node.getValue("MasterStocks_Available").setSimpleValue(null);

BA_Approve.execute(node);

webui.showAlert("INFO", "Item updated", "Maintenance request has been cancelled.");
webui.navigate("homepage", null);
}