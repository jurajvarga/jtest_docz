/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateReferenceToProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "Migration Business Actions" ],
  "name" : "To be deleted - BA_CreateReferenceToProduct",
  "description" : "This is also the migration BR.  It creates reference between Product to all Sub-objects for WebUI",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Equipment_Revision", "Kit_Revision", "MasterStock", "Product", "Product_Kit", "Product_Revision", "SKU", "Service_Conjugates" ],
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
//
// Test
//
//node.getValue("XXTEST").setSimpleValue("BA: Entry")
//
//
var sRefType;
var sObjectType = node.getObjectType().getID();
if (sObjectType == "MasterStock") {
	sRefType = "Product_To_MasterStock"
} else if (sObjectType == "SKU") {
	sRefType = "Product_To_SKU";
}
var nProduct = node.getParent().getValue("PRODUCTNO").getSimpleValue();
var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct)
	//Product_To_MasterStock
	//Product_To_Revision
	//Product_To_SKU
	//var ref = pProduct.createReference(node, sRefType);
try {
	var ref = pProduct.createReference(node, sRefType);
} catch (err) {
	if (!err.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException) {
		throw err;
	}
}
}