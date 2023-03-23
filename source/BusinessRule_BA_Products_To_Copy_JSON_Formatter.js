/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Products_To_Copy_JSON_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Products_To_Copy" ],
  "name" : "BA_Products_To_Copy_JSON_Formatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  } ]
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {

    var mesg = {};

    mesg.eventid = simpleEventType.getID() + "";
    //STEP-6193
    mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";
    
    var acceptedAttr = node.getValue("AcceptedCopyAttributes").getSimpleValue().split(";");
    
    for (var k = 0; k < acceptedAttr.length; k++) {
		var attrID = acceptedAttr[k].split("=")[0];
    		var attrVal = acceptedAttr[k].split("=")[1]
         	attrID == "COPY_MS_CODE" ? mesg.COPY_MS_CODE = attrVal + "" : mesg.COPYTYPE = attrVal + "";
    }
    //STEP-6193 ENDS
    return mesg;
};

//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null && (node.getObjectType().getID().equals("Product_Kit") || node instanceof com.stibo.core.domain.Product ||
        node.getObjectType().getID().equals("Equipment"))) {

    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {

        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }
    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
}
}