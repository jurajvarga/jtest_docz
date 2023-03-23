/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Init_Product_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Global_Init_Product_Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
    "alias" : "baInitSourFolder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Initiate_Source_Folder",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baAssignFolderForMainDocs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_AssignFolderForMaintenanceDocs",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGblExitProdMaint",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Exit_Product_Maintenance",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "bcIsCustomOrComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProductOrComponentWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCreateDefaultSkuWithPrice",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDefaultSkuWithPrice",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Global_Init_OTS_Conversion",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Init_OTS_Conversion",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "BC_isCustomProductOrComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProductOrComponentWF",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,lookupTableHome,baInitSourFolder,baAssignFolderForMainDocs,baGblExitProdMaint,webui,bcIsCustomOrComponentWF,baGenerateMaintenanceRevisionEvents,baCreateDefaultSkuWithPrice,BA_Global_Init_OTS_Conversion,BC_isCustomProductOrComponentWF,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_TechTransfer) {
var workflowName = node.getValue("Workflow_Name_Initiated").getSimpleValue();
log.info(" workflowName " + workflowName);
var maintenanceWFNo = lookupTableHome.getLookupTableValue("MaintenanceWorkflowIDLookupTable", workflowName);
log.info(" maintenanceWFNo " + maintenanceWFNo);
var initiatedRevNo = node.getValue("Main_Initiated_REVISIONNO").getSimpleValue();
log.info(" initiatedRevNo " + initiatedRevNo);
var workflowNotes = node.getValue("Workflow_Notes").getSimpleValue();
log.info(" workflowNotes " + workflowNotes);
// STEP-6057 adding revision switch flag
var revSwitch = node.getValue("Revision_Switch").getSimpleValue();
log.info(" revSwitch " + revSwitch);

//STEP-5841
if (node.getValue("Workflow_Name_Initiated").getSimpleValue() == "OTS Conversion" && node.isInState("Product_Maintenance_Upload", "UserSystem_Initiated_Maintenance")) {
    BA_Global_Init_OTS_Conversion.execute(node);
    webui.navigate("homepage", null);
    return;
}

// For system initiated
var ttObject;
var productToTTRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Tech_Transfer");
//STEP-6396
var productToTTRefs = node.queryReferences(productToTTRefType);
productToTTRefs.forEach(function(ref) {
    ttObject = ref.getTarget(); //Will only be one
    return false;
});
//STEP-6396
var latestRev;

// For user initiated
var pProductRev;
if (initiatedRevNo && initiatedRevNo != "") {
    pProductRev = manager.getNodeHome().getObjectByKey("PRODUCTREVNO", initiatedRevNo);
}

// for an array with a new wip revision and/or messages
var ret;
var isSystem_Initiated = "N";

if (!pProductRev && !ttObject) {
    throw "No revision was found for a given product.";
} else if (pProductRev) {
    // User initiated

    log.info(" pProductRev " + pProductRev.getName());

    //STEP-STEP-5831 new wf
    if (workflowName == "Publish Product Change") {
        //Check if User is in the group PMLT
        var currentUser = manager.getCurrentUser();
        var groups = currentUser.getGroups();
        if (!manager.getGroupHome().getGroupByID("PMLT").isMember(currentUser) && !manager.getGroupHome().getGroupByID("ProdGL").isMember(currentUser)) {
            throw "User " + currentUser.getName() + " is not a member of PMLT or GL group, he can not initiate Publish Product Change workflow.";
        }
    }

    ret = BL_MaintenanceWorkflows.initiateMaintenanceWFRev(manager, pProductRev, maintenanceWFNo, lookupTableHome, "U")

} else if (ttObject) {
    // System initiated

    //STEP-5841
    if (maintenanceWFNo == "2") {
        ttObject.getValue("NewTechTransferFlag_YN").setSimpleValue(maintenanceWFNo);
    }

    isSystem_Initiated = "Y";
    log.info("ttObject: " + ttObject.getName());
    var bNewProduct = ttObject.getValue("NewProductFlag_YN").getSimpleValue();
    var bNewMasterStock = ttObject.getValue("NewMasterStockFlag_YN").getSimpleValue();
    var bNewRevision = ttObject.getValue("NewRevisionFlag_YN").getSimpleValue();
    var systemInitiatedWF = ttObject.getValue("NewTechTransferFlag_YN").getSimpleValue();
    var systemInitiatedMessage = ttObject.getValue("TechTransferInitiatedSystemMessage").getSimpleValue();
    var customLotRevFlag = ttObject.getValue("CustomLotRev_YN").getSimpleValue();
    var customWFFlag = ttObject.getValue("Custom_Workflow_YN").getSimpleValue();
    var abbrWFNameFlag = ttObject.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();

    log.info(" bNewProduct: " + bNewProduct);
    log.info(" bNewMasterStock: " + bNewMasterStock);
    log.info(" bNewRevision: " + bNewRevision);
    log.info(" systemInitiatedWF: " + systemInitiatedWF);
    log.info(" customLotRevFlag: " + customLotRevFlag);
    log.info(" customWFFlag: " + customWFFlag);
    log.info(" abbrWFNameFlag: " + abbrWFNameFlag);
    log.info(" systemInitiatedMessage: " + systemInitiatedMessage);

    // STEP-5834 begins
    if ((bNewProduct == "N") && (bNewMasterStock == "Y") && (bNewRevision == "Y")) {

        var bKit = BL_TechTransfer.isKit(ttObject);

        // Creating a new masterstock
        var newMasterStock = BL_TechTransfer.createMasterStock(manager, ttObject, node, bKit);
        log.info("newMasterStock: " + newMasterStock.getName());

        var productNo = node.getValue("PRODUCTNO").getSimpleValue();
        var newRevision = BL_TechTransfer.createRevision(manager, ttObject, node, bNewProduct, productNo, bKit, bNewRevision);
        log.info("newRevision: " + newRevision.getName());

        newRevision.getValue("Workflow_Name_Initiated").setSimpleValue(workflowName);
        var wfNoInitiated = lookupTableHome.getLookupTableValue("MaintenanceWorkflowIDLookupTable", workflowName);
        newRevision.getValue("Workflow_No_Initiated").setSimpleValue(wfNoInitiated);

        ret = ["OK", newRevision];

        // STEP-5834 ends

    } else if ((bNewProduct == "N") && (bNewMasterStock == "N") && (bNewRevision == "Y") && systemInitiatedWF != "") {
        // STEP-5834 added check for bNewMasterStock

        var nMasterStock = ttObject.getValue("MasterStock_SKU").getSimpleValue();
        var pMasterStock = manager.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
        log.info("pMasterStock " + pMasterStock);

        if (pMasterStock) {
            latestRev = BL_Library.getLatestAssociatedRevision(pMasterStock);

            if (latestRev) {
                ret = BL_MaintenanceWorkflows.initiateMaintenanceWFRev(manager, latestRev, systemInitiatedWF, lookupTableHome, systemInitiatedMessage);

            } else {
                throw ("Unable to locate an associated Revision for the Master Stock " + pMasterStock.getName());
            }
        } else {
            throw ("Unable to locate the existing Master Stock object. [" + nMasterStock + "]");
        }
    }
}

if (ret[0] == "OK") {
    var newWipRevision = ret[1];
    newWipRevision.getValue("Workflow_Notes").setSimpleValue(workflowNotes);
    //STEP-5965 
    newWipRevision.getValue("System_Initiated").setSimpleValue(isSystem_Initiated);
    // STEP-6057 adding setting revision switch flag
    newWipRevision.getValue("Revision_Switch").setSimpleValue(revSwitch);

    //Changes done for STEP-5612  & 6014 starts
    //Create Audit Instance ID
    BL_AuditUtil.createAuditInstanceID(newWipRevision);
    //Changes done for STEP-5612  & 6014 ends

    // STEP-5588 moved checking pdp figure changes and starting PAG from BL_TechTransfer.updateRevision to this BR
    var bImageChangeFromPDP = false;

    if (ttObject) {
        // STEP-5998 changed from bNewRevision to bNewMasterStock
        if (bNewMasterStock != "Y") {
            //Populate value from Lot Object to new Revision
            newWipRevision = BL_TechTransfer.updateRevision(manager, log, ttObject, newWipRevision, node);
        }

        log.info("FigureChanged_YN: " + newWipRevision.getValue("FigureChanged_YN").getSimpleValue());
        // STEP-5588 moved checking pdp figure changes and starting PAG from BL_TechTransfer.updateRevision to this BR
        bImageChangeFromPDP = BL_TechTransfer.checkImageChanged(manager, ttObject, latestRev, log);
        log.info("bImageChangeFromPDP: " + bImageChangeFromPDP)

        //Update the customLotRevFlag,customWFFlag,abbrWFNameFlag,Initiator,Initiated_From_LAR for the new revision
        node.getValue("Custom_Workflow_YN").setSimpleValue(customWFFlag);
        BL_Library.copyAttributes(manager, ttObject, newWipRevision, "New_WIP_Revision_Attributes", null); // STEP-6074

        // STEP-5834 begins 
        // to create reference from revision to master stock for revision with a new master stock
        if (bNewMasterStock == "Y") {
            // Adding a reference to MasterStock for the new Revision
            BL_TechTransfer.createReference_ProductRevision_To_MasterStockWithoutEvent(manager, ttObject, newWipRevision, newMasterStock);

            // Add defualt SKUs with price
            log.info("Adding default SKUs for " + newMasterStock.getName() + " using BA_CreateDefaultSkuWithPrice.");
            baCreateDefaultSkuWithPrice.execute(newWipRevision);

            // STEP-5834 ends

        } else {
            	// STEP-5738 begins
            if (maintenanceWFNo == "12") {
              	 //Update MasterStock attr from ttObject to Masterstock associated to revision
               var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
               BL_TechTransfer.updateMSfromTT(manager, newWipRevision, ttObject, refType);
           
                // STEP-5738 ends
            }
        }
    }

    // STEP-5791 setting CustomLotRev_YN for user initiated Custom Lot Maintenance
    if (workflowName == "Custom Lot") {
        newWipRevision.getValue("CustomLotRev_YN").setSimpleValue("Y");
    }

    //If  Custom or component for full workflow do not add to pag
    var isCustomOrComponentWFResult = bcIsCustomOrComponentWF.evaluate(newWipRevision);

    log.info("isCustomOrComponentWFResult: " + isCustomOrComponentWFResult.isRejected())

    //For Image only, Add/Drop Application (if image has been changed) and Full Product Review workflow initiate in PAG Review
    if (maintenanceWFNo == "15" || (maintenanceWFNo == "20" && isCustomOrComponentWFResult.isRejected())) {


        baInitSourFolder.execute(newWipRevision);

        newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());

        // STEP-5588 moved checking pdp figure changes and starting PAG from BL_TechTransfer.updateRevision to this BR
        //STEP-6080
    } else if (maintenanceWFNo == "17" && (bImageChangeFromPDP || node.getValue("FigureChanged_YN").getSimpleValue() == "Y")) {
        // if the maintenance 17 starts in PAG
        newWipRevision.getValue("FigureChanged_YN").setSimpleValue("Y");
        baInitSourFolder.execute(newWipRevision);
        
    } else if (maintenanceWFNo == "2") { // STEP-5841
        node.getValue("Freezer_Date_Check").setSimpleValue(null);

        if (BC_isCustomProductOrComponentWF.evaluate(node).isAccepted()) {
            node.getValue("Workflow_Name_Initiated").setSimpleValue(null);
        }

        baInitSourFolder.execute(newWipRevision);
        newWipRevision.getValue("PUBLISHED_YN").setSimpleValue("Y"); // STEP-6547
        baCreateDefaultSkuWithPrice.execute(newWipRevision); // STEP-6547
        newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
    } else {

        newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
    }

    // Copy Maintenance Documents from Product to Revision if any
    copyMaintenanceDocumentsToRevision(node, newWipRevision)

    //STEP-6341 start
    //STEP-6795 added MS for email report
    var masterStock = BL_Library.getMasterStockForRevision(manager, newWipRevision);
    var oldShipCondMS = BL_Library.getApprovedProductAttribute(manager, masterStock, "ShippingConditions");
    masterStock.getValue("Shipping_Conditions_Original").setSimpleValue(oldShipCondMS);
   
    var skus = masterStock.queryChildren();
    skus.forEach( function(sku) {
    		var oldShipCond = BL_Library.getApprovedProductAttribute(manager, sku, "ShippingConditions");
    		if (oldShipCond == null) {
    			sku.getValue("Shipping_Conditions_Original").setSimpleValue("no value");
    		} else {
    			sku.getValue("Shipping_Conditions_Original").setSimpleValue(oldShipCond);
    		}
	   	return true;
    });
    //end
    
    var message = "Item successfully submitted to " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue() + " workflow.";

    //Move out of maintenance workflow and reset values in product
    baGblExitProdMaint.execute(node);

    //Move Maintenance Documents under Product Folder with Key and update approved file name attribute
    baAssignFolderForMainDocs.execute(newWipRevision);

    //Send to Backfeed queue for capturing Maintenance Start event
    baGenerateMaintenanceRevisionEvents.execute(newWipRevision);


    // TESTING uncomment webui, remove log
    webui.navigate("homepage", null);
    webui.showAlert("ACKNOWLEDGMENT", "Action", message);
    //log.info(message);

} else {
    throw ret[2];
}


function copyMaintenanceDocumentsToRevision(product, revision) {
    //Add document reference from maintenance
    //STEP-6396
    var prodMainDocRef = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");    
    var refs = product.queryReferences(prodMainDocRef);
    
    refs.forEach(function(ref) {
        log.info(" target " + ref.getTarget().getID() + " target " + prodMainDocRef);
        try {
            var revisionImageRef = revision.createReference(ref.getTarget(), "Product_Maintenance_Documents");
            BL_Library.copyAttributes(manager, ref, revisionImageRef, "Product_Maintenance_Documents_Attributes", null); // STEP-6074
        } catch (e) {
            log.info("create ref: " + e);
        }
        return true;
    });   

    //STEP-6396
    //ends
}

}