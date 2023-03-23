/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Customer_Price_Europe",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_Customer_Price_Europe",
  "description" : "Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).",
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
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
script ID: BA_Customer_Price_Europe
description: 
    Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).
bindings: 
    node --> Current Object
    step --> STEP Manager
    logger --> Logger
01/01/2019 MMiracle First tracked version
07/12/2020 RSathi/Miro Moved hardcoded customer ids to a generalized customer loop logic 
**/

var classHomeID = "CR338407";  // Europe
var classHomeRoot = node.getManager().getClassificationHome().getClassificationByID(classHomeID);

LibCatalogPrice.loopToCatalogFolderSKU(step, logger, classHomeID, classHomeRoot, node);
}