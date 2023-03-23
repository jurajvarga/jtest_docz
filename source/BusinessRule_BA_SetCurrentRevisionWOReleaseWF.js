/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetCurrentRevisionWOReleaseWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA_Set Current Revision Without Release Workflow",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baRevApprovedEmail",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Revision_Approved",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "webCategoryQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_CATEGORY_JSON_EP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetCurrentRevRelease",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevRelease",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "autoApproveRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AutoApproveRevisionUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productAutoApproveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Prod_AutoApprRev_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "pricingQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ItemPriceUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ItemPriceUpdated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,productQueue,currentRevisionUpdated,baRevApprovedEmail,webCategoryQueue,baSetCurrentRevRelease,logger,busCondComponentWF,busActApprove,baGenerateMaintenanceRevisionEvents,autoApproveRevisionUpdated,productAutoApproveQueue,pricingQueue,ItemPriceUpdated,bl_library,bl_maintenancewWFs) {
//BA_SetCurrentRevisionWOReleaseWF
var businessRule = "Business Rule: BA_SetCurrentRevisionWOReleaseWF";
var wfInitiatedNo=node.getValue("Workflow_No_Initiated").getSimpleValue();
logger.info(businessRule + " wfInitiatedNo "+ wfInitiatedNo);

var condComponentWFResult = busCondComponentWF.evaluate(node);
var isComponentWF = condComponentWFResult.isAccepted();

//STEP-5682 Update Revision logic to include checks for shipping lot
/*if (node.isInWorkflow("Marketing_Review_Workflow") ||
   (node.isInWorkflow("WF6_Content_Review_Workflow") && (wfInitiatedNo == "15"||wfInitiatedNo == "17"||wfInitiatedNo == "19"||wfInitiatedNo == "20") ) ||
    (isComponentWF && node.isInWorkflow("WF3B_Supply-Chain"))
   ) {*/
    //Change wip revision status
    node.getValue("REVISIONSTATUS").setSimpleValue("Approved");

    //Get WIP Revision
    var product = node.getParent();

     // STEP-5843 moving copying price to the Marketing WF, remove bind variable baCopyCurrentPriceToFutureUS
    /*
    // Copy Current CLP to Future CLP for regions Changes done for STEP-4066 Starts
    //Need to be commented after year end pricing is executed
    var masterstockList = bl_library.getProductMasterstock(product);
    log.info(" masterstockList " + masterstockList);

   
    //Call Copy Price BR's
    for (var i = 0; i < masterstockList.size(); i++) {
        var masterstock = masterstockList.get(i)
        //log.info(" masterstock "+masterstock);
        var msChildren = masterstock.getChildren().iterator();
        //log.info(msChildren);
        while (msChildren.hasNext()) {
            var skuTargetObjRev = msChildren.next();
            // log.info(" skuTargetObjRev "+skuTargetObjRev.getName());
            baCopyCurrentPriceToFutureUS.execute(skuTargetObjRev);

        }

    }

    // Copy Current CLP to Future CLP for regions Changes done for STEP-4066 Ends
    //Also remove binds
    //Need to be commented after year end pricing is executed 
    */
    
    var wipRevision = bl_maintenancewWFs.getWIPRevision(product); 
    
    if (wipRevision != null) {
        //Set Current Rev    
        baSetCurrentRevRelease.execute(node);

        //Send Email for Regions
        baRevApprovedEmail.execute(node);

        //STEP-6543 Starts
        product.getValue("PUBLISHED_YN").setSimpleValue(node.getValue("PUBLISHED_YN").getSimpleValue());
        product.getValue("PRODUCTSHORTNAME").setSimpleValue(node.getValue("PRODUCTSHORTNAME").getSimpleValue());
        product.getValue("PRODUCTNAME").setSimpleValue(node.getValue("PRODUCTNAME").getSimpleValue());
        product.setName(node.getValue("PRODUCTNAME").getSimpleValue());
        //STEP-6543 Ends

        busActApprove.execute(node);
        busActApprove.execute(product); //STEP-6543

        //STEP-6152
        if(node.getValue("Published_SKU_Price_Changed_YN").getSimpleValue() == "Y"){
        	 pricingQueue.queueDerivedEvent(ItemPriceUpdated, product);
        }

        //STEP-6136
        if(node.getValue("AUTOADD_YN").getSimpleValue() == "Y"){
            productAutoApproveQueue.queueDerivedEvent(autoApproveRevisionUpdated, product);
        }
        else{
            productAutoApproveQueue.queueDerivedEvent(currentRevisionUpdated, product);
        }
        //END STEP-6136

        //Add to Queue
        productQueue.queueDerivedEvent(currentRevisionUpdated, product);
        webCategoryQueue.queueDerivedEvent(currentRevisionUpdated, product);
        
        
	    //Changes Done for STEP- 5564 Starts
		//Send to Backfeed queue for capturing Maintenance Complete event before Approval as outbound looks only Main workspace.
		baGenerateMaintenanceRevisionEvents.execute(node);
		//Changes Done for STEP- 5564 Ends
  // }
}
}