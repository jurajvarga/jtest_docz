/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Product_Status_Change_WF_QA_Review",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Product_Status_Change_WF_QA_Review",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
if (node != null) {
	var hostname = java.net.InetAddress.getLocalHost().getHostName();
	var emailList = 'quality@cellsignal.com';
	var emailSubject = 'Product is waiting for Quality Review in Product Status Change Workflow';
	var emailBody = 'Quality Team,<br><br>\
		You have an item in PIM Workflow for ' + node.getValue("PRODUCTNAME").getSimpleValue() + '\
		with Product Number: ' + node.getValue("PRODUCTNO").getSimpleValue() + '<br><br>\
		Product is moving from ' + node.getValue("Product_Status").getSimpleValue() + '\
		to ' + node.getValue('Product_Status_Change_To').getSimpleValue() + '\
		with reason ' + node.getValue('Product_Status_Change_Reason').getSimpleValue() + '<br><br><br>\
		Thanks,<br>\
		STEP: ' + hostname;
	
	if (emailList) {
	   BL_Email.sendEmail(mailHome.mail(), emailList, emailSubject, emailBody)
	} else {
	   throw "Product Status Change Workflow: No recipients found.";
	}
}
}