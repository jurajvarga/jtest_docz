/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_Juraj_Status_Change_Email",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_Juraj",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  }, {
    "libraryId" : "BL_Email",
    "libraryAlias" : "lib_email"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
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
    "contract" : "DerivedEventTypeBinding",
    "alias" : "bulkAuditEvent",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "BulkAuditEventCreated",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "bulkAuditQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageBulkEndpoint",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (mailHome,step,lookupTableHome,node,bulkAuditEvent,baApprove,bulkAuditQueue,manager,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_ServerAPI,lib_email) {

var brName = 'Test_Juraj';

var auditInstanceID = '123';
var targetEventsList = ['event_no1', 'event_no2'];
var assocTicketNo = 'STEP-6559';
var submitMessage = 'JTEST bulk audit message.'
var comments = 'Currently in development.';

BL_AuditUtil.setAndSendBulkAuditMessage(node, brName, targetEventsList, assocTicketNo, submitMessage, comments, manager, bulkAuditQueue, bulkAuditEvent, baApprove);
//BL_AuditUtil.setAndSendBulkAuditMessage(node,auditInstanceID, brName, targetEventsList, assocTicketNo, submitMessage, comments, manager, bulkAuditQueue, bulkAuditEvent, baApprove);
//BL_AuditUtil.setAndSendBulkAuditMessage(node,auditInstanceID, brName, targetEventsList, assocTicketNo, submitMessage, comments, bulkAuditQueue, bulkAuditEvent, baApprove);

var auditInstanceID = '321';
BL_AuditUtil.setAndSendBulkAuditMessage(node, brName, targetEventsList, assocTicketNo, submitMessage, comments, manager, bulkAuditQueue, bulkAuditEvent, baApprove);
//BL_AuditUtil.setAndSendBulkAuditMessage(node,auditInstanceID, brName, targetEventsList, assocTicketNo, submitMessage, comments, manager, bulkAuditQueue, bulkAuditEvent, baApprove);
//BL_AuditUtil.setAndSendBulkAuditMessage(node,auditInstanceID, brName, targetEventsList, assocTicketNo, submitMessage, comments, bulkAuditQueue, bulkAuditEvent, baApprove);

var storedMessages = node.getValue("Bulk_Audit_Message").getSimpleValue();
log.info("storedMessages:\n" + storedMessages);


//------------------------------------------------------------------

/*
// product / kit / equipment / service
var objectids = ["p3323059","pk3326100","e3326352","s4777919"];

for(i = 0; i < objectids.length; i++){
	var product = step.getProductHome().getProductByID(objectids[i]);
	log.info("----- " + product + " -----");
	var getLatestRevision = BL_Library.getLatestRevision(product);
	var getLatestApprovedRevision = BL_Library.getLatestApprovedRevision(product);
	var getLatestNotApprovedRevision = BL_Library.getLatestNotApprovedRevision(product);
	var getLatestRevision_inApprovedState = BL_Library.getLatestRevision_inApprovedState(product);
	var getNextRevisionNo = BL_Library.getNextRevisionNo(product);
	var getRevisions = BL_Library.getRevisions(product);
	var getRevisionsOfProductInWorkflow = BL_Library.getRevisionsOfProductInWorkflow(product,"Marketing_Review_Workflow");
	log.info("getLatestRevision: " + getLatestRevision);
	log.info("getLatestApprovedRevision: " + getLatestApprovedRevision);
	log.info("getLatestNotApprovedRevision: " + getLatestNotApprovedRevision);
	log.info("getLatestRevision_inApprovedStateion: " + getLatestRevision_inApprovedState);
	log.info("getNextRevisionNo: " + getNextRevisionNo);
	log.info("getRevisions: " + getRevisions);
	log.info("getRevisionsOfProductInWorkflow: " + getRevisionsOfProductInWorkflow);
	log.info("");
}

var masterstock = step.getProductHome().getProductByID("ms3330407");
var getLatestAssociatedRevision = BL_Library.getLatestAssociatedRevision(masterstock);
log.info("getLatestAssociatedRevision: " + getLatestAssociatedRevision);

var revision = step.getProductHome().getProductByID("pr6012059");
var getLatestRevisionFromSameMasterStock = BL_MaintenanceWorkflows.getLatestRevisionFromSameMasterStock(revision, manager);
log.info("getLatestRevisionFromSameMasterStock: " + getLatestRevisionFromSameMasterStock);
*/

//------------------------------------------------------------------

/*
var prodNo = node.getValue("PRODUCTNO").getSimpleValue();
var prodName = node.getValue("PRODUCTNAME").getSimpleValue();
var prodStatusFrom = node.getValue("Product_Status").getSimpleValue();
var prodStatusTo = null;
var sellOldStock = node.getValue("SELLOLDSTOCK_YN").getSimpleValue();
var recallProduct = node.getValue("Recall_Product").getSimpleValue();
var prodStatusReason = node.getValue("Product_Status_Change_Reason").getSimpleValue();
var estAvailableDate = node.getValue("Estimated_Available_Date").getSimpleValue();
var plannedPrediscontinuationDate = node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();

var listLotNumbers = "";
var lotNumbersAffected = node.getValue("Lot_numbers_affected").getValues();
for(i = 0; i < lotNumbersAffected.size(); i++){
	if(i > 0){
		listLotNumbers = listLotNumbers + ", " + lotNumbersAffected.get(i).getSimpleValue();
	}
	else{
		listLotNumbers = lotNumbersAffected.get(i).getSimpleValue();
	}
}
if(!listLotNumbers){
	listLotNumbers = "None";
}

var altProdList = "";
var refType = step.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT");
var refs = node.getReferences().get(refType);
for(i = 0; i < refs.size(); i++){
	if(i > 0)
		 altProdList = altProdList + ", " + refs.get(i).getTarget().getValue("PRODUCTNO").getSimpleValue();
	else
		altProdList = refs.get(i).getTarget().getValue("PRODUCTNO").getSimpleValue();
}

if(!altProdList)
	altProdList = "No";

if (prodStatusFrom.equals("Abandoned")){
	prodStatusTo = node.getValue("PSC_Abandoned").getSimpleValue();	
} else if (prodStatusFrom.equals("Discontinued")){
	prodStatusTo = node.getValue("PSC_Discontinued").getSimpleValue();
} else if (prodStatusFrom.equals("Internal Use Only")){
	prodStatusTo = node.getValue("PSC_InternalUseOnly").getSimpleValue();	
	if (prodStatusTo != null){
		node.getValue("PSC_InternalUseOnly").setSimpleValue("");
	}	
} else if (prodStatusFrom.equals("Pending")){
	prodStatusTo = node.getValue("PSC_Pending").getSimpleValue();	
} else if (prodStatusFrom.equals("Pre-discontinued")){
	prodStatusTo = node.getValue("PSC_Pre-discontinued").getSimpleValue();	
} else if (prodStatusFrom.equals("Released")){
	prodStatusTo = node.getValue("PSC_Released").getSimpleValue();	
} else if (prodStatusFrom.equals("Released - On Hold")){
	prodStatusTo = node.getValue("PSC_ReleasedOnHold").getSimpleValue();	
}

if(!prodStatusTo){prodStatusTo = ""};
if(!prodStatusFrom){prodStatusFrom = ""};
if(!lotNumbersAffected){lotNumbersAffected = ""};
if(!sellOldStock){sellOldStock = ""};
if(sellOldStock == "Y"){sellOldStock = "Yes"};
if(sellOldStock == "N"){sellOldStock = "No"};
if(!recallProduct){recallProduct = ""};
if(!prodStatusReason){prodStatusReason = ""};
if(!estAvailableDate){estAvailableDate = ""};

var body = "TEST EMAIL for MPV3 Launch. Please ignore" + "\n" + "\n";
body = body + "Product SKU: " + prodNo + " " + prodName + "\n" +
	  "Product Status: " + prodStatusTo + "\n" +
	  "Previous Status: " + prodStatusFrom + "\n" +
	  "1. What Lot # are affected? " + listLotNumbers + "\n" +
	  "2. Is Old Stock OK to Sell? " + sellOldStock + "\n" +
	  "3. Does the Product need to be recalled? " + recallProduct + "\n" +
	  "4. Are any Kits affected? " + "No" + "\n" +
	  "5. Are there any alternative products? " + altProdList + "\n" +
	  "6. Why the status change? " + prodStatusReason + "\n" +
	  "7. Estimated date available? " + estAvailableDate + "\n";

if (plannedPrediscontinuationDate != null && plannedPrediscontinuationDate != "") {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var discoDateItems = plannedPrediscontinuationDate.split('-');
	
	body = body + "8. Planned discontinuation date? " + discoDateItems[2] + months[discoDateItems[1] - 1] + discoDateItems[0] + "\n";
}

var mail = mailHome.mail();
mail.subject(BL_ServerAPI.getMailSubjectServerName()+" Product Status Change email (" + prodNo + " marked " + prodStatusTo + ")");
mail.from(BL_ServerAPI.getNoReplyEmailId()); //can be changed to any email address
var prodGroup = node.getValue("ProdTeam_Planner_Product").getSimpleValue();
var recipientsEmails = lib_email.getEmailsFromGroup(step, lookupTableHome, "WorkflowEmailUserGroupMapTable", "10");
*/


//BLOCK A Begin  // uncomment this for go-live & UAT testing and comment next block
//mail.addTo("steptest@cellsignal.com; product-notifications@cellsignal.com");
//if(prodGroup){
//	mail.addTo(prodGroup + "@cellsignal.com");
//}
//mail.addTo(recipientsEmails);
//mail.addTo("juraj.varga@globallogic.com");
//BLOCK A End

/*
//BLOCK B Begin  // comment this block for go-live & UAT testing and uncomment previous block
mail.addTo("steptest@cellsignal.com");
body = body + "\n\n mail would be sent to \n" + "steptest@cellsignal.com; product-notifications@cellsignal.com";
if(prodGroup){
body = body + "; " + prodGroup + "@cellsignal.com";
}
if(recipientsEmails){
body = body + "\n" + recipientsEmails + "\n";
}
//BLOCK B End
*/


/*

mail.plainMessage(body);
mail.send();

*/

//---------------------------------------------------------------------------------------------------------------

/*

var body2 = "TEST EMAIL for MPV3 Launch. Please ignore" + "\n" + "\n";
body2 = body2 + "Product SKU: " + prodNo + " " + prodName + "\n" +
	  "Product Status: " + prodStatusTo + "\n" +
	  "Previous Status: " + prodStatusFrom + "\n" +
	  "1. What Lot # are affected? " + listLotNumbers + "\n" +
	  "2. Is Old Stock OK to Sell? " + sellOldStock + "\n" +
	  "3. Does the Product need to be recalled? " + recallProduct + "\n" +
	  "4. Are any Kits affected? " + "No" + "\n" +
	  "5. Are there any alternative products? " + altProdList + "\n" +
	  "6. Why the status change? " + prodStatusReason + "\n" +
	  "7. Estimated date available? " + estAvailableDate + "\n";

if (plannedPrediscontinuationDate != null && plannedPrediscontinuationDate != "") {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var discoDateItems = plannedPrediscontinuationDate.split('-');
	
	body2 = body2 + "8. Planned discontinuation date? " + discoDateItems[2] + months[discoDateItems[1] - 1] + discoDateItems[0] + "\n";
}

mail.htmlMessage(body2);.
mail.send();

*/
}