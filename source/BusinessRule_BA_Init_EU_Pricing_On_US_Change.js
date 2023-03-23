/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_EU_Pricing_On_US_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Init_EU_Pricing_On_US_Change",
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
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
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
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,lookUp,auditEventType,auditQueueMain,auditQueueApproved,mailHome,BL_AuditUtil,BL_Email,BL_Library,BL_MaintenanceWorkflows) {
// BA_Init_EU_Pricing_On_US_Change
// STEP-6091 For every price change in the US, have a node automatically drop into the EU Maintenance workflow
var product = node.getParent();

if (BL_Library.getRevisionsOfProductInWorkflow(product, "WF16_EU_Maintenance_Workflow").length == 0) {
    var maintenanceWFNo = "16A1";
    var region = "EU";
    var ret = BL_MaintenanceWorkflows.createRegionalRevisionRequest(manager, product, maintenanceWFNo, region, lookUp);

    if (ret[0] == "OK") {
    	   log.info('BA_Init_EU_Pricing_On_US_Change > Workflow > OK');
        var newRegRevision = ret[1];
        var masterStock = BL_Library.getMasterStockForRevision(manager, node);
        var msCode = masterStock.getValue("MASTERITEMCODE").getSimpleValue();
        newRegRevision.startWorkflowByID("Regional_Initiation_Workflow", "Initiated from " + newRegRevision.getValue("Workflow_Name_Initiated").getSimpleValue() + " for " + region + " region.");
        newRegRevision.getValue("MasterStock_Selected").setSimpleValue(msCode);
        var initWF = manager.getWorkflowHome().getWorkflowByID("Regional_Initiation_Workflow");
        if (initWF) {
            var workflowInstance = newRegRevision.getWorkflowInstance(initWF);
            if (workflowInstance) {
                workflowInstance.delete("Success - Maintenance Cancelled - Remove from Regional Maintenance Workflow");
                BL_AuditUtil.buildAndSetAuditMessageForAction(newRegRevision, manager, initWF.getID(), "Cancel_Action", "Regional_Initiation_Maintenance_Cancel", "", "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved);
            }
        }
        BL_MaintenanceWorkflows.updateRegionalRevision(manager, newRegRevision, node);
        newRegRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newRegRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
        log.info('BA_Init_EU_Pricing_On_US_Change > Workflow > PASSED');
    } else {
    	   log.info('BA_Init_EU_Pricing_On_US_Change > Workflow > Error');
        throw ret[2];
    }
} else {
    log.info('BA_Init_EU_Pricing_On_US_Change > Email');
    // ******** CST Logo ********
    var emailBody = '<img src=' + lookUp.getLookupTableValue("ServerLookupURL", "email-logo-url") + ' alt="Cell Signaling Technology Logo" width="225" height="47"/>'

    // ******** US SKUs ******** 
    emailBody += '<br><br> \
    			   Please note that there has been a US price change, \
                  but the EU revision could not be initiated automatically \
                  as another EU revision in process was already in progress.<br> \
                  Please access STEP to resolve this and start a new EU revision for price change. \
                  <br><br>';
                  
    emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

    var skuHeadingContent = ["SKU", "PRODUCT NO", "PRODUCT NAME", "STATUS", "PUBLISHED", "ITEM ACTIVE", "PREVIOUS PRICE", "CURRENT PRICE", "REGION"];
    emailBody += BL_Email.generateHtmlTableHeading(skuHeadingContent);

    var prodNo = String(node.getValue("PRODUCTNO").getSimpleValue());
    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var msRef = node.getReferences(revToMS)

    if (msRef && msRef.size() > 0) {

        var skus = msRef.get(0).getTarget().getChildren()
        for (var j = 0; j < skus.size(); j++) {
            var sku = skus.get(j)

		  // STEP-6280 Rename SKU email flags for regional emails
            if (sku.getValue("US_to_EU_Email_Sent_YN").getSimpleValue() != "N") {
                continue;
            }

            var skuName = sku.getName();
            var prodName = product.getName();
            var prodStatus = node.getValue("Product_Status").getSimpleValue();
            var published = sku.getValue("PUBLISH_YN").getSimpleValue()
            var itemActive = sku.getValue("ITEMACTIVE_YN").getSimpleValue();
            var previousPrice = BL_Library.getPreviousPrice(sku, "US");
            var currentPrice = sku.getValue("PRICE").getSimpleValue();
            var region = "US";

            if (!previousPrice || previousPrice == "") {
                previousPrice = currentPrice;
            }

            var revTableContent = [skuName, prodNo, prodName, prodStatus, published, itemActive, previousPrice, currentPrice, region];
            var tableRowStyle = 'style="background-color:#eaeaea"';
            emailBody += BL_Email.generateHtmlTableRow(revTableContent, tableRowStyle);
        }
    }
    emailBody += '</table>';

    var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "Europe_Price")
    // var recipientsEmails = "gabriel.pavlik@globallogic.com";
    var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var today = isoDateFormat.format(new Date());

    // Sending an email
    if (recipientsEmails) {
        var subject = "Price Change alert " + today;
        BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, emailBody)
    } else {
        throw "BA_Init_EU_Pricing_On_US_Change: No recipients found.";
    }
}
}