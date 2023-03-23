/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_FigureLastModifyDate",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_FigureLastModifyDate",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var approvedDate =  new Date().getFullYear()+("0"+(new Date().getMonth()+1)).slice(-2)+("0"+new Date().getDate()).slice(-2);

log.info(approvedDate);
//node.getValue("xxx").setSimpleValue(approvedDate);
}