/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CompleteAutoApproveJSONFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Auto_Approved_Revision" ],
  "name" : "BA_CompleteAutoApproveJSONFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
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
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation,BL_Library,BL_MaintenanceWorkflows) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult

Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {

    var mesg = {};
    var latestRevision;
    // STEP-6286
    var notify = true;

    //If the Object is Product Revision/Kit Revision/Equipment Revision ,set latestRevision and set Parent as the node. Else get latest revision from product.
    var checkRevisionService = true;
    if (BL_Library.isRevisionType(node, checkRevisionService)){

        latestRevision = node;
        node = node.getParent();

    } else {
        //STEP-5957
        latestRevision = BL_Library.getLatestRevision(node);
    }

    var kit = false;
    if (node.getObjectType().getID().equals("Product_Kit") || node.getObjectType().getID().equals("Kit_Revision")) {
        kit = true;
    }

    var productstepid = node.getID() + "";
    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;
    mesg.eventid = simpleEventType.getID() + "";

    mesg.AutoApprove_YN = "Y";


    //To Get Product Attributes
    var prodAttrJson = BL_JSONCreation.getObjectAttributesJson(node, false);
    mesg = BL_JSONCreation.mergeJsonObjects(mesg, prodAttrJson);


    // to get MasterStock and associated SKUs from Latest Approved Revision
    var mss = [];

    var refTypeProdRevToMasterStock = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")
    //STEP-6396
    var msRefs = latestRevision.queryReferences(refTypeProdRevToMasterStock)

    msRefs.forEach(function(msRef) {
  
        var masterStock = msRef.getTarget()
        var masterStockJson = BL_JSONCreation.getObjectAttributesJson(masterStock, false);

        var masterStockID = masterStock.getID() + "";
        masterStockJson["MASTERSTOCKSTEPID"] = masterStockID;


        //To Get SKUs
        var skusArr = [];
        var skuObjectTypeKey = "";
        var skus = masterStock.getChildren();
        for (j = 0; j < skus.size(); j++) {

            var sku = skus.get(j);

            var skuObjectTypeID = sku.getObjectType().getID();
            skuObjectTypeKey = skuObjectTypeID + "s";

            // json with SKU attributes
            var skuJson = BL_JSONCreation.getObjectAttributesJson(sku, false);

            var skuID = sku.getID() + "";
            skuJson["SKUSTEPID"] = skuID;

            skusArr.push(skuJson);
        }

        masterStockJson[skuObjectTypeKey] = skusArr;
        mss.push(masterStockJson);

        var masterStockObjectTypeID = masterStock.getObjectType().getID();
        mesg[masterStockObjectTypeID] = mss;

        return false;
    });
    //STEP-6396
   
    // To get an alternate product
    var altprod = BL_JSONCreation.getAlternateProduct(manager, node);


    // To get Current Revision
    var curRevArr = [];
    var curRev = BL_MaintenanceWorkflows.getCurrentRevision(node);

    if (curRev) {
        
        var curRevname = curRev.getName() + "";
        //executionReportLogger.logInfo("### " + curRevname);
        var curRevID = curRev.getID() + "";
        var curRevMasterStockStepID = BL_JSONCreation.getProductRevision_To_MasterStock(manager, curRev, notify);

        //STEP-6154
        var curRevJson = BL_JSONCreation.getObjectAttributesJson(curRev, false);

        curRevJson["name"] = curRevname;
        curRevJson["PRODUCTSTEPID"] = productstepid;
        curRevJson["PRODUCTNO"] = productno;
        curRevJson["REVISIONID"] = curRevID;
        curRevJson["ProductRevision_To_MasterStock"] = curRevMasterStockStepID;

        curRevArr.push(curRevJson);
    }

    
    //To Build SDS Links
    var sdslinks = [{}];

    
    //To get Application Protocol Information
    var appprotocol = [{}];
   

    //To Get Tech Transfer Lot  Information
    var techtranslot = [{}];
    //techtranslot = BL_JSONCreation.getLots(manager, latestRevision);

    
    //To Get companion Product
    var compprod = [{}];
    //compprod = BL_JSONCreation.getCompanionProduct(manager, node);

    
    //To get Asset Information
    var prodfigs = [];

    
    // To Get Entity - Homology Species & Target & Species
    var entity = [{}];


    //To get Latest Revision  Attributes
    var latestRevTarget = BL_JSONCreation.getObjectAttributesJson(latestRevision, false);

    var prodLatestRevname = latestRevision.getName() + "";
    var latestRevisionID = latestRevision.getID() + "";
    var masterStockStepID = BL_JSONCreation.getProductRevision_To_MasterStock(manager, latestRevision, notify);

    latestRevTarget["name"] = prodLatestRevname;
    latestRevTarget["PRODUCTSTEPID"] = productstepid;
    latestRevTarget["PRODUCTNO"] = productno;
    latestRevTarget["REVISIONID"] = latestRevisionID;
    latestRevTarget["ProductRevision_To_MasterStock"] = masterStockStepID;
    latestRevTarget["Rev_Product_Figures"] = prodfigs;

    var latestRevArr = []; //latestRevArr array
    latestRevArr.push(latestRevTarget);

    var assetUniqueList = [{}];


    mesg.SDSLinks = sdslinks;
    mesg.AlternateProduct = altprod;
    mesg.CompanionProduct = compprod;
    mesg.ApplicationProtocol = appprotocol;
    mesg.Asset = assetUniqueList;
    mesg.ProductToApprovedRevision = latestRevArr;
    mesg.ProductToCurrentRevision = curRevArr;
    mesg.TechTransferLot = techtranslot;
    mesg.Entity = entity;

    return mesg;
};


//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;
var checkRevisionService = true;
var checkServiceConjugates = true;

if (node != null && node.getApprovalStatus() == "Completely Approved") {
    //executionReportLogger.logInfo(" approvalStatus " + node.getApprovalStatus()); // STEP-6160
	
    if (node != null && (BL_Library.isRevisionType(node, checkRevisionService) || BL_Library.isProductType(node, checkServiceConjugates))) {

        //executionReportLogger.logInfo(" Product Kit ");
        if (nodeHandlerSource.isDeleted()) {
            mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
            nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
        } else {
            mesgfinal = Object.buildNodeMessage(node, simpleEventType);
        }
        nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
    }
}
}