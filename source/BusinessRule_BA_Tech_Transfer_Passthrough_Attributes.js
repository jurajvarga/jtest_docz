/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Tech_Transfer_Passthrough_Attributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "TechTransferActions" ],
  "name" : "BA Tech Transfer Passthrough Attributes",
  "description" : "Populates passthrough attributes and send to queue",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot", "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "lib_maintwf"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "lib_tt"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthroughChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productBGUpdatedQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "autoApproveRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AutoApproveRevisionUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "autoApproveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Prod_AutoApprRev_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "IDMPassthroughChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "IDMPassthroughChanges",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,webPassthroughChanges,productBGUpdatedQueue,autoApproveRevisionUpdated,autoApproveQueue,baApprove,IDMPassthroughChanges,BL_AuditUtil,Lib,lib_maintwf,lib_tt) {
// BA_Tech_Transfer_Passthrough_Attributes

   var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
   var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
   var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
   var pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
   log.info("pProduct " + pProduct.getName());
   log.info("pMasterStock " + pMasterStock.getName());

   var pRevision = lib_maintwf.getCurrentRevision(pProduct);
   if (pRevision == null) {
       pRevision = lib_maintwf.getWIPRevision(pProduct);
   }
   //STEP-6222
   var pMSRevision = Lib.getLatestAssociatedRevision(pMasterStock);

   var areDiffAttributesMS = false;
   if (pMasterStock) {
        areDiffAttributesMS = lib_tt.areDifferentAttributes(step, node, pMasterStock, "TTPT_Masterstock_Attributes", log);
   }
   
   var areDiffAttributesProductOrRevision = (lib_tt.areDifferentAttributes(step, node, pProduct, "TTPT_Product_Attributes", log)
                                                   || lib_tt.areDifferentAttributes(step, node, pRevision, "TTPT_Product_Revision_Attributes", log));
   
   //STEP-6222
   var areDiffApplicationAttributes = lib_tt.checkValidatedApplications(step, node, pMSRevision);                                                   

   if (areDiffAttributesMS || areDiffAttributesProductOrRevision || areDiffApplicationAttributes == "passthrough") {    

        //STEP-6222 
        if(areDiffApplicationAttributes == "passthrough"){
              //create reference ProductRevision_to_TechTransfer to the lot for Application passthrough changes
             // pMSRevision.createReference(node, "ProductRevision_to_Lot");

 		    //update latest associated to MS revision	           
              lib_tt.copyApplicationsAttributes(step, node, pMSRevision);
              baApprove.execute(pMSRevision);
              //update current revision  
              if( pMSRevision != pRevision){
            		lib_tt.copyApplicationsAttributes(step, node, pRevision);
            		baApprove.execute(pRevision);  
       		}
        }
        //STEP-6222 end
        
        lib_tt.copyPassThroughAttributes(step, node, log);   

	   //STEP-6341 start
	   var oldShipCondMS = Lib.getApprovedProductAttribute(step, pMasterStock, "ShippingConditions");
	   var newShipCondMS = pMasterStock.getValue("ShippingConditions").getSimpleValue();

	   if (oldShipCondMS != newShipCondMS) {
	   	var isApprovedRevision = pMSRevision.getApprovalStatus().name();
	   	
	   	pMSRevision.getValue("Shipping_Conditions_Original").setSimpleValue("Changed");
	   	pMasterStock.getValue("Shipping_Conditions_Original").setSimpleValue(oldShipCondMS);
	   	
	   	if (isApprovedRevision == "CompletelyApproved") {
			baApprove.execute(pMSRevision);
		}
        }
        //STEP-6341 end

        baApprove.execute(pProduct);
        baApprove.execute(pMasterStock);

        // Send to queue 
        if (areDiffAttributesMS)  {
            autoApproveQueue.queueDerivedEvent(autoApproveRevisionUpdated, pRevision);
            log.info(pRevision.getName() + "Sent to autoApproveRevisionUpdated ");
        } 
        // STEP-6121
        if (areDiffAttributesProductOrRevision){
            autoApproveQueue.queueDerivedEvent(IDMPassthroughChanges, pRevision);
            log.info(pRevision.getName() + "Sent to IDMPassthroughChanges ");
            productBGUpdatedQueue.queueDerivedEvent(webPassthroughChanges, pProduct);  
            log.info(pProduct.getName() + "Sent to webPassthroughChanges ");      
        } else {
            productBGUpdatedQueue.queueDerivedEvent(webPassthroughChanges, pProduct);
            log.info(pProduct.getName() + "Sent to webPassthroughChanges ");
        } 
   }
}