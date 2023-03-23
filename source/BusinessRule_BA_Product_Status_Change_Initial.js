/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Product_Status_Change_Initial",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Product_Status_Change_Initial",
  "description" : "WF-7B-PRODUCT STATUS CHANGE Initial state routing",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,bl_library) {
var parent = node.getParent();
var newStatus = null;
var pStatus = parent.getValue("Product_Status").getSimpleValue();
var lotNumberAffected =  parent.getValue("Lot_numbers_affected").getSimpleValue();
var pStatusChangeReason = parent.getValue("Product_Status_Change_Reason").getSimpleValue();
log.info("Product Status " + pStatus);

if (pStatus.equals("Abandoned")){
	newStatus = parent.getValue("PSC_Abandoned").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_Abandoned").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Discontinued")){
	newStatus = parent.getValue("PSC_Discontinued").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_Discontinued").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Internal Use Only")){
	newStatus = parent.getValue("PSC_InternalUseOnly").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_InternalUseOnly").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Pending")){
	newStatus = parent.getValue("PSC_Pending").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_Pending").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Pre-discontinued")){
	newStatus = parent.getValue("PSC_Pre-discontinued").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_Pre-discontinued").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Released")){
	newStatus = parent.getValue("PSC_Released").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_Released").setSimpleValue(newStatus);
	}
} else if (pStatus.equals("Released - On Hold")){
	newStatus = parent.getValue("PSC_ReleasedOnHold").getSimpleValue();
	if (newStatus != null){
		node.getValue("PSC_ReleasedOnHold").setSimpleValue(newStatus);
	}
}

if (newStatus != null){
	node.getValue("Product_Status_Change_To").setSimpleValue(newStatus);
}
node.getValue("Product_Status_Change_Reason").setSimpleValue(pStatusChangeReason)
node.getValue("Lot_numbers_affected").setSimpleValue(lotNumberAffected)

var wfInst = node.getWorkflowInstanceByID("WF-7B-Product-Status-Change-Workflow")
var task = wfInst.getTaskByID("Product_Status_Change");

if (task != null){
	var user = manager.getCurrentUser();

	var groups = user.getGroups();

	if (hasGroup(groups, "ProdGL")){
		log.info("==> submit for ProdGL")
		var ass = manager.getGroupHome().getGroupByID("ProdGL");
		task.reassign(ass);
		task.triggerLaterByID("Submit_GL", "Submitted by Assign User Group");
	} else if (hasGroup(groups, "PMLT_Managers")){
		log.info("==> submit for PMLT_Managers")
		var ass = manager.getGroupHome().getGroupByID("PMLT_Managers");
		task.reassign(ass);
		task.triggerLaterByID("Submit_ProdSci", "Submitted by Assign User Group");
	} else if (hasGroup(groups, "ProdSci")) {
		log.info("==> submit for ProdSci")
		var ass = manager.getGroupHome().getGroupByID("ProdSci");
		task.reassign(ass);
		task.triggerLaterByID("Submit_ProdSci", "Submitted by Assign User Group")
	} else {
		log.info("==> submit for unknown group")
		var ass = manager.getGroupHome().getGroupByID("ProdSci");
		task.reassign(ass);
		task.triggerLaterByID("Submit_ProdSci", "Submitted by Assign User Group - Unknown group")
	}
}

function hasGroup(groups, ug){
	var groupsItr = groups.iterator();

	while (groupsItr.hasNext()){
		var group = groupsItr.next();
		var gID = group.getID();

		if (gID.equals(ug)){
			return true;
		}
	}
	return false;
}
}