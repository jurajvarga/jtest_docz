/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Region_to_US_Price_Email",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_Region_to_US_Price_Email",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Constant",
    "libraryAlias" : "BL_Constant"
  }, {
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
exports.operation0 = function (node,mailHome,manager,lookupTableHome,BL_Constant,BL_Email,BL_MaintenanceWorkflows) {
if (BL_Constant.getEnvironmentConfiguration(manager, "EnvironmentConfiguration_", "SendEmailPricingWFtoRegion") != "N") {  //STEP-6729
	

    log.info("Sending an email using BA_Region_to_US_Price_Email for " + node.getName());
    var workflowType = node.getValue("Workflow_Type").getSimpleValue();

    if (workflowType == "M") {

        var wfCurrentNo = node.getValue("Workflow_No_Current").getSimpleValue();
        if (wfCurrentNo != -1) {
            wfCurrentNo = "WF" + wfCurrentNo;
        }
        var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
        log.info(" wfInitiatedNo " + wfInitiatedNo);

        var wfName = "";

        if (BL_MaintenanceWorkflows.isChinaMaintenanceWokflow(wfInitiatedNo)) {
            wfName = "China Pricing Workflow";
        } else if (BL_MaintenanceWorkflows.isJapanMaintenanceWokflow(wfInitiatedNo)) {
            wfName = "Japan Pricing Workflow";
        } else if (BL_MaintenanceWorkflows.isEUMaintenanceWokflow(wfInitiatedNo)) {
            wfName = "EU Pricing Workflow";
        }
        log.info(" wfName " + wfName);

        var mwLookupTable = lookupTableHome.getLookupTableValue("MaintenanceWorkflowLookupTable", wfInitiatedNo);
        //To get Pricing Recipient Group in lookup table need to set wf no if it is initated from DG Workflow
        var emailGroupWFNo = wfInitiatedNo.replace("2", "1");
        var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", emailGroupWFNo);

        if (recipientsEmails) {

            var subject = wfName;
            var body = "Pricing Manager US Team,<BR> <BR>" +
                "The Product Revision: <BR> <B>" + node.getName() + "(" + node.getID() + ")" + "</B> initiated from <B>" + mwLookupTable + "</B> has exited  <B>" + wfName + "</B> and prices were changed.<BR> " +
                "<BR> Thanks";
            BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);
        }
    }
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_IsPriceChanged"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
