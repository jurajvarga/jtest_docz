/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Cancel",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Cancel",
  "description" : "Webui Bulk update rule to initiate product into Price Change Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBABusinessAction",
  "parameters" : [ {
    "id" : "ReferencedBA",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "BA_Workflow_Cancel_Email"
  } ],
  "pluginType" : "Operation"
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
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "revertMS",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_RevertNodes",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCancelAuditAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CancelAuditAction",
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetCatalogReady",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCatalogReadyFlag",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation1 = function (node,manager,wf,web,revertMS,baGenerateMaintenanceRevisionEvents,baResetAuditInstanceID,baCancelAuditAction,auditEventType,auditQueueMain,auditQueueApproved,busActSetCatalogReady,BL_AuditUtil,BL_CopyRevision,Lib) {
var businessRule = "Business Rule: BA_Cancel";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var workflowType = node.getValue("Workflow_Type").getSimpleValue();
log.info(Lib.logRecord([" workflowType :", businessRule, currentObjectID, currentDate, workflowType]));
var objType = node.getObjectType().getID();

if (workflowType == "M") {
    var parent = node.getParent();

    //STEP-6269 Check if US or Regional Revision
    if (objType != 'Regional_Revision') {
        // STEP-5796 - remove revision from all wf
        var arrayWorkflow = ["WF6_Content_Review_Workflow",
            "Production_Workflow",
            "SDS-DG Workflow",
            "WF3B_Supply-Chain",
            "Marketing_Review_Workflow",
            "WF4-Dummy"
        ];

        for (var i = 0; i < arrayWorkflow.length; i++) {
            var workflow = manager.getWorkflowHome().getWorkflowByID(arrayWorkflow[i]);
            if (workflow) {
                var workflowInstance = node.getWorkflowInstance(workflow);
                if (workflowInstance) {
                	var sourceStateID = Lib.getCurrentTaskState(workflowInstance);
                    workflowInstance.delete("Success - Maintenance Cancelled - Remove from Product Maintenance Workflow");
                    //STEP-6061
                    BL_AuditUtil.buildAndSetAuditMessageForAction(node, manager, workflow.getID(), "Cancel_Action", "Cancel_Maintenance", sourceStateID, "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved);
                    //STEP-6061
                }
            }
        }

        // STEP-5796 - remove product folder + figure folder from their wfs
        var productFolderRef = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");

        if (productFolderRef != null) {
            var links = node.queryReferences(productFolderRef); //STEP-6396

            links.forEach(function(link) { //STEP-6396             
                var productFolder = link.getTarget();

                if (productFolder.isInWorkflow("PAG_App_Mgr_PC_Review_Workflow")) {
                    var wfPAG = productFolder.getWorkflowInstanceByID("PAG_App_Mgr_PC_Review_Workflow");
                    if (wfPAG) {
                        var sourceStateID = Lib.getCurrentTaskState(wfPAG);
                        wfPAG.delete("Product Folder removed from the workflow because maintenance workflow has been cancelled.");
                        //STEP-6061
                        BL_AuditUtil.buildAndSetAuditMessageForAction(productFolder, manager, "PAG_App_Mgr_PC_Review_Workflow", "Cancel_Action", "Cancel_Maintenance", sourceStateID, "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved);
                        //STEP-6061
                    }
                }

                var figureFolders = productFolder.getChildren();
                var figureFoldersItr = figureFolders.iterator();

                while (figureFoldersItr.hasNext()) {
                    var figureFolder = figureFoldersItr.next();

                    if (figureFolder.getObjectType().getID() == "Figure_Folder" && figureFolder.isInWorkflow("WF4_App_Mgr_PC_Review_Workflow")) {
                        var wfAppMgr = figureFolder.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
                        if (wfAppMgr) {
                        	   var sourceStateID = Lib.getCurrentTaskState(wfAppMgr);
                            wfAppMgr.delete("Figure Folder removed from the workflow because maintenance workflow has been cancelled.");
                            //STEP-6061
                            BL_AuditUtil.buildAndSetAuditMessageForAction(figureFolder, manager, "WF4_App_Mgr_PC_Review_Workflow", "Cancel_Action", "Cancel_Maintenance", sourceStateID, "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved);
                            //STEP-6061
                        }
                    }
                }
                return true; //STEP-6396
            });
        }
        
        var refs = parent.getProductReferences()
        var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision")
        var p2wipRefs = refs.get(p2wipRefType)

        // remove reference to wip revision
        if (p2wipRefs) {
            if (p2wipRefs.size() == 1) {
                var p2wipRef = p2wipRefs.get(0)
                log.info(p2wipRef);
                p2wipRef.delete();
            }
        }

        if(node.getValue("Workflow_No_Initiated").getSimpleValue() == "2") { // STEP-5841, set Freezer_Date_Check back
            var product = node.getParent();
            var productApproved = Lib.getApprovedNode(step = manager, obj = product);
            product.getValue("Freezer_Date_Check").setSimpleValue(productApproved.getValue("Freezer_Date_Check").getSimpleValue());
        }
    }

    //Set Revision Status to Cancel
    node.getValue("REVISIONSTATUS").setSimpleValue("Canceled");

    //STEP-6341, STEP-6645 Clear Shipping Condition Original attribute
    var masterStock = Lib.getMasterStockForRevision(manager, node);
    var skus = masterStock.queryChildren();

    skus.forEach( function (sku) {
    		sku.getValue("Shipping_Conditions_Original").setSimpleValue(null);
    		return true;	
    });
    //STEP-6341, STEP-6645 end

    //Changes Done for STEP- 5564 Starts
    //Send to Backfeed queue for capturing Maintenance cancel event before Approval as outbound looks only Main workspace.
    baGenerateMaintenanceRevisionEvents.execute(node);

    //Changes Done for STEP- 5564 Ends

    // remove from workflow
    var wi = node.getWorkflowInstance(wf)

    if (wi) {
    	   var sourceStateID = Lib.getCurrentTaskState(wi);
        wi.delete("Success - Remove from Product Maintenance Workflow");
          //STEP-6061
          BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,wf.getID(),"Cancel_Action","Cancel_Maintenance",sourceStateID,"Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
          //STEP-6061
    }

    

/*  Commented since duplicate entries are made from other statements
        //Changes done for STEP-5929 starts
        baCancelAuditAction.execute(node);
        //Changes done for STEP-5929 ends
*/

    try {

        //Changes done for STEP-5612 starts
        //Reset Audit Instance
        baResetAuditInstanceID.execute(node);
        //Changes done for STEP-5612 ends

        //Revert Master Stock data 
        revertMS.execute(node);

        // STEP-6326 Recalculate discount prices for all SKUs after cancelation
        var masterstockList = Lib.getProductMasterstock(parent);
        log.info(" masterstockList " + masterstockList);

        for (var i = 0; i < masterstockList.size(); i++) {
            var masterstock = masterstockList.get(i)
            var msChildren = masterstock.getChildren().iterator();
            while (msChildren.hasNext()) {
                var skuTargetObjRev = msChildren.next();
                log.info(" skuTargetObjRev " + skuTargetObjRev.getName());
                //Call Catalog Related BR's
                busActSetCatalogReady.execute(skuTargetObjRev);
                skuTargetObjRev.approve(); //STEP-6445 fix, adding missing approval after recalculation of customer prices
            }
        }
        
        node.approve();
        parent.approve();
    } catch (e) {
        if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
            log.info(Lib.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
            log.info(Lib.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
            log.info(Lib.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else {
            log.info(Lib.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            throw (e);
        }
    }

    web.showAlert("ACKNOWLEDGMENT", "Cancel Action", "Item successfully canceled");
    web.navigate("homepage", null);
} else {
    var message = "Cancel Action is not allowed for NPI.";
    web.showAlert("ERROR", "Cancel Action", message);
}
}