/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BR_Calculate_SKU_Price",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BR_Calculate_SKU_Price",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_CatalogPrice",
    "libraryAlias" : "LibCatalogPrice"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib,LibCatalogPrice) {
/*
get attributes
check us/region by "Catalog Region" ID

SKUs attributes
logger.info("PRICE:" + node.getValue("PRICE").getSimpleValue());
logger.info("Future_Global_Base_Price: " + node.getValue("Future_Global_Base_Price").getSimpleValue());

var attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() +"_FutureDiscountPrice");
logger.info("CLP_Discount_From_Price:" + node.getValue("CLP_Discount_From_Price").getSimpleValue());
logger.info("CLP_Future_Discount_From_Price:" + node.getValue("CLP_Future_Discount_From_Price").getSimpleValue());
*/

function calculateSKUPrice(step, logger, catalogProduct, node) {
	var catalogProduct = null;
	var catalogCustomer = catalogProduct.getParent();
	var location = LibCalcPrice.getLocation(node);
	var attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_DiscountPrice");
	
	if (attribute && attribute.getValidForObjectTypes().contains(node.getObjectType())) {
		var currentDiscount = customerCatalog.getValue("Pricing Summary").getSimpleValue();
		var currentPrice;	
		var discountPrice;
		
		if (location == 'US') {
			currentPrice = node.getValue("PRICE").getSimpleValue();
		}
		else { // regional
			var currentPriceSourceAttr = customerCatalog.getValue("CLP_Discount_From_Price").getSimpleValue();
			currentPrice = node.getValue(currentPriceSourceAttr).getSimpleValue();
		}
	
		discountPrice = Lib.roundTo((((100 - currentDiscount) / 100) * currentPrice), 2);
		node.getValue(catalogCustomer.getID() + "_DiscountPrice").setSimpleValue(discountPrice);
	}
	
	attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_FutureDiscountPrice");
	
	if (attribute && attribute.getValidForObjectTypes().contains(node.getObjectType())) {
		var futureDiscount = customerCatalog.getValue("CustomerFuturePrice").getSimpleValue();
		var futurePrice;	
		var futureDiscountPrice;
		
		if (location == 'US') {
			futurePrice = node.getValue("Future_Global_Base_Price").getSimpleValue();
		}
		else { // regional
			var futurePriceSourceAttr = customerCatalog.getValue("CLP_Future_Discount_From_Price").getSimpleValue();
			futurePrice = node.getValue(futurePriceSourceAttr).getSimpleValue();
		}
	
		futureDiscountPrice = Lib.roundTo((((100 - futureDiscount) / 100) * futurePrice), 2);
		node.getValue(catalogCustomer.getID() + "_FutureDiscountPrice").setSimpleValue(futureDiscountPrice);
	}
}
}