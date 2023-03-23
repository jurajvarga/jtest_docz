/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Show_Readonly_Tab",
  "type" : "BusinessCondition",
  "setupGroups" : [ "FiguresReview" ],
  "name" : "BC Show Readonly Tab",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
var sFigureStatus = node.getValue("Figure_Status").getValue();
var sFigureName = node.getName();
var isEditable = false;
if (sFigureName.contains("_ds"))
{
	isEditable = true;
}
return isEditable
}