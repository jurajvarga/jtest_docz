/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Reject_Product",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA Reject Product",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyProduct",
    "libraryAlias" : "BL_CopyProduct"
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
    "alias" : "workflowObject",
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserBindContract",
    "alias" : "user",
    "parameterClass" : "com.stibo.core.domain.impl.UserImpl",
    "value" : "DUMMY",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "userGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Dev_Sci",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "rejectTechTransfer",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "RejectTechTransfer",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (workflowObject,manager,logger,user,userGroup,rejectTechTransfer,wipBFQueue,web,BL_CopyProduct,bl_library) {
// BA_RejectProduct
// node: Current Object
// manager: STEP Manager
// logger: Logger
// Lib: BL_Library
// validity: Product/Product Kit


var notesToDevsci = workflowObject.getValue("Notes_to_DevSci").getSimpleValue();
if (notesToDevsci == null) {
    web.showAlert("ERROR", "Tech-Transfer Reject Reason Required", "Tech-Transfer Reject Reason is required for Reject Tech Transfer"); // STEP-6087
} else {
var parent = null;

if (bl_library.isRevisionType(workflowObject, checkServiceRevision = false)) {
    parent = workflowObject.getParent();
}

var ttNode = bl_library.getReferenceTarget(workflowObject, "ProductRevision_to_Lot")
if (ttNode)
    var lotNo = ttNode.getValue("LOTNO").getSimpleValue();

    parent.getValue("Notes_to_DevSci").setSimpleValue(notesToDevsci + "\nLot Number: " + lotNo + "\nRejected by: " + manager.getCurrentUser().getName());

//Create rejectTechTransfer event
wipBFQueue.queueDerivedEvent(rejectTechTransfer, workflowObject);

//STEP-6625
var abbrWorkflowName = workflowObject.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();
var parentCopytype = parent.getValue("COPYTYPE").getSimpleValue();
var parentProdNo = workflowObject.getValue("PARENT_PRODUCTNO").getSimpleValue();
var parentProduct = manager.getNodeHome().getObjectByKey("PRODUCTNO",parentProdNo);
//STEP-6625
var productno = parent.getValue("PRODUCTNO").getSimpleValue();
var bibProduct = parent.getManager().getEntityHome().getEntityByID(productno);

var prodFolder = bl_library.getReferenceTarget(parent, "Product_Folder_To_Product")

//STEP-6344
//Remove all regional revisions from all WFs
var prodRegRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Regional_Revision");
//STEP-6396
var prodRegRevReferences = parent.queryReferences(prodRegRevReferenceType);
prodRegRevReferences.forEach(function(ref) {
	bl_library.removeFromAllWF(ref.getTarget());
    return true;
});
//STEP-6396
//STEP-6344 END

//Delete all the references and referencedBy
bl_library.deleteRefRecursively(parent);
bl_library.deleteRefByRecursively(parent);

//Remove from all Workflows.
bl_library.removeFromAllWF(workflowObject);


parent.approve();
workflowObject.approve();
if (prodFolder) {
    bl_library.deleteRefRecursively(prodFolder)
    bl_library.deleteRefByRecursively(prodFolder);
}

bl_library.deleteRecursively(parent)
if (prodFolder) {
    bl_library.deleteRecursively(prodFolder)
    prodFolder.delete();
}
if (bibProduct && bibProduct.getObjectType().getID().equals("Bibliography_Products")) {
    bl_library.deleteRecursively(bibProduct);
}

//STEP-6625
if (abbrWorkflowName == "CarrierFree" && parentCopytype == "CarrierFree" ){
    //Update Product Status and ORIGIN_PRODNO_REVNO
    parent.getValue("Product_Status").setSimpleValue("Product-Planned");
    parent.getValue("ORIGIN_PRODNO_REVNO").setSimpleValue("");

    //Create reference "Product_To_Parent_Product" - all references were deleted
    parent.createReference(parentProduct, "Product_To_Parent_Product");

    var parentProductAppr = parentProduct.getApprovalStatus().name();

    //Update COPYTYPE on parentProduct
    parentProduct.getValue("COPYTYPE").setSimpleValue("CarrierFree"); 

    //delete  bibliography if exists
    //should be already deleted

    //copy bibliogrphy
    BL_CopyProduct.copyBiblioCitations(manager, parentProduct, parent);
   
    parent.approve();
    if (parentProductAppr == "CompletelyApproved") {
       parentProduct.approve();
    }
}
else {
    parent.delete();
}
//STEP-6625

bl_library.deleteRecursively(ttNode)
if (ttNode)
    ttNode.delete();
    if (abbrWorkflowName == "CarrierFree" && parentCopytype == "CarrierFree" ){ //STEP-6625
       web.showAlert("ACKNOWLEDGMENT", "Reject Action", "Tech Transfer successfully rejected and CarrierFree revision removed from STEP."); //STEP-6625
    } else {
       web.showAlert("ACKNOWLEDGMENT", "Reject Action", "Tech Transfer successfully rejected and product removed from STEP.");   
    } 
    web.navigate("homepage", null);
}
}