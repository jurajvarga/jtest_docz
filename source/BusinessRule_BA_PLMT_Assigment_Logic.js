/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PLMT_Assigment_Logic",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "PLMT Assigment Logic",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
var sAssignee = node.getValue("PRODUCTION_TEAM").getSimpleValue();

//log.info("Assignee --> " + sAssignee);
var workflow = step.getWorkflowHome().getWorkflowByID("Product_SKU_Creation");
var instance = node.getWorkflowInstance(workflow);
	  
var group = step.getGroupHome().getGroupByID(sAssignee);
//log.info(group);
if (group) {
	instance.getTaskByID("PMLT_Review").reassign(group);
}
}