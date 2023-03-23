/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Republish_WebPassthrough_Event",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Republish_WebPassthrough_Event",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthroughChange",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productBGQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baMigCatalogAttrFinal",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateCatalogAttributesFinal",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ItemPriceUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ItemPriceUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "ItemPricingQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webPassthroughChange,productBGQueue,baMigCatalogAttrFinal,ItemPriceUpdated,ItemPricingQueue,BL_MaintenanceWorkflows) {
// STEP-5995
if(node.getApprovalStatus() != "Not in Approved workspace") {
    //STEP-6287 Call migrate catalog attributes
    var currentRevision = BL_MaintenanceWorkflows.getCurrentRevision(node);
    baMigCatalogAttrFinal.execute(currentRevision);
    productBGQueue.queueDerivedEvent(webPassthroughChange, node);
    //STEP-6709 adding condition to check if product is published 
    if (node.getValue("PUBLISHED_YN").getSimpleValue() == "Y") {
    		ItemPricingQueue.queueDerivedEvent(ItemPriceUpdated, node);
    }
}
else {
    logger.info(node + " doesn't exist in approved workspace");
}
}