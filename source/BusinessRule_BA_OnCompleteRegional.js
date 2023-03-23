/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_OnCompleteRegional",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_OnCompleteRegional",
  "description" : "Update Revision Status on completion of Regional Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "LibApprove"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintain"
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetRevRegEmailFlag",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetRevRegEmailFlag",
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustCNPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_China",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustJPPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_Japan",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustEUPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_Europe",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustUKPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_United_Kingdom",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustGEPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_Germany",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "pricingQueueNPI",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Pricing_NPI",
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
exports.operation0 = function (node,logger,baApproveProductObjects,manager,baSetRevRegEmailFlag,pricingQueue,ItemPriceUpdated,busActionCalcCustCNPrices,busActionCalcCustJPPrices,busActionCalcCustEUPrices,busActionCalcCustUKPrices,busActionCalcCustGEPrices,pricingQueueNPI,BA_ApproveRevisionObjects,LibApprove,LibMaintain,bl_library) {
// BA_OnCompleteRegional
var businessRule = "Business Rule: BA_OnCompleteRegional";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var inst = null
var wfFlag = null

if (node.isInWorkflow("WF5_Regional_Workflow")) {
    inst = node.getWorkflowInstanceByID("WF5_Regional_Workflow")
    wfFlag = inst.getSimpleVariable("WF_Flag")
}

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();

//Set Revision Status to "Approved"
node.getValue("REVISIONSTATUS").setSimpleValue("Approved")

var product = node.getParent()

var initiatedRevNo = bl_library.getReferenceAttrValue(product, node, "Product_To_Regional_Revision", "Initiated_REVISIONNO");
var prodRev2MSRef = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock"); //STEP-6396

if (initiatedRevNo && initiatedRevNo > 0) {

    var masterStock = bl_library.getMasterStockForRevision(manager, node); // STEP-6326 using library function to get masterstock
    var byRefs = masterStock.queryReferencedBy(prodRev2MSRef)  //STEP-6396
    byRefs.forEach(function(byRef) { //STEP-6396
        var bySource = byRef.getSource();
            var iRevision = bySource

            if (bl_library.isRevisionType(iRevision, checkServiceRevision = false)) { // STEP-6326 using library function to check if it is product(kit, eq) revision
                var iRevisionNum = parseInt(iRevision.getValue("REVISIONNO").getSimpleValue(), 10);

                if (iRevisionNum >= initiatedRevNo) {
                    if (wfFlag == "CN" || wfInitiatedNo == "16C2" || wfInitiatedNo == "16C1") {
                        //CN DG
                        bl_library.copyAttributes(manager, node, iRevision, "China_DG_Maint_Copy", null)
  
                    } else if (wfFlag == "JP" || wfInitiatedNo == "16B2" || wfInitiatedNo == "16B1") {
                        //JP DG
                        bl_library.copyAttributes(manager, node, iRevision, "Japan_DG_Maint_Copy", null);
 
                    } else if (wfFlag == "EU" || wfInitiatedNo == "16A2" || wfInitiatedNo == "16A1") {
                        //EU DG
                        bl_library.copyAttributes(manager, node, iRevision, "EU_DG_Maint_Copy", null);
                    }

                }
            }
        return true; //STEP-6396
    }); //STEP-6396

    // STEP-6326 recalculate catalogue ready prices for SKUs based on region
    var SKUs = masterStock.getChildren().iterator();
    while (SKUs.hasNext()) {
        var sku = SKUs.next();
        if (sku.getValue("Catalog_Ready").getSimpleValue() == "Y") {
            if (wfFlag == "CN" || wfInitiatedNo == "16C2" || wfInitiatedNo == "16C1") {
                busActionCalcCustCNPrices.execute(sku);
            } else if (wfFlag == "JP" || wfInitiatedNo == "16B2" || wfInitiatedNo == "16B1") {
                busActionCalcCustJPPrices.execute(sku);
            } else if (wfFlag == "EU" || wfInitiatedNo == "16A2" || wfInitiatedNo == "16A1") {
                busActionCalcCustEUPrices.execute(sku);
                busActionCalcCustUKPrices.execute(sku);
                busActionCalcCustGEPrices.execute(sku);
            }
        }
    }
    // STEP-6326 ends

    //Changes done for JP Regulation not populated story STEP-5774 Starts
    product.getValue("JP_Regulation").setSimpleValue(node.getValue("JP_Regulation").getSimpleValue());
    //Changes done for JP Regulation not populated story STEP-5774 Ends

    // STEP-5869 When there is SKU to send for regions set regional email flag on revision
    baSetRevRegEmailFlag.execute(node);


    try {
    	   //STEP-6465 Starts
        //baApproveProductObjects.execute(product);
        BA_ApproveRevisionObjects.execute(node);
        //STEP-6465 Ends

    } catch (e) {
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

//STEP-6152
if (node.getValue("Published_SKU_Price_Changed_YN").getSimpleValue() == "Y") {
    pricingQueue.queueDerivedEvent(ItemPriceUpdated, product);
    pricingQueueNPI.queueDerivedEvent(ItemPriceUpdated, product); //STEP-6747
}
}