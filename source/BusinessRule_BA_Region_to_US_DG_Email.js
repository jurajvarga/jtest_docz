/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Region_to_US_DG_Email",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_Region_to_US_DG_Email",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mailHome,manager,lookupTableHome,BL_Email,BL_MaintenanceWorkflows) {
log.info("Sending an email using BA_Region_to_US_DG_Email for " + node.getName());
var workflowType = node.getValue("Workflow_Type").getSimpleValue();

if (workflowType == "M") {

    var wfCurrentNo = node.getValue("Workflow_No_Current").getSimpleValue();
    if (wfCurrentNo != -1) {
        wfCurrentNo = "WF" + wfCurrentNo;
    }

    var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
    var wfName = ""

    if (BL_MaintenanceWorkflows.isChinaMaintenanceWokflow(wfInitiatedNo)) {
        wfName = "China DG Workflow";
    } else if (BL_MaintenanceWorkflows.isJapanMaintenanceWokflow(wfInitiatedNo)) {
        wfName = "Japan DG Workflow";
    } else if (BL_MaintenanceWorkflows.isEUMaintenanceWokflow(wfInitiatedNo)) {
        wfName = "EU DG Workflow";
    }
    log.info(" wfName " + wfName);

    var mwLookupTable = lookupTableHome.getLookupTableValue("MaintenanceWorkflowLookupTable", wfInitiatedNo);
    var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", wfInitiatedNo);

    if (recipientsEmails) {

        var subject = wfName;
        var body = "Global Dangerous goods Team,<BR> <BR>" +
            "The Product Revision: <BR> <B>" + node.getName() + "(" + node.getID() + ")" + "</B> initiated from <B>" + mwLookupTable + "</B> has exited  <B>" + wfName + "</B>.<BR> " +
            "<BR> Thanks";
        BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);
    }
}
}