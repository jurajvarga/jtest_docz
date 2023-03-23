/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isProductTypeGFnCMF",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isProductTypeGFnCMF",
  "description" : "is product type equal to \"Growth Factors & Cytokines\" and masterstock code equal to \"MF\" ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
/**
 * Business Condition: BC_isProductTypeGFnCMF
 * 
 * Description
 * return thrue if product type is Growth Factors & Cytokines and masterstock code is MF
 * 
 * Purpose:
 * STEP-6075
 * Create Default SKUs in WebUI.
 */

//STEP-6396
var masterStockReferences = node.queryReferences(revisionMasterStock);
var masterStockReferencesExist = false;
var retValue = true;
masterStockReferences.forEach(function(ref) {
	var masterStock = ref.getTarget();
	masterStockReferencesExist = true;
	if (
		(node.getValue("PRODUCTTYPE").getSimpleValue() == "Growth Factors and Cytokines") &&
		(masterStock.getValue("MASTERITEMCODE").getSimpleValue() == "MF") 
	)
	{
		retValue = true;
	} else {
		retValue = false;
	}
	return true;
});
if (!masterStockReferencesExist)
{
	retValue = false;
}
return retValue;
//STEP-6396
}