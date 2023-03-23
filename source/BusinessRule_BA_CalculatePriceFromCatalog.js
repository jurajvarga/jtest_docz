/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CalculatePriceFromCatalog",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_CalculatePriceFromCatalog",
  "description" : "Sets Catalog Discount Price on SKU when linked to Catalog Product folder. It grabs Discount and GDB Override and calculates discount.",
  "scope" : "Global",
  "validObjectTypes" : [ "CatalogCustomer", "CatalogDistributorHub" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,logger,LibCatalogPrice) {
var cProducts = step.getClassificationHome().getClassificationByID(node.getID() + "_Products");
var classHomeID = LibCatalogPrice.getCatalogRegionID(logger, node);

if (cProducts) {
    var lstProduct = cProducts.getClassificationProductLinks();

    for (var i = 0; i < lstProduct.size(); i++) {
    		var pProduct = lstProduct.get(i).getProduct();
    		LibCatalogPrice.calculateSKUPrice(step, logger, classHomeID, cProducts, pProduct);
    }
}
}