/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Revision_Approved",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_Revision_Approved",
  "description" : "Send Email after exit from WF6 for maintenace",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mailHome,manager,lookupTableHome,BL_Email) {
var workflowType = node.getValue("Workflow_Type").getSimpleValue();

if (workflowType == "M") {

    var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
    var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", wfInitiatedNo);

    if (recipientsEmails) {

        var wfCurrentNo = node.getValue("Workflow_No_Current").getSimpleValue();

        if (wfCurrentNo != -1) {
            wfCurrentNo = "WF" + wfCurrentNo;
        }

        var mwLookupTable = lookupTableHome.getLookupTableValue("MaintenanceWorkflowLookupTable", wfInitiatedNo);
        var wfName = lookupTableHome.getLookupTableValue("WorkflowIdMappingTable", wfCurrentNo);
        var body = "Dear STEP Users,<BR> <BR>" +
            "The Product Revision <B>" + node.getName() + "</B> initiated for <B>" + mwLookupTable + "</B> exited out of <B>" + wfName + "</B> workflow.<BR> " +
            "<BR> Thanks";

        var subject = mwLookupTable + " completed for " + node.getName();

        log.info("BA_Revision_Approved: Sending an email of about " + node.getName() + " exiting the WF " + wfName + ".");
        BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);

    }
}
}