/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Copy_Current_Price_To_Future_EU",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA Copy Current PriceTo Future_EU",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_PricingUtil",
    "libraryAlias" : "bl_pricingutil"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "sku",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (sku,bl_pricingutil) {
bl_pricingutil.copyCurrentToFuturePriceForRegion(sku,"EU");
}