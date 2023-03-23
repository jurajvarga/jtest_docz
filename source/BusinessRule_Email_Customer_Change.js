/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email_Customer_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Business_Rules" ],
  "name" : "Email Customer Change",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "CatalogCustomer" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Trigger",
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
exports.operation0 = function (node,mailHome,BL_Email) {
//STEP-6006
var EmailBody ="B2B Team:<br>";
EmailBody = EmailBody + "The following Customer Information has been changed.<br>" ;
EmailBody = EmailBody + "Customer ID :" + node.getID() + "<br>" ;
EmailBody = EmailBody + "Customer Name :" + node.getName() + "<br><br>" ;
EmailBody = EmailBody + "Current Price Discount          : " + node.getValue("Pricing Summary").getSimpleValue() + "<br>" ;
EmailBody = EmailBody + "CLP Current Discount From Price : " + node.getValue("CLP_Discount_From_Price").getSimpleValue() + "<br><br>" ;
EmailBody = EmailBody + "Future Price Discount          : " + node.getValue("CustomerFuturePrice").getSimpleValue() + "<br>" ;
EmailBody = EmailBody + "Future Price Discount Date     : " + node.getValue("CustomerFuturePriceDate").getSimpleValue() + "<br>" ;
EmailBody = EmailBody + "CLP Future Discount From Price : " + node.getValue("CLP_Future_Discount_From_Price").getSimpleValue() + "<br><br>" ;
EmailBody = EmailBody + "Thanks<br>STEP ";

var subject = "Customer Edit " + node.getName();

log.info(EmailBody);

BL_Email.sendEmail(mailHome.mail(), "steptest@cellsignal.com", subject, EmailBody);
}