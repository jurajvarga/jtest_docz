/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestEvent",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestEvent",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "rejectTechTransfer",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "RejectTechTransfer",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wipBFQueue,rejectTechTransfer) {
wipBFQueue.queueDerivedEvent(rejectTechTransfer, node);
}