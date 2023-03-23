/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Figure_Approval_Action",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Figure Approval Action",
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
var extension = node.getValue("asset.extension").getSimpleValue();
var figurekey = node.getValue("Figure_Key").getSimpleValue();
var date = new Date();
var approvedDate =  date.getFullYear()+("0"+(date.getMonth()+1)).slice(-2)+("0"+date.getDate()).slice(-2) +
				("0"+date.getHours()).slice(-2) + ("0"+date.getMinutes()).slice(-2) + ("0"+date.getSeconds()).slice(-2);
var approvedFigName = new java.lang.StringBuilder(figurekey).append("_").append(approvedDate).append(".").append(extension);

node.getValue("Approved_Figure_Name").setSimpleValue(approvedFigName.toString());
node.getValue("Modified_Date").setSimpleValue(approvedDate);

logger.info(" approvedFigName "+approvedFigName.toString());
logger.info(" extension "+extension);
logger.info(" figurekey "+figurekey);
}