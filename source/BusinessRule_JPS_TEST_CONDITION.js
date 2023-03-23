/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "JPS_TEST_CONDITION",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "jpsTestCondition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
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
var childrenIter = node.getChildren().iterator();
var sdsFound = false;
var wipRevFound = false;
while(childrenIter.hasNext()) {
	var child = childrenIter.next();
	var childObj = child.getObjectType().getID();
	if( (childObj == "Product_Revision") || (childObj == "Kit_Revision") || (childObj == "Equipment_Revision") ) {      
		var rStatus = child.getValue("REVISIONSTATUS").getSimpleValue();    
		if (rStatus == "In-process")
		{    wipRevFound = true;
			var sdsIter = child.getChildren().iterator();
			while(sdsIter.hasNext()) {
				var sds =  sdsIter.next();
				var sdsObj = sds.getObjectType().getID();
				if (sdsObj == "SDS_ASSET_URL_LINK") {
					sdsFound = true;
					break; 
				}
			}
		}
	}
}

if (wipRevFound == true && sdsFound == false) {
	return "SDS Sheet not found for the WIP Revision";
}
}