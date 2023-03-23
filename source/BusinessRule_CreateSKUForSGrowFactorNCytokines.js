/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateSKUForSGrowFactorNCytokines",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Create SKU For S GrowFactor N Cytokines",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "BL_CreateSKU"
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionToMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,revisionToMasterStock,webui,BL_CreateSKU) {
/**
 * Business Rule: Create SKU For S GrowFactor N Cytokines
 * 
 * Purpose:
 * STEP-6075
 * Create Default SKU with Item Code "S" in WebUI. If there is SKU with this code code display warning alert with message about existing SKU and SKU will not be created.
 * 
 */

var businessAction = "Business Rule: Create SKU For S GrowFactor N Cytokines";
log.info ("Start " + businessAction);
//STEP-6396
var masterStockReferences = node.queryReferences(revisionToMasterStock);
var masterStockReferencesExists = false;
masterStockReferences.forEach(function(ref) {
	log.info("I've masterstock reference.");
	masterStockReferencesExists = true;
	masterStock = ref.getTarget();
	if (masterStock) {
		var nProduct = masterStock.getValue("PRODUCTNO").getSimpleValue();
		if (!BL_CreateSKU.isSkuExist(manager, nProduct, "S", logger)) {
			var defaultEntity = manager.getEntityHome().getEntityByID("GrowthFactorsandCytokinesS");
			var sDefaultItemCode = defaultEntity.getValue("ItemCode_DFLT").getSimpleValue();
			var attrGroup = manager.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
			log.info("defaultEntity = " + defaultEntity);
			var newSku = BL_CreateSKU.createSKU(manager, masterStock, defaultEntity, nProduct, sDefaultItemCode, attrGroup);
			web.showAlert("ACKNOWLEDGMENT","SKU creation", "The SKU has been successfully created.");
		} else {
			web.showAlert("WARNING","SKU creation", "The SKU cannot be created because it already exists.");
					     
		}
	} else {
		web.showAlert("ERROR","SKU creation", "MasterStock does not exist.");
	}
	return true;
});
if (!masterStockReferencesExists) {
	log.info("I don't have masterstock reference.");
}
//STEP-6396
}