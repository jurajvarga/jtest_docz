/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "STEP-3155",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "STEP-3155",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
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
exports.operation0 = function (node,step,revisionMasterStock) {
function buildItemCodesLists(masterStock, holder) {
	var sProductType = masterStock.getValue("PRODUCTTYPE").getSimpleValue();
	var sMasterItemCode = masterStock.getValue("MASTERITEMCODE").getSimpleValue();

	//Search for Entities with matching product type
	var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome); 
	var type = com.stibo.core.domain.entity.Entity;
	var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
	var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);
	
	var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
	query.root = belowNode;
	
	var itemCodesList = searchHome.querySingleAttribute(query).asList(100).toArray();
	log.info("Matched Item Codes: " + itemCodesList.length);
	for (var i = 0; i < itemCodesList.length; i++) {
		var eSkuDefault = itemCodesList[i];
		var sDefaultItemCode =  eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
		var sDefaultMasterItemCode =  eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
		
		if (sDefaultMasterItemCode == sMasterItemCode){ 
			holder.all.push({"entity" : eSkuDefault.getID(),  "itemCode" : sDefaultItemCode});
		}		
	}
	
	var query = masterStock.queryChildren();
	 query.forEach(function(sku) {
		 var sItemCode =  sku.getValue("ItemCode").getSimpleValue();
		 holder.available.push(sItemCode);
	     return true;
	 });

      var sb = new java.lang.StringBuilder();
	 holder.all.forEach(function(obj) {
		if(holder.available.indexOf(obj.itemCode) == -1) {
			holder.missing.push(obj.itemCode);
		} 
		if(sb.length() > 0) sb.append(",");
		sb.append(obj.itemCode);
	 });
	 log.info("All: " + sb.toString());
	 log.info("Already Created " + holder.available);
	 log.info("Missing Codes: " +holder.missing);
}

 var ItemCode = {
		all : [],
		available : [],
		missing : []
	};
var masterStockReferences = node.getReferences(revisionMasterStock);
if(!masterStockReferences.isEmpty()) {
	var masterStock = masterStockReferences.get(0).getTarget();
	buildItemCodesLists(masterStock, ItemCode);
}
}