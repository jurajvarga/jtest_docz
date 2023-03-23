/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MI",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BA_SendEmail for Product Status Change(2)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
exports.operation0 = function (node,step,mailHome,lookupTableHome,BL_ServerAPI,lib_email) {
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

var altProdList = "";
var refType = step.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT");
var refs = node.getReferences().get(refType);
for(i = 0; i < refs.size(); i++){
	if(i > 0)
		 altProdList = altProdList + ", " + refs.get(i).getTarget().getValue("PRODUCTNO").getSimpleValue();
	else
		altProdList = refs.get(i).getTarget().getValue("PRODUCTNO").getSimpleValue();
}

if(!altProdList)
	altProdList = "No";

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

if (node.getObjectType().getID() == "Product_Revision" || node.getObjectType().getID() == "Kit_Revision" || node.getObjectType().getID() == "Equipment_Revision") {
	var masterStockRefType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");

}else if (node.getObjectType().getID() == "Product" || node.getObjectType().getID() == "Product_Kit" || node.getObjectType().getID() == "Equipment") {
	var masterStockRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock")	
}
if (masterStockRefType) {
	var msReferences = node.getReferences(masterStockRefType);
	for (var i = 0; i < msReferences.size(); i++) {
	    var ms = msReferences.get(i).getTarget()
	    var children = ms.getChildren()
	    for (var j = 0; j < children.size(); j++) {	
	            var byRefs = children.get(j).getReferencedBy();
	            var byRefsItr = byRefs.iterator();	
	            while (byRefsItr.hasNext()) {
	                var byRef = byRefsItr.next();
	                var bySource = byRef.getSource();
	                if (byRef.getReferenceTypeString().equals("KitRevision_to_SKU")) {
	                    if(bySource.getName()) {log.info(bySource.getName())
	                    kitsAffected = "Yes";
	                    break;
	                    }
	                }
	            }
	    }	
	}  
}

if(!prodStatusTo){prodStatusTo = ""};
if(!prodStatusFrom){prodStatusFrom = ""};
if(!lotNumbersAffected){lotNumbersAffected = ""};
if(!sellOldStock){sellOldStock = ""};
if(sellOldStock == "Y"){sellOldStock = "Yes"};
if(sellOldStock == "N"){sellOldStock = "No"};
if(!recallProduct){recallProduct = ""};
if(!prodStatusReason){prodStatusReason = ""};
if(!estAvailableDate){estAvailableDate = ""};

var body = "TEST EMAIL for MPV3 Launch. Please ignore" + "\n" + "\n";
body = body + "Product SKU: " + prodNo + " " + prodName + "\n" +
	  "Product Status: " + prodStatusTo + "\n" +
	  "Previous Status: " + prodStatusFrom + "\n" +
	  "1. What Lot # are affected? " + listLotNumbers + "\n" +
	  "2. Is Old Stock OK to Sell? " + sellOldStock + "\n" +
	  "3. Does the Product need to be recalled? " + recallProduct + "\n" +
	  "4. Are any Kits affected? " + kitsAffected + "\n" +
	  "5. Are there any alternative products? " + altProdList + "\n" +
	  "6. Why the status change? " + prodStatusReason + "\n" +
	  "7. Estimated date available? " + estAvailableDate + "\n";

if (plannedPrediscontinuationDate != null && plannedPrediscontinuationDate != "") {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var discoDateItems = plannedPrediscontinuationDate.split('-');
	
	body = body + "8. Planned discontinuation date? " + discoDateItems[2] + months[discoDateItems[1] - 1] + discoDateItems[0] + "\n";
}

var mail = mailHome.mail();
mail.subject(BL_ServerAPI.getMailSubjectServerName()+" Product Status Change email (" + prodNo + " marked " + prodStatusTo + ")");
mail.from(BL_ServerAPI.getNoReplyEmailId()); //can be changed to any email address
var prodGroup = node.getValue("ProdTeam_Planner_Product").getSimpleValue();
var recipientsEmails = lib_email.getEmailsFromGroup(step, lookupTableHome, "WorkflowEmailUserGroupMapTable", "10");

var currentEnvironment=BL_ServerAPI.getServerEnvironment();

if (currentEnvironment == "prod"){
	if(prodGroup){
		mail.addTo(prodGroup + "@cellsignal.com");
	}
}

//BLOCK A Begin  // uncomment this for go-live & UAT testing and comment next block
//mail.addTo("steptest@cellsignal.com; product-notifications@cellsignal.com");
//if(prodGroup){
//	mail.addTo(prodGroup + "@cellsignal.com");
//}
mail.addTo("maria.ivanecka@globallogic.com");
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

mail.plainMessage(body);
mail.send();
}