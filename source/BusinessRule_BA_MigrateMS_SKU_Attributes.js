/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_MigrateMS_SKU_Attributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_MigrateMS_SKU_Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetCatalogReady",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCatalogReadyFlag",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetUnitAbbreviation",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Unit_Abbreviation",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busActSetCatalogReady,busActSetUnitAbbreviation,manager,BL_Library) {
log.info("+++Update MS and SKU attributes during approval of " + node.getName());

var pRevision = node;
var pProduct = pRevision.getParent();


// Copy group attributes from a revision to a product
//STEP-6171 Fix copying from revision to product
//STEP-5957
BL_Library.copyAttributes(manager, node, pProduct, "Preview_Attributes", null);
BL_Library.copyAttributes(manager, node, pProduct, "Product_Release_Attributes", null);


//Get Master Stock for revision and set Unit Abbreviation  
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")
//STEP-6396
var msRefs = pRevision.queryReferences(refType);

msRefs.forEach(function(msRef) {
    var masterStock = msRef.getTarget();

    if (masterStock != null) {
        busActSetUnitAbbreviation.execute(masterStock);
    }

    return true;
});
//STEP-6396

//Get All Masterstock to get SKU's
var masterstockList = BL_Library.getProductMasterstock(pProduct);
//log.info(" masterstockList " + masterstockList);

//Call Catalog Related BR's
for (var i = 0; i < masterstockList.size(); i++) {
    var masterstock = masterstockList.get(i)
    //log.info(" masterstock "+masterstock);
    var msChildren = masterstock.getChildren().iterator();
    //log.info(msChildren);
    while (msChildren.hasNext()) {
        var skuTargetObjRev = msChildren.next();
        //log.info(" skuTargetObjRev " + skuTargetObjRev.getName());
        //Changes Done for STEP-5774 Starts
        //Copy JP Regulation from Revision to SKU 
        skuTargetObjRev.getValue("JP_Regulation").setSimpleValue(node.getValue("JP_Regulation").getSimpleValue());
        //Changes Done for STEP-5774 Ends

        busActSetCatalogReady.execute(skuTargetObjRev);
        //STEP-6326 removing invalid BR
        //busActCalcPriceFromCatalog.execute(skuTargetObjRev);
        busActSetUnitAbbreviation.execute(skuTargetObjRev);
    }
}
}