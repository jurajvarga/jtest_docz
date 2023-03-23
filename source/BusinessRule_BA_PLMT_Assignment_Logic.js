/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PLMT_Assignment_Logic",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "PLMT Assignment Logic",
  "description" : "Assigned to the PMLT group for Product Creation and Maintenance Workflows",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "workflow",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,workflow) {
var sAssignee = node.getValue("ProdTeam_Planner_Product").getSimpleValue();

//testing ONLY
//should create a workflow variable and bind to Current workflow
//var workflow = step.getWorkflowHome().getWorkflowByID("Product_SKU_Creation");
var instance = node.getWorkflowInstance(workflow);
	  
var group = step.getGroupHome().getGroupByID(sAssignee);
//log.info(group);
if (group) {
	instance.getTaskByID("PMLT_Review").reassign(group);
	var eMail = group.getValue("User_Group_Email").getSimpleValue();
	if(eMail){
		instance.setSimpleVariable("Workflow_State_Assignee", eMail)
	}
	
}else{
	instance.setSimpleVariable("WorkflowErrorMessage", "Unable to determine assignee for PMLT state.");
}
}