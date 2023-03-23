/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Product_Release_Status_CP",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Set_Product_Release_Status_Custom_Products_ToDelete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
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
exports.operation0 = function (node,productReleased,productQueue,currentRevisionUpdated,logger,baApproveProductObjects,baMigCatalogAttrFinal,BA_ApproveRevisionObjects,BL_Approve,bl_library) {
var businessRule = "Business Rule: BA_Set_Product_Release_Status";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());

var product = node.getParent();

// set revision, copied from SetCurrentRevisionEqualToWIPRevision, changed node to product
var refs = product.getProductReferences();
var p2wipRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var p2wipRefs = refs.get(p2wipRefType);

if (p2wipRefs.size() == 1) {
    var p2wipRef = p2wipRefs.get(0);
    var targetRevision = p2wipRef.getTarget();
    var p2curRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
    var p2curRefs = refs.get(p2curRefType);
    var currentRevision = null;
    if (p2curRefs.size() == 1) {
        var p2curRef = p2curRefs.get(0);
        currentRevision = p2curRef.getTarget();
        if (!currentRevision.equals(targetRevision)) {
            // If such a reference already exists for a different target revision we will replace it.
            p2curRef.delete();
            currentRevision = null;
        }
    }
    if (currentRevision == null) {
        product.createReference(targetRevision, p2curRefType.getID());
    }
    // Remove reference from the existing Current Product Revision:
    p2wipRef.delete();

    var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var today = isoDateFormat.format(new Date());

    product.getValue("DateReleased").setSimpleValue(today);
    product.getValue("Product_Status").setSimpleValue("Released");

    //Update Catalog related attributes.
    baMigCatalogAttrFinal.execute(node);

    if (bl_library.isRevisionType(node, checkServiceRevision = false)) {
        try {

		  //STEP-6465 Starts
            //baApproveProductObjects.execute(product);
            BA_ApproveRevisionObjects.execute(targetRevision);
            //STEP-6465 Ends

        }
        catch (e) {
            if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else {
                logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                throw (e);
            }
        }
    }




    productQueue.queueDerivedEvent(productReleased, node);


}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "RemoveObjectFromWorkflowAction",
  "parameters" : [ {
    "id" : "Workflow",
    "type" : "com.stibo.core.domain.state.Workflow",
    "value" : null
  }, {
    "id" : "Message",
    "type" : "java.lang.String",
    "value" : ""
  } ],
  "pluginType" : "Operation"
}
*/

/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_isCustomProduct"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
