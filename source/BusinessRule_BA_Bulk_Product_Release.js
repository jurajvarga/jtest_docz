/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Product_Release",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Bulk_Product_Release",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ReleaseCheck",
    "libraryAlias" : "BL_ReleaseCheck"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "productReleased",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ProductReleased",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "webCategoryQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_CATEGORY_JSON_EP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetCurrentRevRelease",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevRelease",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "pricingQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ItemPriceUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ItemPriceUpdated",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Republish_Product_Bibliography",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Product_Bibliography",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_CarrierFree_Product_Release",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CarrierFree_Product_Release",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "damPassthrough",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AssetSyncToDAMInitiated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "damQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=DAM_Metadata_To_S3",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "pricingQueueNPI",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing_NPI",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (productReleased,productQueue,logger,webCategoryQueue,baSetCurrentRevRelease,manager,auditEventType,auditQueueMain,auditQueueApproved,pricingQueue,ItemPriceUpdated,BA_Republish_Product_Bibliography,BA_CarrierFree_Product_Release,mailHome,lookUp,damPassthrough,damQueue,pricingQueueNPI,BL_ReleaseCheck) {
var rollbackChanges = false;
var businessRule = "BA_Bulk_Product_Release";

BL_ReleaseCheck.bulkProductRelease(productReleased, productQueue, logger, webCategoryQueue, baSetCurrentRevRelease, manager, auditEventType,
	auditQueueMain, auditQueueApproved, pricingQueueNPI, ItemPriceUpdated, BA_Republish_Product_Bibliography, BA_CarrierFree_Product_Release, lookUp, mailHome, businessRule, damPassthrough, damQueue, rollbackChanges); //STEP-6747 pricingQueueNPI
}