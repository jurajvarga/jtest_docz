/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_App_Mgr_PC_Review_OnEntry",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA App Mgr PC Review OnEntry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
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
exports.operation0 = function (node,step,BL_Library) {
var workflow = step.getWorkflowHome().getWorkflowByID("WF4_App_Mgr_PC_Review_Workflow");
var instance = node.getWorkflowInstance(workflow);
var figAss = node.getValue("Figure_Assignment").getID();
var wfID = "WF4_App_Mgr_PC_Review_Workflow";
var transactionID = "Start";
var stateID = "Figure_Review";
var product=node;

if (figAss != null && figAss.equals("005")) {
    if (node.isInState("WF4_App_Mgr_PC_Review_Workflow", "Figure_Review")) {
        log.info("Triggering Submit for App Manager");
        // STEP-5818 using library function
        BL_Library.triggerTransition(product, transactionID, wfID, stateID, false);
        // STEP-5818 ends
    }
}

if (figAss != null && figAss.equals("003")) {
    if (node.isInState("WF4_App_Mgr_PC_Review_Workflow", "Figure_Review")) {
        log.info("Triggering Submit for ProdTeam05");
        // STEP-5818 using library function
        BL_Library.triggerTransition(product, transactionID, wfID, stateID, false);
        // STEP-5818 ends
    }
}

if (figAss != null && figAss.equals("001")) {
    if (node.isInState("WF4_App_Mgr_PC_Review_Workflow", "Figure_Review")) {
        log.info("Triggering Submit for Dev Sci");
        // STEP-5818 using library function
        BL_Library.triggerTransition(product, transactionID, wfID, stateID, false);
        // STEP-5818 ends
    }
}

if (figAss != null && figAss.equals("006")) {
    if (node.isInState("WF4_App_Mgr_PC_Review_Workflow", "Figure_Review")) {
        log.info("Triggering Submit for Production");
        // STEP-5818 using library function
        BL_Library.triggerTransition(product, transactionID, wfID, stateID, false);
        // STEP-5818 ends
    }
}
}