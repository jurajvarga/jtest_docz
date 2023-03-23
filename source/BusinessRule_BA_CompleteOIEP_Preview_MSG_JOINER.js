/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CompleteOIEP_Preview_MSG_JOINER",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Preview_Revision" ],
  "name" : "BA_CompleteOIEP_Preview_MSG_JOINER",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Joiner",
    "libraryAlias" : "BL_Joiner"
  } ]
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
exports.operation0 = function (joinerSource,joinerResult,log,BL_Joiner) {
joinerResult = BL_Joiner.join(joinerSource, joinerResult, "upsert", "Products");
}