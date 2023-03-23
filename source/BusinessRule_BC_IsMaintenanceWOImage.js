/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsMaintenanceWOImage",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_IsMaintenanceWOImage",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
var workflowName=node.getValue("Workflow_Name_Initiated").getSimpleValue();
var workflowInitiator=node.getValue("Workflow_Initiated_By").getSimpleValue();
if ( workflowName=="Image Only Change" || workflowName=="Full Product Review Workflow"||workflowName=="Add/Drop Apps" ||workflowName=="Publish Product" || workflowInitiator =="PDP/PLM"){
	return false;
}else{
	return true;
}
}