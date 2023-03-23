/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_OIEP_JSON_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BA_OIEP_JSON_Formatter",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult

var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
	log.info("No event information available in node handler");
} else {
	log.info("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();
if (node != null && node instanceof com.stibo.core.domain.Product) {
	log.info("Node handler handling product with URL: " + node.getURL());
	//
	//format the JSON message 
	//
	var mesg = {};
	mesg.stepid = node.getID() + "";
	mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";

	if (nodeHandlerSource.isDeleted()) {
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesg));
	} else {
		mesg.category = node.getParent() == null ? null : node.getParent().getID() + "";
		mesg.PRODUCTNAME = node.getValue("PRODUCTNAME").getSimpleValue() + "";
		var children = node.getChildren();
		var mss = []  //MasterStock Array
		for (i = 0; i < children.size(); i++) {
			var child = children.get(i);
			if (child.getObjectType().getID() == "MasterStock") {
				var ms = {};  // MasterStock 
				ms["MasterStock_SKU"] = child.getValue("MasterStock_SKU").getSimpleValue() + "";
				ms["CLP_Lot_Concentration_Units"] =  child.getValue("CLP_Lot_Concentration_Units").getSimpleValue() + "";
				var skus=[];  //SKU array
				var skulist = child.getChildren();
				//get all the SKU and format into JSON record
				for (j = 0; j < skulist.size(); j++) {
					var pSKU  = skulist.get(j);
					var sku = {}; //SKU
					sku["Item_SKU"] = pSKU.getValue("Item_SKU").getSimpleValue() + "";
					sku.ITEMSTOCKFORMAT= pSKU.getValue("ITEMSTOCKFORMAT").getSimpleValue() + "";
					sku.QTY_MKTG= pSKU.getValue("QTY_MKTG").getSimpleValue() + "";
					skus.push(sku);
				}
				ms.SKUs=skus;
				mss.push(ms);
				mesg.MasterStocks = mss;
			}
		}
		nodeHandlerResult.addMessage("upsert", JSON.stringify(mesg));
	}
}
}