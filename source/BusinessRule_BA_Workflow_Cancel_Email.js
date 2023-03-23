/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Workflow_Cancel_Email",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_Workflow_Cancel_Email",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mailHome,manager,lookupTableHome,wf,BL_Email,BL_MaintenanceWorkflows) {
log.info("Sending an email using BA_Workflow_Cancel_Email.")
var workflowType = node.getValue("Workflow_Type").getSimpleValue();

if (workflowType == "M") {
    var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
    log.info(" wfInitiatedNo " + wfInitiatedNo);
    var userName = manager.getCurrentUser().getName();
    var mwLookupTable = lookupTableHome.getLookupTableValue("MaintenanceWorkflowLookupTable", wfInitiatedNo);
    var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WFCancelEmailUserGroupMapTable", wfInitiatedNo);

    if (recipientsEmails) {

        var subject = mwLookupTable + " is canceled";
        var body = "Dear STEP User,<BR> <BR>" +
            "The Product Revision: <BR> <B>" + node.getName() + "(" + node.getID() + ")" + "</B> has been canceled from <B>" + mwLookupTable + "</B> by user <B>" + userName + "</b>.<BR> " +
            "<BR> Thanks";
        BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);
    }
}
}