/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Content_Review_OnEntry",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Content Review OnEntry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : true,
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baProductKitRevisionApprovalAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,busCond,baProductKitRevisionApprovalAction,BL_Library) {
var workflow = manager.getWorkflowHome().getWorkflowByID("WF6_Content_Review_Workflow");
var instance = node.getWorkflowInstance(workflow);

var workflowType = node.getValue("Workflow_Type").getSimpleValue();
log.info(" workflowType " + workflowType);

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo " + wfInitiatedNo);

// STEP-6162 reading abbr wf name
var abbrWfName = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();

var prodToFigureFolder = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
var figFolderRef = node.queryReferences(prodToFigureFolder); //STEP-6396 

var redirectProduction = false;

var figureChanged = node.getValue("FigureChanged_YN").getSimpleValue();

// if wf17 was initiated and there was no figure change, call the BR to add Rev_Application_Figures to the app protocol reference
if (wfInitiatedNo == "17" && figureChanged != "Y") {
    baProductKitRevisionApprovalAction.execute(node);
}

//If Workflow type is maintenance or any of the figure folder Content Review Assignment is production for active status for NPI redirect to production
//If not assign to devsci group


var condResult = busCond.evaluate(node);
var isNewWorkflow = condResult.isAccepted();
log.info(" isNewWorkflow " + isNewWorkflow);

if (isNewWorkflow) {

    // STEP-6162 for carrier free redirect to production
    if (abbrWfName == "CarrierFree") {
        redirectProduction = true;
    } else {
        //STEP-6396
        figFolderRef.forEach(function(ref) {
            var figFolderObj = ref.getTarget();
            var figAmAssignID = figFolderObj.getValue("Figure_AM_Assign").getID();
            var figFolderStatus = figFolderObj.getValue("Figure_Status").getSimpleValue();
            log.info(" figAmAssignID " + figAmAssignID);
            log.info(" figFolderStatus " + figFolderStatus);
            if (figAmAssignID == "006" && figFolderStatus == "Approved") {
                redirectProduction = true;
                return false;
            }
            return true;
        });
        //STEP-6396
    }

} else if (workflowType == "M" && wfInitiatedNo != "2") { // STEP-5841 added wf != 2
    redirectProduction = true;
}

//If Redirect Production is true ,then send to production review or send to devsci review

if (redirectProduction) {
    if (node.isInState("WF6_Content_Review_Workflow", "Initial")) {
        log.info("Triggering Submit for  Production ");
        // STEP-5818 adding an argument to function
        BL_Library.triggerTransition(node, "Skip_to_Production_Review", "WF6_Content_Review_Workflow", "Initial", false);
        // STEP-5818 ends
    }
} else {
    if (node.isInState("WF6_Content_Review_Workflow", "Initial")) {
        log.info("Triggering Submit for  Production ");
        // STEP-5818 adding an argument to function
        BL_Library.triggerTransition(node, "Skip_to_DevSci_Review", "WF6_Content_Review_Workflow", "Initial", false);
        // STEP-5818 ends
    }
}
}