/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "testRIMA3",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "testRIMA3",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product", "Product_Kit" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
exports.operation0 = function (node,step,Lib) {
function getSubCategory(sSubCategoryId){
	var eCategorizationLogicRoot = step.getEntityHome().getEntityByID("Product_Type_SubCategory_Logic");
	var children = eCategorizationLogicRoot.getChildren().iterator();
	while(children.hasNext()){
		var eMapping = children.next();
		//log.info(eMapping.getValue("New_Product_Product_Type").getSimpleValue() + " | " + sSubCategoryId);
		if(eMapping.getValue("New_Product_Product_Type").getSimpleValue() == sSubCategoryId){
			return eMapping.getValue("New_Product_SubCategory_ID").getSimpleValue();
		}
	}
	return null;
}

var sSubCategoryName = node.getValue("PRODUCTTYPE").getSimpleValue();
var sSubCategoryId = getSubCategory(sSubCategoryName);
//this will be provided by Tech Transfer object
if(sSubCategoryId){
	var pSubCategory = step.getProductHome().getProductByID(sSubCategoryId);
}
else{
	var pSubCategory = step.getProductHome().getProductByID("Uncategorized_Products");
}


//#1 create Product
pProduct = pSubCategory.createProduct( null, "Product_Kit");
log.info(pProduct.getParent().getName());
}