/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Maintenance_Calculate_Discounts",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_Maintenance_Calculate_Discounts",
  "description" : "For a SKU, calculate discounts (current and future) for every customer across all regions",
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (step,logger,node,LibCatalogPrice) {
/**
script ID: BA_Maintenance_Calculate_Discounts
developer: Michael Miracle (with historic code)
description: 
    Calculate discounts (current and future) for every customer that has a corresponding discount attribute on a SKU (current object).
    Approval of SKU, attributes, or classification can be in any state.

valid object types: SKU
bindings: 
    node --> Current Object
    step --> STEP Manager
    logger --> Logger
**/
var arrRegion = ["CR338408", // US,
		       "UK000001", // UK,
			  "CR338405", // Japan
			  "DE_Catalogs", // Germany
			  "CR338407", // Europe
			 ];

for (idx in arrRegion) {
	var classHomeID = arrRegion[idx];
	var classHomeRoot = node.getManager().getClassificationHome().getClassificationByID(classHomeID);
	
	LibCatalogPrice.loopToCatalogFolderSKU(step, logger, classHomeID, classHomeRoot, node);
}
}