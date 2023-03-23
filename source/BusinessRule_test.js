/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Create Default SKUs(2)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
function setDefault(attGroup, pSku, entity){
	if(attGroup != null){
		var lstAttributes = attGroup.getAttributes();
		var iterator = lstAttributes.iterator();
		while(iterator.hasNext()) {
			var dfltAttribute = iterator.next();
			var attributeId = dfltAttribute.getID().replace("_DFLT", "");
			var attribute = step.getAttributeHome().getAttributeByID(attributeId);
			if (attribute.getValidForObjectTypes().contains(pSku.getObjectType())){
				var attID = attribute.getID();
				//log.info("Default Attribute "+ attID);
				var val = entity.getValue(dfltAttribute.getID()).getSimpleValue();
				//log.info("Default Value "+ val);
				if (val)
					pSku.getValue(attID).setSimpleValue(val);
			}
		}
	}
}

function isSkuExist(nProduct, sItemCode){
	var pSku= step.getNodeHome().getObjectByKey("SKUNO",nProduct+sItemCode);
	 if (pSku)
	 	return true;
	 else
	 	return false;;
}
var children =node.getChildren();
for(var i=0;i<children.size(); i++){
	var child =children.get(i);
	if (child.getObjectType().getID()=="MasterStock" && child.getApprovalStatus().name()!= "CompletelyApproved"){
		//1.	create Skus
		//2. Set default attribute (attribute grp:ProductItemDefaults & Entity:SKUDefault
		
		//#1 base on the Product Type on Tech Transfer
		var sProductType = child.getValue("PRODUCTTYPE").getSimpleValue();
		var nProduct = child.getValue("PRODUCTNO").getSimpleValue();
		var sMasterItemCode = child.getValue("ITEMCODE").getSimpleValue();
		//log.info("Product Type " + sProductType);
		var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
		
		//With ProductType, retreive entity (Sku Default).
		var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome); 
		var type =com.stibo.core.domain.entity.Entity;
		var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
		var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);
		
		var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
		query.root = belowNode;
		
		var lstDefault = searchHome.querySingleAttribute(query).asList(100).toArray();
		
		for (var i = 0; i < lstDefault.length; i++) {
			var eSkuDefault = lstDefault[i];
			var sAutoCreate = eSkuDefault.getValue("AUTOCREATE_YN_DFLT").getSimpleValue();
			log.info(sAutoCreate);
			if(sAutoCreate=="Y"){
				var sDefaultItemCode = eSkuDefault.getValue("ITEMCODE_DFLT").getSimpleValue();
				if(!isSkuExist(nProduct, sDefaultItemCode)){
					var sDefaultMasterItemCode =  eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
					//log.info("sDefaultMasterItemCode " + sDefaultMasterItemCode);
					if (sDefaultMasterItemCode == sMasterItemCode){
					  	var pSku =  child.createProduct( null, "SKU");
					  	pSku.getValue("PRODUCTNO").setSimpleValue(nProduct);
						pSku.getValue("ITEMCODE").setSimpleValue(sDefaultItemCode);
						pSku.getValue("EXTERNALITEMNO").setSimpleValue(nProduct+sDefaultItemCode);
						pSku.setName(nProduct+sDefaultItemCode);
						log.info(pSku);
						setDefault(attGroup, pSku, eSkuDefault);
					}
				}
			}
		}

	}
}


}