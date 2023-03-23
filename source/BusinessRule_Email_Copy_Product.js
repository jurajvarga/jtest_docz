/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email_Copy_Product",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Business_Rules" ],
  "name" : "Email_Copy_Product",
  "description" : "Send email after the new product was created as a copy of existing one",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
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
exports.operation0 = function (node,manager,mailHome,BL_Email) {
//STEP-6176
var businessRule = "Business Rule: Email_Copy_Product";
var currentDate = "Date: " + (new Date()).toLocaleString();

//Email body
var EmailBody = "Hi all, <BR>" +
                "The new Product: <b>" + node.getName() + "</b> with the Product No.<b>" + node.getValue("PRODUCTNO").getSimpleValue() 
                + "</b> was copied from the Product No.<b>" + node.getValue("PARENT_PRODUCTNO").getSimpleValue() + "</b>.<BR>Thanks,";

//Email subject
var subject = "The New CarrierFree product # - " + node.getValue("PRODUCTNO").getSimpleValue() + " - " + node.getName();

//Email recipients
node.getValue("EMAIL_TO_NOTIFY").getSimpleValue();
var EmailTo = node.getValue("EMAIL_TO_NOTIFY").getSimpleValue()+"";

//Fix done to remove blank recipient becoz of delimiter
var delim=""
if (EmailTo) {
    var strlen = EmailTo.length;
    var lastidxlen = EmailTo.lastIndexOf(";");
    if ((strlen - 1) == (lastidxlen)) {
        delim = ""
    } else {
        delim = ";"
    }
}

//PMLT
var group = manager.getGroupHome().getGroupByID("PMLT"); 
if (group) {
	var eMailPMLT = group.getValue("User_Group_Email").getSimpleValue();	//pmlt@cellsignal.com
}
if (eMailPMLT) {
    if (EmailTo){
        EmailTo = EmailTo + delim + eMailPMLT;
    } else {
        EmailTo = eMailPMLT;
    }
    
}

//ProdTeam06
group = manager.getGroupHome().getGroupByID("ProdTeam06"); 
if (group) {
	var eMailProdTeam06 = group.getValue("User_Group_Email").getSimpleValue();	
}
if (eMailProdTeam06) {
    EmailTo = EmailTo + ";" + eMailProdTeam06;
}
else {
    EmailTo = EmailTo + ";" + "ProdTeam06@cellsignal.com";
}
//log.info("Recipients: " + EmailTo);

//Send email
BL_Email.sendEmail(mailHome.mail(), EmailTo, subject, EmailBody);
}