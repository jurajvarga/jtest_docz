/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BulkGenerateAndSendDamObjects",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_BulkGenerateAndSendDamObjects",
  "description" : "To generate dam objects for current revisions and send to queue - for bulk update",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_CreateDamObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDamObjects",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "damQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Bulk_DAM_Metadata_To_S3",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "damEvent",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "BulkAssetSyncToDAMInitiated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_CreateDamObjects,BA_Approve,damQueue,damEvent,BL_Library) {
// revision level
var apprStatus = node.getApprovalStatus();

if (String(apprStatus) != "Completely Approved") {
    BA_Approve.execute(node);
}

BA_CreateDamObjects.execute(node);
var damObjects = BL_Library.getRevDAMObjects(node);

// dam object level
for (var i = 0; i < damObjects.length; i++) {
    var dam = damObjects[i];

    var isImageApproved = false;

    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_DAM_Object");
    var refs = dam.queryReferences(refType);
    refs.forEach(function (ref) {
        img = ref.getTarget();
        var apprStatus = img.getApprovalStatus();

        // check if active image is approved
        if (String(apprStatus) == "Completely Approved") {

            isImageApproved = true;
        }
        return false;
    });

    //log.info(dam.getName())
    // only approve and send to queue if image is approved
    if (isImageApproved) {
        BA_Approve.execute(dam);
        damQueue.queueDerivedEvent(damEvent, dam);
        //log.info("Sending")
    }
}
}