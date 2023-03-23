/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SubmitToSFGI",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_SubmitToSFGI",
  "description" : "Check Product_Status, if \"Commercialization\" then change to \"Pre-release\", update revision status to approved",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Kit_JSON_WIP_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "createItemDetails",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CreateItemDetails",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Main_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActMigMSSkuAttributes",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateMS_SKU_Attributes",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActCRWebPubReleaseWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevisionWebPubRelease",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "bc_setAutorelease",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_setAutorelease",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActCurrRevWOReleaseWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevisionWOReleaseWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Republish_Product_Bibliography",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Product_Bibliography",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_CreateDamObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDamObjects",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "otsConversionRevApproved",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "OTSConversionRevApproved",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveRevisionObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveRevisionObjects",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busCond,lookupTableHome,wipQueue,createItemDetails,previewQueue,sendToPreview,busActMigMSSkuAttributes,busActCRWebPubReleaseWF,baGenerateMaintenanceRevisionEvents,bc_setAutorelease,busActCurrRevWOReleaseWF,BA_Republish_Product_Bibliography,BA_CreateDamObjects,BA_ApproveProductObjects,otsConversionRevApproved,BA_ApproveRevisionObjects,BL_Approve,bl_library,libWF) {
var businessRule = "Business Rule: Check Product Status in WF6 Approval";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var product = node.getParent();
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();

log.info(bl_library.logRecord([" wfInitiatedNo:", businessRule, currentObjectID, currentDate, wfInitiatedNo]));

var condResult = busCond.evaluate(node);
var isNewWorkflow = condResult.isAccepted();

log.info(bl_library.logRecord([" isNewWorkflow:", businessRule, currentObjectID, currentDate, isNewWorkflow]));

var destWorkflowID = "";

//Populate Completed List
var availableList = libWF.populateWorkflowCompletedList(log, node);

//Check Ready for Regional Revision Creation
var readyForSFGI = libWF.isReadyForSFGI(availableList);

if (isNewWorkflow && readyForSFGI) {
    var val = product.getValue("Product_Status").getSimpleValue();

    node.getValue("REVISIONSTATUS").setSimpleValue("Approved");
    if (val.equals("Commercialization")) {
        bl_library.updateHistoryAttribute(product, "Commercialization", "Pre-released");
        product.getValue("Product_Status").setSimpleValue("Pre-released");
        node.getValue("Product_Status").setSimpleValue("");
        BA_CreateDamObjects.execute(node); //STEP-6403 creating dam objects for NPI
        // busActRepublishBibliography.execute(node); // STEP-6178
        BA_Republish_Product_Bibliography.execute(product); //STEP-6199
    }

    busActMigMSSkuAttributes.execute(node);

    wipQueue.queueDerivedEvent(createItemDetails, node);
    previewQueue.queueDerivedEvent(sendToPreview, node);

    wfInitiatedNo = "WF1B";
    destWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", wfInitiatedNo)


    if (!node.isInWorkflow(destWorkflowID)) {
        node.startWorkflowByID(destWorkflowID, "Initiated from WF6_Content_Review_Workflow (WF6) ");
    }

} else if (!isNewWorkflow) {

    //If not Full maintenance wf,ready for release queue
    // If Full maintenance wf,ready for SFGI condition to be satisified before ready for release queue 
    var isReadyForRevisionRelease = false;
    if (wfInitiatedNo != "20") {
        isReadyForRevisionRelease = true;
    } else if ((wfInitiatedNo == "20" || wfInitiatedNo == "2") && readyForSFGI) { // STEP-5841 added or wf==2
        isReadyForRevisionRelease = true;
    }

    //STEP-5879 auto-release logic change
    var condAutoReleaseResult = bc_setAutorelease.evaluate(node);
    var isSetToAutorelease = condAutoReleaseResult.isAccepted();

    if (isSetToAutorelease) {
        if (wfInitiatedNo == "19") {
            busActCRWebPubReleaseWF.execute(node);
        } else {
            busActCurrRevWOReleaseWF.execute(node);
        }
        // end STEP-5879 changes
    } else {

        if (isReadyForRevisionRelease) {
            node.getValue("REVISIONSTATUS").setSimpleValue("Approved");

            //Changes Done for STEP- 5564 Starts
            //Send to Backfeed queue for capturing Maintenance Complete event before Approval as outbound looks only Main workspace.
            baGenerateMaintenanceRevisionEvents.execute(node);
            //Changes Done for STEP- 5564 Ends

            //STEP-6403 creating of dam objects for maintenances
            if (wfInitiatedNo == 2 || wfInitiatedNo == 15 || wfInitiatedNo == 17 || wfInitiatedNo == 20) {
                BA_CreateDamObjects.execute(node);
            }

            if(wfInitiatedNo == "2") { // STEP-5841
                product.getValue("OTS_Conversion_Release_Date").setSimpleValue(product.getValue("DateReleased").getSimpleValue());
                product.getValue("DateReleased").setSimpleValue(null);
                destWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", "WF1B");

                if (!node.isInWorkflow(destWorkflowID)) {
                    node.startWorkflowByID(destWorkflowID, "Initiated from WF6_Content_Review_Workflow (WF6)");
                    wipQueue.queueDerivedEvent(otsConversionRevApproved, node); // STEP-6629
                }
            }
            else {
                //Add to Revision Release workflow
                wfInitiatedNo = "WF10";
                destWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", wfInitiatedNo)

                if (!node.isInWorkflow(destWorkflowID)) {
                    node.startWorkflowByID(destWorkflowID, "Initiated from WF6_Content_Review_Workflow (WF6) ");
                }

                //If available in Revision Release workflow,remove  wip revision reference 
                var wfRevisionRelease = node.getWorkflowInstanceByID("Revision_Release_Workflow");

                if (wfRevisionRelease) {
                    //Get Product
                    var product = node.getParent();

                    //Get WIP Revision
                    var refs = product.getProductReferences();
                    var p2wipRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
                    var p2wipRefs = refs.get(p2wipRefType);

                    if (p2wipRefs.size() == 1) {
                        var p2wipRef = p2wipRefs.get(0);
                        // Remove reference from the existing WIP Product Revision:
                        p2wipRef.delete();
                    }
                }

                try {
                    /* START STEP-6479
                    node.approve();
                    product.approve();
                    */
                    //STEP-6465 Starts
                    //BA_ApproveProductObjects.execute(product);
                    BA_ApproveRevisionObjects.execute(node);
                    //STEP-6465 Ends
                    // END STEP-6479
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
            }
        }
    }
}
}