/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "WF4_App_Mgr_PC_Review_Workflow_Start",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "WF4 App Mgr PC Review Workflow Start",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "assetLib"
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
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetFigKeyForImage",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetFigureKeyForImage",
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
exports.operation0 = function (node,manager,webui,baSetFigKeyForImage,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,assetLib) {
var ot = node.getObjectType().getID();
var isError = false;
var nameOfPrimary = node.getName();
log.info("WF4 " + ot);
if (ot.equals("Figure_Folder") && nameOfPrimary.contains("ds")) {
    var kids = node.getAssets();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var kot = kid.getObjectType().getID();
        log.info(kid.getName());
        log.info(kot.equals("ProductImage"));
        log.info(kid.getValue("Image_Status").getSimpleValue());
        if (kot.equals("ProductImage") && kid.getValue("Image_Status").getSimpleValue() == "Active") {
            isError = true
        }
    }
}
log.info("WF4 " + isError);
if (isError) {
 		//STEP-5929 - STEP-5993
	var err="This Figure folder can not exit PAG workflow, if there is an active image for a datasheet folder."

	//Set Audit for Child Figure Folder
	BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Submit_For_Review","","Exit",true,err,auditEventType,auditQueueMain,auditQueueApproved);
	
	 
	webui.showAlert("ERROR", "Active Image", err);
	 //STEP-5929 - STEP-5993
  } else {

    //Set Image Status to Active if it is blank

    var assets = node.getAssets();
    var assetsItr = assets.iterator();

    while (assetsItr.hasNext()) {
        var asset = assetsItr.next();
        var imageStatus = asset.getValue("Image_Status").getSimpleValue();
        if (imageStatus == null || imageStatus == "") {
            asset.getValue("Image_Status").setSimpleValue("Active");
        }
	
        // Set Figure Key for an asset
        baSetFigKeyForImage.execute(asset);

    }
    //Check for Image greater than 1,If so throw error else move to next step
    var imageStatus = getNumImageStatus(node);
    logger.info("imageStatus " + imageStatus);
    if (imageStatus.cnt >= 2) {
        var err = node.getName() + " contains more than one Active images.";
            //STEP-5929 - STEP-5993
	     //Set Audit for Child Figure Folder
		BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Submit_For_Review","","Exit",true,err,auditEventType,auditQueueMain,auditQueueApproved);
		 //STEP-5929 - STEP-5993

        webui.showAlert("ERROR", "Multiple Active Images ", err);

    } else if (imageStatus.cnt == 0) {
        var err = node.getName() + " contains no Active images.";

          
        
         //STEP-5929 - STEP-5993
	     //Set Audit for Child Figure Folder
		BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Submit_For_Review","","Exit",true,err,auditEventType,auditQueueMain,auditQueueApproved);
		 //STEP-5929 - STEP-5993

		 
        webui.showAlert("ERROR", "Image Not Available", err);
    } else {

        var figAss = node.getValue("Figure_Assignment").getSimpleValue();

        var assigneeId = manager.getCurrentUser().getID();
        logger.info(" assigneeId " + assigneeId);

        if (figAss == null || figAss == "PAG") {
            webui.showAlert("ERROR", "Missing Figure Assignment ", "Please enter a Figure Assignment value.");
        } else {
            node.getValue("Figure_Status").setSimpleValue("Pending Review");
            /*var group = "";
            if (figAss.equals("Dev Sci")){
                group = "Dev_Sci";
            } else if (figAss.equals("App Manager")){
                group = "Application_Manager";
            } else {
                group = figAss;
            }

            if (figAss.equals("Dev Sci") || figAss.equals("Production")){
                node.getValue("Figure_AM_Assign").setSimpleValue(figAss);
            }*/
            var parent = node.getParent()
            //STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration
            assetLib.updateFigureFolderName(node, imageStatus.objs[0], manager)

            var parentPAGAssignment = parent.getValue("PAG_Assignment").getSimpleValue();
            logger.info(" parentPAGAssignment " + parentPAGAssignment);
            if (parentPAGAssignment == null || parentPAGAssignment == '') {
                parent.getValue("PAG_Assignment").setSimpleValue(assigneeId);
            }
            var Workflow_Initiated_By = parent.getValue("Workflow_Initiated_By").getSimpleValue()
            var Workflow_Name_Initiated = parent.getValue("Workflow_Name_Initiated").getSimpleValue()
            var Workflow_No_Initiated = parent.getValue("Workflow_No_Initiated").getSimpleValue()
            var Workflow_Type = parent.getValue("Workflow_Type").getSimpleValue()
            var Workflow_Notes = parent.getValue("Workflow_Notes").getSimpleValue()

            node.getValue("Workflow_Initiated_By").setSimpleValue(Workflow_Initiated_By)
            node.getValue("Workflow_Name_Initiated").setSimpleValue(Workflow_Name_Initiated)
            node.getValue("Workflow_No_Initiated").setSimpleValue(Workflow_No_Initiated)
            node.getValue("Workflow_Type").setSimpleValue(Workflow_Type)
            node.getValue("Workflow_Notes").setSimpleValue(Workflow_Notes)

            //var assignee= manager.getGroupHome().getGroupByID(group);
            var wf;
            if (!node.isInWorkflow("WF4_App_Mgr_PC_Review_Workflow")) {
                wf = node.startWorkflowByID("WF4_App_Mgr_PC_Review_Workflow", "");
            } else {
                wf = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
            }

            /*var tasks = wf.getTasks();
            var tasksItr = tasks.iterator();
            while (tasksItr.hasNext()){
                var task = tasksItr.next();
                task.reassign(assignee);
            }*/


            if (isDone(parent)) {
                webui.showAlert("ACKNOWLEDGMENT", "Submit Information", "All Images successfully submitted.");
                if (parent.isInWorkflow("PAG_App_Mgr_PC_Review_Workflow")) {
                    var wf = parent.getWorkflowInstanceByID("PAG_App_Mgr_PC_Review_Workflow");

				parent.getValue("Figure_Status").setSimpleValue(null);  //STEP-6258
                    
                    wf.delete("removed by BA");
                      //STEP-6061
                    BL_AuditUtil.buildAndSetAuditMessageForAction(parent,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Submit_For_Review","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved)
                    //STEP-6061
                }
            }

        }

          //STEP-5929 - STEP-5993 - STEP-6151
	     //Set Audit for Child Figure Folder
		//BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Submit_For_Review","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved)
		 //STEP-5929 - STEP-5993

    }
}


function isDone(parent) {

    var kids = parent.getChildren();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var status = kid.getValue("Figure_Status").getSimpleValue()

        if (status != null) {
            if (!status.equals("Approved") && !status.equals("Pending Review") && !status.equals("Inactive")) {
                return false;
            }
        } else {
            webui.showAlert("INFO", "Submit Information", "Product Folder will remain in workflow until all Figures have been submitted for review.");
            return false;
        }
    }

    return true;
}

function getNumImageStatus(node) {
    var assets = node.getAssets();
    var assetsItr = assets.iterator();
    var cnt = 0;
    var objs = [];

    while (assetsItr.hasNext()) {
        var asset = assetsItr.next();
        var assetObjType = asset.getObjectType().getID();

        if (assetObjType.equals("ProductImage") || assetObjType.equals("Product_DataSheet")) {
            var imageStatus = asset.getValue("Image_Status").getSimpleValue();
            if (imageStatus != null && imageStatus.equals("Active")) {
                cnt++;
                objs.push(asset);
            }
        }
    }

    return { cnt: cnt, objs: objs };
}
}