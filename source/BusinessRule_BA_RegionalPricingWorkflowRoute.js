/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalPricingWorkflowRoute",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewRouteCreation" ],
  "name" : "BA_RegionalPricingWorkflowRoute",
  "description" : "Used for workflow routing",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,wf,lookupTableHome,Lib) {
var instance=node.getWorkflowInstance(wf);
var wfInitiatedNo="";
var destWorkflowID="";
if (instance!=null){
	var wfFlag = instance.getSimpleVariable("WF_Flag");
	if (wfFlag=="CN"){
		log.info(" In China ");	
		wfInitiatedNo="WF5C1";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - China Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","China", "Send to China Pricing Review State.");
		}
	}else if (wfFlag=="JP"){
		log.info(" In Japan ");	
	  	wfInitiatedNo="WF5B1";
	  	destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - Japan Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","Japan", "Send to Japan Pricing Review State.");
		}
	}else if (wfFlag=="EU"){
		log.info(" In EU ");	
	  	wfInitiatedNo="WF5A1";
	  	destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - EU Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","EU", "Send to EU Pricing Review State.");
		}
	}else{
		log.info(" For DG Flag = N ");	
		wfInitiatedNo="WF5C1";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - China Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","China", "Send to China Pricing Review State.");
		}

		wfInitiatedNo="WF5B1";
	  	destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - Japan Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","Japan", "Send to Japan Pricing Review State.");
		}

		wfInitiatedNo="WF5A1";
	  	destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)
	
		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - EU Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","EU", "Send to EU Pricing Review State.");
		}
	}
}
}