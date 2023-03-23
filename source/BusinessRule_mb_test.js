/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "mb_test",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "mb_test",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  }, {
    "libraryId" : "BL_CatalogPrice",
    "libraryAlias" : "LibCatalogPrice"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "bl_copyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "bl_maintenancewWFs"
  }, {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "lib"
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mail",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthrough",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Main_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "ba_approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "createItemDetails",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CreateItemDetails",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Kit_JSON_WIP_OIEP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondNotCustomOrComponent",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isNotCustomProductOrComponentWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Regional_Price_History_Update",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Regional_Price_History_Update",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,mail,liveQueue,webPassthrough,previewMain,previewApproved,sendToPreview,manager,ba_approve,createItemDetails,wipQueue,lookUp,busCondNotCustomOrComponent,BA_Regional_Price_History_Update,BL_Email,BL_JSONCreation,BL_ServerAPI,LibCatalogPrice,bl_copyRevision,bl_library,bl_maintenancewWFs,lib) {
BA_Regional_Price_History_Update.execute(node);
BA_SetFuturePriceOnCurrentPriceChangeReg.execute(node);
throw "err";
}