/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TC_TEST",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TC_TEST",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "alias" : "step",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revToMS",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,manager,revToMS,bl_library) {
var workflowType=node.getValue("Workflow_Type").getSimpleValue()
if (workflowType == "M") {
	var wfInst = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
	var msRef = node.getReferences(revToMS)
	if (msRef && msRef.size()>0) {
		var pricesMap = new java.util.HashMap()
		var rationalesMap = new java.util.HashMap()
		var skus = msRef.get(0).getTarget().getChildren()
		for (var i = 0; i < skus.size(); i++) {
			var sku = skus.get(i)
			var skuName = sku.getName();
			var price = sku.getValue("PRICE").getSimpleValue()
			var rationale = sku.getValue("Global_Base_Price_Rationale").getSimpleValue()
			pricesMap.put(skuName,price);
			rationalesMap.put(skuName,rationale);
		}
		wfInst.setSimpleVariable("MaintenancePricesTmp",pricesMap)
		wfInst.setSimpleVariable("MaintenanceRationalesTmp",rationalesMap)
	}
}
}