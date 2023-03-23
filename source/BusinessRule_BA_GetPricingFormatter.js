/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetPricingFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Pricing" ],
  "name" : "BA_GetPricingFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Lib"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  } ]
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
  }, {
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,executionReportLogger,step,BL_JSONCreation,BL_Lib,BL_MaintenanceWorkflows) {
function checkPrice(price) {
	if (price == null) {
		return "0";
	}
	else {
		return price + "";
	}
}

function buildSkuMessage(currSku){
    var mesg;
    if (currSku.getValue("ITEMACTIVE_YN").getSimpleValue() == "Y" && currSku.getValue("PUBLISH_YN").getSimpleValue() == "Y" && currSku.getValue("EBSFLAG_YN").getSimpleValue() == "Y") {
        var skuPrices = {};
        var skuJsonPrice = {};
        var skuJsonEu = {};
        var skuJsonChina = {};
        var skuJsonDe = {};
        var skuJsonAt = {};
        var skuJsonUk = {};
        var skuJsonJapan = {};
        var skuList = [];

        skuPrices["sku"] = currSku.getValue("Item_SKU").getSimpleValue() + "";

        skuJsonPrice["country"] = "US";
        skuJsonPrice["currencyCode"] = "USD";
        skuJsonPrice["amount"] = checkPrice(currSku.getValue("PRICE").getSimpleValue());

        skuJsonEu["country"] = "NL";
        skuJsonEu["currencyCode"] = "EUR";
        skuJsonEu["amount"] = checkPrice(currSku.getValue("EU_CLP").getSimpleValue());

        skuJsonChina["country"] = "CN";
        skuJsonChina["currencyCode"] = "CNY";
        skuJsonChina["amount"] = checkPrice(currSku.getValue("China_CLP").getSimpleValue());

        skuJsonDe["country"] = "DE";
        skuJsonDe["currencyCode"] = "EUR";
        skuJsonDe["amount"] = checkPrice(currSku.getValue("DE_CLP").getSimpleValue());

	   skuJsonAt["country"] = "AT";
        skuJsonAt["currencyCode"] = "EUR";
        skuJsonAt["amount"] = checkPrice(currSku.getValue("DE_CLP").getSimpleValue());
        
        skuJsonUk["country"] = "UK";
        skuJsonUk["currencyCode"] = "GBP";
        skuJsonUk["amount"] = checkPrice(currSku.getValue("UK_CLP").getSimpleValue());

        skuJsonJapan["country"] = "JP";
        skuJsonJapan["currencyCode"] = "JPY";
        skuJsonJapan["amount"] = checkPrice(currSku.getValue("Japan_CLP").getSimpleValue());

        skuList.push(skuJsonPrice);
        skuList.push(skuJsonEu);
        skuList.push(skuJsonChina);
        skuList.push(skuJsonDe);
        skuList.push(skuJsonAt);
        skuList.push(skuJsonUk);
        skuList.push(skuJsonJapan);

        skuPrices["price"] = skuList;
    }
    return skuPrices;
}

Object.buildNodeMessage = function buildNodeMessage(node) {
	var mesg = {};
	mesg.productno = node.getValue("PRODUCTNO").getSimpleValue() + "";	
     var itemPriceDetails = [];
	var currRev;
	
    // SKU
	if (node.getObjectType().getID().equals("SKU")) {
        	var JsonskuPrices = buildSkuMessage(node);
     	if (JsonskuPrices){
    		 	itemPriceDetails.push(JsonskuPrices);
		}
        mesg["itemPriceDetails"] = itemPriceDetails;
        mesg["json-generation-date"] = new Date().toISOString().replace("T"," ").replace("Z","");
        return mesg;
	}
	
    // Revision or Product
    // STEP-6513
     var checkServiceRevision = true;
	if (BL_Lib.isRevisionType(node, checkServiceRevision)) {
		currRev = node;
		node = node.getParent();
	}
	else {
		currRev = BL_MaintenanceWorkflows.getCurrentRevision(node);
	}

	if (currRev != null && currRev.getValue("PUBLISHED_YN").getSimpleValue() == "Y") {
		var productType = node.getValue("PRODUCTTYPE").getSimpleValue();

		if (productType == "Growth Factors and Cytokines") {
			var ms = BL_Lib.getProductChildren(node, "MasterStock");
			
			// for all MS
			for (var i = 0; i < ms.length; i++) {
				var skus = BL_Lib.getProductChildren(ms[i], "SKU");
				// for all SKUs
				for (var j = 0; j < skus.length; j++) {
	               	var JsonskuPrices = buildSkuMessage(skus[j]);
	               	if (JsonskuPrices){
	              		 	itemPriceDetails.push(JsonskuPrices);
					}
				}
			}
            	mesg["itemPriceDetails"] = itemPriceDetails;
		}
		else {
			var currMs = BL_Lib.getMasterStockForRevision(step, currRev);
			var currSkus = BL_Lib.getProductChildren(currMs, "SKU");
			// for all SKUs
			for (var i = 0; i < currSkus.length; i++) {
               	 var JsonskuPrices = buildSkuMessage(currSkus[i]);
               	 if (JsonskuPrices){
              		 	itemPriceDetails.push(JsonskuPrices);
               	 }
			}
			mesg["itemPriceDetails"] = itemPriceDetails;
		}
		//STEP-6152
          mesg["json-generation-date"] = new Date().toISOString().replace("T"," ").replace("Z","");
	}   
	return mesg;
}

//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
	executionReportLogger.logInfo("No event information available in node handler");
}
else {
	executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null) {
	executionReportLogger.logInfo("node ID: " + node.getID()); // STEP-6160
		
	if (nodeHandlerSource.isDeleted()) {
		mesgfinal = {};
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
	}
	else {
		mesgfinal = Object.buildNodeMessage(node);
		log.info(JSON.stringify(mesgfinal));
	}

	nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
}
}