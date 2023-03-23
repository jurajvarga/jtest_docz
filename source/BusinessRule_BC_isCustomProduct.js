/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isCustomProduct",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isCustomProduct",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
//STEP-6032
var abbrWF = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();
var isCustom = abbrWF != null && abbrWF.toLowerCase() == "custom";
if (node.getValue("CustomLotRev_YN").getSimpleValue() == "Y" || node.getValue("Custom_Workflow_YN").getSimpleValue() == "Y" || isCustom) {
	return true;
} else {
	return false;
}
}