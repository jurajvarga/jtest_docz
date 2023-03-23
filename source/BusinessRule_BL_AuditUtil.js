/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_AuditUtil",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_AuditUtil",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
//STEP-5929
/**
 * @description - To build and set Audit message in workflow audit action
 * @param node  - Current Object
 * @param manager  - Step Manager Object
 * @param workflow  - STEP Workflow Object
 * @param transitionEvaluation -  transitionEvaluation Object
 * @param isCancelWorkflow  -  Flag determines the current action is cancel or not
 */
function buildAndSetAuditMessage(node, manager, workflow, transitionEvaluation, isCancelWorkflow) {

    var nodeID = node.getID();
    var workflowID = "";
    if (workflow != null) {
        workflowID = workflow.getID();
    }
    var userID = manager.getCurrentUser().getID();
    var logTime = new Date().getTime();


    var eventID = null;
    var transitionMessage;
    var sourceAssignee;
    var targetAssignee;

    var sourcetask;
    var targettask;
    var transitionRejected = "";
    var resultMessages;
    var sourceStateID = null;
    var targetStateID = null;
    var concatenatedResults = "";

    //STEP 6271 - sourceStateID and sourceAssignee not empty on cancel wf
    var sourceState = transitionEvaluation.getSource();

    if (sourceState) {
        sourceStateID = sourceState.getID();
        if (sourceStateID != null) {
            sourcetask = node.getWorkflowInstance(workflow).getTaskByID(sourceStateID);
            if (sourcetask) {
                sourceAssignee = sourcetask.getAssignee().getID();
            }
        } else {
            sourceStateID = "";
            sourceAssignee = "";
        }
    }    

    if (isCancelWorkflow) {
        eventID = "Cancel";
        transitionMessage = "Cancel";
        targetStateID = "Exit";
        targetAssignee = userID;
    } else {
        var event = transitionEvaluation.getEvent();
        if (event != null) {
            eventID = event.getID();
        } else {
            eventID = "";
        }
        transitionMessage = transitionEvaluation.getMessage();
        transitionRejected = transitionEvaluation.isRejected();
        resultMessages = transitionEvaluation.getResultMessages();

        if (resultMessages.size() === 0) {
            concatenatedResults = "";
        } else {
            concatenatedResults = "Evaluation Results (" + resultMessages.size() + "): ";
        }

        var resultMessageIter = resultMessages.iterator();
        while (resultMessageIter.hasNext()) {
            concatenatedResults = concatenatedResults + resultMessageIter.next() + "; ";
        }

        var targetState = transitionEvaluation.getTarget();

        if (targetState) {
            targetStateID = targetState.getID();
            if (targetStateID != null) {
                targettask = node.getWorkflowInstance(workflow).getTaskByID(targetStateID);
                if (targettask) {
                    targetAssignee = targettask.getAssignee().getID();
                }
            } else {
                targetStateID = "";
                targetAssignee = "";
            }
        }


    }

  
     //STEP-5993
     var auditInstanceID = node.getValue("Audit_InstanceID").getSimpleValue();
     if (!(auditInstanceID  && auditInstanceID != "" && typeof auditInstanceID !== 'undefined' && auditInstanceID!="undefined")){
         createAuditInstanceID(node); 
         auditInstanceID = node.getValue("Audit_InstanceID").getSimpleValue();
     }
     //STEP-5993

    var auditMessageIndex = 0;
    if (node.getValue("Audit_Message_Index").getSimpleValue() != null) {
        auditMessageIndex = parseInt(node.getValue("Audit_Message_Index").getSimpleValue()) + 1;
    } else {
        auditMessageIndex = auditMessageIndex + 1;
    }

    node.getValue("Audit_Message_Index").setSimpleValue(auditMessageIndex);


    var parentObjectID = "";

    if (node.getObjectType().getID() == "Figure_Folder" || node.getObjectType().getID() == "Product_Rev_Folder") {
        parentObjectID = getParentObjectID(auditInstanceID, manager,node);//STEP-6189 
    }
    //STEP-6005
    if (node.getObjectType().getID() == "Regional_Revision" ) {
        parentObjectID = getRegionalParentObjectID(node, manager);
    }
   //STEP-6005

    //STEP-5993
    //Information to be captured if workflow is Universal Workflow (Product_Maintenance_Upload)
    if (workflowID == "Product_Maintenance_Upload") {
        
        if (targetStateID == "Exit") {
            //Get WIP Revision to find Workflow Name Initiated & set new revision object as parent object id
            var wipRev = BL_MaintenanceWorkflows.getWIPRevision(node);
            if (wipRev) {
                transitionMessage = wipRev.getValue("Workflow_Name_Initiated").getSimpleValue();
                parentObjectID = wipRev.getID();
                if (auditInstanceID == "" || auditInstanceID == null) {
                    auditInstanceID = wipRev.getValue("Audit_InstanceID").getSimpleValue();

                }
            }
        }
    }
    //STEP-5993

    buildAuditObjectMessage(node, nodeID, auditMessageIndex, auditInstanceID, parentObjectID, workflowID, userID, logTime, eventID, transitionMessage, sourceStateID,
        sourceAssignee, targetStateID, targetAssignee, transitionRejected, concatenatedResults, manager)




}


/**
 * @description To build and set Audit Message for Action in STEP Web UI
 * @param node  - Current Object
 * @param manager - STEP Manager Object
 * @param workflowIDArg  - Current Workflow ID action is taking place
 * @param eventIDArg  - Current Action Event
 * @param transitionAction -  Action initiated in the button
 * @param sourceStateIDArg  -  Source State ID of workflow
 * @param sourceAssigneeArg -  Source State User
 * @param targetStateIDArg - Target State ID of workflow
 * @param isRejected - boolean for error on action
 * @param errormessage - Error Message
 * @param eventType - Event Type
 * @param eventMainQueue - Main Queue
 * @param eventApprovedQueue - Approved Queue
 */
function buildAndSetAuditMessageForAction(node, manager, workflowIDArg, eventIDArg, transitionAction, sourceStateIDArg, targetStateIDArg, isRejected, errorMessage,eventType,eventMainQueue,eventApprovedQueue) {


    var nodeID = node.getID();
    var workflowID = workflowIDArg;
    var workflow = manager.getWorkflowHome().getWorkflowByID(workflowID);
    var userID = manager.getCurrentUser().getID();
    var logTime = new Date().getTime();
    var eventID = eventIDArg;
    var transitionMessage = transitionAction;
    var sourceStateID = sourceStateIDArg;
    var sourceAssignee = ""
    var wfInstance = node.getWorkflowInstance(workflow);
    if (wfInstance != null && wfInstance.getTaskByID(sourceStateID) != null) {
        sourceAssignee = wfInstance.getTaskByID(sourceStateID).getAssignee().getID();
    }
    var targetStateID = targetStateIDArg;
    var targetAssignee = userID;
    var transitionRejected = isRejected;
    var concatenatedResults = errorMessage;


    //STEP-5993
    var auditInstanceID = node.getValue("Audit_InstanceID").getSimpleValue();
    if (!(auditInstanceID  && auditInstanceID != "" && typeof auditInstanceID !== 'undefined' && auditInstanceID!="undefined")){
        createAuditInstanceID(node) 
    }
    //STEP-5993

    var auditMessageIndex = 0;
    if (node.getValue("Audit_Message_Index").getSimpleValue() != null) {
        auditMessageIndex = parseInt(node.getValue("Audit_Message_Index").getSimpleValue()) + 1;
    } else {
        auditMessageIndex = auditMessageIndex + 1;
    }

    node.getValue("Audit_Message_Index").setSimpleValue(auditMessageIndex);

    //STEP-6283
    if (node.getObjectType().getID() == "Figure_Folder" && workflowID == "PAG_App_Mgr_PC_Review_Workflow") {
    		var parent = node.getParent();
    		if (node.getValue("Audit_Message_Index").getSimpleValue() !== parent.getValue("Audit_Message_Index").getSimpleValue()) {
    			parent.getValue("Audit_Message_Index").setSimpleValue(node.getValue("Audit_Message_Index").getSimpleValue());
    		}
    }
    //STEP-6283

    var parentObjectID = "";

    if (node.getObjectType().getID() == "Figure_Folder" || node.getObjectType().getID() == "Product_Rev_Folder") {
        parentObjectID = getParentObjectID(auditInstanceID, manager,node)//STEP-6189 
    }

    //STEP-6005
    if (node.getObjectType().getID() == "Regional_Revision" ) {
        parentObjectID = getRegionalParentObjectID(node, manager);
    }
    //STEP-6005

     //STEP-5993
    //Information to be captured if workflow is Universal Workflow (Product_Maintenance_Upload)
    if (workflowID == "Product_Maintenance_Upload") {
        
       // if (targetStateID == "Exit") {
            //Get WIP Revision to find Workflow Name Initiated & set new revision object as parent object id
            var wipRev = BL_MaintenanceWorkflows.getWIPRevision(node);
            if (wipRev) {
                transitionMessage = wipRev.getValue("Workflow_Name_Initiated").getSimpleValue();
                parentObjectID = wipRev.getID();
                if (auditInstanceID == "" || auditInstanceID == null) {
                    auditInstanceID = wipRev.getValue("Audit_InstanceID").getSimpleValue();

                }
            }
       // }
    }
    //STEP-5993

    //STEP-6243 Starts
    //Changes for STEP-6283 - commented out the condition for properly incrementing Audit Message Index
    /*if (transitionAction == "Create_Figure_Folder" || transitionAction == "Create_Figure_Folder_Datasheet"  || transitionAction == "Duplicate_Figure_Folder") {
        transitionMessage = node.getName();
        node = node.getParent();
        nodeID = node.getID();
    }*/
    //STEP-6243 Ends


    buildAuditObjectMessage(node, nodeID, auditMessageIndex, auditInstanceID, parentObjectID, workflowID, userID, logTime, eventID, transitionMessage, sourceStateID,
        sourceAssignee, targetStateID, targetAssignee, transitionRejected, concatenatedResults, manager)


    //Find Approval Status and post in correct queue
    var approvalStatus = node.getApprovalStatus()
    if (approvalStatus == "Completely Approved") {
        eventApprovedQueue.queueDerivedEvent(eventType, node);
    } else {
        eventMainQueue.queueDerivedEvent(eventType, node);
    }
    
   


}


/**
 * @description To build and set Audit Message for Assign in STEP Web UI
 * @param node  - Current Object
 * @param manager - STEP Manager Object
 * @param workflowIDArg  - Current Workflow ID action is taking place
 * @param eventIDArg  - Current Action Event
 * @param transitionAction -  Action initiated in the button
 * @param sourceStateIDArg  -  Source State ID of workflow
 * @param sourceAssigneeIDArg -  Source State User ID
 * @param targetStateIDArg - Target State ID of workflow
 * @param targetAssigneeIDArg - Target State User ID
 * @param isRejected - boolean for error on action
 * @param errormessage - Error Message
 * @param eventType - Event Type
 * @param eventMainQueue - Main Queue
 * @param eventApprovedQueue - Approved Queue
 */
 function buildAndSetAuditMessageForAssign(node, manager, workflowIDArg, eventIDArg, transitionAction, sourceStateIDArg, sourceAssigneeIDArg, targetStateIDArg, targetAssigneeIDArg, isRejected, errorMessage, eventType, eventMainQueue, eventApprovedQueue) {

    var nodeID = node.getID();
    var workflowID = workflowIDArg;
    var userID = manager.getCurrentUser().getID();
    var logTime = new Date().getTime();
    var eventID = eventIDArg;
    var transitionMessage = transitionAction;
    var sourceStateID = sourceStateIDArg;
    var sourceAssignee = sourceAssigneeIDArg;
    var targetStateID = targetStateIDArg;
    var targetAssignee = targetAssigneeIDArg;
    var transitionRejected = isRejected;
    var concatenatedResults = errorMessage;


    //STEP-5993
    var auditInstanceID = node.getValue("Audit_InstanceID").getSimpleValue();
    if (!(auditInstanceID && auditInstanceID != "" && typeof auditInstanceID !== 'undefined' && auditInstanceID != "undefined")) {
        createAuditInstanceID(node)
    }
    //STEP-5993

    var auditMessageIndex = 0;
    if (node.getValue("Audit_Message_Index").getSimpleValue() != null) {
        auditMessageIndex = parseInt(node.getValue("Audit_Message_Index").getSimpleValue()) + 1;
    } else {
        auditMessageIndex = auditMessageIndex + 1;
    }

    node.getValue("Audit_Message_Index").setSimpleValue(auditMessageIndex);


    var parentObjectID = "";

    if (node.getObjectType().getID() == "Figure_Folder" || node.getObjectType().getID() == "Product_Rev_Folder") {
        parentObjectID = getParentObjectID(auditInstanceID, manager,node)//STEP-6189 
    }

    //STEP-6005
    if (node.getObjectType().getID() == "Regional_Revision") {
        parentObjectID = getRegionalParentObjectID(node, manager);
    }
    //STEP-6005

    //STEP-5993
    //Information to be captured if workflow is Universal Workflow (Product_Maintenance_Upload)
    if (workflowID == "Product_Maintenance_Upload") {

        // if (targetStateID == "Exit") {
        //Get WIP Revision to find Workflow Name Initiated & set new revision object as parent object id
        var wipRev = BL_MaintenanceWorkflows.getWIPRevision(node);
        if (wipRev) {
            transitionMessage = wipRev.getValue("Workflow_Name_Initiated").getSimpleValue();
            parentObjectID = wipRev.getID();
            if (auditInstanceID == "" || auditInstanceID == null) {
                auditInstanceID = wipRev.getValue("Audit_InstanceID").getSimpleValue();

            }
        }
        // }
    }
    //STEP-5993


    buildAuditObjectMessage(node, nodeID, auditMessageIndex, auditInstanceID, parentObjectID, workflowID, userID, logTime, eventID, transitionMessage, sourceStateID,
        sourceAssignee, targetStateID, targetAssignee, transitionRejected, concatenatedResults, manager)


    //Find Approval Status and post in correct queue
    var approvalStatus = node.getApprovalStatus()
    if (approvalStatus == "Completely Approved") {
        eventApprovedQueue.queueDerivedEvent(eventType, node);
    } else {
        eventMainQueue.queueDerivedEvent(eventType, node);
    }
}


/**
 * @description To Build Audit Message Object
 * @param node - Current Object
 * @param nodeID  - id of the current object
 * @param auditInstanceID - Unigue GUID for current workflow 
 * @param auditMessageIndex  - audit message index
 * @param parentObjectID  - parent object id
 * @param workflowID  - workflow id
 * @param userID - user id
 * @param logTime  -log time
 * @param eventID - event ID
 * @param transitionMessage  -  Message generated during transition
 * @param sourceStateID  - Source State ID
 * @param sourceAssignee - Source Assignee
 * @param targetStateID  - Target State ID
 * @param targetAssignee  - Target Assignee
 * @param transitionRejected - Is transition rejected flag
 * @param concatenatedResults - Cancel Messages
 */

function buildAuditObjectMessage(node, nodeID, auditMessageIndex, auditInstanceID, parentObjectID, workflowID, userID, logTime, eventID, transitionMessage, sourceStateID,
    sourceAssignee, targetStateID, targetAssignee, transitionRejected, concatenatedResults, manager) {
    //STEP-5993
    //Set Object info for audit
    var newprodstatus = "";
    var prodstatuschangereason = "";
    var abbrwfname = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();// ""; // STEP-6612
    var wfnotes = "";
    var objectTypeId = node.getObjectType().getID();
    //STEP-6062
    var objectName=node.getName();
    // STEP-6600
    var copytype = node.getValue("COPYTYPE").getValue();
    //Filter only Revision Object
    var checkServiceRevision = true;
    if (bl_library.isRevisionType(node, checkServiceRevision)) {
        newprodstatus = node.getValue("Product_Status_Change_To").getSimpleValue();
        prodstatuschangereason = node.getValue("Product_Status_Change_Reason").getSimpleValue();
        // abbrwfname = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue(); // STEP-6612
        wfnotes = node.getValue("Workflow_Notes").getSimpleValue();

    }
    //STEP-6062
     if (objectTypeId == "Product_Rev_Folder" ){
         objectName="Product Folder"
     }

    // STEP-6600
    if (objectTypeId == "Product_Rev_Folder" || objectTypeId == "Figure_Folder") {
    	   var refId;
    	   var src = node;
    	   
        if (objectTypeId == "Product_Rev_Folder") {
            refId = "Product_Folder_To_Product";
        } else {
            refId = "Figure_Folder_To_Product";
        	  src = node.getParent();
        }
        var refType = manager.getReferenceTypeHome().getReferenceTypeByID(refId); 
        var refs = src.queryReferencedBy(refType);
      
        refs.forEach(function(ref) {
            var refSrc = ref.getSource();
            copytype = refSrc.getValue("COPYTYPE").getValue();
            return true;
        });

        if (!copytype) {
            copytype = "";
        }
        abbrwfname = copytype;
    }

    var auditObject = {
        "nodeID": "" + nodeID,
        "nodeName": ""+ objectName,
        "auditMessageIndex": "" + auditMessageIndex,
        "auditInstanceID": "" + auditInstanceID,
        "parentObjectID": "" + parentObjectID,
        "workflowID": "" + workflowID,
        "userID": "" + userID,
        "logTime": logTime,
        "transition": {
            "eventID": "" + eventID,
            "submitMessage": "" + transitionMessage,
            "sourceStateID": "" + sourceStateID,
            "sourceAssignee": "" + sourceAssignee,
            "targetStateID": "" + targetStateID,
            "targetAssignee": "" + targetAssignee,
            "isRejected": transitionRejected,
            "rejectionMessages": "" + concatenatedResults
        },
        "objectinfo": {
            "newprodstatus": "" + newprodstatus,
            "prodstatuschangereason": "" + prodstatuschangereason,
            "abbrwfname": "" + abbrwfname,
            "wfnotes": "" + wfnotes
        }
    };
     //STEP-5993
    var auditMessage = JSON.stringify(auditObject);

    node.getValue("Audit_Message").addValue(auditMessage);

}

/**
 * @description Get Parent Object Id for Figure Folder and Product Folder
 * @param instanceid - current object instance id
 * @param manager - STEP Manager
 * @param node - current object
 * @returns object id of the instance
 */
function getParentObjectID(instanceid, manager,node) {
    //STEP-6189 Startså
    var parentIdAvailable=false;
    var nodeobjecttypeid=node.getObjectType().getID();
    //STEP-6189 Ends
    var parentObject;
    var inparentObjectID;
    var searchHome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.Product;
    var searchAttribute = manager.getAttributeHome().getAttributeByID("Audit_InstanceID");
    var searchValue = instanceid;
    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
    //STEP-5993
    var lstParentObjClass = searchHome.querySingleAttribute(query).asList(10).toArray();
    if (lstParentObjClass != null) {
        for (var i = 0; i < lstParentObjClass.length; i++) {
            parentObject = lstParentObjClass[0];
            if (typeof parentObject !== 'undefined') {
                var objectTypeId = parentObject.getObjectType().getID();
                //Filter only Revision Object
    			 var checkServiceRevision = true;
    			 if (bl_library.isRevisionType(parentObject, checkServiceRevision)) {
                   inparentObjectID = parentObject.getID();
                    //STEP-6189 Starts
                    parentIdAvailable=true;
                    //STEP-6189 Ends
                    break;
                }
            }
        }
    }
    //STEP-5993
    //STEP-6189 Starts
    var nProduct=""
    if (!parentIdAvailable ){
        if ( nodeobjecttypeid=="Figure_Folder"){
    	    nProduct=node.getParent().getName();
        }else if (nodeobjecttypeid == "Product_Rev_Folder"){
            nProduct=node.getName();
        }
   		var pProduct = manager.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
		//log.info(" nProduct "+nProduct);
		//log.info(" pProduct "+pProduct.getName());
		var wipRevision= BL_MaintenanceWorkflows.getWIPRevision(pProduct)
		if (wipRevision!=null){
			inparentObjectID = wipRevision.getID();
			//log.info(" id "+inparentObjectID);
			//log.info(" id "+wipRevision.getName());
		}
    }
    	//STEP-6189 Ends
    return inparentObjectID;
}

 //STEP-6005
/**
 * @description Get Parent Object ID
 * @param node  - Current Object
 * @param manager  -  STEP Manager
 * @returns parentobjectid
 */
function getRegionalParentObjectID(node, manager) {
    
    var parentObject;
    var inparentObjectID;
    var product = node.getParent()
    var initiatedRevNo = bl_library.getReferenceAttrValue(product, node, "Product_To_Regional_Revision", "Initiated_REVISIONNO");
    if (initiatedRevNo && initiatedRevNo > 0) {
        var revisionsList=bl_library.getRevisions(product);
        for (var i=0;i<revisionsList.size();i++){
            var  parentObject = revisionsList.get(i);  
            var revisionNo=parseInt(parentObject.getValue("REVISIONNO").getSimpleValue(),10);
            if (initiatedRevNo==revisionNo){
                inparentObjectID=parentObject.getID();
                break;
            }
        }
    }
   
    return inparentObjectID;
}
 //STEP-6005

/**
 * @description Generates a GUID string.
 * @returns {string} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa

 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}


//STEP-6014
/**
 * @description Generate Instance ID
 * @param obj - Current Object
 *

 */
function createAuditInstanceID(obj) {
    var myParentID = obj.getParent().getObjectType().getID();
    var currAuditID = obj.getValue("Audit_InstanceID").getSimpleValue();
    var isInstanceAvailable=false;
      if (currAuditID  && currAuditID != "" && typeof currAuditID !== 'undefined'  && currAuditID!="undefined"){
        isInstanceAvailable=true;
      }
    if ((myParentID == "Product" || myParentID == "Product_Kit" || myParentID == "Equipment" || myParentID == "Service") && !isInstanceAvailable) {
        currAuditID = obj.getParent().getValue("Audit_InstanceID").getSimpleValue();
    }
     // STEP-6791
    else if ((obj.getObjectType().getID() == "Figure_Folder" || obj.getObjectType().getID() == "Product_Rev_Folder")
             && !isInstanceAvailable) { 
    		var refType = obj.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
		var refsByProduct = obj.queryReferencedBy(refType);
		refsByProduct.forEach(function (ref) {
			var product = ref.getSource();
			var wipRev = BL_MaintenanceWorkflows.getWIPRevision(product);
               if (wipRev) {
				currAuditID = wipRev.getValue("Audit_InstanceID").getSimpleValue();
				isInstanceAvailable = true;
			}
			return true;
		})	
		if (currAuditID === "" || currAuditID === null) {
			isInstanceAvailable = false;
		}    
    }

    if (isInstanceAvailable) {
        obj.getValue("Audit_InstanceID").setSimpleValue(currAuditID);
        
    } else {
        var auditInstanceID = guid();
        obj.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
       
    }
    //log.info("Cur Aud " + currAuditID + " New Aud " + auditInstanceID + " My Parent id " + myParentID);
}


/**
 * To build, store and send Bulk_Audit_Message to an even queue
 * @param {*} node STEP object (product/revision/..)
 * @param {*} auditInstanceID String
 * @param {*} brName String
 * @param {*} targetEventsList String[]
 * @param {*} assocTicketNo String
 * @param {*} submitMessage String
 * @param {*} comments String
 * @param {*} manager STEP Manager
 * @param {*} bulkAuditQueue Outbound Integration Endpoint 
 * @param {*} bulkAuditEvent Derived Event Type
 * @param {*} baApprove BR BA_Approve
 */
 function setAndSendBulkAuditMessage(node, brName, targetEventsList, assocTicketNo, submitMessage, comments, manager, bulkAuditQueue, bulkAuditEvent, baApprove) {
    
    var approvalStatus = node.getApprovalStatus();
    
    var msgDict = {};
    msgDict['nodeID'] = node.getID() + "";
    msgDict['nodeName'] = node.getName() + "";
    
    var today = new Date().toISOString();
    today = today.substring(0,today.indexOf('T'));
    
    msgDict['auditInstanceID'] = today + "_" + assocTicketNo;
    msgDict['logTime'] = new Date().getTime() + "";
    msgDict['userID'] = manager.getCurrentUser().getID() + "";
    msgDict['executedBRName'] = brName + "";
    msgDict['targetEvents'] = targetEventsList + "";
    msgDict['associatedTicketNo'] = assocTicketNo + "";
    msgDict['submitMessage'] = submitMessage + "";
    msgDict['comments'] = comments + "";

    var auditMessage = JSON.stringify(msgDict);
    //log.info("adding auditMessage:\n" + auditMessage);

    node.getValue('Bulk_Audit_Message').addValue(auditMessage);

    if (approvalStatus== "Completely Approved") {
        baApprove.execute(node);
    }

    bulkAuditQueue.queueDerivedEvent(bulkAuditEvent, node);
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.buildAndSetAuditMessage = buildAndSetAuditMessage
exports.buildAndSetAuditMessageForAction = buildAndSetAuditMessageForAction
exports.buildAndSetAuditMessageForAssign = buildAndSetAuditMessageForAssign
exports.buildAuditObjectMessage = buildAuditObjectMessage
exports.getParentObjectID = getParentObjectID
exports.getRegionalParentObjectID = getRegionalParentObjectID
exports.guid = guid
exports.createAuditInstanceID = createAuditInstanceID
exports.setAndSendBulkAuditMessage = setAndSendBulkAuditMessage