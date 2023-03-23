/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Copy_Current_Price_To_Future",
  "type" : "BusinessAction",
  "setupGroups" : [ "Year_End_Pricing_Rules" ],
  "name" : "BA Copy Current Price To Future",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "SKU", "Service_Conjugates" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
function updateFuturePrice(obj) {
					try {
					var sPrice = obj.getValue("PRICE").getSimpleValue();
					var sFuturePrice = obj.getValue("Future_Global_Base_Price").getSimpleValue() ;
					log.info(obj.getName() + " Price " + sPrice + " Future Price is " + sFuturePrice );
					if (sPrice) {
						if ((sPrice == 0) && ((sFuturePrice==0) || sFuturePrice == null)) {
							log.info(obj.getName() + " Both current and future are 0, no need to update.");
						}
						else {
							obj.getValue("Future_Global_Base_Price").setSimpleValue(sPrice);
							obj.getValue("Future_Global_Base_Price_Date").setSimpleValue("2020-12-31");
							obj.getValue("Future_Global_Base_Price_Rationale").setSimpleValue("8. Annual Price Change");
							log.info(obj.getName() + " Updated Future price to " + sPrice);
						}
					}
					else {
						log.info(obj.getName() + " Current price is blank ");
					}
				}
				catch (e) {
					log.info(obj.getName() + " Error setting Future Price to "+sPrice);
					throw(e);
				}

}

log.info("Processing Product: "  + node.getValue("PRODUCTNO").getSimpleValue() + " - " + node.getName());
var sObjType = node.getObjectType().getID() ;
if(sObjType == "SKU" ) {
	updateFuturePrice(node);    
}
else {
	var childrenObj = node.getChildren();
	for ( i = 0; i < childrenObj.size(); i++ ) {
		masterStock = childrenObj.get(i);
		var sObjType = masterStock.getObjectType().getID() ;
		if(sObjType == "MasterStock" )  {
			var masterStockChildren = masterStock.getChildren();
			for ( x = 0; x < masterStockChildren.size(); x++ ) {
				sku = masterStockChildren.get(x);    
				updateFuturePrice(sku);    
			}
		}
		else if(sObjType == "SKU" )  {
			log.info(masterStock.getName() + " is a SKU Directly under Product ");  
			updateFuturePrice(masterStock);
		}
		else  {
			log.info(masterStock.getName() + " is not a masterstock and sku");
		} 
	}

}
}