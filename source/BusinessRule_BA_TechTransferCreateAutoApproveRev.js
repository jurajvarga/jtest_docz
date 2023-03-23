/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_TechTransferCreateAutoApproveRev",
  "type" : "BusinessAction",
  "setupGroups" : [ "TechTransferActions" ],
  "name" : "BA Tech Transfer Create Auto Approve Revision",
  "description" : "Creates Product,Product Revision and Masterstock from Tech Transfer data",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot", "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "lib_copy"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "lib_tt"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCreateDefaultSkuWithPrice",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDefaultSkuWithPrice",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baMigrateMSSKUAttributes",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateMS_SKU_Attributes",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
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
    "contract" : "EventQueueBinding",
    "alias" : "autoApprovingEvent",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Prod_AutoApprRev_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "autoApproveRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AutoApproveRevisionUpdated",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baUpdatePublishDate",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_UpdatePublishDate",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
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
exports.operation0 = function (node,step,baCreateDefaultSkuWithPrice,baMigrateMSSKUAttributes,lookUp,BA_Approve,autoApprovingEvent,autoApproveRevisionUpdated,BA_ApproveProductObjects,baUpdatePublishDate,baGenerateMaintenanceRevisionEvents,BA_ApproveRevisionObjects,BL_AuditUtil,Lib,lib_copy,lib_tt) {
// BA_TechTransferCreateProdRevAction
// node: Current Object
// step: STEP Manager
// Lib: BL_Library,
// lib_tt: BL_TechTransfer
// techTransferRevisionCreated: TechTransferRevisionCreated (TechTransferRevisionCreated)
//wipBFQueue: Complete_Product_Product_Kit_WIPBF_JSON_OIEP (Complete_Product_and_Kit_WIPBF_JSON_OIEP)
//lookup:Lookup Table Home
// validity: Tech Transfer (Lot),Tech Transfer (Non Lot)

var businessRule = "Business Rule: BA_TechTransferCreateAutoApproveRev ";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();


log.info("======================= START BA Tech Transfer Create Auto Approve Revision for node: " + node.getName())

try {


    var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
    var bNewRevision = node.getValue("NewRevisionFlag_YN").getSimpleValue();

    log.info(" bNewRevision: " + bNewRevision);
    log.info(" bNewProduct: " + bNewProduct);

    var bKit = lib_tt.isKit(node);

    var productNo = node.getValue("PRODUCTNO").getSimpleValue();
    var product = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);

    // Creating a new revision
    var newRevision = lib_tt.createRevision(step, node, product, bNewProduct, productNo, bKit, bNewRevision);
    log.info("newRevision: " + newRevision.getName());

    // Reseting the JP_Regulation Attribute for the new revision
    newRevision.getValue("JP_Regulation").setSimpleValue("");

    // STEP-5867
    var prodShortName = node.getValue("PRODUCTSHORTNAME").getSimpleValue();

    if (prodShortName && !newRevision.getValue("PRODUCTSHORTNAME").getSimpleValue()) {
        newRevision.getValue("PRODUCTSHORTNAME").setSimpleValue(prodShortName);
    }

    // Creating a new masterstock
    var newMasterStock = lib_tt.createMasterStock(step, node, product, bKit);
    log.info("newMasterStock: " + newMasterStock.getName());

    // Adding a reference to MasterStock for the new Revision
    lib_tt.createReference_ProductRevision_To_MasterStockWithoutEvent(step, node, newRevision, newMasterStock);

    // Add defualt SKUs with price for MF MasterStock
    log.info("Adding default SKUs for " + newMasterStock.getName() + " using BA_CreateDefaultSkuWithPrice.");
    baCreateDefaultSkuWithPrice.execute(newRevision);

    //Update Mastestock ,Sku attributes update like catalog ready ,unit abbreviation
    baMigrateMSSKUAttributes.execute(newRevision);

    //STEP-6243
    //Add Audit Instance when revision is created to avoid null values for Auto Add
    BL_AuditUtil.createAuditInstanceID(newRevision);
    //STEP-6243 Ends

    //STEP-6083, STEP-6207 - Remove conjugates from auto-dropping into marketing review wf
    if (newRevision.getValue("AUTOADD_YN").getSimpleValue() == "Y" && newRevision.getValue("CONJUGATEFLAG_YN").getSimpleValue() == "N") {
        newRevision.getValue("REVISIONSTATUS").setSimpleValue("In-process");
        newRevision.getValue("System_Initiated").setSimpleValue("Y");
        newRevision.getValue("Workflow_Type").setSimpleValue("M");
        newRevision.getValue("Workflow_No_Initiated").setSimpleValue("13");
        newRevision.getValue("Workflow_Name_Initiated").setSimpleValue(lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", "13"));
        newRevision.getValue("Workflow_Initiated_By").setSimpleValue("PDP/PLM");
        product.createReference(newRevision, "Product_To_WIP_Revision");
        newRevision.startWorkflowByID("Marketing_Review_Workflow", "Initiated from " + newRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
        //STEP-6387 Send to Backfeed queue for capturing Maintenance Start event
        baGenerateMaintenanceRevisionEvents.execute(newRevision);
    } else {
        newRevision.getValue("REVISIONSTATUS").setSimpleValue("Approved");
        baUpdatePublishDate.execute(newRevision); // STEP-6306 set publish date
        BA_Approve.execute(node);
        //STEP-6465 Starts
        //BA_ApproveProductObjects.execute(product);
        BA_ApproveRevisionObjects.execute(newRevision);
        //STEP-6465 Ends
        BA_Approve.execute(newRevision);
        autoApprovingEvent.queueDerivedEvent(autoApproveRevisionUpdated, newRevision);
        log.info("Conjugates were skipped " + newRevision.getName())
    }

    //END STEP-6083

    log.info("======================= DONE BA_TechTransferCreateProdRevAction for node: " + node.getName())
} catch (err) {
    throw err;
}
}