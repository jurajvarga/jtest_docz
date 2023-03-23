/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetFigureKeyForImage",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_SetFigureKeyForImage",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage", "Product_DataSheet" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,logger) {
//logger.info(" node "+node);
var parentList=node.getClassifications().toArray();
//logger.info(" parentList "+parentList);

if (parentList){
	var figureKey = parentList[0].getValue("Figure_Key").getSimpleValue();
	logger.info(" figureKey Importer "+figureKey);
	node.setName(figureKey);
	node.getValue("Figure_Key").setSimpleValue(figureKey);
	
}
}