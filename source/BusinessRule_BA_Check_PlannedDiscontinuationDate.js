/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Check_PlannedDiscontinuationDate",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Check_PlannedDiscontinuationDate",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,lib) {
var newStatus = node.getValue("Product_Status_Change_To").getSimpleValue();
var plannedDiscontinuationDate = node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();
var okToContinue = true;

if (newStatus == "Pre-discontinued") {
	var plannedDiscontinuationDate = node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();

	if ((plannedDiscontinuationDate == null || plannedDiscontinuationDate == "") && (node.isInState("WF-7B-Product-Status-Change-Workflow", "Sr_Manager_Review"))) {
		webui.showAlert("WARNING", "Warning", "Please fill in Planned Discontinuation Date.");
		okToContinue = false;
	}
}
else {
	if (newStatus != "Pending" && newStatus != "Discontinued" && plannedDiscontinuationDate != null && plannedDiscontinuationDate != "" && !node.getValue("PLANNEDDISCONTINUATIONDATE").isInherited()) {
		webui.showAlert("WARNING", "Warning", "Planned Discontinuation Date can not have value.");
		okToContinue = false;
	}
}
if (okToContinue) {
	if (node.isInWorkflow("WF-7B-Product-Status-Change-Workflow")) {
		var workflow = manager.getWorkflowHome().getWorkflowByID("WF-7B-Product-Status-Change-Workflow");
		var instance = node.getWorkflowInstance(workflow);
		
		if (instance != null) {	
			if (node.isInState("WF-7B-Product-Status-Change-Workflow", "Manager_Review")) {
				lib.Trigger(instance, "Manager_Review", "Submit", "");
				webui.navigate("homepage", null);
			}
	          
	          else if (node.isInState("WF-7B-Product-Status-Change-Workflow", "Sr_Manager_Review")) {
	                lib.Trigger(instance, "Sr_Manager_Review", "Submit", "");
	                webui.navigate("homepage", null);
			}
		}
	}
}
}