/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CarrierFree_Product_Release",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_CarrierFree_Product_Release",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
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
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "WebDataRepublished",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebDataRepublished",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
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
exports.operation0 = function (step,node,lookUp,sendToPreview,previewQueueApproved,liveQueue,WebDataRepublished,BA_ApproveProductObjects,BA_ApproveRevisionObjects,BL_AuditUtil,BL_CopyRevision,BL_Library,BL_MaintenanceWorkflows) {
var parent = BL_Library.getReferenceTarget(node.getParent(), "Product_To_Parent_Product");

parent.getValue("AcceptedCopyAttributes").setSimpleValue(null);
	
var currentRev = BL_MaintenanceWorkflows.getCurrentRevision(parent);
var prodNum = node.getValue("PRODUCTNO").getSimpleValue();


//STEP-6823 add check "PUBLISHED_YN")=Y
var storageText = currentRev.getValue("STORAGE").getSimpleValue();
if (node.getParent().getValue("PUBLISHED_YN").getSimpleValue() == "Y"){
    if(storageText) {
        storageText = currentRev.getValue("STORAGE").getSimpleValue() + "<lt/>br /<gt/><lt/>br /<gt/>For a carrier free (BSA and azide free) version of this product see product #<lt/>a href=\"/product/productDetail.jsp?productId=" + prodNum + "\" target=\"_blank\"<gt/>" + prodNum + "<lt/>/a<gt/>.";
    } else {
        storageText = "For a carrier free (BSA and azide free) version of this product see product #<lt/>a href=\"/product/productDetail.jsp?productId=" + prodNum + "\" target=\"_blank\"<gt/>" + prodNum + "<lt/>/a<gt/>.";
	}		
}

var maintenanceWFNo = 51;
var maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", maintenanceWFNo);

var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());

var dup = BL_CopyRevision.duplicateObject(step, currentRev, false);
dup.getValue("STORAGE").setSimpleValue(storageText);
dup.getValue("Workflow_Name_Initiated").setSimpleValue(maintenanceWFName);
dup.getValue("Workflow_No_Initiated").setSimpleValue(maintenanceWFNo);
dup.getValue("MakeRevisionEffectiveDate").setSimpleValue(today);
dup.getValue("REVISIONSTATUS").setSimpleValue("Approved");
dup.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");

var WIPrev = BL_MaintenanceWorkflows.getWIPRevision(parent);
if(WIPrev){
	WIPrev.getValue("STORAGE").setSimpleValue(storageText);
}
	
var children = BL_Library.getRevisions(parent);

for (var i = 0; i < children.size(); i++) {
	var rev = children.get(i);
	
	if (rev.isInWorkflow("Revision_Release_Workflow")) {
		rev.getValue("STORAGE").setSimpleValue(storageText);
	}
}
	
BL_MaintenanceWorkflows.deleteReferenceOfType(parent, "Product_To_Current_Revision");
parent.createReference(dup, "Product_To_Current_Revision");

//STEP-6465 Starts
//BA_ApproveProductObjects.execute(parent);    
//BA_ApproveProductObjects.execute(dup);
BA_ApproveRevisionObjects.execute(dup);
//STEP-6465 Ends

previewQueueApproved.queueDerivedEvent(sendToPreview, parent);
liveQueue.queueDerivedEvent(WebDataRepublished, parent);
}