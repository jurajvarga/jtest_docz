/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ReturnToPAGReview",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Return to PAG Review",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "bl_AssetUpdatesUtil"
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,web,busCond,bl_AssetUpdatesUtil) {
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
var links = node.queryReferences(refType);//STEP-6396
var workflowID = "WF6_Content_Review_Workflow";
var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);
var Workflow_Notes = node.getValue("Workflow_Notes").getSimpleValue()
log.info("***Workflow_No_Initiated" + node.getValue("Workflow_No_Initiated").getSimpleValue());

var prodToFigureFolder = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder")
var figFolderRef = node.queryReferences(prodToFigureFolder)//STEP-6396 


var workflowType = node.getValue("Workflow_Type").getSimpleValue();
log.info(" workflowType " + workflowType);


var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo " + wfInitiatedNo);

var redirectProduction = false;

//If Workflow type is maintenance or any of the figure folder Content Review Assignment is production for active status for NPI redirect to production
//If not assign to devsci group

//comment after testing, add bind variable
//var web = "";


var condResult = busCond.evaluate(node);
var isNewWorkflow = condResult.isAccepted();
log.info(" isNewWorkflow " + isNewWorkflow);

if (isNewWorkflow) {
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
} else if (workflowType == "M" && wfInitiatedNo != "2") { // STEP-6595 added wf != 2
    redirectProduction = true;
}

if (wfInitiatedNo == "19") {

    if (node.isInState(workflowID, "Copy_Editor_Review") && redirectProduction) {

        setWorkflowRedirect(node, workflowID, "Copy_Editor_Review", "Production_Review", "GoToProdWF6", web, "WF6_Content_Review_Tasklist", "Returned to Production Review.", "Item from Copy Editor Review was returned back to Production Review in Content Review.")
    } else {
        // after TEST: uncomment web and comment log
        web.showAlert("ACKNOWLEDGMENT", "Return to PAG not allowed.", "The item from the Maintenance Content Only workflow is not allowed to return to PAG review.");
        //log.info("ACKNOWLEDGMENT" + "\n" + "Return to PAG not allowed." + "\n" + "The item from the Maintenance Content Only workflow is not allowed to return to PAG review.");
    }
} else {
    //If Copy editor then in content review to dev sci or production in content review
    if (node.isInState(workflowID, "Copy_Editor_Review")) {
        if (redirectProduction) {

            setWorkflowRedirect(node, workflowID, "Copy_Editor_Review", "Production_Review", "GoToProdWF6", web, "WF6_Content_Review_Tasklist", "Returned to Production Review.", "Item from Copy Editor Review was returned back to Production Review in Content Review.")


        } else {
            setWorkflowRedirect(node, workflowID, "Copy_Editor_Review", "Dev_Sci_Review", "GoToDevSciWF6", web, "WF6_Content_Review_Tasklist", "Returned to Dev Sci Review.", "Item from Copy Editor Review was returned back to Dev Sci Review in Content Review.")


        }
    } else { // Dev sci and Prod then run PAG wf 
        var changeNeeded = false;
        var hasInactiveOrNone = false;
        links.forEach(function(ref) { //STEP-6396
            var productFolder = ref.getTarget();//STEP-6396
            
            log.info("PF " + productFolder);

            productFolder.getValue("Workflow_Notes").setSimpleValue(Workflow_Notes)
            productFolder.getValue("Workflow_Name_Initiated").setSimpleValue(node.getValue("Workflow_Name_Initiated").getSimpleValue())

            //Check if exists FF with the status "Change Needed"
            changeNeeded = bl_AssetUpdatesUtil.isFFStatusChangeNeeded(productFolder);
            log.info("changeNeeded: " + changeNeeded);
            hasInactiveOrNone = bl_AssetUpdatesUtil.hasOnlyInactiveFFOrEmpty(productFolder);
            log.info("hasInactiveOrNone: " + hasInactiveOrNone);

            // STEP-5704 - adding hasInactiveOrNone
            if (changeNeeded || hasInactiveOrNone) {
                // send product folder to PAG review
                if (!productFolder.isInWorkflow("PAG_App_Mgr_PC_Review_Workflow")) {
                    var instance = productFolder.startWorkflowByID("PAG_App_Mgr_PC_Review_Workflow", "");
                    log.info("PAG_App_Mgr_PC_Review_Workflow")
                }
            } else {
                // after TEST: uncomment web and comment log
                web.showAlert("WARNING", "Not Returned to PAG Review.", "Item was not returned to PAG Workflow because there is no Figure Folder with a status of Change Needed.");
                //log.info("WARNING" + "\n" + "Not Returned to PAG Review." + "\n" + "Item was not returned to PAG Workflow because there is no Figure Folder with a status of Change Needed.");
            }
            return true;
        });
        // STEP-5704 - adding hasInactiveOrNone
        if (changeNeeded || hasInactiveOrNone) {
            // send to WF4 dummy
            if (!node.isInWorkflow("WF4-Dummy")) {
                node.startWorkflowByID("WF4-Dummy", "Returning to PAG folder");
            }

            // send revision out of WF6
            var workflowID = "WF6_Content_Review_Workflow";
            var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);

            if (node.isInState(workflowID, "Dev_Sci_Review")) {
                
                setWorkflowRedirect(node, workflowID, "Dev_Sci_Review", "Dev_Sci_Review", "Return_to_PAG_Review", web, "WF6_Content_Review_Tasklist", "Returned to PAG Review.", "Item was successfully returned to PAG_App_Mgr_PC_Review_Workflow.")
            } else if (node.isInState(workflowID, "Production_Review")) {

                setWorkflowRedirect(node, workflowID, "Production_Review", "Production_Review", "Return_to_PAG_Review", web, "WF6_Content_Review_Tasklist", "Returned to PAG Review.", "Item was successfully returned to PAG_App_Mgr_PC_Review_Workflow.")
            }
        }
    }
}


function setWorkflowRedirect(node, workflowID, sourceID, stateID, destID, web, navState, ackTitle, ackMessage) {
    //Example
    //sourceID  -- "Copy_Editor_Review"
    //stateID - "Production_Review"
    //destID -"GoToProdWF6"
    //navState - "WF6_Content_Review_Dev_Sci_Tasklist"
    //ackTitle - "Returned to Production Review."
    //ackMessage - "Item from Copy Editor Review was returned back to Production Review in Content Review."
    var task = node.getTaskByID(workflowID, sourceID);
    var state = workflow.getStateByID(stateID);
    task.triggerByID(destID, "");

    // after Test uncomment web, comment log
    web.navigate(navState, null, state);
    web.showAlert("ACKNOWLEDGMENT", ackTitle, ackMessage);
    //log.info("ACKNOWLEDGMENT" + "\n" + ackTitle + "\n" + ackMessage);
}
}