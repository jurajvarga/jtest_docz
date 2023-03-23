/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsDGorPrimaryAntibodies",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_IsDGorPrimaryAntibodies",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var productType = node.getValue("PRODUCTTYPE").getSimpleValue();
var isPrimaryAntibody = productType != null && (productType == "Polyclonal Antibody" || productType == "Monoclonal Antibody");

if ((node.getValue("Dangerous_Goods_Flag_YN").getSimpleValue() == "Y") || (node.getValue("GHS_Label_Required_CB").getSimpleValue() == "Y") || !isPrimaryAntibody ){
 	return true;
} else {
	return false;
}
}