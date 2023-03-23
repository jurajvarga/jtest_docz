/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ChinaSkuEmail",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Release" ],
  "name" : "BA_ChinaSkuEmail",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,baApprove,lookUp,mailHome,BL_Email,BL_Library) {
var businessRule = "Business Rule: Email Product Release Status List";
var currentDate = "Date: " + (new Date()).toLocaleString();

// ******** CST Logo ********
var CSTLogo = '<img src='+lookUp.getLookupTableValue("ServerLookupURL","email-logo-url")+' alt="Cell Signaling Technology Logo" width="225" height="47"/>'
var emailBody = CSTLogo;

// ******** US SKUs ******** 
emailBody += '<br>' + '<h2> SKU US Changes </h2>'
emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

var skuHeadingContent = ["SKU", "PRODUCT NO", "PRODUCT NAME", "STATUS", "PUBLISHED", "ITEM ACTIVE", "PREVIOUS PRICE", "CURRENT PRICE", "REGION"];

emailBody += BL_Email.generateHtmlTableHeading(skuHeadingContent);

var conditionsRevision = com.stibo.query.condition.Conditions;
// STEP-6280 Rename SKU email flags for regional emails
var isSentRevisionChina = conditionsRevision.valueOf(manager.getAttributeHome().getAttributeByID("US_to_China_Email_Sent_YN")).eq("N");
var isProductRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Revision"));
var isProductKitRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Kit_Revision"));
var isEquipmentRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment_Revision"));

var queryHomeRevision = manager.getHome(com.stibo.query.home.QueryHome);

var querySpecificationRevision = queryHomeRevision.queryFor(com.stibo.core.domain.Product).where(isSentRevisionChina.and((isProductRevision).or(isProductKitRevision).or(isEquipmentRevision)));

var resultRevision = querySpecificationRevision.execute();
var resultArrRevision = resultRevision.asList(100).toArray();

var skuCount = 0;
var prodNoVisited = [];
for (var i = 0; i < resultArrRevision.length; i++) {

    var revision = resultArrRevision[i];
    var prodNo = String(revision.getValue("PRODUCTNO").getSimpleValue());

    //log.info("i: " + i + " revision " + revision.getName() + " prodNoVisited: " + prodNoVisited)
    // Skip revision from wich we already took current state of SKU
    if (prodNoVisited.indexOf(prodNo) > -1) {
        //log.info("continue");
        continue;
    }
    var product = revision.getParent();

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var msRef = revision.queryReferences(revToMS) //STEP-6396

    msRef.forEach(function(ref) { //STEP-6396

        var skus = ref.getTarget().getChildren() //STEP-6396
        for (var j = 0; j < skus.size(); j++) {
            var sku = skus.get(j)

		  // STEP-6280 Rename SKU email flags for regional emails
            if (sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue() != "N") {
                continue;
            }

            var skuName = sku.getName();
            var prodName = product.getName();
            var prodStatus = revision.getValue("Product_Status").getSimpleValue();
            var published = sku.getValue("PUBLISH_YN").getSimpleValue()
            var itemActive = sku.getValue("ITEMACTIVE_YN").getSimpleValue();
            var previousPrice = BL_Library.getPreviousPrice(sku, "US");
            var currentPrice = sku.getValue("PRICE").getSimpleValue();
            var region = "US"

            if (!previousPrice || previousPrice == "") {
                previousPrice = currentPrice;
            }

            var revTableContent = [skuName, prodNo, prodName, prodStatus, published, itemActive, previousPrice, currentPrice, region];
            var tableRowStyle = (skuCount % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
            emailBody += BL_Email.generateHtmlTableRow(revTableContent, tableRowStyle);

            skuCount++;
        }
        return true; //STEP-6396
    });
    prodNoVisited.push(prodNo);
}
emailBody += '</table>';

// ******** CHINA SKUs ******** 
emailBody += '<br>' + '<h2> SKU Regional China Changes </h2>'
emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

var skuHeadingContent = ["SKU", "PRODUCT NO", "PRODUCT NAME", "STATUS", "PUBLISHED", "ITEM ACTIVE", "PREVIOUS PRICE", "CURRENT PRICE", "REGION"];

emailBody += BL_Email.generateHtmlTableHeading(skuHeadingContent);

var conditionsRevision = com.stibo.query.condition.Conditions;
// STEP-6280 Rename SKU email flags for regional emails
var isSentRevisionChina = conditionsRevision.valueOf(manager.getAttributeHome().getAttributeByID("US_to_China_Email_Sent_YN")).eq("N");
var isRegionalRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Regional_Revision"));

var queryHomeRevision = manager.getHome(com.stibo.query.home.QueryHome);

var querySpecificationRevision = queryHomeRevision.queryFor(com.stibo.core.domain.Product).where(isSentRevisionChina.and(isRegionalRevision));

var resultRegRevision = querySpecificationRevision.execute();
var resultArrRegRevision = resultRegRevision.asList(100).toArray();

var skuCountReg = 0;
var prodNoVisitedReg = [];
for (var i = 0; i < resultArrRegRevision.length; i++) {

    var revision = resultArrRegRevision[i];
    var prodNo = String(revision.getValue("PRODUCTNO").getSimpleValue());

    // Skip reg revision from wich we already took current state of SKU
    if (prodNoVisitedReg.indexOf(prodNo) > -1) {
        continue;
    }

    var product = revision.getParent();

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
    var msRef = revision.queryReferences(revToMS) //STEP-6396

    msRef.forEach(function(ref) {//STEP-6396

        var skus = ref.getTarget().getChildren()//STEP-6396
        for (var j = 0; j < skus.size(); j++) {
            var sku = skus.get(j)

		  // STEP-6280 Rename SKU email flags for regional emails
            if (sku.getValue("China_to_China_Email_Sent_YN").getSimpleValue() != "N") { //STEP-6275 check for a new flag for regional changes on SKU
                continue;
            }

            var skuName = sku.getName();
            var prodName = product.getName();
            var prodStatus = revision.getValue("Product_Status").getSimpleValue();
            var published = sku.getValue("PUBLISH_YN").getSimpleValue()
            var itemActive = sku.getValue("ITEMACTIVE_YN").getSimpleValue();
            var previousPrice = BL_Library.getPreviousPrice(sku, "China");
            var currentPrice = sku.getValue("China_CLP").getSimpleValue();
            var region = "China";

            if (!previousPrice || previousPrice == "") {
                previousPrice = currentPrice;
            }

            var revTableContent = [skuName, prodNo, prodName, prodStatus, published, itemActive, previousPrice, currentPrice, region];
            var tableRowStyle = (skuCountReg % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
            emailBody += BL_Email.generateHtmlTableRow(revTableContent, tableRowStyle);

            skuCountReg++;
        }
        return true;//STEP-6396
    });
    prodNoVisitedReg.push(prodNo);
}
emailBody += '</table>';


// change US_to_China_Email_Sent_YN Flag for all revisions and it's corresponding SKUs and approve them
for (var i = 0; i < resultArrRevision.length; i++) {
    var revision = resultArrRevision[i];
    // STEP-6280 Rename SKU email flags for regional emails
    revision.getValue("US_to_China_Email_Sent_YN").setSimpleValue("Y");

    baApprove.execute(revision);

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var msRef = revision.queryReferences(revToMS) //STEP-6396

    msRef.forEach(function(ref) {    //STEP-6396
        var skus = ref.getTarget().getChildren() //STEP-6396
        for (var j = 0; j < skus.size(); j++) {
            var sku = skus.get(j)
		  // STEP-6280 Rename SKU email flags for regional emails
            if (sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue() == "N") {
                sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("Y");
                log.info("changing US_to_China_Email_Sent_YN on " + sku.getName() + " to " + sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue());
                baApprove.execute(sku);
            }
        }
        return true; //STEP-6396
    });
}

// change US_to_China_Email_Sent_YN YN Flag for all regional revisions and corresponding SKUs
for (var i = 0; i < resultArrRegRevision.length; i++) {
    var regRevision = resultArrRegRevision[i];
    // STEP-6280 Rename SKU email flags for regional emails
    regRevision.getValue("US_to_China_Email_Sent_YN").setSimpleValue("Y");

    baApprove.execute(revision);

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
    var msRef = revision.queryReferences(revToMS) //STEP-6396

    msRef.forEach(function(ref) {    //STEP-6396

        var skus = ref.getTarget().getChildren() //STEP-6396
        for (var j = 0; j < skus.size(); j++) {
            var sku = skus.get(j)
            // STEP-6275 check for a new flag for regional changes on SKU and change to Y
		  // STEP-6280 Rename SKU email flags for regional emails
            if (sku.getValue("China_to_China_Email_Sent_YN").getSimpleValue() == "N") {
                sku.getValue("China_to_China_Email_Sent_YN").setSimpleValue("Y");
                log.info("changing China_to_China_Email_Sent_YN on " + sku.getName() + " to " + sku.getValue("China_to_China_Email_Sent_YN").getSimpleValue());
                baApprove.execute(sku);
            }
            // STEP-6275 ends
        }
        return true; //STEP-6396
    });
}


// Adding a footnote

//STEP-6027
/*var hostname = java.net.InetAddress.getLocalHost().getHostName();

emailBody += '<br>';
emailBody += '<hr>'
emailBody += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>'*/
//END STEP-6027

// Recipients
var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "China_Price")
// var recipientsEmails = "gabriel.pavlik@globallogic.com;maros.jevocin@globallogic.com;juraj.varga@globallogic.com;youssef.abdennassib@cellsignal.com";

// Format email if there were no product/revision updates
var numberOfReports = skuCount + skuCountReg;
log.info("number of SKUs in the daily digest email: " + numberOfReports);
if (numberOfReports == 0) {
    emailBody = CSTLogo;
    emailBody += '<h2> Please note, there were no sku changes today. </h2>';
    //STEP-6027
    /*emailBody += '<br>' + '<hr>';
    emailBody += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>';*/
    //END STEP-6027
}

// Date today
var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());

// Sending an email
if (recipientsEmails) {

    // STEP-5944 refactor email sending
    var subject;
    if (numberOfReports != 0) {
        subject = "SKU Change Report " + today;
    } else {
        subject = "No SKU Updates on " + today;
    }

    BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, emailBody)
} else {
    throw "BA_ChinaSkuEmail: No recipients found.";
}
// // STEP-5944 ends
}