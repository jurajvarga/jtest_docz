/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Alternate_Product",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ProductStatus" ],
  "name" : "BC_Alternate_Product",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
var refAltProdType = manager.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT")
//STEP-6396
var altProdRefs = node.queryReferences(refAltProdType)
var curentProdID = node.getParent().getID()
var altProdRefsExists = false;
var curentProdIDExists = false;
altProdRefs.forEach(function(ref) {
	altProdRefsExists = true;
	if (ref.getTarget().getID() == curentProdID) {
		curentProdIDExists = true;
		return false;
	}
	return true;	
});
if (!altProdRefsExists) {
	return true
}
if (curentProdIDExists) {
	return false;
}
return true

//STEP-6396
}