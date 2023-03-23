/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ShortNameLength_and_Submit",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_ShortNameLength_and_Submit",
  "description" : null,
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
exports.operation0 = function (node,webui,manager,busCond,lib) {
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
	
	if (node.isInWorkflow("Production_Workflow")) {
		var workflow = manager.getWorkflowHome().getWorkflowByID("Production_Workflow");
		var instance = node.getWorkflowInstance(workflow);
		
		if (instance != null) {	
			if (node.isInState("Production_Workflow", "Create_Short_Name")) {
			    //STEP-6198
                	var emptySkus = lib.getSkusMarketingEmpty(manager, node);
                
                	if (emptySkus.length){
                    	webui.showAlert("WARNING", "Warning", "Please fill in Marketing Qty Units in SKU: " + emptySkus.toString());
                    //STEP-6608
                	}else if (!isCheckSentToEbs){
                		webui.showAlert("WARNING", "Production Workflow", "Item already sent to EBS. Base UOM can’t be updated. " );
                    //STEP-6608
                	}else{
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

                	if (emptySkus.length){
                    	webui.showAlert("WARNING", "Warning", "Please fill in Marketing Qty Units in SKU: " + emptySkus.toString());
                    //STEP-6608
                	}else if (!isCheckSentToEbs){
                		webui.showAlert("WARNING", "Supply Chain Workflow", "Item already sent to EBS. Base UOM can’t be updated. " );
                	//STEP-6608
                	}
                	else{
                    	lib.Trigger(instance, "Initial", "Submit", "Move node out of the wf.");
                    	webui.navigate("homepage", null);
                	}
                	//STEP-6198 ENDS
			}
		}
	}
}
}