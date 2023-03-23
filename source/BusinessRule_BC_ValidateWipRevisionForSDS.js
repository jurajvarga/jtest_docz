/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ValidateWipRevisionForSDS",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BC_Validate Wip Revision For SDS",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "objTypeSDSLink",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "SDS_ASSET_URL_LINK",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,objTypeSDSLink,logger) {
var sdsFound = false;
var wipRevFound = false;
var rStatus = node.getValue("REVISIONSTATUS").getSimpleValue();
if (rStatus == "In-process") {
	wipRevFound = true;
	var childrenIter = node.getChildren().iterator();
	while(childrenIter.hasNext()) {
		var child = childrenIter.next();
		if (child.getObjectType().getID().equals(objTypeSDSLink.getID())) {
			sdsFound = true;
			break; 
		}
	}
}
//logger.info(wipRevFound + " "  + sdsFound)
if (wipRevFound == true && sdsFound == false) {
	return "SDS Sheet not found for the WIP Revision";
} else {
	return true;
}
}