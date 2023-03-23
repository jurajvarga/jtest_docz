/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Revision_Release_Assign_OnEntry",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Set_Revision_Release_Assign_OnEntry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWFs"
  }, {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_MaintenanceWFs,lib) {
var workflow = manager.getWorkflowHome().getWorkflowByID("Revision_Release_Workflow");
var instance = node.getWorkflowInstance(workflow);
var task = node.getWorkflowInstance(workflow).getTaskByID("Initial");

if (task) {

	//STEP-6341 start
	if(lib.isRevisionType(node, false)) {
		var product = node.getParent();
		var currentRevision = BL_MaintenanceWFs.getCurrentRevision(product);
		var currentRevMSCode = lib.getReferenceAttrValueWOTarget(currentRevision, "ProductRevision_To_MasterStock", "MASTERITEMCODE");
		var nodeRevMSCode = lib.getReferenceAttrValueWOTarget(node, "ProductRevision_To_MasterStock", "MASTERITEMCODE");
	
    		 if (currentRevMSCode != null && currentRevMSCode != nodeRevMSCode) {
     		//STEP-6645
     		lib.toCompareOGandNewShippingConditions(manager, node); 
		}
     }
	//STEP-6341 end
	
	var reassignGroup = node.getValue("ProdTeam_Planner_Product").getSimpleValue();
	instance.setSimpleVariable("AssignTo", reassignGroup);
	
	if (reassignGroup) {
	    var group = manager.getGroupHome().getGroupByID(reassignGroup);
	
	    if (group) {
	        manager.executeWritePrivileged(function() {
	            task.reassign(group);
	            lib.Trigger(instance, "Initial", "Start", "Auto reasign");
	        });
	    }
	}
}
}