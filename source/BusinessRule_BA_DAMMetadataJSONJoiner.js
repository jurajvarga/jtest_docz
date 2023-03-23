/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DAMMetadataJSONJoiner",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound DAMMetadata" ],
  "name" : "BA_DAMMetadataJSONJoiner",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorJoinerSourceBindContract",
    "alias" : "joinerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorJoinerResultBindContract",
    "alias" : "joinerResult",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (joinerSource,joinerResult,log) {
// Joiner Source bound joinerSource
// Joiner Result bound to joinerResult

function appendFromGroup(messageGroup) {
    var seen = [];
    var first = true;
    joinerResult.appendToMessage("{\"Image_Metadata\":[");
    while(joinerSource.hasNext(messageGroup)) {
      var messageString = joinerSource.getNextMessage(messageGroup);
      var hash = messageString.hashCode();
      
      log.logInfo(" messageString "+messageString);
      log.logInfo(" hash "+hash);
      if (seen.indexOf(hash) == -1) {
        seen.push(hash);
        if (first) {
          first = false;
        } else {
          joinerResult.appendToMessage(",");
        }
        joinerResult.appendToMessage(messageString);
      }
    }
    joinerResult.appendToMessage("]}");
  }
  
  joinerResult.appendToMessage("{\"ProductImages\":[");
  appendFromGroup("upsert");
  joinerResult.appendToMessage("]}");
}