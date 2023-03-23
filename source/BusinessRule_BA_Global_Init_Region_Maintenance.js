/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Init_Region_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_Global_Init_Region_Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
  "allObjectTypesValid" : false,
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
exports.operation0 = function (node,manager,webui,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows) {
var selectedMs = node.getValue("MasterStock_Selected").getSimpleValue();
var msCodeOK = false;

if (selectedMs) {
    var children = node.getParent().getChildren().iterator();

    while (children.hasNext()) {
        var child = children.next();

        if (child.getObjectType().getID() == "MasterStock") {
            var ms = child.getValue("MASTERITEMCODE").getSimpleValue();

            if (ms == selectedMs) {
                msCodeOK = true;
                var msCode = node.getValue("PRODUCTNO").getSimpleValue() + selectedMs;
                var pMasterStock = manager.getNodeHome().getObjectByKey("MASTERSTOCKNO", msCode);
    
                if (pMasterStock) {
                    var highestRevToMS = BL_Library.getLatestAssociatedRevision(pMasterStock);
    
                    if (highestRevToMS) {
                        var initWF = manager.getWorkflowHome().getWorkflowByID("Regional_Initiation_Workflow");
    
                        if (initWF) {
                            var workflowInstance = node.getWorkflowInstance(initWF);
    
                            if (workflowInstance) {
                                workflowInstance.delete("Success - Maintenance Cancelled - Remove from Regional Maintenance Workflow");
                                   //STEP-6061
						BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,initWF.getID(),"Cancel_Action","Regional_Initiation_Maintenance_Cancel","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
						//STEP-6061
                            }
                        }
    
                        BL_MaintenanceWorkflows.updateRegionalRevision(manager, node, highestRevToMS);
                        node.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + node.getValue("Workflow_Name_Initiated").getSimpleValue());
                        webui.navigate("homepage", null);
                    }
                    else {
                        webui.showAlert("WARNING", "Revision", "Couldn't find any revision with reference to the selected MasterStock.");
                    }
                }
                else {
                    webui.showAlert("WARNING", "MasterStock", "Selected MasterStock was not found.");
                }
            }
        }
    }
}

if(!msCodeOK) {
    webui.showAlert("WARNING", "Wrong MasterStock Code", "Please select one of available MasterStock codes.");
}
}