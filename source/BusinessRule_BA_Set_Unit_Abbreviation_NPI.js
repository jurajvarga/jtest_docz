/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Unit_Abbreviation_NPI",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA Set Unit Abbreviation in NPI",
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetUnitAbbreviation",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Unit_Abbreviation",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,busActSetUnitAbbreviation,BL_Library) {
var pRevision = node;
var pProduct =  pRevision.getParent();



/*
//Set Unit Abbreviation for SKUs
var productToSkuRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_SKU");
if (productToSkuRefType != null) {
	var skuTargetReferences = pProduct.getReferences(productToSkuRefType);
	log.info(" ----"+skuTargetReferences + "");
	for (var j = 0; j < skuTargetReferences.size(); j++) {
		var skuTargetObjRev = skuTargetReferences.get(j).getTarget();
		busActSetUnitAbbreviation.execute(skuTargetObjRev);
	
	}
}
*/


//Get All Masterstock to get SKU's
var masterstockList=BL_Library.getProductMasterstock(pProduct);
log.info(" masterstockList "+masterstockList);

//Call Catalog Related BR's
for (var i = 0; i <masterstockList.size(); i++) {
        var masterstock = masterstockList.get(i)
        //log.info(" masterstock "+masterstock);
        var msChildren=masterstock.getChildren().iterator();
        //log.info(msChildren);
        while (msChildren.hasNext()) {
            var skuTargetObjRev = msChildren.next();
           // log.info(" skuObject "+skuTargetObjRev.getName());
          
		  busActSetUnitAbbreviation.execute(skuTargetObjRev);
        }
        
 }
}