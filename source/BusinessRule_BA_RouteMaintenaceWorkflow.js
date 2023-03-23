/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RouteMaintenaceWorkflow",
  "type" : "BusinessAction",
  "setupGroups" : [ "RoutingBR" ],
  "name" : "BA_RouteMaintenaceWorkflow",
  "description" : "To route maintenace workflow based on workflow order lookup",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintain"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionInitSourceFolder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Initiate_Source_Folder",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,lookupTableHome,busActionInitSourceFolder,LibMaintain,bl_library) {
// BA_RouteMaintenaceWorkflow

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
//log.info(" wfInitiatedNo " + wfInitiatedNo);

var wfCurrentNo = node.getValue("Workflow_No_Current").getSimpleValue();
//log.info(" wfCurrentNo " + wfCurrentNo);

var workflowOrder = lookupTableHome.getLookupTableValue("WorkflowOrderTable", wfInitiatedNo)
//log.info(" workflowOrder " + workflowOrder);
log.info("Revision: " + node.getName() + " , wfInitiatedNo: " + wfInitiatedNo + " , wfCurrentNo: " + wfCurrentNo + " , workflowOrder: " + workflowOrder);

var isMaintenanceRegional = false;
if (LibMaintain.isChinaMaintenanceWokflow(wfInitiatedNo) || LibMaintain.isJapanMaintenanceWokflow(wfInitiatedNo) || LibMaintain.isEUMaintenanceWokflow(wfInitiatedNo)) {
    isMaintenanceRegional = true;
}
if (workflowOrder) {
    var workflowOrderList = workflowOrder.split(",");
    var wfCurrentIndex = -1;
    var nextWorkflowNo = -1;
    //log.info("==> wfCurrentNo != -1: " + (wfCurrentNo != "-1"))

    if (wfCurrentNo != null && wfCurrentNo != "-1") {

        for (var i = 0; i < workflowOrderList.length; i++) {
            if (workflowOrderList[i] == wfCurrentNo) {
                wfCurrentIndex = i;
            }
        }
        nextWorkflowNo = workflowOrderList[wfCurrentIndex + 1];
    } else if (wfCurrentNo == "-1") {
        //log.info(" No More Steps");

    } else {
        //log.info("else")
        wfCurrentIndex = 0;
        nextWorkflowNo = workflowOrderList[wfCurrentIndex];
    }

    //log.info(" wfCurrentIndex " + wfCurrentIndex);
    //log.info(" nextWorkflowNo " + nextWorkflowNo);
    if (nextWorkflowNo != "-1" && !isMaintenanceRegional) {
        var nextWfKey = "WF" + nextWorkflowNo;
        var nextWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", nextWfKey)

        node.getValue("Workflow_No_Current").setSimpleValue(nextWorkflowNo);
        if (nextWorkflowNo != "4") {
            //log.info(" nextWorkflowID " + nextWorkflowID);
            node.startWorkflowByID(nextWorkflowID, "Initiated workflow from Product Maintenance workflow");
            
        } else if (wfInitiatedNo == "17" && nextWorkflowNo == "4" && node.getValue("FigureChanged_YN").getSimpleValue() != "Y") {
            // skip figure review and go to content review if there is no image change
            nextWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", "-1")
            //log.info(" No figure change for " + node.getName() + " in maintenance 17. Skipping to Content Review.");
            //log.info(" nextWorkflowID " + nextWorkflowID);
            node.startWorkflowByID(nextWorkflowID, "Initiated workflow from Product Maintenance workflow");

            // no need to add condition to start wf4 for maintenance 17 if there is an image change, we are doing that in tech transfer BR using BL_TechTransfer.updadeRevision
        }
    } else if (wfInitiatedNo == "19") {
        var nextWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", nextWorkflowNo)
        var nextWfKey = ""; //STEP-6464
        node.startWorkflowByID(nextWorkflowID, "Initiated workflow from Product Maintenance workflow");
    } else {
        //log.info(" wfInitiatedNo " + wfInitiatedNo);
        //For Regional there will be no next workflow,
        if (isMaintenanceRegional) {
            //Get the initated wf value .for example 16A1 will get "WF16A1"
            var nextWfKey = "WF" + wfInitiatedNo;
            //log.info(" nextWfKey " + nextWfKey);
            //Lookup in the id table for workflow id ex. WF16A1 will give WF16_EU_Maintenance_Workflow
            var nextWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", nextWfKey)
            //log.info(" nextWorkflowID " + nextWorkflowID);
            //set next wf no which is in this case -1
            node.getValue("Workflow_No_Current").setSimpleValue(nextWorkflowNo);
            //Exit out of parent workflow.
            node.startWorkflowByID(nextWorkflowID, "Initiated workflow from Product Maintenance workflow");
        } else {
            //If it is not regional workflow set next wfno to -1
            node.getValue("Workflow_No_Current").setSimpleValue(nextWorkflowNo);
            var nextWorkflowID = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", nextWorkflowNo);   //STEP-6464
            var nextWfKey = "";  //STEP-6464
            var businessRule = "Business Rule: BA_RouteMaintenaceWorkflow set current wf scenario";
            var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
            var currentDate = "Date: " + (new Date()).toLocaleString();


            try {

                node.approve();
                node.getParent().approve();
            } catch (e) {
                if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                    logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                    logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                    logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                } else {
                    logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                    throw (e);
                }
            }
        }
    }
    log.info("Revision: " + node.getName() + " , nextWorkflowID: " + nextWorkflowID + " , nextWfKey: " + nextWfKey);
}
}