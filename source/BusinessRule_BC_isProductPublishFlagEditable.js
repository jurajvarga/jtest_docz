/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isProductPublishFlagEditable",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isProductPublishFlagEditable",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  } ]
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_Library) {
//STEP-5831
//STEP-6143 Wrokflow_Type added
//var currentUser = manager.getCurrentUser();
//var groups = currentUser.getGroups();
// Publish Product flag is editable only if it is WF "Publisg Product Change" or "Full maintenance" 
//Only in the part "Production_Workflow"

// STEP-5841 added wf==2
if((node.getValue("Workflow_No_Initiated").getSimpleValue() == "21" || node.getValue("Workflow_No_Initiated").getSimpleValue() == "20" || node.getValue("Workflow_No_Initiated").getSimpleValue() == "2" || node.getValue("Workflow_Type").getSimpleValue() == "N" ) && node.isInWorkflow("Production_Workflow"))
{
	return true;
}
else {
	return false;
}
}