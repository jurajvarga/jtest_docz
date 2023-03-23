/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateRevisionForMasterstockNA",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_CreateRevisionForMasterstockNA",
  "description" : "Creates Product,Product Revision and Masterstock from Tech Transfer data",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot", "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "lib_copy"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "lib_maintwf"
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
    "contract" : "DerivedEventTypeBinding",
    "alias" : "techTransferRevisionCreated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "TechTransferRevisionCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApproveProdObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthroughChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productBGUpdatedQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baTechTransferCreateAutoApproveRev",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_TechTransferCreateAutoApproveRev",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baUpdateChildSpeciesHomology",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Update_Child_Species_Homology",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "autoApproveRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AutoApproveRevisionUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "autoApproveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Prod_AutoApprRev_Updated_OIEP",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,techTransferRevisionCreated,wipBFQueue,lookUp,baApproveProdObjects,webPassthroughChanges,productBGUpdatedQueue,baTechTransferCreateAutoApproveRev,baUpdateChildSpeciesHomology,autoApproveRevisionUpdated,autoApproveQueue,Lib,lib_copy,lib_maintwf,lib_tt) {
// BA_TechTransferCreateProdRevAction
// node: Current Object
// step: STEP Manager
// Lib: BL_Library,
// lib_tt: BL_TechTransfer
// techTransferRevisionCreated: TechTransferRevisionCreated (TechTransferRevisionCreated)
//wipBFQueue: Complete_Product_Product_Kit_WIPBF_JSON_OIEP (Complete_Product_and_Kit_WIPBF_JSON_OIEP)
//lookup:Lookup Table Home
// validity: Tech Transfer (Lot),Tech Transfer (Non Lot)

log.info("======================= START BA_TechTransferCreateProdRevAction for node: " + node.getName())

try {
    
       
        //1. create Product
        //2. create REV
        //3. create reference ProductRevision_to_TechTransfer
        //3a. move figure folder from TT to Product Revision
        //3b. copy figure links from previous Product Revision to new Product Revision
        //4. create Master Stock
        //5. create reference ProductRevision_To_MasterStock

        var bNewProduct = "N";
        var bNewRevision = "Y";

        var bKit = lib_tt.isKit(node);

        //************************
        //#1 create Product
        //************************
        //var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
        var nProduct = node.getValue("PRODUCTNO").getSimpleValue();

        log.info("BA_CreateRevisionMasterItemForLot: nProduct: " + nProduct);

        var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
        //************************
        //#2 create REV
        //************************
        var pRevision = lib_tt.createRevision(step, node, pProduct, bNewProduct, nProduct, bKit, bNewRevision);

        //************************
        //#4 create Master Stock
        //************************
        var pMasterStock = lib_tt.createMasterStock(step, node, pProduct, bKit);

        //Product to REV reference  -> it supports WebUI user experience
        //#5 create reference ProductRevision_To_MasterStock
        //************************
        lib_tt.createReference_ProductRevision_To_MasterStockWithoutEvent(step, node, pRevision, pMasterStock);

    

    log.info("======================= DONE BA_TechTransferCreateProdRevAction for node: " + node.getName())
} catch (err) {
    throw err;
}
}