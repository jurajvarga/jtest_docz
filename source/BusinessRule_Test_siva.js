/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_siva",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_Siva",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,lookup,BL_CopyRevision,BL_Library,BL_MaintenanceWorkflows,libWF) {
var productno = node.getValue("PRODUCTNO").getValue();
//var shippingLotNo = node.getValue("Shipping_Lot_No").getValue();
var shippingLotNo = "17";

log.info("BA_Switch_Cur_Rev_On_Shipping_Lot_Change *** Starting current revision switcher based on shipping lot for product no " + productno);

if (productno) {
    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productno);

    // Current revision switching logic based on shipping lot is applied only for existing lot managed products
    if (product && product.getValue("LOTMANAGED_YN").getSimpleValue() == "Y") {

        var bCurrentRevHasShippingLot = false;

        var curRev = BL_MaintenanceWorkflows.getCurrentRevision(product);

        var curRevMasterStock;

        if (curRev) {

            // Get the master stock bound to a current revision
            curRevMasterStock = BL_Library.getMasterStockForRevision(manager, curRev);

            if (!curRevMasterStock) {
                throw ("The current revision " + curRev.getName() + " is missing reference to a master stock.");
            }
            log.info(curRevMasterStock.getName());

            // Checking lot numbers in lots bound to a revision includes shipping lot no
            bCurrentRevHasShippingLot = BL_Library.revisionContainsShippingLot(manager, curRev, shippingLotNo);


            log.info("Shipping lot no for product " + productno + " : " + shippingLotNo);
            log.info("bCurrentRevHasShippingLot: " + bCurrentRevHasShippingLot);

            if (bCurrentRevHasShippingLot) {
                // End here if current rev has shipping lot
                // STEP-5856
                product.getValue("No_Shipping_Lot_Msg").setSimpleValue(null);
                //noShippingLotMsgQueue.queueDerivedEvent(noShippingLotMsgEvent, product);
                log.info("The current revision of product " + productno + " is bound to Shipping Lot, no current revision switch needed.")

                // STEP-5959
                //if(!product.isInWorkflow("Product_Maintenance_Upload") && BL_MaintenanceWorkflows.getWIPRevision(product) == null) {
                //BA_Approve.execute(product);
                //}
            } else {
                // Looking for a highest revision in the Revision Release Workflow with lot no same as shipping lot no

                var revsInRevReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Revision_Release_Workflow");

                var highestRevWithShippingLot;
                var highestRevNoWithShippingLot = -1;

                for (var i = 0; i < revsInRevReleaseWF.length; i++) {

                    var rev = revsInRevReleaseWF[i];
                    // Skip revision if masterstock bound to revision is other than master stock bound to current revision 
                    if (BL_Library.getMasterStockForRevision(manager, rev) && BL_Library.getMasterStockForRevision(manager, rev).getName() != curRevMasterStock.getName()) {
                        continue;
                    }

                    var bRevHasShippingLot = BL_Library.revisionContainsShippingLot(manager, rev, shippingLotNo);

                    if (bRevHasShippingLot) {
                        if (parseInt(rev.getValue("REVISIONNO").getSimpleValue()) > highestRevNoWithShippingLot) {
                            highestRevNoWithShippingLot = parseInt(rev.getValue("REVISIONNO").getSimpleValue());
                            highestRevWithShippingLot = rev;
                        }
                    }
                }

log.info("Setting highestRevWithShippingLot 1 " +highestRevWithShippingLot); 
                if (highestRevWithShippingLot) {
                    
                    log.info("Setting the revision " + highestRevWithShippingLot.getName() + " as a current revision.");

                    // Set date if empty
                    var makeRevEffectiveDate = highestRevWithShippingLot.getValue("MakeRevisionEffectiveDate").getSimpleValue();
                    if (!makeRevEffectiveDate) {
                        var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
                        var today = isoDateFormat.format(new Date());
                        highestRevWithShippingLot.getValue("MakeRevisionEffectiveDate").setSimpleValue(today);
                    }

                    //BA_Update_Child_Species_Homology.execute(highestRevWithShippingLot);
                   // BA_Set_Revision_Release_Status.execute(highestRevWithShippingLot);

                   // noShippingLotMsgQueue.queueDerivedEvent(noShippingLotMsgEvent, product);

                } else {
                    // Looking for a highest approved revision with lot no same as shipping lot no
                    var revs = BL_Library.getRevisions(product);
                    //log.info(revs);

                     //Remove if the Revision is in Product Release workflow (scenario like OTS Conversion Revision in Product Release workflow should not switch ) - ITSM-14168 Starts
			        for (var j = 0; j < revs.size(); j++) {
			
			        var prodRev = revs.get(j);
			        if (prodRev.isInWorkflow("Product_Release_Workflow")){
			                revs.remove(j);
			            }
			        
			        }
			        //Remove if the Revision is in Product Release workflow (scenario like OTS Conversion Revision in Product Release workflow should not switch ) - ITSM-14168 Ends

                    highestRevNoWithShippingLot = -1;
                    //log.info("### Debugging")

                    for (var i = 0; i < revs.size(); i++) {

                        var rev = revs.get(i);

                        // Skip revision if masterstock bound to revision is other than master stock bound to current revision 
                        if (BL_Library.getMasterStockForRevision(manager, rev) && BL_Library.getMasterStockForRevision(manager, rev).getName() != curRevMasterStock.getName()) {
                            continue;
                        }

                        //STEP-6429 In-process revisions should not be set as current by Current Revision Switcher Logig
                        if (rev.getValue("REVISIONSTATUS").getSimpleValue() == "Canceled" || rev.getValue("REVISIONSTATUS").getSimpleValue() == "In-process") {
                            continue;
                        }

                        var bRevHasShippingLot = BL_Library.revisionContainsShippingLot(manager, rev, shippingLotNo);

                        if (bRevHasShippingLot) {

                            if (parseInt(rev.getValue("REVISIONNO").getSimpleValue()) > highestRevNoWithShippingLot) {
                                highestRevNoWithShippingLot = parseInt(rev.getValue("REVISIONNO").getSimpleValue());
                                highestRevWithShippingLot = rev;
                            }
                        }
                    }

                    
log.info("Setting highestRevWithShippingLot 2 " +highestRevWithShippingLot); 

                    //log.info("highestRevWithShippingLot: " + highestRevWithShippingLot.getName());

                    if (highestRevWithShippingLot) {
                        // If there is an approved revision with the shipping lot, make the highest one of them as current
                        log.info("Setting the revision " + highestRevWithShippingLot.getName() + " as a current revision.");
                        product.getValue("No_Shipping_Lot_Msg").setSimpleValue(null);

                      //  BA_Update_Child_Species_Homology.execute(highestRevWithShippingLot);
                      //  BA_SetCurrentRevRelease.execute(highestRevWithShippingLot);

                     //   productQueue.queueDerivedEvent(currentRevisionUpdated, product); //Complete_Product_Product_Kit_JSON_OIEP (OB_PRODUCT_JSON_TEST)
                        //webCategoryQueue.queueDerivedEvent(currentRevisionUpdated, product); //Product_ProductKit_Web_Category_JSON_OIEP (OB_PRODUCT_CATEGORY_JSON_EP)
                     //   noShippingLotMsgQueue.queueDerivedEvent(noShippingLotMsgEvent, product);

                        log.info("The new current revision " + BL_MaintenanceWorkflows.getCurrentRevision(product).getName() + " has been set.");

                    } else {
                        //var message = "There is no revision bound to a lot with lot number same as shipping lot for the product no " + productno + " and masterstock " + curRevMasterStock.getName() + ".";
                        var message = "Product no " + productno + ", masterstock " + curRevMasterStock.getName() + " doesn’t have lot # " + shippingLotNo + " in STEP." // STEP-6103
                        //log.info(message); // add product number here too <----------- !!!!!!!!
                        var productApprovalState = product.getApprovalStatus();
                        //log.info("isProductApproved: " + isProductApproved);
                        product.getValue("No_Shipping_Lot_Msg").setSimpleValue(message);
                     //   noShippingLotMsgQueue.queueDerivedEvent(noShippingLotMsgEvent, product);

                        // STEP-5959
                        //if(!product.isInWorkflow("Product_Maintenance_Upload") && BL_MaintenanceWorkflows.getWIPRevision(product) == null) {
                    //    BA_Approve.execute(product);
                        //}
                    }
                }
            }
        } else {
            log.info("No current revision for a product no " + productno + ".");
        }
    }
    log.info("No_Shipping_Lot_Msg : " + product.getValue("No_Shipping_Lot_Msg").getSimpleValue());
}

log.info("BA_Swtich_Cur_Rev_On_Shipping_Lot_Change *** end ");
}