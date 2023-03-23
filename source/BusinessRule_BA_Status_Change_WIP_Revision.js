/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Status_Change_WIP_Revision",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA Status Change WIP Revision",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflow"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Global_Exit_Product_Maintenance",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Exit_Product_Maintenance",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,lookUp,BA_Global_Exit_Product_Maintenance,baGenerateMaintenanceRevisionEvents,BL_AuditUtil,BL_CopyRevision,BL_Library,BL_MaintenanceWorkflow) {
var changeReason = node.getValue("Product_Status_Change_Reason").getSimpleValue()
var productStatus = node.getValue("Product_Status").getSimpleValue()
var abandoned = node.getValue("PSC_Abandoned").getSimpleValue()
var dicontinued = node.getValue("PSC_Discontinued").getSimpleValue()
var internal = node.getValue("PSC_InternalUseOnly").getSimpleValue()
var pending = node.getValue("PSC_Pending").getSimpleValue()
var preDiscontinued = node.getValue("PSC_Pre-discontinued").getSimpleValue()
var released = node.getValue("PSC_Released").getSimpleValue()
var realeasedOnHold = node.getValue("PSC_ReleasedOnHold").getSimpleValue()

if (changeReason && (abandoned || dicontinued || internal || pending || preDiscontinued || released || realeasedOnHold)) {

	// Get the current revision
	var currentRevision = BL_MaintenanceWorkflow.getCurrentRevision(node);

	if (!currentRevision) {
		//throw "The product does not have a current revision.";
		webui.showAlert("WARNING", "Missing current revision", "The product does not have a current revision.");
	} else {
		var selectedRevName = node.getValue("Main_Initiated_REVISIONNO").getSimpleValue();
		var revisionsList = [];
		var p2RevReleaseWFType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_RevRelease_WF");
		var p2RevReleaseRefs = node.queryReferences(p2RevReleaseWFType);
		p2RevReleaseRefs.forEach(function (ref) {
			revisionsList.push(ref.getTarget());
			return true;
		});
		revisionsList.push(currentRevision);
		var psc_rev = null;
		revisionsList.forEach(function foo(rev) {
			if (rev.getName() == selectedRevName) {
				psc_rev = rev;
				return false;
			}
			return true;
		});
		if (!psc_rev) {
			webui.showAlert("Error", "Please select a valid revision");
			return false;
		}

		//STEP-5431 Refactor 
		var dup = BL_CopyRevision.duplicateObject(manager, psc_rev, false);
		// in the new revision clean up old revision attributes, remove Product Status Change Document and Alternate Product references, setup workflow attributes
		BL_MaintenanceWorkflow.setRevMaintenanceAttributes(manager, dup, 11, lookUp, "U");
		// STEP-6089 adding setting revision Main_Initiated_REVISIONNO
		dup.getValue("Main_Initiated_REVISIONNO").setSimpleValue(psc_rev.getName());

		dup.getValue("REVISIONSTATUS").setSimpleValue("In-process");
		var webCategory = psc_rev.getValue("Web_Category").getSimpleValue();
		dup.getValue("Web_Category").setSimpleValue(webCategory);
		//STEP-5965 
		dup.getValue("System_Initiated").setSimpleValue("N");

		//Changes done for STEP-5612 & 6014 starts  	
		BL_AuditUtil.createAuditInstanceID(dup);
		//Changes done for STEP-5612 end 

		//Step 5642 - copying attributes and copying Product Status Change Documents references from a product to a new WIP revision
		BL_Library.copyAttributes(manager, node, dup, "Status_Change_WIP_Rev_Att", null); // STEP-6074

		// Copy Product Status Change Documents references from a product to the dupliciated revision
		var refTypeStatusChangeDocs = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Status_Change_Documents");
		//STEP-6396
		var refProdStatusChangeDocsLinks = node.queryReferences(refTypeStatusChangeDocs);
		refProdStatusChangeDocsLinks.forEach(function (ref) {
			var statusChangeDocRef = ref.getTarget();
			dup.createReference(statusChangeDocRef, "Product_Status_Change_Documents")
			return true;
		});
		//STEP-6396

		// Create product to wip revision reference 
		node.createReference(dup, "Product_To_WIP_Revision");

		//Send to Backfeed queue for capturing Maintenance Start event
		baGenerateMaintenanceRevisionEvents.execute(dup);

		// Start Product Status Change workflow
		dup.startWorkflowByID("WF-7B-Product-Status-Change-Workflow", "Started by BA Status Change WIP Revision");
		// set Estimated_Available_Date
		if (released == "Pending" || realeasedOnHold == "Pending") {
			dup.getValue("Estimated_Available_Date").setSimpleValue("More Than One Month"); // Id of 2 Maps to value of More Than One Month
		} else if (released == "Released - On Hold") {
			dup.getValue("Estimated_Available_Date").setSimpleValue("30 Days or Less"); // Id of 1 Maps to value of 30 Days or Less
		} else {
			dup.getValue("Estimated_Available_Date").setSimpleValue("");
		}

		//Step 5642 - using a new BR to trigger submit in the Product_Maintenance_Upload workflow that exits a product from the workflow and setting values on product to blank
		BA_Global_Exit_Product_Maintenance.execute(node);
		var wfID = "Product_Maintenance_Upload";
		var wf = manager.getWorkflowHome().getWorkflowByID(wfID);
		var stateID = "Product_Status_Maintenance";
		var state = wf.getStateByID(stateID);
		var tasklistScreenID = "Product_Maintenance_Upload-Product_Status_Maintenance-Tasklist"
		// navigate to tasklist screen
		webui.navigate(tasklistScreenID, null, state);

		webui.showAlert("ACKNOWLEDGMENT", "Init Action", "Item successfully initialized in Product Status Change.");
	}

} else {
	if (changeReason) {
		webui.showAlert("WARNING", "Mandatory Fields", "Add New Status")
	} else if (abandoned || dicontinued || internal || pending || preDiscontinued || released || realeasedOnHold) {
		webui.showAlert("WARNING", "Mandatory Fields", "Add Change Reason ")
	} else {
		webui.showAlert("WARNING", "Mandatory Fields", "Add Change Reason, New Status.")
	}
}
}