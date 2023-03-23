/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Task_User_Assignment",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_Task_User_Assignment",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
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
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
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
exports.operation0 = function (node,manager,auditEventType,auditQueueMain,auditQueueApproved,workflow,BL_AuditUtil,BL_Library,BL_UserGroupAss) {
log.info("Executing BR BA_Task_User_Assignment");

//Get Workflow
//For Testing enable below commented line and remove bind for current workflow
/*var worflowinstances = node.getWorkflowInstances()
var cValsItr = worflowinstances.iterator();
var workflow;

while (cValsItr.hasNext()) {
    var cVal = cValsItr.next();
    //log.info(cVal.getWorkflow().getID())
    workflow = cVal.getWorkflow();
    break;
}*/

var instance = node.getWorkflowInstance(workflow);

//Get Current State in the Workflow
var stateID = "";
var previousUserID = "";
var groupCode = "";
if (instance != null) {
    stateID = BL_Library.getCurrentTaskState(instance);

}
log.info(" stateID " + stateID);


//Setting Previous State as Initial 
var previousStateID = "Initial"

//Get task and the user id before assignment
var task = node.getWorkflowInstance(workflow).getTaskByID(stateID);
if (task) {
    previousUserID = task.getAssignee().getID();
}
log.info(" previousUserID " + previousUserID);

//Get Workflow ID and call corresponding assign method
var wfID = workflow.getID()
log.info("wfID " + wfID);

if (wfID == "WF4_App_Mgr_PC_Review_Workflow") {

    //Set Group Code based on State ID
    if (stateID == "Production_Review") {
        groupCode = "PR";
    } else if (stateID == "App_Manager") {
        groupCode = "AM";
    } else if (stateID == "Dev_Sci_Review") {
        groupCode = "DS";
    }


    log.info(" groupCode " + groupCode);

    BL_UserGroupAss.reassignUserGroup(node, groupCode, manager, workflow);
}else {
    BL_UserGroupAss.reassignUserGroupRevision(node, manager, workflow, stateID);
}
//Get User after regroup
var task = node.getWorkflowInstance(workflow).getTaskByID(stateID);
if (task) {
    userID = task.getAssignee().getID();
}

 log.info(" userID " + userID);
 
//Add Audit Entry
BL_AuditUtil.buildAndSetAuditMessageForAssign(node, manager, wfID, "Assign_Action", "Task_User_Assign", previousStateID, previousUserID, stateID, userID, false, "", auditEventType, auditQueueMain, auditQueueApproved);


 log.info(" Audit is Finished ");
 
}