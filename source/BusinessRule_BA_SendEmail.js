/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SendEmail",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_SendEmail for Product Status Change",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  }, {
    "libraryId" : "BL_Email",
    "libraryAlias" : "lib_email"
  } ]
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,mailHome,lookupTableHome,BL_Library,BL_ServerAPI,lib_email) {
var prodNo = node.getValue("PRODUCTNO").getSimpleValue();
var prodName = node.getValue("PRODUCTNAME").getSimpleValue();
var prodStatusFrom = node.getValue("Product_Status").getSimpleValue();
var prodStatusTo = null;
var sellOldStock = node.getValue("SELLOLDSTOCK_YN").getSimpleValue();
var recallProduct = node.getValue("Recall_Product").getSimpleValue();
var prodStatusReason = node.getValue("Product_Status_Change_Reason").getSimpleValue();
var estAvailableDate = node.getValue("Estimated_Available_Date").getSimpleValue();
var plannedPrediscontinuationDate = node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();

var listLotNumbers = "";
var lotNumbersAffected = node.getValue("Lot_numbers_affected").getValues();
for(i = 0; i < lotNumbersAffected.size(); i++){
	if(i > 0){
		listLotNumbers = listLotNumbers + ", " + lotNumbersAffected.get(i).getSimpleValue();
	}
	else{
		listLotNumbers = lotNumbersAffected.get(i).getSimpleValue();
	}
}
if(!listLotNumbers){
	listLotNumbers = "None";
}

//STEP-6396
var altProdList = "";
var refType = step.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT");
var refs = node.queryReferences(refType);
refs.forEach(function(ref) {
	if (!altProdList || altProdList == "")
		{altProdList = ref.getTarget().getValue("PRODUCTNO").getSimpleValue();}
	else
		{altProdList = altProdList + ", " + ref.getTarget().getValue("PRODUCTNO").getSimpleValue();}
	return true;
});

if (!altProdList || altProdList == "")
	altProdList = "No";
//STEP-6396


if (prodStatusFrom.equals("Abandoned")){
	prodStatusTo = node.getValue("PSC_Abandoned").getSimpleValue();	
} else if (prodStatusFrom.equals("Discontinued")){
	prodStatusTo = node.getValue("PSC_Discontinued").getSimpleValue();
} else if (prodStatusFrom.equals("Internal Use Only")){
	prodStatusTo = node.getValue("PSC_InternalUseOnly").getSimpleValue();	
} else if (prodStatusFrom.equals("Pending")){
	prodStatusTo = node.getValue("PSC_Pending").getSimpleValue();	
} else if (prodStatusFrom.equals("Pre-discontinued")){
	prodStatusTo = node.getValue("PSC_Pre-discontinued").getSimpleValue();	
} else if (prodStatusFrom.equals("Released")){
	prodStatusTo = node.getValue("PSC_Released").getSimpleValue();	
} else if (prodStatusFrom.equals("Released - On Hold")){
	prodStatusTo = node.getValue("PSC_ReleasedOnHold").getSimpleValue();	
}

// Kits affected?
var kitsAffected = "No";
var masterStockRefType = "";
var checkServiceRevision = false;
var checkServiceConjugates = false;

if (BL_Library.isRevisionType(node, checkServiceRevision)) {
	var masterStockRefType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");

}else if (BL_Library.isProductType(node, checkServiceConjugates)) {
	var masterStockRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock")	
}
//STEP-6396
if (masterStockRefType) {
	var kitRev2SKURefType = step.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
	var msReferences = node.queryReferences(masterStockRefType);
	msReferences.forEach(function(msReference) {
	    var ms = msReference.getTarget()
	    var children = ms.getChildren()
	    for (var j = 0; j < children.size(); j++) {	
	        var byRefs = children.get(j).queryReferencedBy(kitRev2SKURefType);
			byRefs.forEach(function(byRef) {
	            var bySource = byRef.getSource();
	            if(bySource.getName()) {log.info(bySource.getName())
	                kitsAffected = "Yes";
	            return false;
	            }
			return true;
	        });
	    }
		return true;
	});	
}  
//STEP-6396

if(!prodStatusTo){prodStatusTo = ""};
if(!prodStatusFrom){prodStatusFrom = ""};
if(!lotNumbersAffected){lotNumbersAffected = ""};
if(!sellOldStock){sellOldStock = ""};
if(sellOldStock == "Y"){sellOldStock = "Yes"};
if(sellOldStock == "N"){sellOldStock = "No"};
if(!recallProduct){recallProduct = ""};
if(!prodStatusReason){prodStatusReason = ""};
if(!estAvailableDate){estAvailableDate = ""};


//BLOCK A Begin  // uncomment this for go-live & UAT testing and comment next block
//mail.addTo("steptest@cellsignal.com; product-notifications@cellsignal.com");
//if(prodGroup){
//	mail.addTo(prodGroup + "@cellsignal.com");
//}
//mail.addTo(recipientsEmails);
//BLOCK A End



/*
//BLOCK B Begin  // comment this block for go-live & UAT testing and uncomment previous block
mail.addTo("steptest@cellsignal.com");
body = body + "\n\n mail would be sent to \n" + "steptest@cellsignal.com; product-notifications@cellsignal.com";
if(prodGroup){
body = body + "; " + prodGroup + "@cellsignal.com";
}
if(recipientsEmails){
body = body + "\n" + recipientsEmails + "\n";
}
//BLOCK B End
*/

var prodGroup = node.getValue("ProdTeam_Planner_Product").getSimpleValue();

if (node != null) {
	var emailRecipient = lib_email.getEmailsFromGroup(step, lookupTableHome, "WorkflowEmailUserGroupMapTable", "10");

	if(prodGroup) {
		emailRecipient += ";" + prodGroup + "@cellsignal.com";
	}
	
	var emailSubject = "Product Status Change email (" + prodNo + " marked " + prodStatusTo + ")";
	var emailBody = 'Product SKU: ' + prodNo + ' ' + prodName + '<br>\
	  Product Status: ' + prodStatusTo + '<br>\
	  Previous Status: ' + prodStatusFrom + '<br>\
	  1. What Lot # are affected? ' + listLotNumbers + '<br>\
	  2. Is Old Stock OK to Sell? ' + sellOldStock + '<br>\
	  3. Does the Product need to be recalled? ' + recallProduct + '<br>\
	  4. Are any Kits affected? ' + kitsAffected + '<br>\
	  5. Are there any alternative products? ' + altProdList + '<br>\
	  6. Why the status change? ' + prodStatusReason + '<br>\
	  7. Estimated date available? ' + estAvailableDate + '<br>';

		if (plannedPrediscontinuationDate != null && plannedPrediscontinuationDate != "") {
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			var discoDateItems = plannedPrediscontinuationDate.split('-');
			
			emailBody = emailBody + "8. Planned discontinuation date? " + discoDateItems[2] + months[discoDateItems[1] - 1] + discoDateItems[0] + '<br>';
		}
	

	lib_email.sendEmail(mailHome.mail(), emailRecipient, emailSubject, emailBody);
}
}