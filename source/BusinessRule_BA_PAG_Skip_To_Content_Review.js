/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PAG_Skip_To_Content_Review",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_PAG_Skip_To_Content_Review",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Rev_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve_Inactive_Figure_Folder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve_Inactive_Figure_Folder",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetFigKeyForImage",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetFigureKeyForImage",
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Figure_Approval_Action",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Figure_Approval_Action",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "imageDataExportQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=ASSET_EXPORT_JSON",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Approve_Inactive_Figure_Folder,baSetFigKeyForImage,webui,auditEventType,auditQueueMain,auditQueueApproved,BA_Approve,BA_Figure_Approval_Action,imageDataExportQueue,BL_AuditUtil,bl_library) {
var businessRule = "Business Rule: BA_PAG_Skip_To_Content_Review";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();


// There should be only one WIP revision
var prodWIPRevs = bl_library.getProductWIPRevision(manager, node); //STEP-6526
//log.info("prodWIPRevs: " + prodWIPRevs);
var prodWIPRev = prodWIPRevs[0];
log.info(prodWIPRev.getName());

// Start WF6 only if all Figure/Datasheet Folders have been submitted (Figure_Status has been set to Approved/Inactive for all Figure/Datasheet folders)
if (isApproveInactive(node)) {

    if (!prodWIPRev.isInWorkflow("WF6_Content_Review_Workflow")) {

        log.info("==> setWorkflowRedirect");

        //Changes done for full maintenance story for STEP-5643 Starts
        var workflowType = prodWIPRev.getValue("Workflow_Type").getSimpleValue();
        log.info(" workflowType " + workflowType);

        var wfInitiatedNo = prodWIPRev.getValue("Workflow_No_Initiated").getSimpleValue();
        log.info(" wfInitiatedNo " + wfInitiatedNo);

        if (workflowType == "M" && wfInitiatedNo != "20" && wfInitiatedNo != "2") { // STEP-5841 added wf != 2
            prodWIPRev.getValue("Workflow_No_Current").setSimpleValue("-1");
        }
        //Changes done for full maintenance story for STEP-5643 Ends

        prodWIPRev.startWorkflowByID("WF6_Content_Review_Workflow", "Initiated by WF4 BA_PAG_Skip_To_Content_Review");

        var wfInstDummy = prodWIPRev.getWorkflowInstanceByID("WF4-Dummy");
        if (wfInstDummy != null) {
            wfInstDummy.delete("Removed by BA_PAG_Skip_To_Content_Review");
             //STEP-6014
             BL_AuditUtil.buildAndSetAuditMessageForAction(prodWIPRev,manager,"WF4-Dummy","Submit_Action","Skip_to_ContentReview_OnExit","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
             //STEP-6014
        }
    }

    log.info("prodRev " + prodWIPRev.getName() + " is In Workflow WF6_Content_Review_Workflow: " + prodWIPRev.isInWorkflow("WF6_Content_Review_Workflow"));

    log.info("### Skipping to the Content Review.")

    // Remove an object from the current WF if all Figure/Datasheet folders have been Approved / set as Inactive.
    if (node.isInWorkflow("PAG_App_Mgr_PC_Review_Workflow")) {
        // start STEP-6575
        if (node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue() == "CarrierFree") {
            node.approve();

            var figureFolders = node.queryChildren();

            figureFolders.forEach(function(figureFolder) {
                var assets = figureFolder.getAssets();
                var assetsItr = assets.iterator();

                while (assetsItr.hasNext()) {
                    var asset = assetsItr.next();

                    if (asset.getValue("Approved_Figure_Name").getSimpleValue() == null) {
                        BA_Figure_Approval_Action.execute(asset);
                    }

                    BA_Approve.execute(figureFolder);
                    BA_Approve.execute(asset);

                    imageDataExportQueue.republish(asset);
                }

                return true; 
            });
        }
        // end STEP-6575

        var wf = node.getWorkflowInstanceByID("PAG_App_Mgr_PC_Review_Workflow");
        wf.delete("Removed by BA_PAG_Skip_To_Content_Review.");

        //STEP-6061
        BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Skip_to_ContentReview_OnExit","PAG_Review","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
        //STEP-6061
    }

    //STEP-5929 && 5993
    //Set Audit for Child Figure Folder
    BL_AuditUtil.buildAndSetAuditMessageForAction(node, manager, "PAG_App_Mgr_PC_Review_Workflow", "Cancel_Action", "Skip_Figure_Review", "PAG_Review", "Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
    //STEP-5929


    // Approve the Product Folder
    try {

        node.approve();

    } catch (e) {

        if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
            log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
            log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
            log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else {
            log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            throw (e);
        }
    }

    // Approve Inactive Figure/Datasheet folders
    var kids = node.getChildren();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var kot = kid.getObjectType().getID();

        if (kot.equals("Figure_Folder")) {
            var figFolderStatus = kid.getValue("Figure_Status").getSimpleValue();

            if (figFolderStatus == "Inactive") {

                try {

                    // Approve a Figure Folder
                    kid.approve();

                } catch (e) {

                    if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                        log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                        log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                        log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else {
                        log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                        throw (e);
                    }
                }

                // // Set figure keys for inactive assets in a figure folder
                var assets = kid.getAssets();
                var assetsItr = assets.iterator();

                while (assetsItr.hasNext()) {
                    var asset = assetsItr.next();

                    // Set Figure Key for an asset
                    baSetFigKeyForImage.execute(asset);
                }

                BA_Approve_Inactive_Figure_Folder.execute(kid);

                //STEP-5929 && 5993
                //Set Audit for Child Figure Folder
                BL_AuditUtil.buildAndSetAuditMessageForAction(kid, manager, "PAG_App_Mgr_PC_Review_Workflow", "Cancel_Action", "Skip_Figure_Review", "", "Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved)
                //STEP-5929


            }
        }
    }


    // Navigate to homepage and show success message
    webui.navigate("homepage", null);
    webui.showAlert("ACKNOWLEDGMENT", "Submit Information", "Skipping to the Content Review.");


} else {
    // Throw an error if Figure status for a Figure/Datasheet Folders is not Inactive or Approved
    var err = "Approval of the " + node.getName() + " cannot be skipped. There is Pending Review or Change Needed or other Figure/Datasheet folder yet to be approved for this Product.";
    log.info("error, figFolderStatus is: " + figFolderStatus);
	//STEP-5929 && 5993
	//Set Audit for Child Figure Folder
	BL_AuditUtil.buildAndSetAuditMessageForAction(node, manager, "PAG_App_Mgr_PC_Review_Workflow", "Cancel_Action", "Skip_Figure_Review", "", "Exit",true,err,auditEventType,auditQueueMain,auditQueueApproved);
	//STEP-5929
    webui.showAlert("ERROR", "Invalid action", err);
    log.info(err)
}


// Returns true if all Figure/Datasheet folders are Approved/Inactive
function isApproveInactive(productFolder) {

    // Figure/Datasheet Folders
    var kids = productFolder.getChildren();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var kot = kid.getObjectType().getID();

        log.info(bl_library.logRecord([" kot: ", businessRule, currentObjectID, currentDate, kot]));
        log.info(bl_library.logRecord([" kid name: ", businessRule, currentObjectID, currentDate, kid.getName()]));

        if (kot.equals("Figure_Folder")) {
            var fs = kid.getValue("Figure_Status").getSimpleValue();
            log.info(bl_library.logRecord([" fs: ", businessRule, currentObjectID, currentDate, fs]));

            if (fs == null) {
                return false;
            } else if (!fs.equals("Approved") && !fs.equals("Inactive")) {
                return false;
            }
        }
    }

    return true;
}
}