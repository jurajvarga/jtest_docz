/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_StoreBaseUOM",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_StoreBaseUOM",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,revisionMasterStock) {
//STEP-6608
var instance;
if (node.isInWorkflow("WF3B_Supply-Chain")){
	 instance = node.getWorkflowInstanceByID("WF3B_Supply-Chain")
}else if (node.isInWorkflow("Production_Workflow")){
	 instance = node.getWorkflowInstanceByID("Production_Workflow")
}
//STEP-6608

//STEP-6396
var masterStockReferences = node.queryReferences(revisionMasterStock)
masterStockReferences.forEach(function(ref) {
	masterStock = ref.getTarget();
	if(masterStock) {
		var usedSkus = masterStock.getChildren()
		var result = []
		for (var i=0; i<usedSkus.size();i++) {
			var item = "itemCode:" + usedSkus.get(i).getValue("ItemCode").getSimpleValue() + ";"
			+ " itemSentToEBS:" + usedSkus.get(i).getValue("ITEM_SENT_TO_EBS").getSimpleValue() + ";"
			+ " baseUOM:" + usedSkus.get(i).getValue("UOM_BASE").getSimpleValue()		
	     	result.push(item)
		}
		instance.setSimpleVariable("skuData",result)
	}
	return true;
});
//STEP-6396
}