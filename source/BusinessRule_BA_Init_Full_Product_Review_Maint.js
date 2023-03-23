/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_Full_Product_Review_Maint",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Init_Full_Product_Review_Maint",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "BL_TechTransfer"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGblExitProdMaint",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Exit_Product_Maintenance",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "maintenanceWorkflowInitiated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "MaintenanceWorkflowInitiated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baAssignFolderForMainDocs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_AssignFolderForMaintenanceDocs",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baInitSourFolder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Initiate_Source_Folder",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCreateDefaultSkuWithPrice",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDefaultSkuWithPrice",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCreateAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateAuditInstanceID",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,lookupTableHome,baGblExitProdMaint,maintenanceWorkflowInitiated,wipBFQueue,baAssignFolderForMainDocs,baInitSourFolder,baCreateDefaultSkuWithPrice,webui,baCreateAuditInstanceID,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_TechTransfer) {
var workflowName = "Full Product Review Workflow";
log.info(" workflowName " + workflowName);
var maintenanceWFNo = lookupTableHome.getLookupTableValue("MaintenanceWorkflowIDLookupTable", workflowName);
log.info(" maintenanceWFNo " + maintenanceWFNo);
var workflowNotes = node.getValue("Workflow_Notes").getSimpleValue();
log.info(" workflowNotes " + workflowNotes);

var productToTTRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Tech_Transfer");
var ttObject;
//STEP-6396
var productToTTRefs = node.queryReferences(productToTTRefType);
productToTTRefs.forEach(function(ref) {
    ttObject = ref.getTarget(); //Will only be one
    return false;
});
//STEP-6396

if (!ttObject) {
    // uncomment webui when done testing
    webui.showAlert("WARNING", "Invalid action", "Expanding to the Full Product Review maintenance is not allowed for user initiated maintenance workflows.");
    //log.info("WARINNG: Not allowed for a maintenance initiated within the Step WebUI.");
} else {
    // System initiated

    log.info("ttObject: " + ttObject.getName());
    var systemInitiatedMessage = ttObject.getValue("TechTransferInitiatedSystemMessage").getSimpleValue();
    log.info(" systemInitiatedMessage: " + systemInitiatedMessage);
    var customLotRevFlag = ttObject.getValue("CustomLotRev_YN").getSimpleValue();
    log.info(" customLotRevFlag: " + customLotRevFlag);

    if (customLotRevFlag == "Y") {
        // Show alert when user is trying to start Full Product Maintenance when Custom Lot changes have come

        // Testing, uncomment webui when done, comment log
        webui.showAlert("WARNING", "Invalid action", "Expanding to the Full Product Review Maintenance is not allowed for the Custom Lot maintenance.");
        //log.info("WARNING: Not Allowed for the Custom Lot maintenance.");
    } else {

        var nMasterStock = ttObject.getValue("MasterStock_SKU").getSimpleValue();
        var pMasterStock = manager.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
        log.info("pMasterStock " + pMasterStock);
        var ret;
        // STEP-5834
        var newMasterStock;

        if (pMasterStock) {
            var pRevision = BL_Library.getLatestAssociatedRevision(pMasterStock);

            if (pRevision) {
                ret = BL_MaintenanceWorkflows.initiateMaintenanceWFRev(manager, pRevision, maintenanceWFNo, lookupTableHome, systemInitiatedMessage);

            } else {
                throw ("Unable to locate an associated Revision for the Master Stock " + pMasterStock.getName());
            }
        } else {
            // STEP-5834 branch for a creating a new revision for a new master stock
            //throw ("Unable to locate the existing Master Stock object. [" + nMasterStock + "]");
            var bKit = BL_TechTransfer.isKit(ttObject);
            var bNewProduct = ttObject.getValue("NewProductFlag_YN").getSimpleValue();
            var bNewRevision = ttObject.getValue("NewRevisionFlag_YN").getSimpleValue();

            // Creating a new masterstock
            newMasterStock = BL_TechTransfer.createMasterStock(manager, ttObject, node, bKit);
            log.info("newMasterStock: " + newMasterStock.getName());

            var productNo = node.getValue("PRODUCTNO").getSimpleValue();
            var newRevision = BL_TechTransfer.createRevision(manager, ttObject, node, bNewProduct, productNo, bKit, bNewRevision);
            log.info("newRevision: " + newRevision.getName());

            newRevision.getValue("Workflow_Name_Initiated").setSimpleValue(workflowName);
            var wfNoInitiated = lookupTableHome.getLookupTableValue("MaintenanceWorkflowIDLookupTable", workflowName);
            newRevision.getValue("Workflow_No_Initiated").setSimpleValue(wfNoInitiated);

            ret = ["OK", newRevision];
            // STEP-5834 ends
        }

        if (ret[0] == "OK") {
            var newWipRevision = ret[1];
            newWipRevision.getValue("Workflow_Notes").setSimpleValue(workflowNotes);

            //Changes done for STEP-5612 & 6014 starts
            //Create Audit Instance ID
            BL_AuditUtil.createAuditInstanceID(newWipRevision);
            //Changes done for STEP-5612 Ends

             //STEP-5965 
            newWipRevision.getValue("System_Initiated").setSimpleValue("Y");

            //Populate value from Lot Object to new Revision
            newWipRevision = BL_TechTransfer.updateRevision(manager, log, ttObject, newWipRevision, node, baInitSourFolder);
            log.info("checkImageChanged: " + BL_TechTransfer.checkImageChanged(manager, ttObject, newWipRevision, log))

            BL_Library.copyAttributes(manager, ttObject, newWipRevision, "Full_Product_Review_Maint_Att", null); // STEP-6074

            // STEP-5738
            //Update MasterStock attr from newRevision to Masterstock associated to revision
            var TTWorkflowName = node.getValue("Workflow_Name_Initiated").getSimpleValue();
            var TTmaintenanceWFNo = lookupTableHome.getLookupTableValue("MaintenanceWorkflowIDLookupTable", TTWorkflowName);
            // STEP-5834 updating ms only if the ms pMasterStock existed maintenance initiation, else create a reference
            if (pMasterStock && TTmaintenanceWFNo == "12") {

                var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
                BL_TechTransfer.updateMSfromTT(manager, newWipRevision, ttObject, refType);
								
            } else if (newMasterStock) {
                // Adding a reference to MasterStock for the new Revision
                BL_TechTransfer.createReference_ProductRevision_To_MasterStockWithoutEvent(manager, ttObject, newWipRevision, newMasterStock);

                // Add defualt SKUs with price
                log.info("Adding default SKUs for " + newMasterStock.getName() + " using BA_CreateDefaultSkuWithPrice.");
                baCreateDefaultSkuWithPrice.execute(newWipRevision);

                // STEP-5834 ends
            }

            //Update the customLotRevFlag for the new revision
            newWipRevision.getValue("CustomLotRev_YN").setSimpleValue(customLotRevFlag);

            //For Image only, Add/Drop Application (if image has been changed) and Full Product Review workflow initiate in PAG Review
            baInitSourFolder.execute(newWipRevision);

            newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());

            // Copy Maintenance Documents from Product to Revision if any
            copyMaintenanceDocumentsToRevision(node, newWipRevision)

            var message = "Item successfully submitted to " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue() + " workflow.";

            //Move out of maintenance workflow and reset values in product
            baGblExitProdMaint.execute(node);

            //Move Maintenance Documents under Product Folder with Key and update approved file name attribute
            baAssignFolderForMainDocs.execute(newWipRevision);

            //Send to Backfeed queue for capturing Maintenance Start event
            wipBFQueue.queueDerivedEvent(maintenanceWorkflowInitiated, newWipRevision);

            // TESTING uncomment webui, remove log
            webui.navigate("homepage", null);
            webui.showAlert("ACKNOWLEDGMENT", "Action", message);
            //log.info(message);

        } else {
            webui.showAlert("WARNING", ret[2], "");
            //log.info(ret[2]);
        }
    }

}


function copyMaintenanceDocumentsToRevision(product, revision) {
    //Add document reference from maintenance
    //STEP-6396
    var refTypeMaintDocs = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents"); 
    var refs = product.queryReferences(refTypeMaintDocs);

    refs.forEach(function(ref) {
        log.info(" target " + ref.getTarget().getID() + " target " + refTypeMaintDocs);

        try {
            revision.createReference(ref.getTarget(), "Product_Maintenance_Documents");
        } catch (e) {
            log.info("create ref: " + e);
        }
        return true;
    });    
    //STEP-6396
    //ends
}

}