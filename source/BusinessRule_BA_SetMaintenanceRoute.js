/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetMaintenanceRoute",
  "type" : "BusinessAction",
  "setupGroups" : [ "RoutingBR" ],
  "name" : "BA_SetMaintenanceRoute",
  "description" : "To route maintenace workflow based on workflow order lookup",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_InitPricing",
    "libraryAlias" : "BL_InitPricing"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
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
    "alias" : "busAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevisionWOReleaseWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionSubmitToSFGI",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SubmitToSFGI",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondCustomProd",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProduct",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,lookupTableHome,wf,busCond,busAction,busActionSubmitToSFGI,busCondCustomProd,busCondComponentWF,baApprove,mailHome,auditEventType,auditQueueMain,auditQueueApproved,BL_InitPricing,Lib,libWF) {
var businessRule = "Business Rule: BA_SetMaintenanceRoute";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var productNo = node.getValue("PRODUCTNO").getSimpleValue();
var workflowType = node.getValue("Workflow_Type").getSimpleValue();
log.info(" workflowType " + workflowType + " productNo " + productNo);

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo " + wfInitiatedNo);

var wfCurrentNo = node.getValue("Workflow_No_Current").getSimpleValue();
log.info(" wfCurrentNo " + wfCurrentNo);

var routingParentWorkflowID = "Product_Maintenance_Workflow_Parent";

libWF.setWorkflowCompleted(log, node, wf);


//Populate Completed List
var availableList = libWF.populateWorkflowCompletedList(log, node);

//Check Ready for Regional Revision Creation
var readyForSFGI = libWF.isReadyForSFGI(availableList);


var instance = node.getWorkflowInstance(wf);
var wfTaskState = "";
if (instance != null) {
    wfTaskState = Lib.getCurrentTaskState(instance);
    log.info(" wfTaskState " + wfTaskState);
}

var condResult = busCond.evaluate(node);
var isNewWorkflow = condResult.isAccepted();
log.info(" isNewWorkflow " + isNewWorkflow);

//Check is custom product
var condCustomProdResult = busCondCustomProd.evaluate(node);
var isCustomProduct = condCustomProdResult.isAccepted();
log.info(" isCustomProduct " + isCustomProduct);
log.info("workflowType " + workflowType);

var condComponentWFResult = busCondComponentWF.evaluate(node);
var isComponentWF = condComponentWFResult.isAccepted();

var autoreleaseFlag = false
//IF custom product , product is released from marketing workflow
if ((isCustomProduct && node.isInWorkflow("Marketing_Review_Workflow") && wfTaskState == "Exit")) {
    if (isNewWorkflow || (workflowType == "M" && (wfInitiatedNo == "20" || wfInitiatedNo == "18" || wfInitiatedNo == "13"))) {
        autoreleaseFlag = true;
    }
//For Marketing  Review Maintenance 30 always set to true
}else if (workflowType == "M" && wfInitiatedNo == "13"){
    autoreleaseFlag = true;
}
//IF component product , product is released from Supply Chain workflow
if ((isComponentWF && node.isInWorkflow("WF3B_Supply-Chain") && wfTaskState == "Final")) {
    if (isNewWorkflow || (workflowType == "M" && (wfInitiatedNo == "20" || wfInitiatedNo == "12"))) {
        autoreleaseFlag = true;
    }

}

log.info(" autoreleaseFlag " + autoreleaseFlag);

log.info(" readyForSFGI " + readyForSFGI);

//If autoreleaseFlag is true ,release the revision
if (autoreleaseFlag) {
    node.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");
     //Changes done for STEP-5564 - Rework Starts
     //Status should be updated only for NPI custom workflow
    if (isNewWorkflow){
	    var product = node.getParent();
	    var fromStatus = product.getValue("Product_Status").getSimpleValue();
	    Lib.updateHistoryAttribute(product, fromStatus, "Released"); // this includes DateReleased & history
	    product.getValue("Product_Status").setSimpleValue("Released");
    }
     //Changes done for STEP-5564 - Rework Ends
    busAction.execute(node);

    //Call the parent workflow to set the next wf no as -1

    if ((wfInitiatedNo == "13" || wfInitiatedNo == "18" || wfInitiatedNo == "12") && wfTaskState == "Exit") {
        //On Exit of WF1 ,call parent workflow which decides next one and redirects . Updated on 10/4 since Some revisions aren't going out of marketing review
        //node.startWorkflowByID(routingParentWorkflowID, "Initiated from Marketing_Review_Workflow (WF1) to Parent Workflow");
        //Changes done for STEP-5564 - Rework Starts
	    node.getValue("Workflow_No_Current").setSimpleValue("-1");
         baApprove.execute(node);
         //Changes done for STEP-5564 - Rework Ends
    }

}



if (isNewWorkflow && !autoreleaseFlag) {


    //If Workflow is Marketing Review or SDS DG Workflow call Submit to sFGI
    var currentWorkflowIDMarkWF = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", "WF1");
    log.info(" currentWorkflowIDMarkWF " + currentWorkflowIDMarkWF);
    var currentWorkflowIDSDSWF = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", "WF3");
    log.info(" currentWorkflowIDSDSWF " + currentWorkflowIDSDSWF);
    //Validate Pricing Workflow , GTL workflow ,Content Review workflow is completed before submit for release process in NPI
  

    

    if ((node.isInWorkflow(currentWorkflowIDMarkWF) && wfTaskState == "Exit") ||
        (node.isInWorkflow(currentWorkflowIDSDSWF) && wfTaskState == "Exit_SDS_Workflow")) {
        //If ready for SFGI ,call approval process and submit to queue
        if (readyForSFGI) {
            busActionSubmitToSFGI.execute(node);
        }
    }

} else if (workflowType == "M") {
    // STEP-5464 Added wf==20
    // STEP-5831 added wf==21
    // STEP-5841 added wf==2
    if (wfInitiatedNo == "12" || wfInitiatedNo == "14" || wfInitiatedNo == "15" || wfInitiatedNo == "17" || wfInitiatedNo == "20" || wfInitiatedNo == "18" || wfInitiatedNo == "21" || wfInitiatedNo == "2") {
        //Marketing Workflow
        if (wfCurrentNo == "1") {
            //For workflow 12  (add to release queue by calling busActionSubmitToSFGI ) for others set next wfno = -1
            var isReadyForRevisionRelease = false;
            if (wfTaskState == "Exit") {
                
                if (wfInitiatedNo == "12" ) {
                    isReadyForRevisionRelease = true;
                }
                //For workflow 20  add to release queue by calling busActionSubmitToSFGI  if readyForSFGI is true and for others set next wfno = -1
                if ((wfInitiatedNo == "20" || wfInitiatedNo == "2") && readyForSFGI){ // STEP-5841 added wf==2
                    isReadyForRevisionRelease = true;
                }
                 //step-6463
                if (wfInitiatedNo == "2"){ // OTS Conversion
                    BL_InitPricing.initPricing(manager, node, 'CN', lookupTableHome, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
                    BL_InitPricing.initPricing(manager, node, 'JP', lookupTableHome, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
                }
            }
            if (!isReadyForRevisionRelease) {
                //On Exit of WF1 ,call parent workflow which decides next one and redirects .
                node.startWorkflowByID(routingParentWorkflowID, "Initiated from Marketing_Review_Workflow (WF1) to Parent Workflow");
            } else if (isReadyForRevisionRelease) {
                busActionSubmitToSFGI.execute(node);
            }
            //Production Workflow
        } else if (wfCurrentNo == "2") {
            //Make change only if the workflow state is GL_Figure_Review
            if (wfTaskState == "GL_Figure_Review") {
                Lib.Trigger(instance, "GL_Figure_Review", "SkipForMaintenance", "For Maintenance Worklow start at Create short name task");
            } else if (wfTaskState == "Exit") {                
                //If custom Product and workflow no is 12 or 20 skip to Marketing
                if (isCustomProduct && (wfInitiatedNo == "12" || wfInitiatedNo == "20")) {
                    node.getValue("Workflow_No_Current").setSimpleValue("1");
                    node.startWorkflowByID("Marketing_Review_Workflow", "Initialize WF for Custom product");

                    //If component Product and workflow no is 12 skip to DG-GTL
                } else if (isComponentWF && (wfInitiatedNo == "12")) {
                    node.getValue("Workflow_No_Current").setSimpleValue("3");
                    node.startWorkflowByID("SDS-DG Workflow", "Initialize WF for Component product");

			    //STEP-5831 wf21 finish - drop into revision release wf	
                } else if (wfInitiatedNo == "21") {
                    busActionSubmitToSFGI.execute(node);
                    
                } else {
                    //On Exit of WF2 ,call parent workflow which decides next one and redirects .
                    node.startWorkflowByID(routingParentWorkflowID, "Initiated  from Production_Workflow (WF2) to Parent Workflow");
                }
            }
            //DG GTL Workflow
        } else if (wfCurrentNo == "3") {
            if (wfTaskState == "Initial") {
                Lib.Trigger(instance, "Initial", "SkipForMaintenance", "For Maintenance Workflow skip adding revision to regional workflow");

            } else if (wfTaskState == "Exit_SDS_Workflow") {
               
                if (isComponentWF && (wfInitiatedNo == "12")) {
                    node.getValue("Workflow_No_Current").setSimpleValue("3B");
                    node.startWorkflowByID("WF3B_Supply-Chain", "Initialize WF for Component product");

                } else {
                    //On Exit of WF3 ,call parent workflow which decides next one and redirects .
                    node.startWorkflowByID(routingParentWorkflowID, "Initiated from SDS-DG Workflow (WF3) to Parent Workflow");
                }
            }
            //Supply Chain Workflow
        } else if (wfCurrentNo == "3B") {
            if (wfTaskState == "Final") {
                // Submit to Revision Release Workflow in the end of Supply Chain during Maintenance WF14 (Formula/Component Change) or WF20 if ready for sfgi is set
                if (wfInitiatedNo == "14" || (wfInitiatedNo == "20" && readyForSFGI))  {
                    busActionSubmitToSFGI.execute(node);
                    log.info("Success!");
                    
                } else {
                    //If this component and full workflow set this as last.
                    if (isComponentWF && wfInitiatedNo == "20"){
                        node.getValue("Workflow_No_Current").setSimpleValue("-1");
                    }
                    //On Exit of WF3 ,call parent workflow which decides next one and redirects .
                    node.startWorkflowByID(routingParentWorkflowID, "Initiated from Supply Chain to Parent Workflow");
                }
            }
            //Figure Review Workflow
        } else if (wfCurrentNo == "4") {
            //If we are in Figure review set the next workflow only for   15 and  17
            if ((wfInitiatedNo == "15" || wfInitiatedNo == "17") && wfTaskState == "Exit") {
                //On Exit of WF3 ,call parent workflow which decides next one and redirects .
                node.startWorkflowByID(routingParentWorkflowID, "Initiated from WF4_App_Mgr_PC_Review_Workflow (WF4) to Parent Workflow");
            }
        }
    }
  
}
}