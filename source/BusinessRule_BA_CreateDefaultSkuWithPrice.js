/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateDefaultSkuWithPrice",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Create Default SKUs With Price in Marketing WF",
  "description" : "Creates SKUs by default entity, and sets default prices ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_lib"
  }, {
    "libraryId" : "BL_CreateSKU",
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,log,bl_lib,lib) {
var product = node.getParent();
var sourcedorcustom=bl_lib.checkSourcedOrCustomLot(step,node,log)
var copyType = product.getValue("COPYTYPE").getSimpleValue();
var wfInitiated = node.getValue("Workflow_No_Initiated").getSimpleValue();

log.info(node.getName() + ": sourcedorcustom " + sourcedorcustom + ", Product copyType " + copyType + ", Workflow_No_Initiated " + wfInitiated);

//STEP 6303 If CarrierFree and MF, create SF & BF SKUs
if(copyType == "CarrierFree") {
    var defaultMFsku = ["SF", "BF"]; //STEP-6408
    var productType = product.getValue("PRODUCTTYPE").getSimpleValue();
    var nProduct = product.getValue("PRODUCTNO").getSimpleValue();
    var revision = bl_lib.getMasterStockForRevision(step, node);
    var msCode = revision.getValue("COPY_MS_CODE").getSimpleValue();
    var parentProductno = revision.getValue("PARENT_PRODUCTNO").getSimpleValue();

    if(msCode == "MF" && parentProductno!=null) {
        for(var i=0; i <defaultMFsku.length; i++) {
            var conditions = com.stibo.query.condition.Conditions;
            var queryHome = step.getHome(com.stibo.query.home.QueryHome);

            var isSKUDefault = conditions.objectType(step.getObjectTypeHome().getObjectTypeByID("SKUDefault"));
            var hasProductType = conditions.valueOf(step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT")).eq(productType);
            var hasItemCode = conditions.valueOf(step.getAttributeHome().getAttributeByID("ItemCode_DFLT")).eq(defaultMFsku[i]); //STEP-6408

            var querySpecification = queryHome.queryFor(com.stibo.core.domain.entity.Entity).where(isSKUDefault.and(hasProductType).and(hasItemCode));
            var resultEntity = querySpecification.execute();
            var resultArrEntity = resultEntity.asList(100).toArray();

            if(resultArrEntity.length != 0) {
                var eSkuDefault = resultArrEntity[0];
                var sDefaultItemCode = eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
                var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
                if(!lib.isSkuExist(step, nProduct, sDefaultItemCode, log)) {
                    var newSku = lib.createSKU(step, revision, eSkuDefault, nProduct, sDefaultItemCode, attrGroup);
                    log.info(newSku.getName() + " has been created");
                }
            }
        }
    }
} else if (wfInitiated == "2") { // STEP-6547
    var ms = bl_lib.getMasterStockForRevision(step, node);

    if (ms) {
        var productType = product.getValue("PRODUCTTYPE").getSimpleValue();
        var nProduct = product.getValue("PRODUCTNO").getSimpleValue();
        var defaultSKUs = ["S", "T"];

        defaultSKUs.forEach(function(code) {
            var conditions = com.stibo.query.condition.Conditions;
            var queryHome = step.getHome(com.stibo.query.home.QueryHome);

            var isSKUDefault = conditions.objectType(step.getObjectTypeHome().getObjectTypeByID("SKUDefault"));
            var hasProductType = conditions.valueOf(step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT")).eq(productType);
            var hasItemCode = conditions.valueOf(step.getAttributeHome().getAttributeByID("ItemCode_DFLT")).eq(code);
            var validForMS = conditions.valueOf(step.getAttributeHome().getAttributeByID("MASTERITEMCODE_DFLT")).eq(ms.getValue("MASTERITEMCODE").getSimpleValue());

            var querySpecification = queryHome.queryFor(com.stibo.core.domain.entity.Entity).where(isSKUDefault.and(hasProductType).and(hasItemCode).and(validForMS));
            var resultEntity = querySpecification.execute();

            resultEntity.forEach(function(eSkuDefault) {
                var sDefaultItemCode = eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
                var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");

                if(!lib.isSkuExist(step, nProduct, sDefaultItemCode, log)) {
                    var newSku = lib.createSKU(step, ms, eSkuDefault, nProduct, sDefaultItemCode, attrGroup);
                    log.info(newSku.getName() + " has been created for OTS Conversion");
                }

                return true;
            });

            return true;
        });
    }
//Create Default SKU only if product type is not Custom or Sourced.
}else if (!sourcedorcustom){
	var children =node.getParent().getChildren();
	for(var i=0;i<children.size(); i++){
		var child =children.get(i);
		log.info("child " + child.getName() + " " + child.getObjectType().getID() + " "  + child.getApprovalStatus().name());
		if (child.getObjectType().getID()=="MasterStock" && child.getApprovalStatus().name()!= "CompletelyApproved"){
			//1.	create Skus
			//2. Set default attribute (attribute grp:ProductItemDefaults & Entity:SKUDefault
			//#1 base on the Product Type on Tech Transfer
			var sProductType = child.getValue("PRODUCTTYPE").getSimpleValue();
			var nProduct = child.getValue("PRODUCTNO").getSimpleValue();
			var sMasterItemCode = child.getValue("MASTERITEMCODE").getSimpleValue();
			log.info("sMasterItemCode" + sMasterItemCode)
			log.info("Product Type " + sProductType + " " + nProduct);
			var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
			
			//With ProductType, retreive entity (Sku Default).
			var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome); 
			var type =com.stibo.core.domain.entity.Entity;
			var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
			var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);
			
			var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
			query.root = belowNode;
			
			var lstDefault = searchHome.querySingleAttribute(query).asList(100).toArray();

			if(lstDefault != null) {
			    for (var i = 0; i < lstDefault.length; i++) {
				  var eSkuDefault = lstDefault[i];
			       var sAutoCreate = eSkuDefault.getValue("AUTOCREATE_YN_DFLT").getSimpleValue();
				  log.info("sAutoCreate " + sAutoCreate);
				  
				  if(sAutoCreate=="Y"){
					var sDefaultItemCode = eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
					log.info("Item SKU " + nProduct+sDefaultItemCode);
					var sDefaultMasterItemCode =  eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
					//log.info("sDefaultMasterItemCode " + sDefaultMasterItemCode + "==" + sMasterItemCode );
					var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
					if (sDefaultMasterItemCode == sMasterItemCode){
						if(!lib.isSkuExist(step, nProduct, sDefaultItemCode, log)) {
							var newSku = lib.createSKU(step, child, eSkuDefault, nProduct, sDefaultItemCode, attrGroup);
						}
					}					
				  }
			    }
			}
		}
	}
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Precondition"
}
*/
exports.precondition0 = function (node,bl_lib,lib) {
if (node != null &&  node.getObjectType().getID().equals("Kit_Revision")) {
	return false;
}else{
	return true;	

}
}