/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TC_Entry",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TC_Entry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
exports.operation0 = function (node,step,manager,revToMS,BL_MaintenanceWorkflows,bl_library) {
//var workflowType=node.getValue("Workflow_Type").getSimpleValue()
//if (workflowType == "M") {
//	var wfInst = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
//	var msRef = node.getReferences(revToMS)
//	if (msRef && msRef.size()>0) {
//		var skusArr = []
//		var pricesMap = new java.util.HashMap()
//		var rationalesMap = new java.util.HashMap()
//		var skus = msRef.get(0).getTarget().getChildren()
//		for (var i = 0; i < skus.size(); i++) {
//			var sku = skus.get(i)
//			var skuName = sku.getName();
//			var price = sku.getValue("PRICE").getSimpleValue()
//			var rationale = sku.getValue("Global_Base_Price_Rationale").getSimpleValue()
//			pricesMap.put(skuName,price);
//			rationalesMap.put(skuName,rationale);
//			skusArr.push(skuName+";"+"PRICE"+";"+price+";"+"Global_Base_Price_Rationale"+";"+rationale)
//		}
//		wfInst.setSimpleVariable("MaintenancePricesTmp",pricesMap)
//		wfInst.setSimpleVariable("MaintenanceRationalesTmp",rationalesMap)
//		wfInst.setSimpleVariable("MaintenanceMasterStock",skusArr)
//	}
//}


var nProduct=node.getName();
   		var pProduct = manager.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
		log.info(" nProduct "+nProduct);
		log.info(" pProduct "+pProduct.getName());
		var wipRevision= BL_MaintenanceWorkflows.getWIPRevision(pProduct)
		if (wipRevision!=null){
			inparentObjectID = wipRevision.getID();
			log.info(" id "+inparentObjectID);
			log.info(" id "+wipRevision.getName());
		}
}