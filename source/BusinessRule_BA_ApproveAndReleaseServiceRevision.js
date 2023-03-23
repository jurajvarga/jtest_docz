/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveAndReleaseServiceRevision",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_ApproveAndReleaseServiceRevision",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_lib"
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
    "contract" : "EventQueueBinding",
    "alias" : "productQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "currentRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CurrentRevisionUpdated",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baMigCatalogAttrFinal",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateCatalogAttributesFinal",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveRevisionObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveRevisionObjects",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,productQueue,currentRevisionUpdated,baApproveProductObjects,baMigCatalogAttrFinal,BA_ApproveRevisionObjects,bl_lib) {
var businessRule = "Business Rule: BA_ApproveAndReleaseServiceRevision";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();


var product = node.getParent();
baMigCatalogAttrFinal.execute(node);
//STEP-6465 Starts
//baApproveProductObjects.execute(product);
BA_ApproveRevisionObjects
//STEP-6465 Ends
productQueue.queueDerivedEvent(currentRevisionUpdated, product);
}