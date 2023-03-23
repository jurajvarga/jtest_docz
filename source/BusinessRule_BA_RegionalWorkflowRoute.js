/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalWorkflowRoute",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewRouteCreation" ],
  "name" : "BA_RegionalWorkflowRoute",
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
logger.info("test")

		wfInitiatedNo="WF5C1";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - China Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","CP", "Send to China Pricing Review State.");
		}

		wfInitiatedNo="WF5B1";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - Japan Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","JP", "Send to Japan Pricing Review State.");
		}

		wfInitiatedNo="WF5A1";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - EU Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","EUP", "Send to China Pricing Review State.");
		}

		wfInitiatedNo="WF5C2";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - China Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","CP", "Send to China Pricing Review State.");
		}

		wfInitiatedNo="WF5B2";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - Japan Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","JP", "Send to Japan Pricing Review State.");
		}

		wfInitiatedNo="WF5A2";
		destWorkflowID=lookupTableHome.getLookupTableValue("WorkflowIdMappingTable",wfInitiatedNo)

		if (!node.isInWorkflow(destWorkflowID)) {
			var destInstance = node.startWorkflowByID(destWorkflowID,"Initated from SDS-DG Workflow - EU Pricing Workflow ");
			Lib.Trigger(destInstance,"Initial","EUP", "Send to China Pricing Review State.");
		}
}