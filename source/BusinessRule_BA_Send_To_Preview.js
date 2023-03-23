/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Send_To_Preview",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Send_To_Preview",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
    "alias" : "previewQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Main_OIEP",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetFigureDisplayIndex",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Set_Figure_Display_Index",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baProductKitRevisionApprovalAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "bcIsNewWorkflow",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetUnitAbbreviation",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Unit_Abbreviation",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Republish_Product_Bibliography",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_Product_Bibliography",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "biblioQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=BIBILIOGRAPHY_PRODUCT_JSON_EP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ProductBibliographyChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ProductBibliographyChanges",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,sendToPreview,previewQueueApproved,previewQueueMain,manager,baSetFigureDisplayIndex,baProductKitRevisionApprovalAction,bcIsNewWorkflow,busActSetUnitAbbreviation,BA_Republish_Product_Bibliography,biblioQueue,ProductBibliographyChanges,BL_Library) {
var approvalStatus = node.getApprovalStatus();
//log.info("approvalStatus " + approvalStatus);

//Set Figure Display Index from Figure folder to Product Image/Datasheet before sending to Preview Server
baSetFigureDisplayIndex.execute(node);

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
logger.info(" wfInitiatedNo " + wfInitiatedNo);

var figureChanged = node.getValue("FigureChanged_YN").getSimpleValue();

var isNewWorkflow = bcIsNewWorkflow.evaluate(node).isAccepted();
log.info(" isNewWorkflow " + isNewWorkflow);

//Changes done for STEP-5903 Starts
//Get Master Stock for revision and set Unit Abbreviation  
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")
//STEP-6396
var msRefs = node.queryReferences(refType);

msRefs.forEach(function (msRef) {
    var masterStock = msRef.getTarget();

    if (masterStock != null) {
        busActSetUnitAbbreviation.execute(masterStock);
    }

    return true;
});
//STEP-6396

var pProduct = node.getParent();
//Get All Masterstock to get SKU's
var masterstockList = BL_Library.getProductMasterstock(pProduct);
log.info(" masterstockList " + masterstockList);

//Call Catalog Related BR's
for (var i = 0; i < masterstockList.size(); i++) {
    var masterstock = masterstockList.get(i)
    //log.info(" masterstock "+masterstock);
    var msChildren = masterstock.getChildren().iterator();
    //log.info(msChildren);
    while (msChildren.hasNext()) {
        var skuTargetObjRev = msChildren.next();
        log.info(" skuTargetObjRev " + skuTargetObjRev.getName());
        busActSetUnitAbbreviation.execute(skuTargetObjRev);
    }

}


//Changes done for STEP-5903 Ends

// if wf17 was initiated and there was no figure change, call the BR to add Rev_Application_Figures to the app protocol reference
//Content only (19) & Full Product REview Workflow (20)
//if ((wfInitiatedNo == "17" && figureChanged != "Y") ||(wfInitiatedNo == "19" ) ||(wfInitiatedNo == "20" )  || (isNewWorkflow)) { STEP-6122
if ((wfInitiatedNo == "17" && figureChanged != "Y") || wfInitiatedNo == "15" || wfInitiatedNo == "19" || wfInitiatedNo == "20" || wfInitiatedNo == "2" || isNewWorkflow) { // STEP-6122 STEP-5841
    baProductKitRevisionApprovalAction.execute(node);
}


if (node.isInWorkflow("WF6_Content_Review_Workflow")) {
    previewQueueMain.queueDerivedEvent(sendToPreview, node);
    //STEP-6716 Starts
    if (wfInitiatedNo == "2") {
        BL_Library.republishProductBibliography(node, manager, biblioQueue, ProductBibliographyChanges); //STEP-6584
    }
    else {
        BA_Republish_Product_Bibliography.execute(pProduct); //STEP-6199
    }
    //STEP-6716 Ends
} else if (approvalStatus == "Not in Approved workspace" || approvalStatus == "Partly approved") {
    previewQueueMain.queueDerivedEvent(sendToPreview, node);
    //BA_Republish_Product_Bibliography.execute(pProduct); //STEP-6199
    BL_Library.republishProductBibliography(node, manager, biblioQueue, ProductBibliographyChanges); //STEP-6584
} else if (approvalStatus == "Completely Approved") {
    previewQueueApproved.queueDerivedEvent(sendToPreview, node);
    BA_Republish_Product_Bibliography.execute(pProduct); //STEP-6199
}
}