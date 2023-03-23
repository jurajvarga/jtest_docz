/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CalculateCustomoerPriceFromProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_CalculateCustomerPriceFromProduct",
  "description" : "Sets Catalog Discount Price on SKU when linked to Catalog Product folder.  It grabs Discount and GDB Override and calculates  discount.",
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
exports.operation0 = function (node,step,logger,Lib,LibCatalogPrice) {
/**
script ID: BA_CalculateCustomerPriceFromProduct
description: Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).
bindings: 
    node --> Current Object
    step --> STEP Manager
    logger --> Logger
01/01/2019 MMiracle First tracked version
07/12/2020 RSathi Updated to consider null % as 0 % 
**/

var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("SKU_To_Catalog");
var catLinks = node.getClassificationProductLinks().get(refType);

for (var cx = 0; cx < catLinks.size(); cx++) {
	var catalogProductsFolder = catLinks.get(cx).getClassification();
	logger.info(" catalogProductsFolder "+catalogProductsFolder);
	var classHomeID = LibCatalogPrice.getCatalogRegionID(logger, catalogProductsFolder);
     logger.info(" classHomeID in Price "+classHomeID);
     LibCatalogPrice.calculateSKUPrice(step, logger, classHomeID, catalogProductsFolder, node);
}
}