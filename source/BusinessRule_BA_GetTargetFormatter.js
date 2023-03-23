/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetTargetFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Target" ],
  "name" : "BA_GetTargetFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {
    var mesg = {};

    mesg.eventid = simpleEventType.getID() + "";
    mesg.TARGETNO = node.getValue("TARGETNO").getSimpleValue() + "";
    mesg.WHOLEPROTEINFLAG_YNNA = node.getValue("WHOLEPROTEINFLAG_YNNA").getSimpleValue() + "";
    mesg.ALTNAMES = node.getValue("ALTNAMES").getSimpleValue() + "";
    mesg.PNAME = node.getValue("PNAME").getSimpleValue() + "";
    mesg.TARGETNAME = node.getValue("TARGETNAME").getSimpleValue() + "";
    mesg.TARGETTYPE = node.getValue("TARGETTYPE").getSimpleValue() + "";
    mesg.SORTTERM = node.getValue("SORTTERM").getSimpleValue() + "";
    mesg.PRIMARYDEVSECTION = node.getValue("PRIMARYDEVSECTION").getSimpleValue() + "";
    mesg.UNIPROT = node.getValue("UNIPROT").getSimpleValue() + "";
    mesg.ACCESSION_GENE = node.getValue("ACCESSION_GENE").getSimpleValue() + "";
    mesg.TARGET_DISEASES = node.getValue("TARGET_DISEASES").getSimpleValue() + "";
    mesg.MODIFICATION = node.getValue("MODIFICATION").getSimpleValue() + "";
    mesg.SITE = node.getValue("SITE").getSimpleValue() + "";
    mesg.TARGET_KEYWORDS = node.getValue("TARGET_KEYWORDS").getSimpleValue() + "";

    if (node.getValue("Target_Pathway_URL").getSimpleValue()) {
        mesg.Target_Pathway_URL = node.getValue("Target_Pathway_URL").getSimpleValue().replace("\n", "") + "";
    }
    else {
        mesg.Target_Pathway_URL = "null";
    }

    return mesg;
}

var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} 

var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null && (node.getObjectType().getID().equals("Target")||node.getObjectType().getID().equals("Target_Category"))) {
    if (nodeHandlerSource.isDeleted()) {
        mesgfinal={};
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
	executionReportLogger.logInfo("Building Target JSON for " + node.getValue("TARGETNO").getSimpleValue());
        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }

    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
}
}