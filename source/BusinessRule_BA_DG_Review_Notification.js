/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DG_Review_Notification",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_DG_Review_Notification",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mailHome,manager,lookUp,BL_Email,BL_ServerAPI) {
if (node != null) {
	var hostname = java.net.InetAddress.getLocalHost().getHostName();
	// 07-27-2022 hotfix based on user requirement
	var emailRecipient = 'andrew.leclair@cellsignal.com';
	var emailSubject = 'Product is waiting for DG Review';
	var emailBody = 'DG Specialist,<br><br>\
		You have an item in PIM Workflow for ' + node.getValue("PRODUCTNAME").getSimpleValue() + '\
		with Product Number: ' + node.getValue("PRODUCTNO").getSimpleValue() + '.<br><br>\
		Thanks,<br>\
		STEP: ' + hostname;
	
	BL_Email.sendEmail(mailHome.mail(), emailRecipient, emailSubject, emailBody)

}
}