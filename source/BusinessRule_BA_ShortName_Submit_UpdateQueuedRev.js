/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ShortName_Submit_UpdateQueuedRev",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_ShortName_Submit_UpdateQueuedRev",
  "description" : "Action with button \"Production Review Complete & Update Queued Revisions\"",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "lib"
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_set_ProductPublishAttr",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_set_ProductPublishAttr",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_CheckSentToEbs",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui,manager,BA_set_ProductPublishAttr,busCond,lib) {
//STEP-5831
var businessRule = "Business Rule: BA_ShortName_Submit_UpdateQueuedRev";
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();

//added only for thr old STEP version on QA and Prod
if (wfInitiatedNo != "21" && wfInitiatedNo != "20") {
    webui.showAlert("ERROR", "Production Review Complete & Update Queued Revisions.", "The Button works only for the revision in the Publish Product Change or Full Maintenance workflow.");
}
else {
    var shortName = node.getValue("PRODUCTSHORTNAME").getSimpleValue() + "";

    //STEP-6608
var isCheckSentToEbs= busCond.evaluate(node).isAccepted();
//log.info(" isCheckSentToEbs "+isCheckSentToEbs);
//STEP-6608


    if (shortName && shortName.length > 80) {
        webui.showAlert("WARNING", "Warning", "Label Name exceeded max length (80 characters).");
    }
    else {
        node.getValue("PRODUCTNAME").setSimpleValue(node.getValue("PRODUCTNAME").getSimpleValue().trim()); //STEP-6033 
        //Update PRODUCTNAME, PRODUCTSHORTNAME and PUBLISHED_YN on all revisions in Revision release wf and on the product
        BA_set_ProductPublishAttr.execute(node);

        if (node.isInWorkflow("Production_Workflow")) {
            var workflow = manager.getWorkflowHome().getWorkflowByID("Production_Workflow");
            var instance = node.getWorkflowInstance(workflow);

            if (instance != null) {
                if (node.isInState("Production_Workflow", "Create_Short_Name")) {
                    //STEP-6198
                    var emptySkus = lib.getSkusMarketingEmpty(manager, node);

                    if (emptySkus.length) {
                        webui.showAlert("WARNING", "Warning", "Please fill in Marketing Qty Units in SKU: " + emptySkus.toString());
                   	
				//STEP-6608

                	}else if (!isCheckSentToEbs){
                		webui.showAlert("WARNING", "Warning", "Item already sent to EBS. Base UOM can’t be updated. " );
                	}
                	//STEP-6608

                    else {
                        lib.Trigger(instance, "Create_Short_Name", "Submit", "Move node out of the wf.");
                        webui.navigate("homepage", null);
                    }
                    //STEP-6198 ENDS
                }
            }
        }
        else if (node.isInWorkflow("WF3B_Supply-Chain")) {
            var workflow = manager.getWorkflowHome().getWorkflowByID("WF3B_Supply-Chain");
            var instance = node.getWorkflowInstance(workflow);

            if (instance != null) {
                if (node.isInState("WF3B_Supply-Chain", "Initial")) {
                    //STEP-6198
                    var emptySkus = lib.getSkusMarketingEmpty(manager, node);

                    if (emptySkus.length) {
                        webui.showAlert("WARNING", "Warning", "Please fill in Marketing Qty Units in SKU: " + emptySkus.toString());
                   	
				//STEP-6608

                	}else if (!isCheckSentToEbs){
                		webui.showAlert("WARNING", "Warning", "Item already sent to EBS. Base UOM can’t be updated. " );
                	}
                	//STEP-6608

                    else {
                        lib.Trigger(instance, "Initial", "Submit", "Move node out of the wf.");
                        webui.navigate("homepage", null);
                    }
                    //STEP-6198 ENDS
                }
            }
        }
    }

}
}