/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Cancel_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Global_Cancel_Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Global_Exit_Product_Maintenance",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Exit_Product_Maintenance",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BA_Approve,BA_Global_Exit_Product_Maintenance,manager,webui,baResetAuditInstanceID) {
var wfID = "Product_Maintenance_Upload";
var wf = manager.getWorkflowHome().getWorkflowByID(wfID);
var stateID;
var state;
var tasklistScreenID;


if (node.isInState(wfID, "UserSystem_Initiated_Maintenance")) {
    // other maintenances

    stateID = "UserSystem_Initiated_Maintenance";
    state = wf.getStateByID(stateID);
    tasklistScreenID = "Product_Maintenance_Upload-UserSystem_Initiated_Maintenance-Tasklist";
    
    //STEP-6588 revert attr ProdTeam_Planner_Product if it was changed by TT
    if (node.getValue("Workflow_Initiated_By").getSimpleValue() =="PDP/PLM"){  
        var approvedNode = BL_Library.getApprovedNode(manager, node);
        var prodTeamPlannerOriginal = approvedNode.getValue("ProdTeam_Planner_Product").getSimpleValue();
        if (node.getValue("ProdTeam_Planner_Product").getSimpleValue() != prodTeamPlannerOriginal) {
            node.getValue("ProdTeam_Planner_Product").setSimpleValue(prodTeamPlannerOriginal);
        }
    }   

} else if (node.isInState(wfID, "Product_Status_Maintenance")) {
    // product status change

    stateID = "Product_Status_Maintenance";
    state = wf.getStateByID(stateID);
    tasklistScreenID = "Product_Maintenance_Upload-Product_Status_Maintenance-Tasklist";

} else if (node.isInState(wfID, "OTS_Conversion")) { // STEP-5841
    stateID = "OTS_Conversion";
    state = wf.getStateByID(stateID);
    tasklistScreenID = "Product_Maintenance_Upload-OTS_Conversion-Tasklist";
}


//using a common BR to trigger submit in the Product_Maintenance_Upload workflow that exits a product from the workflow and setting values on product to blank
BA_Global_Exit_Product_Maintenance.execute(node);

//Changes done for STEP-6014 starts


//Reset Audit Instance
baResetAuditInstanceID.execute(node);
//Changes done for STEP-6014 ends

// Approve an object
BA_Approve.execute(node);

// Navigate to tasklist screen
if (stateID) {
    
    webui.navigate(tasklistScreenID, null, state);
    webui.showAlert("ACKNOWLEDGMENT", "Init Action", "Item has been canceled successfully.");
}

}