/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetAuditMessageFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound Audit" ],
  "name" : "BA_GetAuditMessageFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "MasterStock", "Product", "Product_Kit", "Product_Revision", "SKU" ],
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

    

   /* //Citation Parent Information
    mesg.eventid = simpleEventType.getID() + "";
    var auditMessage =node.getValue("Audit_Message").getSimpleValue()+"";
    mesg.auditMessage = auditMessage + "";

    executionReportLogger.logInfo(" simpleEventType.getID() " + simpleEventType.getID());
    executionReportLogger.logInfo(" auditMessage " + auditMessage);
   */
   //STEP-5929

    mesg.eventid = simpleEventType.getID() + "";
    mesg.auditObjectId = node.getID() + "";
    mesg.auditObjectTypeId = node.getObjectType().getID() + "";
      //STEP-5929

    return mesg;
}

executionReportLogger.logInfo(" Start ");
var simpleEventType = nodeHandlerSource.getSimpleEventType();

executionReportLogger.logInfo(" simpleEventType "+simpleEventType);
if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;
if (node != null) {
    executionReportLogger.logInfo(" node in Audit Message "+node + " approvalStatus " + node.getApprovalStatus()); // STEP-6160
    //executionReportLogger.logInfo(" approvalStatus " + node.getApprovalStatus()); // STEP-6160

    if (nodeHandlerSource.isDeleted()) {
        mesgfinal ={};
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }

    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
}
}