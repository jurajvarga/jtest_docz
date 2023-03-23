/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CheckItemCode",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "Check Item Code",
  "description" : null,
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "availableCodesAttr",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "SKU_Creation_Available",
    "description" : null
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "newCodeAttr",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeImpl",
    "value" : "SKU_Creation_Create",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,availableCodesAttr,newCodeAttr) {
var availableCodes = node.getValue(availableCodesAttr.getID()).getSimpleValue();
var newCode = node.getValue(newCodeAttr.getID()).getSimpleValue();

if(availableCodes == null) {
	if (node.getObjectType().getID()=="Kit_Revision") {
		return "Kit has no available Item Codes";
	} else {
		return "Product has no available Item Codes";
	}
}

if(newCode) {
	var splitted = availableCodes.split(",");
	for(var i = 0; i < splitted.length; i++) {
		if(splitted[i] == newCode.toUpperCase()) {
			return true;
		}
	}
}

if (node.getObjectType().getID()=="Kit_Revision") {
	return newCode + " is not a valid Item Code for this Kit."
} else {
	return newCode + " is not a valid Item Code for this Product."
}
}