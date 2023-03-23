/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsApprovedImageEvent",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_IsApprovedImageEvent",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage", "Product_DataSheet" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var objApprovalStatus=node.getApprovalStatus()
log.info(" node.getApprovalStatus() "+objApprovalStatus);

if (objApprovalStatus=="Completely Approved"){
	return true;
}else{
	return false;	
		
}
}