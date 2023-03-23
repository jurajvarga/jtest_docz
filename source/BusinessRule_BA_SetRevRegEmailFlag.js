/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetRevRegEmailFlag",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA Set Revision Regional Email Flag",
  "description" : "When there is SKU to send for regions set regional email flag on revision",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_Library,LibMaintenance) {
// STEP-5869 Set regional emails flags if there are SKUs to send
var objectType = node.getObjectType().getID();

if (BL_Library.isRevisionType(node, checkServiceRevision = false)) {
    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
	// STEP-6280 Rename SKU email flags for regional emails
    var jpSkuAttr = "US_to_Japan_Email_Sent_YN";
    var cnSkuAttr = "US_to_China_Email_Sent_YN";
    var euSkuAttr = "US_to_EU_Email_Sent_YN";

} else if (objectType == "Regional_Revision") {
    //STEP-6275 use new attributes as a regional email sent flags for skus for Regional Maintenance
    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
	// STEP-6280 Rename SKU email flags for regional emails
    var jpSkuAttr = "Japan_to_Japan_Email_Sent_YN";
    var cnSkuAttr = "China_to_China_Email_Sent_YN";
    var euSkuAttr = "EU_to_EU_Email_Sent_YN"
    // STEP-6275 ends
}

var msRef = node.queryReferences(revToMS) //STEP-6396

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
var isJPWF = LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo);
var isCNWF = LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo);
var isEUWF = LibMaintenance.isEUMaintenanceWokflow(wfInitiatedNo);

var sellInChina = node.getValue("Sell_in_China_?").getSimpleValue();
var sellInJapan = node.getValue("Sell_in_Japan_?").getSimpleValue();
var sendToPricingQueue = false;

//STEP-6396
msRef.forEach(function(ref) {
    var skus = ref.getTarget().getChildren()

    //STEP-6396
    for (var i = 0; i < skus.size(); i++) {
        var sku = skus.get(i)
        var skuName = sku.getName();

        // STEP-6275 use attributes based on type of maintenance, whether US or regional
        cnMail = sku.getValue(cnSkuAttr).getSimpleValue();
        jpMail = sku.getValue(jpSkuAttr).getSimpleValue();
        euMail = sku.getValue(euSkuAttr).getSimpleValue();
        log.info("SKU " + skuName + " : " + cnSkuAttr + " = " + cnMail + ", " + jpSkuAttr + " = " + jpMail + ", " + euSkuAttr + " = " + euMail);
        // STEP-6275 ends


        // Set regional email flag on revisions or reset email flag on SKU
        if ((!sellInChina || sellInChina == "Y") && cnMail == "N") {
		  // STEP-6280 Rename SKU email flags for regional emails
            node.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
        } else if (sellInChina == "N") {
            sku.getValue(cnSkuAttr).setSimpleValue(null); // STEP-6275 decide on attribute based on rev type
        }

        if ((!sellInJapan || sellInJapan == "Y") && jpMail == "N") {
		  // STEP-6280 Rename SKU email flags for regional emails
            node.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
        } else if (sellInJapan == "N") {
            sku.getValue(jpSkuAttr).setSimpleValue(null); // STEP-6275 decide on attribute based on rev type
        }

        if (euMail == "N") {
		  // STEP-6280 Rename SKU email flags for regional emails
            node.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
        }

        // Setting boolean to decide whether to send to Pricing Queue
        // STEP-6152
        // STEP-6275 decide on attribute based on rev type
        cnMail = sku.getValue(cnSkuAttr).getSimpleValue();
        jpMail = sku.getValue(jpSkuAttr).getSimpleValue();
        parentProductPublished = node.getParent().getValue("PUBLISHED_YN").getSimpleValue(); // STEP-6709
        // STEP-6275 ends
        if (sku.getValue("ITEMACTIVE_YN").getSimpleValue() == "Y" && sku.getValue("PUBLISH_YN").getSimpleValue() == "Y" && sku.getValue("EBSFLAG_YN").getSimpleValue() == "Y" && parentProductPublished == "Y") {
            if (objectType != "Regional_Revision" && euMail == "N") {
                sendToPricingQueue = true;
            } else if ((isJPWF && jpMail == "N") || (isCNWF && cnMail == "N") || (isEUWF && euMail == "N")) {
                sendToPricingQueue = true;
            }
        }
        // STEP-6152 ends
    }
    return true; //STEP-6396
});
// STEP-6280 Rename SKU email flags for regional emails
var cnMailRev = node.getValue("US_to_China_Email_Sent_YN").getSimpleValue();
var jpMailRev = node.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue();
var euMailRev = node.getValue("US_to_EU_Email_Sent_YN").getSimpleValue();

log.info("Revision " + node.getName() + " : US_to_China_Email_Sent_YN = " + cnMailRev + ", US_to_Japan_Email_Sent_YN = " + jpMailRev + ", US_to_EU_Email_Sent_YN = " + euMailRev);
// STEP-5869 ends


// Sending to Pricing Queue
//STEP-6152
if (sendToPricingQueue) {
    node.getValue("Published_SKU_Price_Changed_YN").setSimpleValue("Y");
} else {
    node.getValue("Published_SKU_Price_Changed_YN").setSimpleValue("N");
}
}