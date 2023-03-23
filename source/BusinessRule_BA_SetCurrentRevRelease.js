/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetCurrentRevRelease",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_SetCurrentRevRelease",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "BL_CreateSKU"
  }, {
    "libraryId" : "BL_InitPricing",
    "libraryAlias" : "BL_InitPricing"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  }, {
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baUpdatePublishDate",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_UpdatePublishDate",
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
exports.operation0 = function (node,baApproveProductObjects,baMigCatalogAttrFinal,manager,baResetAuditInstanceID,baSetRevRegEmailFlag,lookUp,mailHome,auditEventType,auditQueueMain,auditQueueApproved,baUpdatePublishDate,BA_ApproveRevisionObjects,BL_CreateSKU,BL_InitPricing,bl_library,bl_maintenancewWFs) {
var product = node.getParent();
var calledFromProdRelStatus = false;
if (node.isInWorkflow("Product_Release_Workflow")) {
    // BR called from BA_Set_Product_Release_Status
    calledFromProdRelStatus = true;
}

// STEP-5681 Removing checking for wipRevision so we can use this BR in the BA_Swtich_Cur_Rev_On_Shipping_Lot_Change, checking wip revision is already done in BRs using this BR

//STEP-6341, STEP-6645 start
if(bl_library.isRevisionType(node, false)) {
	bl_library.toCompareOGandNewShippingConditions(manager, node);
}	
//STEP-6341, STEP-6645 end

//Get Current Revision
var currentRevision = bl_maintenancewWFs.getCurrentRevision(product);
log.info("currentRevision " + currentRevision + " node " + node);

if (currentRevision != null && !currentRevision.equals(node)) {

    if (calledFromProdRelStatus) {
        // If such a reference already exists for a different target revision, will be replaced
        bl_maintenancewWFs.deleteReferences(manager, product, ["Product_To_Current_Revision"]);
        currentRevision = null;
    } else {
        //STEP-6192 If the node's attribute CustomLotRev_YN == Y (regardless on the master stock), don’t switch the current revision.
        if (node.getValue("CustomLotRev_YN").getSimpleValue() != "Y") {
            //Get MS Code
            var currentRevMSCode = bl_library.getReferenceAttrValueWOTarget(currentRevision, "ProductRevision_To_MasterStock", "MASTERITEMCODE");
            var nodeRevMSCode = bl_library.getReferenceAttrValueWOTarget(node, "ProductRevision_To_MasterStock", "MASTERITEMCODE");

            log.info("currentRevMSCode " + currentRevMSCode + " nodeRevMSCode " + nodeRevMSCode)

            //If the master stock code for current revision and node revision are the same then replace current revision else keep it same
            if (currentRevMSCode != null && currentRevMSCode == nodeRevMSCode) {
                bl_maintenancewWFs.deleteReferences(manager, product, ["Product_To_Current_Revision"]);
                currentRevision = null;
            }
        }
        //END STEP-6192
    }
}

if (currentRevision == null) {
    var p2curRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
    product.createReference(node, p2curRefType.getID());
}

// Remove reference from the existing WIP Product Revision:
bl_maintenancewWFs.deleteReferences(manager, product, ["Product_To_WIP_Revision"]);

if (calledFromProdRelStatus) {
    var fromStatus = product.getValue("Product_Status").getSimpleValue();
    //STEP-6460
    var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
    if (wfInitiatedNo == "2") {
        bl_library.updateHistoryAttribute(product, fromStatus, "OTS Conversion");
    } else {
        bl_library.updateHistoryAttribute(product, fromStatus, "Released");
    }
}

// STEP-5845 if the revision being released is bound to lot with LOTNO same as ShippingLotNo on the product, set No_Shipping_Lot_Msg to null 
var shippingLotNo = product.getValue("Shipping_Lot_No").getSimpleValue();
if (bl_library.revisionContainsShippingLot(manager, node, shippingLotNo)) {
    product.getValue("No_Shipping_Lot_Msg").setSimpleValue(null);
}


//STEP-6755
if (product.getValue("LOTMANAGED_YN").getSimpleValue() == "Y") {
	var lotRecombinantFlag = bl_library.getLotRecombinantFlag(manager, product, node);
	product.getValue("Lot_Recombinant_Flag").setSimpleValue(lotRecombinantFlag);	
}

// Set RELEASE_EMAIL_SENT_YN flag
node.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");

// STEP-5869 When there is SKU to send for regions set regional email flag on revision
baSetRevRegEmailFlag.execute(node);

// STEP-6280 Rename SKU email flags for regional emails
// log.info("US_to_EU_Email_Sent_YN = " + node.getValue("US_to_EU_Email_Sent_YN").getSimpleValue());
if (node.getValue("US_to_EU_Email_Sent_YN").getSimpleValue() == "N") {
	// STEP-6091 For every price change in the US, have a revision automatically drop into the EU Maintenance workflow
	BL_InitPricing.initPricing(manager, node, 'EU', lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
}
// STEP-6280 Rename SKU email flags for regional emails
// log.info("US_to_China_Email_Sent_YN = " + node.getValue("US_to_China_Email_Sent_YN").getSimpleValue());
if (node.getValue("US_to_China_Email_Sent_YN").getSimpleValue() == "N") {
	// STEP-6256 For every price change in the US, automatically initiate China Pricing Review (including custom products)
	BL_InitPricing.initPricing(manager, node, 'CN', lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
}

// STEP-6463 
// automatically iniciate Japan Pricing Review
if (node.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue() == "N") {
	BL_InitPricing.initPricing(manager, node, 'JP', lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
}

// STEP-5706 set date if not set
var makeRevEffectiveDate = node.getValue("MakeRevisionEffectiveDate").getSimpleValue();

if (!makeRevEffectiveDate) {
    var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var today = isoDateFormat.format(new Date());

    node.getValue("MakeRevisionEffectiveDate").setSimpleValue(today);
}

// STEP-6220
BL_CreateSKU.setSkuReleaseDate(manager, node, today);

// STEP-6306 set publish date
baUpdatePublishDate.execute(node);

//Changes done for STEP-5612 starts
//Reset Audit Instance
baResetAuditInstanceID.execute(node);
//Changes done for STEP-5612 ends

//Update Catalog related attributes.
baMigCatalogAttrFinal.execute(node);

//Approve all Objects
//STEP-6465
//baApproveProductObjects.execute(product);
BA_ApproveRevisionObjects.execute(node);
//STEP-6465
}