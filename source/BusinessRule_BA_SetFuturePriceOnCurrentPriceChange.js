/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetFuturePriceOnCurrentPriceChange",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA Set Future Price On Current Price Change",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Copy_Current_Price_To_Future_US",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Copy_Current_Price_To_Future_US",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Copy_Current_Price_To_Future_US) {
//Need to be commented after year end pricing is executed <-- comment carried over from BA_SubmitToSFGI, BA_SetCurrentRevisionWOReleaseWF

var wfType = node.getValue("Workflow_Type").getSimpleValue();
var wfInstance = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
var msRef = node.queryReferences(revToMS) //STEP-6396 
msRef.forEach(function(ref) {   //STEP-6396 
    var violations = "";
    var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"))

    var skus = ref.getTarget().getChildren()//STEP-6396

    for (var i = 0; i < skus.size(); i++) {
        var sku = skus.get(i)
        var skuName = sku.getName();
        var price = String(sku.getValue("PRICE").getSimpleValue())
        var priceOld = getValueFromString(pricesTmp, skuName)
        priceOld = (priceOld == "null") ? "" : priceOld
        price = (price == "null") ? "" : price

        if (priceOld != price) {

            BA_Copy_Current_Price_To_Future_US.execute(sku);

            // STEP-5869 to include in daily email for Japan/China/EU, leave this logic when will be removing logic for copy current CLP to future CLP
            if (wfType == "M") {
			 // STEP-6280 Rename SKU email flags for regional emails
                sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
            }
            // STEP-5869 ends
        }

        log.info(skuName + "- priceOld: " + priceOld + ", price: " + price + ", future price: " + sku.getValue("Future_Global_Base_Price").getSimpleValue());

	   // STEP-6280 Rename SKU email flags for regional emails
        var cnMail = sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue();
        var jpMail = sku.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue();
        var euMail = sku.getValue("US_to_EU_Email_Sent_YN").getSimpleValue();

        log.info("SKU " + skuName + " : US_to_China_Email_Sent_YN = " + cnMail + ", US_to_Japan_Email_Sent_YN = " + jpMail + ", US_to_EU_Email_Sent_YN = " + euMail);
    }
    return true; //STEP-6396 
});


// STEP-6326 for loop fix
function getValueFromString(str, id) {
    var result = null;
    var parse1 = str.slice(1, str.length - 1);
    var parse2 = parse1.split(",");
    for (var j = 0; j < parse2.length; j++) {
        var row = parse2[j].split("=");
        if (row[0].trim() == id.trim()) {
            result = row[1].trim();
        }
    }
    return result;
}
}