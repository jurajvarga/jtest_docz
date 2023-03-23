/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Revision_Release",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Bulk_Revision_Release",
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
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
    "alias" : "baUpdateChildSpeciesHomology",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Update_Child_Species_Homology",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondPublishProduct",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_changePublishFlag",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baRepublish_Related_Kits",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Related_Kits",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baRepublish_Related_Kits_Name",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Related_Kits_Name",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetRevRegEmailFlag",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetRevRegEmailFlag",
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
    "alias" : "baUpdatePublishDate",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_UpdatePublishDate",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
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
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webDataRepublished",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebDataRepublished",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "pricingQueueNPI",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing_NPI",
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
exports.operation0 = function (productReleased,productQueue,currentRevisionUpdated,baApproveProductObjects,baMigCatalogAttrFinal,manager,webCategoryQueue,baUpdateChildSpeciesHomology,busCondPublishProduct,baRepublish_Related_Kits,baRepublish_Related_Kits_Name,baResetAuditInstanceID,baSetRevRegEmailFlag,auditEventType,auditQueueMain,auditQueueApproved,pricingQueue,ItemPriceUpdated,baUpdatePublishDate,lookUp,mailHome,damPassthrough,damQueue,webDataRepublished,pricingQueueNPI,BA_ApproveRevisionObjects,BL_ReleaseCheck) {
var rollbackChanges = false;
var businessRule = "BA_Bulk_Revision_Release";

BL_ReleaseCheck.bulkRevisionRelease(productReleased, productQueue, currentRevisionUpdated, BA_ApproveRevisionObjects, baMigCatalogAttrFinal, manager, webCategoryQueue, //STEP-6465 BA_ApproveRevisionObjects
	baUpdateChildSpeciesHomology, busCondPublishProduct, baRepublish_Related_Kits, baRepublish_Related_Kits_Name, baResetAuditInstanceID, baSetRevRegEmailFlag,
	auditEventType, auditQueueMain, auditQueueApproved, pricingQueue, pricingQueueNPI, ItemPriceUpdated, baUpdatePublishDate, lookUp, mailHome, businessRule, damPassthrough, damQueue, webDataRepublished, rollbackChanges); //STEP-6747 pricingQueueNPI
}