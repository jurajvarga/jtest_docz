/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Drop_Revision_to_WF10",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Drop_Revision_to_WF10",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui,manager,lookUp) {
var errMsg = '';
var product = node.getParent();

// 1. There should not be any WIP revision in progress
var wipRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
//STEP-6396
var wipRefs = product.queryReferences(wipRefType);

wipRefs.forEach(function(wipRef) {
	var ref = wipRef.getTarget();

	if (ref.getValue("REVISIONSTATUS").getSimpleValue() == "In-process") {
		appendMessage("WIP revision " + ref.getName() + " can not be in status 'In-process'.");
	}
	return true;
});
//STEP-6396

// 2. The revision selected is not a regional revision
if (node.getObjectType() == "Regional_Revision") {
	appendMessage("Regional revision can not be added to release queue.");
}


// 3. The revision Status is Approved
if (node.getValue("REVISIONSTATUS").getSimpleValue() != "Approved") {
	appendMessage("Selected revision is not 'Approved'.");
}


// 4. The revision is not currently linked as a Current or WIP revision
//STEP-6396
var prod2CurRevRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
var refs = node.queryReferencedBy(prod2CurRevRefType);
refs.forEach(function(ref) {
	appendMessage('Selected revision can not be linked as current revision.');
	return true;
});
var refs = node.queryReferencedBy(wipRefType);
refs.forEach(function(ref) {
	appendMessage('Selected revision can not be linked as WIP revision.');
	return true;
});
//STEP-6396


// 5. Product status should not be commercialization or pre-release. 
var productStatus = product.getValue("Product_Status").getSimpleValue();

if (productStatus == "Commercialization" || productStatus == "Pre-released") {
	appendMessage("Product status can not be '" + productStatus + "'");
}


// return msg to the user
if (errMsg) {
	webui.showAlert("WARNING", "Validation failed", errMsg);
}
else {
	if (!node.isInWorkflow("Revision_Release_Workflow")) {
		node.startWorkflowByID("Revision_Release_Workflow", "Started by BA_Drop_Revision_to_WF10");

		var wfName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", 10);

		if (!node.getValue("Workflow_Initiated_By").getSimpleValue()) {
			node.getValue("Workflow_Initiated_By").setSimpleValue(manager.getCurrentUser().getID());
		}
        
		if (!node.getValue("Workflow_Name_Initiated").getSimpleValue()) {			
			node.getValue("Workflow_Name_Initiated").setSimpleValue(wfName);
		}
		
		webui.showAlert("INFO", "Submit information", "Item has been sent into " + wfName);
	}
}


function appendMessage(newMsg) {
	if (errMsg) {
		errMsg += '\n' + newMsg;
	}
	else {
		errMsg = newMsg;
	}
}
}