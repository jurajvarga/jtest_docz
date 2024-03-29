/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_WorkflowUtil",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_WorkflowUtil",
  "description" : "API Related to workflow related variables",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  } ]
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
function setWorkflowCompleted(logger, currentobj, wf) {
    var wfInstance = currentobj.getWorkflowInstance(wf);
    var workflowId = wfInstance.getWorkflow().getID();
    logger.info(" workflowId " + workflowId);

    if (workflowId == "Marketing_Review_Workflow") {
        currentobj.getValue("Workflow_Completed").addValue("2");
    } else if (workflowId == "SDS-DG Workflow") {
        currentobj.getValue("Workflow_Completed").addValue("3");
    } else if (workflowId == "WF6_Content_Review_Workflow") {
        currentobj.getValue("Workflow_Completed").addValue("6");
    }

}

/*function setWorkflowCompletedWithWFId(logger,currentobj,workflowId){

	logger.info(" workflowId "+workflowId);
	
	if (workflowId=="Marketing_Review_Workflow"){
		currentobj.getValue("Workflow_Completed").addValue("2");	
	}else if (workflowId=="SDS-DG Workflow"){
		currentobj.getValue("Workflow_Completed").addValue("3");
	}else if (workflowId=="WF6_Content_Review_Workflow"){
		currentobj.getValue("Workflow_Completed").addValue("6");
	}
	
}*/

function populateWorkflowCompletedList(logger, currentobj) {
    var availList = [];

    //Get List Values 
    var workflowCompList = currentobj.getValue("Workflow_Completed").getValues();

    if (workflowCompList != null) {
        logger.info(workflowCompList.size());
        for (var vix = 0; vix < workflowCompList.size(); vix++) {
            var wfNo = workflowCompList.get(vix).getSimpleValue() + "";
            logger.info(" wfNo " + wfNo);
            availList.push(wfNo);
        }

    }
    logger.info(" availList " + availList);
    return availList;
}


function isRegionalRevisionReadyForCreation(completedList) {

    var createRegionRevision = false;
    if (completedList.indexOf("2") > -1 && completedList.indexOf("3") > -1) {
        createRegionRevision = true;
    }

    return createRegionRevision;
}

function isReadyForSFGI(completedList) {

    var isReadyForSFGI = false;
    if (completedList.indexOf("2") > -1 && completedList.indexOf("3") > -1 && completedList.indexOf("6") > -1) {
        isReadyForSFGI = true;
    }

    return isReadyForSFGI;
}

function contentApproveSubmit(manager, node, webui, lib) {

    // this BR requires the page "WF6_Content_Review_Copy_Editor_Details" has "Use Immediate Save" checked 
    // or user must save every row in the table manualy
    var indexOne = false;
    var prodRev2FigFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
    var nameOfFolder = '';
    var isExists = false;
    var hasActiveImages = false;

    if (prodRev2FigFolderRefType != null) {
        var pubFigFolderLinks = node.queryReferences(prodRev2FigFolderRefType); //STEP-6396

        pubFigFolderLinks.forEach(function(ref) {    //STEP-6396
            var target = ref.getTarget(); // Figure_Folder //STEP-6396
            nameOfFolder = target.getName();
            if (nameOfFolder.indexOf("fig") > 0) {
                isExists = true;

                var kids = target.getAssets();
                var kidsItr = kids.iterator();

                while (kidsItr.hasNext()) {
                    var kid = kidsItr.next();
                    var kot = kid.getObjectType().getID(); // ProductImage or Product_DataSheet

                    // If it is Product Image and has Image Status Active
                    if (kot.equals("ProductImage") && kid.getValue("Image_Status").getSimpleValue() &&
                        kid.getValue("Image_Status").getSimpleValue().equals("Active")) {

                        hasActiveImages = true;

                        // STEP-5729 adding accepting index 01
                        // If the Figure Folder has the index value set to 1 and 01
                        if (target.getValue("Figure_Display_Index").getSimpleValue() &&
                            (target.getValue("Figure_Display_Index").getSimpleValue().equals("1") ||
                                target.getValue("Figure_Display_Index").getSimpleValue().equals("01"))) {

                            indexOne = true;
                        }
                    }

                    // STEP-5729, what we do here is already included in the if block just above --> commenting this section, needs to be removed after review
                    /*
                    if (kot.equals("ProductImage") &&
                        kid.getValue("Image_Status").getSimpleValue() &&
                        kid.getValue("Image_Status").getSimpleValue().equals("Active") &&
                        target.getValue("Figure_Display_Index").getSimpleValue() &&
                        target.getValue("Figure_Display_Index").getSimpleValue().equals("1")) {
                        indexOne = true;
                    }
                    */
                }
            }
            return true; //STEP-6396
        });
    }

    if (indexOne == false && hasActiveImages == true && isExists == true) {
        webui.showAlert("WARNING", "Warning", " At least one figure needs to have display index of value 1 or 01.");
        log.info("Warning: At least one figure needs to have display index of value 1 or 01.");
    } else {

        var workflow = manager.getWorkflowHome().getWorkflowByID("WF6_Content_Review_Workflow");
        var instance = node.getWorkflowInstance(workflow);

        if (instance != null) {
            var state = null;

            if (node.isInState("WF6_Content_Review_Workflow", "Dev_Sci_Review")) {
                state = "Dev_Sci_Review";
            } else if (node.isInState("WF6_Content_Review_Workflow", "Production_Review")) {
                state = "Production_Review";
            } else if (node.isInState("WF6_Content_Review_Workflow", "Copy_Editor_Review")) {
                state = "Copy_Editor_Review";
            }

            if (state != null) {
                lib.Trigger(instance, state, "Submit", "Move node within wf or out of the wf.");
            }

            webui.navigate("homepage", null);
        }
    }

}


/**
 * Assign task in the workflow specified by wfID to the provided user based on userID, 
 * build an audit message and send to audit queue.
 * @param {*} manager STEP Manager
 * @param {*} node STEP Object (e.g. revision, product, figure folder, ...)
 * @param {String} wfID Workflow ID
 * @param {String} userID User ID
 * @param {boolean} isGroup indicates if the provided user is a group or a person
 * @param {*} auditEventType Derived Event Type for Audit
 * @param {*} auditQueueMain Audit outbound endpoint for Main Workspace
 * @param {*} auditQueueApproved Audit outbound endpoint for Approved Workspace
 */
function assignToUser(manager, node, wfID, stateID, userID, isGroup, auditEventType, auditQueueMain, auditQueueApproved) {
    if (userID == '' || userID == null) {

        throw 'Please select an assignee.';

    } else {

        var wf = manager.getWorkflowHome().getWorkflowByID(wfID);
        var state = wf.getStateByID(stateID);
        var user;
        if (isGroup) {
            user = manager.getGroupHome().getGroupByID(userID);
        } else {
            user = manager.getUserHome().getUserByID(userID);
        }
        
        //STEP-6226 check if user exists
        if (user == null) {
            throw 'UserID ' + userID + ' is invalid. Please contact PIM team via servicedesk. ';
        }
        
        var instance = node.getWorkflowInstance(wf);
        var tasks = instance.getTasks().iterator();

        while (tasks.hasNext()) {
            var task = tasks.next()

            if (node.getID() == task.getNode().getID() && task.getState() == state) {
                var previousUserID = task.getAssignee().getID();
                log.info("Reassigning to " + user);
                task.reassign(user);

                BL_AuditUtil.buildAndSetAuditMessageForAssign(node, manager, wfID, "Assign_Action", "Bulk_Assign", stateID, previousUserID, stateID, userID, false, "", auditEventType, auditQueueMain, auditQueueApproved);
            }
        }
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setWorkflowCompleted = setWorkflowCompleted
exports.populateWorkflowCompletedList = populateWorkflowCompletedList
exports.isRegionalRevisionReadyForCreation = isRegionalRevisionReadyForCreation
exports.contentApproveSubmit = contentApproveSubmit
exports.assignToUser = assignToUser