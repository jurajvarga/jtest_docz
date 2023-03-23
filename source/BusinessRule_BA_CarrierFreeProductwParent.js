/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CarrierFreeProductwParent",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_CarrierFreeProductwParent",
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
exports.operation0 = function (manager,mailHome,lookupTableHome,BL_Email,BL_ServerAPI) {
var currentDate = new Date();
var timeLimit = 1;

var resultProdCount = 0;
var emailBodyRows = '';
var timeUpperBound = currentDate.setMinutes(0,0); //sets Minutes and Seconds to 0
var timeLowerBound = currentDate.setHours(currentDate.getHours() - timeLimit);

// Array of Products with COPYTYPE === CarrierFree (it could be child an parent next we have to filter out parent)
var conditions = com.stibo.query.condition.Conditions;
var isProductObjectType = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product"));
var isCarrierFreeWParent = conditions.valueOf(manager.getAttributeHome().getAttributeByID("COPYTYPE")).eq("CarrierFree");

var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var query = queryHome.queryFor(com.stibo.core.domain.Product).where(isProductObjectType.and(isCarrierFreeWParent));
var result = query.execute();

var resultArr=[];

// filter result 
result.forEach(function(product) {

	var p2RefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Parent_Product");
	var p2Refs = product.queryReferences(p2RefType);

	var parent;
	p2Refs.forEach(function (ref){
		parent=ref.getTarget();
		return false;
	});

	if (parent) { 
		// get created date for the first version od the product
		var stepRevision=product.getRevision();
		var createdVersionDate;
		while (stepRevision) {
			createdVersionDate = stepRevision.getCreatedDate();
			stepRevision = stepRevision.getPredecessor();
		}

		// convert java.Util.Date object to javascript Date
		var createDate = new Date(createdVersionDate.toString());

		var productName = String(product.getName());
		// filter for product from time frame and filter out CarrierFree child products
		if ( createDate > timeLowerBound && 
		     createDate <= timeUpperBound &&
		     productName.substr(productName.length - 20) === "(BSA and Azide Free)") {
			// fill result array with selectet objects 
			var rowData={
				"parent":parent,
				"product":product,
				"createDate":createdVersionDate.toString()
			};
			resultArr.push(rowData);
			resultProdCount ++;	         
		}
	}
	return true;
})

// Sort products according to ProdTeam ans Productno
resultArr.sort(function (a, b) { 
			return a.product.getValue("ProdTeam_Planner_Product").getSimpleValue().localeCompare(b.product.getValue("ProdTeam_Planner_Product").getSimpleValue())
			|| a.product.getValue("PRODUCTNO").getSimpleValue().localeCompare(b.product.getValue("PRODUCTNO").getSimpleValue());
})

if (resultProdCount > 0){
	var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", "CopiedProductsAssociation");

	if (recipientsEmails) {
		// Logo
		var CSTLogo = '<img src=' + lookupTableHome.getLookupTableValue("ServerLookupURL", "email-logo-url") + ' alt="Cell Signaling Technology Logo" width="225" height="47"/>'
		// Email header
		var emailHeader = "Association For Copied Products";
		// Introduction sentence
		var emailBodyIntro = 'There ' + pluralSingular(resultProdCount, "product", 1) + ' created in the last '+ pluralSingular(timeLimit, "hour", 0) +'.<BR>';

		// Email Body
		var emailBody = CSTLogo;
		emailBody += '<br>' + '<h2> ' + emailHeader + ' </h2>';
		emailBody += emailBodyIntro;
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';
		var customProdHeadingContent = ["PARENT PRODUCT", "PARENT PRODUCT NAME", "PRODUCT", "PRODUCT NAME",  "CREATED DATE"];
		emailBody += BL_Email.generateHtmlTableHeading(customProdHeadingContent);	
		// Email Body Table Row
		resultArr.forEach(function (row, index){
			var tableRowContent = [ row.parent.getValue("PRODUCTNO").getSimpleValue(), row.parent.getName(),
							    row.product.getValue("PRODUCTNO").getSimpleValue(), row.product.getName(),
		         				    row.createDate
		         			       ];
			var tableRowStyle = (index % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
			emailBodyRows += BL_Email.generateHtmlTableRow(tableRowContent, tableRowStyle);
		});
		emailBody += emailBodyRows;
		emailBody += '</table>';
	
		BL_Email.sendEmail(mailHome.mail(), recipientsEmails, "Association For Copied Products", emailBody);
	}
}

/*
 * pluralSingular
 * 
 * @param {number} count - number to be displayed, if it is 0 then string "no" will be displayed instead of number
 * @param {string} subject - string to be dispalyed, if count is differend from 1 character "s" will be added to subject
 * @param {number} addVerbFlag - number 1 or 0 decide if the verb "is" or "are" will be displayed
 * @return {string} outputString - string sentence in the plural or singular with verb or no, generated according to the input parameters 
 * /
 
/* Test cases
log.info(pluralSingular(1,"product",1));
log.info(pluralSingular(1,"product",0));
log.info(pluralSingular(0,"product",1));
log.info(pluralSingular(0,"product",0));
log.info(pluralSingular(2,"product",1));
log.info(pluralSingular(2,"product",0));
 */
function pluralSingular(count, subject, addVerbFlag){
	var sentence = (count === 0 ? "no" : count) + " " + subject;
	var outputString = count === 1 ? (addVerbFlag?"is ":"") + sentence : (addVerbFlag?"are ":"") + sentence + "s";
	return outputString;
}
}