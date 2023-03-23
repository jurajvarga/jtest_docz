/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_MaintenancePriceAttrSet",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_MaintenancePriceAttrSet",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
  }, {
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
exports.operation0 = function (node,revToMS,BL_Approve,bl_library) {
var workflowType=node.getValue("Workflow_Type").getSimpleValue()
if (workflowType == "M") {
	var wfInst = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
	//STEP-6396
	var msRef = node.queryReferences(revToMS)
	msRef.forEach(function(ref) {
		var skusArr = []
		var pricesMap = new java.util.HashMap()
		var rationalesMap = new java.util.HashMap()
		var skus = ref.getTarget().getChildren()
		for (var i = 0; i < skus.size(); i++) {
			var sku = skus.get(i)
			var skuName = sku.getName();
			var price = sku.getValue("PRICE").getSimpleValue()
			var rationale = sku.getValue("Global_Base_Price_Rationale").getSimpleValue()
			pricesMap.put(skuName,price);
			rationalesMap.put(skuName,rationale);
			skusArr.push(skuName+";"+"PRICE"+";"+price+";"+"Global_Base_Price_Rationale"+";"+rationale)
		}
		wfInst.setSimpleVariable("MaintenancePricesTmp",pricesMap)
		wfInst.setSimpleVariable("MaintenanceRationalesTmp",rationalesMap)
		wfInst.setSimpleVariable("MaintenanceMasterStock",skusArr)
		return false;
	});
	//STEP-6396
}
}