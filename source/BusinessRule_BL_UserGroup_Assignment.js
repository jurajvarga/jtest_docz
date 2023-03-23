/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_UserGroup_Assignment",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL UserGroup Assignment",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
// Assign Task to user Group
//DS - Dev SCI
//AM - Application Manager
//PR - Production
function reassignUserGroup(node, groupCode, manager, workflow) {
    var planner = "";
    var task;
    var assignee;
    log.info("Function reassignUserGroup is started...");
    if (groupCode == "DS") {
        log.info("Function reassignUserGroup is in Dev Sci Assignment.");
        if (node.getValue("Figure_Folder_DevSci").getSimpleValue() != null) {
            planner = node.getValue("Figure_Folder_DevSci").getSimpleValue();
        } else {
            planner = "Dev_Sci";
        }
        log.info(" Planner " + planner);
        if (planner != "Orphan") {
            task = node.getWorkflowInstance(workflow).getTaskByID("Dev_Sci_Review");
        }

        if (manager.getUserHome().getUserByID(planner) != null && manager.getUserHome().getUserByID(planner) != "") {
            assignee = manager.getUserHome().getUserByID(planner);
        } else {
            assignee = manager.getGroupHome().getGroupByID("Dev_Sci");
        }




    } else if (groupCode == "PR") {
        log.info("Function reassignUserGroup is in Production Assignment.");
        if (node.getValue("Figure_Folder_production_team").getSimpleValue() != null) {
            planner = node.getValue("Figure_Folder_production_team").getSimpleValue();
        } else {
            planner = "Production";
        }
        log.info(" Planner " + planner);
        if (planner != "Orphan") {
            task = node.getWorkflowInstance(workflow).getTaskByID("Production_Review");
        }


        if (manager.getGroupHome().getGroupByID(planner) != null && manager.getGroupHome().getGroupByID(planner) != "") {
            assignee = manager.getGroupHome().getGroupByID(planner)
        } else {
            assignee = manager.getGroupHome().getGroupByID("Production");
        }


    } else if (groupCode == "AM") {
        var appProtClass = getApplicationGroup(node, manager);
        if (appProtClass != null) {
            var appProtObj = appProtClass[0];
            log.info(" Classification Object : " + appProtObj);

            planner = appProtObj.getValue("AssignmentGroup").getSimpleValue();
            log.info(" Group ID " + planner);
        } else {
            planner = "Application_Manager";
        }
        if (planner != "") {
            task = node.getWorkflowInstance(workflow).getTaskByID("App_Manager");
        }

        if (manager.getGroupHome().getGroupByID(planner) != null && manager.getGroupHome().getGroupByID(planner) != "") {
            assignee = manager.getGroupHome().getGroupByID(planner)
        } else {
            assignee = manager.getGroupHome().getGroupByID("Application_Manager");
        }

    }
    log.info(" task " + task);
    if (task) {
        log.info(" In Task - assignee " + assignee);
        log.info(" In Task - planner " + planner);
        if (assignee) {
            manager.executeWritePrivileged(function () {
                task.reassign(assignee);
            });

            log.info(" Task Reassinged ...");
        }
    }
    log.info("Function reassignUserGroup is Finished ...");
}

function reassignUserGroupRevision(node, manager, workflow, stateId) {
    var planner = "";
    var defaultValue = "";
     var assignee;
    if (stateId == 'Production_Review' || stateId == 'Prod_Sci_Review' || stateId == 'Create_Short_Name' || stateId == 'Group_Leader_Review' ||
      stateId =='GL_Figure_Review') {
        defaultValue = 'ProdTeam_Planner_Product';
    } else if (stateId == 'Dev_Sci_Review') {
        defaultValue = 'DEV_SCI';
        
    }

    if (node.getValue(defaultValue).getSimpleValue() != null &&
        node.getValue(defaultValue).getSimpleValue() != "") {

        log.info("defaultValue: " + defaultValue);

        planner = node.getValue(defaultValue).getSimpleValue();
        log.info("planner: " + planner);

        if (stateId == 'Dev_Sci_Review'){
	        if (manager.getUserHome().getUserByID(planner) != null && manager.getUserHome().getUserByID(planner) != "") {
	            assignee = manager.getUserHome().getUserByID(planner);
	        } else {
	            assignee = manager.getGroupHome().getGroupByID("Dev_Sci");
	        }
        }
        if (planner != "Orphan") {
            var task = node.getWorkflowInstance(workflow).getTaskByID(stateId);
        }
        if (task) {
            //log.info("task: " + task.getName());

            if (!assignee){

              assignee = manager.getGroupHome().getGroupByID(planner);
              log.info("assignee: " + assignee);
           
            }

             if (assignee) {
	            manager.executeWritePrivileged(function () {
	                task.reassign(assignee);
	            });
	            log.info("Task Reassigned");
            }
        }
    }
}


function getApplicationGroup(node, manager) {
    var searchValue;
    var searchAttribute;
    var appProtObjList = null;

    if (node.getValue("Figure_Application_Type").getSimpleValue() != null && node.getValue("Figure_Application_Type").getSimpleValue() != '') {
        searchValue = node.getValue("Figure_Application_Type").getSimpleValue();
        searchAttribute = manager.getAttributeHome().getAttributeByID("APPLICATIONABBR");
    }
    /*else if (node.getValue("Figure_Heading").getSimpleValue() != null && (node.getValue("Figure_Heading").getSimpleValue() != ''){
        searchValue = node.getValue("Figure_Heading").getSimpleValue();
        searchAttribute = manager.getAttributeHome().getAttributeByID("Application");
    }*/

    if (searchValue) {
        var searchHome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
        var type = com.stibo.core.domain.Classification;
        //var searchAttribute = manager.getAttributeHome().getAttributeByID("APPLICATIONABBR");
        //var searchValue = node.getValue("Figure_Application_Type").getSimpleValue();
        var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
        log.info("Query created...");
        appProtObjList = searchHome.querySingleAttribute(query).asList(1).toArray();
    }

    return appProtObjList;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.reassignUserGroup = reassignUserGroup
exports.reassignUserGroupRevision = reassignUserGroupRevision
exports.getApplicationGroup = getApplicationGroup