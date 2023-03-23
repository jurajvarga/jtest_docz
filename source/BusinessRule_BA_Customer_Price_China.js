/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Customer_Price_China",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_Customer_Price_China",
  "description" : "Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).",
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
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
exports.operation0 = function (step,node,logger,LibCatalogPrice) {
/**
script ID: BA_Customer_Price_China
description: 
    Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).
bindings: 
    node --> Current Object
    step --> STEP Manager
    logger --> Logger
09/25/2020 YAbdennassib Created
**/

var classHomeID = "CR338406";  // China
var classHomeRoot = node.getManager().getClassificationHome().getClassificationByID(classHomeID);

LibCatalogPrice.loopToCatalogFolderSKU_Region(step, logger, node, classHomeRoot);
}