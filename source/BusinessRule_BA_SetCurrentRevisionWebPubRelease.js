/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetCurrentRevisionWebPubRelease",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Set Current Revision Web Publish Release",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "bl_maintenancewWFs"
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
    "alias" : "webDataRepublished",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebDataRepublished",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetCurrentRevRelease",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevRelease",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baRepublish_Related_Kits",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Related_Kits",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,productQueue,webDataRepublished,baSetCurrentRevRelease,baGenerateMaintenanceRevisionEvents,baRepublish_Related_Kits,bl_maintenancewWFs) {
var businessRule = "Business Rule: BA_SetCurrentRevisionWebPubRelease";
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(businessRule + " wfInitiatedNo " + wfInitiatedNo);

//Change wip revision status
node.getValue("REVISIONSTATUS").setSimpleValue("Approved");

//Get WIP Revision
var product = node.getParent();
var wipRevision = bl_maintenancewWFs.getWIPRevision(product);

if (wipRevision != null) {
    //Set Current Rev    
    baSetCurrentRevRelease.execute(node);

    //Add to Queue
    productQueue.queueDerivedEvent(webDataRepublished, product);

    //Changes Done for STEP- 5564 Starts
    //Send to Backfeed queue for capturing Maintenance Complete event before Approval as outbound looks only Main workspace.
    baGenerateMaintenanceRevisionEvents.execute(node);

    //Changes Done for STEP- 5564 Ends

    // STEP-5752
    baRepublish_Related_Kits.execute(node);
}
}