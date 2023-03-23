/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_InitPricing",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_InitPricing",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
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
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/**
 * function initPricing
 * 
 * create regional revision only if I do not have regional revision in WIP. If i have regional revision in WIP it generate ans send email to appropriate group.
 * Regiona revision will be created by BL_MaintenanceWorkflows.createRegionalRevisionRequest.
 * 
 * @param manager 			the STEP manager
 * @param node 			the STEP node
 * @param region			the two charcter sting represent region
 * @param lookup			the look up table code
 * @param mailHome			the mailHome object
 * @param auditEventType		the Audit Event Type
 * @param auditQueueMain		the Audit Queue Main
 * @param auditQueueApproved	the Audit Queue Approved
 * @return
 * @see	BL_MaintenanceWorkflows.getRegionalWIPRevision
 * @see	BL_MaintenanceWorkflows.createRegionalRevisionRequest
 * @see	BL_Library.getMasterStockForRevision
 * @see	BL_AuditUtil.buildAndSetAuditMessageForAction
 * @see	BL_MaintenanceWorkflows.updateRegionalRevision
 * @see	BL_Email.generateHtmlTableHeading
 * @see	BL_Email.generateHtmlTableRow
 * @see	BL_Email.getEmailsFromGroup
 * @see	BL_Email.sendEmail
 * 
 */
 
// based on BA_Init_Pricing_On_US_Change
// STEP-6091 For every price change in the US, have a node automatically drop into the EU Maintenance workflow
// STEP-6256 For every price change in the US, automatically initiate China Pricing Review (including custom products)

function initPricing(manager, node, region, lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved) {
    var workflowID = "";
    var maintenanceWFNo = "";
    var region_email_sent_flag = "";
    var region_email_group = "";
    var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
    
    switch (region) {
        case 'EU':
            workflowID = "WF16_EU_Maintenance_Workflow";
            maintenanceWFNo = "16A1";
		  // STEP-6280 Rename SKU email flags for regional emails
            region_email_sent_flag = "US_to_EU_Email_Sent_YN";
            region_email_group = "Europe_Price";
            break;
        case 'CN':
            // null value was confirmed to evaluate as NO
            // STEP-6463 
            // Change condition add check for WF != OTS conversion
            if (node.getValue("Sell_in_China_?").getSimpleValue() != 'Y' && wfInitiatedNo!="2") return;
            workflowID = "WF16_China_Maintenance_Workflow";
            maintenanceWFNo = "16C1";
		  // STEP-6280 Rename SKU email flags for regional emails
            region_email_sent_flag = "US_to_China_Email_Sent_YN";
            region_email_group = "China_Price";
            break;
        //STEP-6463 Add case for Japan
         case 'JP':
           if (node.getValue("Sell_in_Japan_?").getSimpleValue() != 'Y' && wfInitiatedNo!="2") return;
            workflowID = "WF16_Japan_Maintenance_Workflow";
            maintenanceWFNo = "16B1";
            region_email_sent_flag = "US_to_Japan_Email_Sent_YN";
            region_email_group = "Japan_Price";
            break;
        default:
            return;
    }

    var product = node.getParent();

    //STEP-6347 replacing BL_Library.getRevisionsOfProductInWorkflow method to also cover checking NPI regional revisions, not only maintenance ones
    if (!BL_MaintenanceWorkflows.getRegionalWIPRevision(product, region)) {
        var ret = BL_MaintenanceWorkflows.createRegionalRevisionRequest(manager, product, maintenanceWFNo, region, lookUp);

        if (ret[0] == "OK") {
            log.info('BA_Init_Pricing_On_US_Change (' + region + ') > Workflow > OK');
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
        } else {
            log.info('BA_Init_Pricing_On_US_Change (' + region + ') > Workflow > Error');
            throw ret[2];
        }
    } else {
        log.info('BA_Init_Pricing_On_US_Change (' + region + ') > Email sent');
        // ******** CST Logo ********
        var emailBody = '<img src=' + lookUp.getLookupTableValue("ServerLookupURL", "email-logo-url") + ' alt="Cell Signaling Technology Logo" width="225" height="47"/>'

        // ******** US SKUs ******** 
        emailBody += '<br><br> \
    			   Please note that there has been a US price change, \
                  but the (' + region + ') revision could not be initiated automatically \
                  as another (' + region + ') revision in process was already in progress.<br> \
                  Please access STEP to resolve this and start a new (' + region + ') revision for price change. \
                  <br><br>';

        emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

        var skuHeadingContent = ["SKU", "PRODUCT NO", "PRODUCT NAME", "STATUS", "PUBLISHED", "ITEM ACTIVE", "PREVIOUS PRICE", "CURRENT PRICE", "REGION"];
        emailBody += BL_Email.generateHtmlTableHeading(skuHeadingContent);

        var prodNo = String(node.getValue("PRODUCTNO").getSimpleValue());
        var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
        var msRef = node.queryReferences(revToMS) //STEP-6396

        msRef.forEach(function(ref) { //STEP-6396 

            var skus = ref.getTarget().getChildren() //STEP-6396
            for (var j = 0; j < skus.size(); j++) {
                var sku = skus.get(j)

                if (sku.getValue(region_email_sent_flag).getSimpleValue() != "N") {
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
            return true;
        }); //STEP-6396
        
        emailBody += '</table>';

        var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", region_email_group)
        // var recipientsEmails = "gabriel.pavlik@globallogic.com";
        var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
        var today = isoDateFormat.format(new Date());

        // Sending an email
        if (recipientsEmails) {
            var subject = "Price Change alert " + today + " for product no. " + prodNo;
            BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, emailBody)
        } else {
            throw "BA_Init_Pricing_On_US_Change (" + region + "): No recipients found.";
        }
    }
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.initPricing = initPricing