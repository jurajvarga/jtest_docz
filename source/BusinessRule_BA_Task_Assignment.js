/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Task_Assignment",
  "type" : "BusinessAction",
  "setupGroups" : [ ".AToBeDeleted" ],
  "name" : "BA_Task_Assignment",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_UserGroup_Assignment",
    "libraryAlias" : "BL_UserGroupAss"
  } ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_UserGroupAss) {
var planner = "";

var workflowID = "Production_Workflow";
var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);
log.info("Executing BR BA_Task_Assignment");

BL_UserGroupAss.reassignUserGroupRevision(node,manager,workflow,'GL_Figure_Review');


/*if (node.getValue("ProdTeam_Planner_Product").getSimpleValue() != null &&
    node.getValue("ProdTeam_Planner_Product").getSimpleValue() != "") {
    
    planner = node.getValue("ProdTeam_Planner_Product").getSimpleValue();
    log.info(planner);

    if (planner != "Orphan") {

        var task = node.getWorkflowInstance(workflow).getTaskByID("GL_Figure_Review");
    }

    if (task) {

        log.info("Reassigning task for the revision " + node.getName());
        
        var assignee = manager.getGroupHome().getGroupByID(planner);
        task.reassign(assignee);
        log.info("Task Reassigned");
    }
}*/
}