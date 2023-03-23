/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "paramTestCondition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "paramTestCondition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
/*var childrenIter = node.getChildren().iterator();
var sdsFound = false;
var wipRevFound = false;

while(childrenIter.hasNext()) {
	var child = childrenIter.next();
	var childObj = child.getObjectType().getID();
	if( (childObj == "Product_Revision") || (childObj == "Kit_Revision") ) {      
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
} else {
	return true;
} */

var refMasterStock 		= step.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock");
var refMasterStockLinks 	= node.getReferences().get(refMasterStock);
var masterStock 		= refMasterStockLinks.get(0).getTarget();
var dangerFlg 			= masterStock.getValue("Dangerous_Goods_Flag_YN").getSimpleValue();  

if (dangerFlg == "N") {
	return true;
} else if (dangerFlg == "Y") {
	var errStr	= "";
	var unNumber 	= masterStock.getValue("UN_Number").getSimpleValue();
	if (unNumber 	== null) { errStr = "\n" + errStr + "UN Number is blank" + "\n"; }
	var pShipName 	= masterStock.getValue("Proper_Shipping_Name").getSimpleValue();
	if (pShipName 	== null) { errStr = errStr + "Proper Shipping Name is blank" + "\n"; }
	var hClassDiv	= masterStock.getValue("Hazardous_Class_Div").getSimpleValue();
	if (hClassDiv 	== null) { errStr = errStr + "Hazardous Class or Division is blank" + "\n"; }
	var packGrp	= masterStock.getValue("Packing_Group").getSimpleValue();
	if (packGrp 	== null) { errStr = errStr + "Packaging Group is blank" + "\n"; }
	var expQtyCode	= masterStock.getValue("Excepted_Quantity_Code").getSimpleValue();
	if (expQtyCode == null) { errStr = errStr + "Expected Quantity Code is blank"; }

	if (errStr == "") {
		return true;
	} else {
		return errStr;
	}
	
} else {
	return "Please provide a value for Dangerous Goods?";
}
}