/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Show_Edit_Tab",
  "type" : "BusinessCondition",
  "setupGroups" : [ "FiguresReview" ],
  "name" : "BC Show Edit Tab",
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
var isEditable = true;
if ( sFigureName.contains("_ds"))
{
	isEditable = false;
}
return isEditable
}