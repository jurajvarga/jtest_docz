/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsMaintenanceOrCopyProduct",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_IsMaintenanceOrCopyProduct",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
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
var workflowType = node.getValue("Workflow_Type").getSimpleValue();
var workflowNo = node.getValue("Workflow_No_Initiated").getSimpleValue(); // STEP-5841
var abrWFName = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();

if ((workflowType == "M" && workflowNo != "2") || abrWFName == "CarrierFree") { // STEP-5841 added wf != 2
    return true;
} else {
    return false;
}
}