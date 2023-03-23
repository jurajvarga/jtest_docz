/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_US_to_Region_DG_Email",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_US_to_Region_DG_Email",
  "description" : null,
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
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
exports.operation0 = function (node,mailHome,manager,lookupTableHome,busCond,wf,BL_Email) {
log.info("Sending an email using BA_US_to_Region_DG_Email.")
var condResult = busCond.evaluate(node);
var isNewWorkflow = condResult.isAccepted();
//log.info(" isNewWorkflow " + isNewWorkflow);

if (!isNewWorkflow) {

    var wfName = ""
    var wfInitiatedNo = "";
    var country = "";

    var instance = node.getWorkflowInstance(wf);
    var wfTaskState = "";
    //log.info(" instance " + instance);
    if (instance != null) {
        var wfFlag = instance.getSimpleVariable("WF_Flag");
        //var jpFlag = instance.getSimpleVariable("JP_Flag");
        //var cnFlag = instance.getSimpleVariable("CN_Flag");
        log.info(" wfFlag " + wfFlag);

        if (wfFlag == "CN") {
            log.info(" In China ");
            wfName = "China DG Workflow";
            wfInitiatedNo = "5C2";
            country = "China";
        } else if (wfFlag == "JP") {
            log.info(" In Japan ");
            wfName = "Japan DG Workflow";
            wfInitiatedNo = "5B2";
            country = "Japan";
        } else if (wfFlag == "EU") {
            log.info(" In EU ");
            wfName = "EU DG Workflow";
            wfInitiatedNo = "5A2";
            country = "EU";
        }
    }

    log.info(" wfName " + wfName);
    log.info(" wfInitiatedNo " + wfInitiatedNo);
    log.info(" country " + country);

    var repicientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", wfInitiatedNo);

    if (repicientsEmails) {

        var subject = wfName;
        var body = country + " Dangerous goods Team,<BR> <BR>" +
            "You have new Item/Revision: <BR> <B>" + node.getName() + "(" + node.getID() + ")" + "</B> in <B>" + wfName + "</B>.<BR> " +
            "<BR> Thanks";

        BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);
    } 
}
}