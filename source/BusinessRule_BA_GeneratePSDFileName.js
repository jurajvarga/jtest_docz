/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GeneratePSDFileName",
  "type" : "BusinessAction",
  "setupGroups" : [ "AssetBusinessActions" ],
  "name" : "Generate Product Status Document FileName on Approval",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "MaintenanceDocuments", "ProductStatusDocuments" ],
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
var name = node.getName();
logger.info(" name "+name);

var extension = node.getValue("asset.extension").getSimpleValue();
logger.info(" extension "+extension);


var uploadedtime = node.getValue("asset.uploaded").getSimpleValue();
logger.info(" uploadedtime "+uploadedtime);



var approvedDate = uploadedtime.replace("-","").replace(":","").replace(" ","");
logger.info(" approvedDate "+approvedDate);

var approvedFigName = new java.lang.StringBuilder(name).append("_").append(approvedDate).append(".").append(extension);
node.getValue("Approved_Figure_Name").setSimpleValue(approvedFigName.toString());
logger.info(" approvedFigName "+approvedFigName.toString());
}