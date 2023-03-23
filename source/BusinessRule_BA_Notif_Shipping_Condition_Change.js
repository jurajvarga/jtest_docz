/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Notif_Shipping_Condition_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Release" ],
  "name" : "BA Notificiation Shipping Condition Change",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,lookupTableHome,mailHome,BA_Approve,BL_Email,BL_Library,BL_ServerAPI) {
//STEP-6341 start
var sendSkuEmail = false;
var sendMSEmail = false;
var skuEmailBody = '<h2>The following SKUs have changed shipping conditions</h2>' + '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';
var msEmailBody = '<h2>The following MasterStocks have changed shipping conditions</h2>';
var skuHeadingContent = ["PRODUCT NUMBER", "MASTERSTOCK", "SKU", "PRODUCT TYPE", "LOT NUMBER", "PRODUCT STATUS", "PRODUCT TEAM", "ORIGINAL SHIPPING CONDITION", "NEW SHIPPING CONDITION", "INITIATOR"];
skuEmailBody += BL_Email.generateHtmlTableHeading(skuHeadingContent, 10);
var msHeadingContent = ["MASTERSTOCK", "ORIGINAL SHIPPING CONDITION", "NEW SHIPPING CONDITION"];
var msSkuHeadingContent = ["SKU", "CURRENT SHIPPING CONDITION"];

var conditions = com.stibo.query.condition.Conditions;
var hasOriginalShippingConditionsChanged = conditions.valueOf(manager.getAttributeHome().getAttributeByID("Shipping_Conditions_Original")).eq("Changed");
var isProductRevision = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Revision"));
var isKitRevision = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Kit_Revision"));
var isEquipmentRevision = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment_Revision"));

var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(hasOriginalShippingConditionsChanged.and((isProductRevision).or(isKitRevision).or(isEquipmentRevision)));

var result = querySpecification.execute();
var resultArr = result.asList(150).toArray();
resultArr.sort(function (a, b) { 
			return a.getValue("ProdTeam_Planner_Product").getSimpleValue().localeCompare(b.getValue("ProdTeam_Planner_Product").getSimpleValue())
			|| a.getValue("PRODUCTNO").getSimpleValue().localeCompare(b.getValue("PRODUCTNO").getSimpleValue()); 
		})

var skuEmailList = lookupTableHome.getLookupTableValue("WorkflowEmailUserGroupMapTable", "ShippingConditionChange");
var msEmailList = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", "ProdGL");
var resultProdCountSku = 0;
var resultProdCountMS = 0;
var skuTableContent = [];
var msTableContent = [];
var msSkuTableContent = [];
		
for (var i = 0; i < resultArr.length; i++) {
	var revision = resultArr[i];

	var isApprovedRevision = revision.getApprovalStatus().name();
	revision.getValue("Shipping_Conditions_Original").setSimpleValue(null);
	if (isApprovedRevision == "CompletelyApproved") {
		BA_Approve.execute(revision);
	}
	
	var oldShipCond;
	var newShipCond;
	
	var masterStock = BL_Library.getMasterStockForRevision(manager, revision);
	var masterStockName = masterStock.getName();

	if (masterStock.getValue("Shipping_Conditions_Original").getSimpleValue() != null){
		sendMSEmail = true;
		oldShipCond = masterStock.getValue("Shipping_Conditions_Original").getSimpleValue();
		newShipCond = masterStock.getValue("ShippingConditions").getSimpleValue();
		
		var isApprovedMasterStock = masterStock.getApprovalStatus().name();
		masterStock.getValue("Shipping_Conditions_Original").setSimpleValue(null);
		if (isApprovedMasterStock == "CompletelyApproved") {
			BA_Approve.execute(masterStock);
		}

		msEmailBody += '<br> <table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">'
		msEmailBody += generateHtmlTableHeading(msHeadingContent, 3);
		msTableContent = [masterStockName, oldShipCond, newShipCond];
		var msTableRowStyle = (resultProdCountMS % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
		msEmailBody += generateHtmlTableRow(msTableContent, msTableRowStyle, 3);
		msEmailBody += '</table> <table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';
		msEmailBody += generateHtmlTableHeading(msSkuHeadingContent, 2);
		var resultProdCountMSSku = 0;

		var skus = masterStock.queryChildren();
		
		skus.forEach( function (sku) {
			var itemSku = sku.getValue("Item_SKU").getSimpleValue();
			var curShipCond = sku.getValue("ShippingConditions").getSimpleValue();

			msSkuTableContent = [itemSku, curShipCond];
			var msSkuTableRowStyle = (resultProdCountMSSku % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
			msEmailBody += generateHtmlTableRow(msSkuTableContent, msSkuTableRowStyle, 2);
			resultProdCountMSSku += 1;
			
			return true;
		});
		
		msEmailBody += '</table>' 
	}

	var prodTeam;

	var skus = masterStock.queryChildren();
	skus.forEach( function (sku) {

		if(sku.getValue("Shipping_Conditions_Original").getSimpleValue() != null){
			
			oldShipCond = sku.getValue("Shipping_Conditions_Original").getSimpleValue();
			newShipCond = sku.getValue("ShippingConditions").getSimpleValue();	
			
			var isApprovedSku = sku.getApprovalStatus().name();
			sku.getValue("Shipping_Conditions_Original").setSimpleValue(null);
			if (isApprovedSku == "CompletelyApproved") {
				BA_Approve.execute(sku);
			}
		
			var skuType = sku.getValue("ItemCode").getSimpleValue();
		
			if (oldShipCond != null && oldShipCond != newShipCond && skuType != "BC" && skuType != "BF") {
				sendSkuEmail = true;

				var productNumber = sku.getValue("PRODUCTNO").getSimpleValue();
				var itemSku = sku.getValue("Item_SKU").getSimpleValue();
				var productType = sku.getValue("PRODUCTTYPE").getSimpleValue();
				var lotNumber = sku.getValue("Shipping_Lot_No").getSimpleValue();
				var productStatus = sku.getValue("Product_Status").getSimpleValue();
				prodTeam = sku.getValue("ProdTeam_Planner_Product").getSimpleValue();
				var initiator = revision.getValue("Workflow_Initiated_By").getSimpleValue();

				if(oldShipCond == "no value") {
					oldShipCond = "";
				}
				
				skuTableContent = [productNumber, masterStockName, itemSku, productType, lotNumber, productStatus, prodTeam, oldShipCond, newShipCond, initiator];

				var skuTableRowStyle = (resultProdCountSku % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				skuEmailBody += BL_Email.generateHtmlTableRow(skuTableContent, skuTableRowStyle, 10);
				resultProdCountSku += 1
				
			}
		}
		return true;
	});

	if(prodTeam && skuEmailList.match(prodTeam) == null) {
			skuEmailList += ";" + prodTeam + "@cellsignal.com";
	}
}

msEmailBody += '</table>';
skuEmailBody += '</table>';

var emailSubject = 'Notification for Shipping condition change';
	
if (sendSkuEmail) {
	BL_Email.sendEmail(mailHome.mail(), skuEmailList, emailSubject, skuEmailBody);
}

if (sendMSEmail) {
	BL_Email.sendEmail(mailHome.mail(), msEmailList, emailSubject, msEmailBody);
}

function generateHtmlTableHeading(headingArray, numberOfCells) {
    var cellWidth = 100/numberOfCells;
    var tableHeading = '<thead style="color:#fff; background-color:#3e7998; border-bottom: 5px solid #235067; border-top: 1px solid #235067">' +
        '<tr>';
    for (var indx = 0; indx < headingArray.length; indx++) {
        tableHeading += '<th style="padding: 5px" width="'+cellWidth+'%">' + headingArray[indx] + '</th>';
    }
    tableHeading += '</tr>' + '</thead>';

    return tableHeading;
}

function generateHtmlTableRow(recordArray, rowStyle, numberOfCells) {
	var cellWidth = 100/numberOfCells;
    var tableRow = '<tr ' + rowStyle + '>'
    for (var indx = 0; indx < recordArray.length; indx++) {
        tableRow += '<td style="padding: 5px" width="'+cellWidth+'%">' + (recordArray[indx] != null ? recordArray[indx] : "") + '</td>';
    }
    tableRow += '</tr>';

    return tableRow;
}
//STEP-6341 end
}