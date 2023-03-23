/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_TechTransferCreateProdRevAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "TechTransferActions" ],
  "name" : "BA Tech Transfer Create Product Revision Action",
  "description" : "Creates Product,Product Revision and Masterstock from Tech Transfer data",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot", "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyProduct",
    "libraryAlias" : "BL_CopyProduct"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "lib_copy"
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
    "alias" : "techTransferRevisionCreated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "TechTransferRevisionCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApproveProdObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baTechTransferCreateAutoApproveRev",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_TechTransferCreateAutoApproveRev",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baUpdateChildSpeciesHomology",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Update_Child_Species_Homology",
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
    "alias" : "baTechTransferPassthroughAttributes",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Tech_Transfer_Passthrough_Attributes",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "noShippingLotMsgQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=No_Shipping_Lot_Msg_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "noShippingLotMsgEvent",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "NoShippingLotMessageUpdated",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,techTransferRevisionCreated,wipBFQueue,lookUp,baApproveProdObjects,webPassthroughChanges,productBGUpdatedQueue,baTechTransferCreateAutoApproveRev,baUpdateChildSpeciesHomology,autoApproveRevisionUpdated,autoApproveQueue,baTechTransferPassthroughAttributes,noShippingLotMsgQueue,noShippingLotMsgEvent,BL_AuditUtil,BL_CopyProduct,Lib,lib_copy,lib_maintwf,lib_tt) {
// BA_TechTransferCreateProdRevAction
// node: Current Object
// step: STEP Manager
// Lib: BL_Library,
// lib_tt: BL_TechTransfer
// techTransferRevisionCreated: TechTransferRevisionCreated (TechTransferRevisionCreated)
//wipBFQueue: Complete_Product_Product_Kit_WIPBF_JSON_OIEP (Complete_Product_and_Kit_WIPBF_JSON_OIEP)
//lookup:Lookup Table Home
// validity: Tech Transfer (Lot),Tech Transfer (Non Lot)

log.info("======================= START BA_TechTransferCreateProdRevAction for node: " + node.getName())

try {
    var bNewRevision = node.getValue("NewRevisionFlag_YN").getSimpleValue();
    var systemInitiatedWF = node.getValue("NewTechTransferFlag_YN").getSimpleValue();

    var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
    var systemInitiatedMessage = node.getValue("TechTransferInitiatedSystemMessage").getSimpleValue();

    var bNewMasterStock = node.getValue("NewMasterStockFlag_YN").getSimpleValue();
    var autoAddFlag = node.getValue("AUTOADD_YN").getSimpleValue();

    var customLotRevFlag = node.getValue("CustomLotRev_YN").getSimpleValue();

    var bLotManaged = node.getValue("LOTMANAGED_YN").getSimpleValue();

    var nProduct = node.getValue("PRODUCTNO").getSimpleValue(); // STEP-6175

    var prod = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct); // STEP-6175

    var ProdTeam_Planner_Product_chage = false; //STEP-6588

    log.info(" bNewProduct: " + bNewProduct);
    log.info(" bNewMasterStock: " + bNewMasterStock);
    log.info(" bNewRevision: " + bNewRevision);
    log.info(" systemInitiatedWF: " + systemInitiatedWF);
    log.info(" systemInitiatedMessage: " + systemInitiatedMessage);
    log.info(" customLotRevFlag: " + customLotRevFlag);
    log.info(" bLotManaged: " + bLotManaged);
    log.info(" nProduct: " + nProduct);

    if (bNewProduct == "Y") {
        log.info(" first if bNewProduct: " + bNewProduct);
        //1. create Product
        //2. create REV
        //3. create reference ProductRevision_to_TechTransfer
        //3a. move figure folder from TT to Product Revision
        //3b. copy figure links from previous Product Revision to new Product Revision
        //4. create Master Stock
        //5. create reference ProductRevision_To_MasterStock

        var sSubCategoryName = node.getValue("PRODUCTTYPE").getSimpleValue();
        log.info("BA_CreateRevisionMasterItemForLot: sSubCategoryName: " + sSubCategoryName);
        var sSubCategoryId = Lib.getSubCategory(sSubCategoryName, step);
        //this will be provided by Tech Transfer object
        if (sSubCategoryId) {
            var pSubCategory = step.getProductHome().getProductByID(sSubCategoryId);
        } else {
            var pSubCategory = step.getProductHome().getProductByID("Uncategorized_Products");
        }
        log.info("BA_CreateRevisionMasterItemForLot: pSubCategory: " + pSubCategory);

        var pCategory = pSubCategory.getParent();
        log.info("BA_CreateRevisionMasterItemForLot: pCategory: " + pCategory);
        var bKit = lib_tt.isKit(node);

        //************************
        //#1 create Product
        //************************
        //var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
        //var nProduct = node.getValue("PRODUCTNO").getSimpleValue(); // STEP-6165 moved up @l:27

        log.info("BA_CreateRevisionMasterItemForLot: nProduct: " + nProduct);

        var pProduct = lib_tt.createProduct(step, log, node, pSubCategory, bKit, bNewProduct);

        //STEP-6199
        lib_tt.createBiblioCitations(step, pProduct, node);
        //ENDS STEP-6199

        //STEP-6805 setting Apps_Species_DilutionFactor attribute for lot
        if (bLotManaged == "Y") {
            node.getValue("Apps_Species_DilutionFactor").setSimpleValue(lib_tt.getAppsForAppsSpeciesAttr(node) + "\n" + lib_tt.getSpeciesForAppsSpeciesAttr(step, node));
        }
        //STEP-6805 Ends

        //************************
        //#2 create REV
        //************************
        var pRevision = lib_tt.createRevision(step, node, pProduct, bNewProduct, nProduct, bKit, bNewRevision);

        //STEP-5929 & 6014
        //Add Audit Instance when revision is created to avoid null values for NPI
        BL_AuditUtil.createAuditInstanceID(pRevision);
        //STEP-5929


        //************************
        //#4 create Master Stock
        //************************
        var pMasterStock = lib_tt.createMasterStock(step, node, pProduct, bKit);

        //Product to REV reference  -> it supports WebUI user experience
        //#5 create reference ProductRevision_To_MasterStock
        //************************



        lib_tt.createReference_ProductRevision_To_MasterStock(step, node, pRevision, pMasterStock, wipBFQueue, techTransferRevisionCreated);


        var attribute_array = ['ACTIVITY', 'DIRECTIONS_FOR_USE', 'ENDOTOXIN', 'Fluorescent_Properties', 'FORMULATION', 'MOLECULAR_FORMULA', 'PRODUCTDESCRIPTION', 'PURITY', 'QUALITY_CONTROL', 'REAGENTS_NOT_SUPPLIED', 'Solubility', 'SOURCEPURIF', 'SPECIFSENSIV']

        for (var j = 0; j < attribute_array.length; j++) {
            var fieldcurrentValueRev = pRevision.getValue(attribute_array[j]).getSimpleValue();
            if (fieldcurrentValueRev != null && fieldcurrentValueRev != '') {
                fieldcurrentValueRev = htmlEntities(attribute_array[j], fieldcurrentValueRev);
                var fields = fieldcurrentValueRev.split('<br/>');
                var textFinal = '';
                for (var i = 0; i < fields.length; i++) {
                    if (i == 0) {
                        textFinal = textFinal + fields[i];
                    }
                    else {
                        textFinal = textFinal + "\n" + fields[i];
                    }
                }

                pRevision.getValue(attribute_array[j]).setSimpleValue(textFinal);

            }
        }

        /* var directionsForUse = pRevision.getValue('DIRECTIONS_FOR_USE').getSimpleValue;
         log.info('---pppppp-----'+directionsForUse);
         directionsForUse = bl_jsonCreation.htmlEntities('DIRECTIONS_FOR_USE',directionsForUse);
         pRevision.getValue('DIRECTIONS_FOR_USE').setSimpleValue(directionsForUse);
 
         var productdescription = pRevision.getValue('PRODUCTDESCRIPTION').getSimpleValue;
         log.info('---pppppp-----'+productdescription);
         productdescription = bl_jsonCreation.htmlEntities('PRODUCTDESCRIPTION',productdescription);
         pRevision.getValue('PRODUCTDESCRIPTION').setSimpleValue(productdescription);
      */

    } else if (bNewProduct == "N" && bNewMasterStock == "Y" && bNewRevision == "Y" && prod && prod.getValue("COPYTYPE").getSimpleValue() == "CarrierFree") { // STEP-6175
        //STEP-6625
        var parentProdNo = node.getValue("PARENT_PRODUCTNO").getSimpleValue();
        var parentProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", parentProdNo);
        var productNo = node.getValue("PRODUCTNO").getSimpleValue();
        var childProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);
        BL_CopyProduct.duplicateProduct(step, parentProduct, childProduct);
        //STEP-6625    	
        lib_tt.createRevisionCarrierFree(step = step,
            ttObject = node,
            wipBFQueue = wipBFQueue,
            techTransferRevisionCreated = techTransferRevisionCreated);

        //STEP-6588
        if (childProduct.getValue("ProdTeam_Planner_Product").getSimpleValue() != node.getValue("ProdTeam_Planner_Product").getSimpleValue()) {
            ProdTeam_Planner_Product_chage = true;
        }

    } else if (bNewProduct == "N" && bNewMasterStock == "Y" && bNewRevision == "Y" && autoAddFlag == "Y") {

        baTechTransferCreateAutoApproveRev.execute(node);

    } else if (bNewProduct == "N" && bNewMasterStock == "Y" && bNewRevision == "Y" && autoAddFlag != "Y") {
        // STEP-5834 adding branch for a new masterstock, where we need to initiate a maintenance
        // New master stock triggering a maintenance

        var productNo = node.getValue("PRODUCTNO").getSimpleValue();
        var product = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);

        if (product.isInWorkflow("Product_Maintenance_Upload") == false) {

            var maintenanceWFName;
            if (customLotRevFlag == "Y") {
                maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", "18");
            } else {
                maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", "12");
            }
            product.getValue("Workflow_Name_Initiated").setSimpleValue(maintenanceWFName);
            product.getValue("Workflow_Initiated_By").setSimpleValue("PDP/PLM");

            //STEP-6588
            if (product.getValue("ProdTeam_Planner_Product").getSimpleValue() != node.getValue("ProdTeam_Planner_Product").getSimpleValue()) {
                ProdTeam_Planner_Product_chage = true;
            }
            // create product to TT object reference
            product.createReference(node, "Product_To_Tech_Transfer");

            // STEP-6014 starts
            //Create Audit Instance ID
            BL_AuditUtil.createAuditInstanceID(product);
            //Changes done for STEP-6014 Ends

            //Drop a product into Product Maintenance Upload workflow
            product.startWorkflowByID("Product_Maintenance_Upload", "The product " + nProduct + " is now in the Product Maintenance Upload workflow.");

            // Trigger transition from the Initial state to the User/System Initiated Maintenance state 
            if (product.isInState("Product_Maintenance_Upload", "Initial")) {
                log.info("Triggering Submit for Maintenance other than Product Status Change");
                Lib.triggerTransition(product, "Start", "Product_Maintenance_Upload", "Initial")
            }

        } else {
            throw 'The product ' + nProduct + ' has already been sent to the User/System Initiated Maintenance queue.';
        }
        // STEP-5834 Ends

    } else if (bNewProduct == "N" && bNewMasterStock == "N" && bNewRevision == "Y" && systemInitiatedWF != "") {
        // STEP-5834 adding checking bNewMasterStock == "N"

        // STEP-5764 - a product will now land in the Product Maintenance Uplaod workflow instead of starting maintenance and creating a new reivision, remove baInitSourceFolder bind variable
        var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
        var pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
        var pProduct;
        log.info("pMasterStock " + pMasterStock);

        if (pMasterStock) {
            var pRevision = Lib.getLatestAssociatedRevision(pMasterStock);
            var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
            pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
            if (pRevision) {
                if (pProduct.isInWorkflow("Product_Maintenance_Upload") == false) {
                    var maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", systemInitiatedWF);
                    pProduct.getValue("Workflow_Name_Initiated").setSimpleValue(maintenanceWFName);
                    pProduct.getValue("Workflow_Initiated_By").setSimpleValue("PDP/PLM");

                    //STEP-6588
                    if (pProduct.getValue("ProdTeam_Planner_Product").getSimpleValue() != node.getValue("ProdTeam_Planner_Product").getSimpleValue()) {
                        ProdTeam_Planner_Product_chage = true;
                    }

                    // create product to TT object reference
                    pProduct.createReference(node, "Product_To_Tech_Transfer");

                    // STEP-6014 starts
                    //Create Audit Instance ID
                    BL_AuditUtil.createAuditInstanceID(pProduct);
                    //Changes done for STEP-6014 Ends

                    //Drop a product into Product Maintenance Upload workflow
                    pProduct.startWorkflowByID("Product_Maintenance_Upload", "The product " + nProduct + " is now in the Product Maintenance Upload workflow.");

                    // Trigger transition from the Initial state to the User/System Initiated Maintenance state 
                    if (pProduct.isInState("Product_Maintenance_Upload", "Initial")) {
                        log.info("Triggering Submit for Maintenance other than Product Status Change");
                        Lib.triggerTransition(pProduct, "Start", "Product_Maintenance_Upload", "Initial")
                    }

                } else {
                    throw 'The product ' + nProduct + ' has already been sent to the User/System Initiated Maintenance queue.';
                }
            } else {
                throw ("Unable to locate existing Product object. [" + nProduct + "]");
            }
        }
        //STEP-6121 Passthrough attributes
        baTechTransferPassthroughAttributes.execute(node);

    } else if ((bNewProduct == "N") && (bNewRevision == "N")) {
        //If No new Revision and No new Product ,set the new lot to current revision associated to Masterstock

        var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
        var pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
        log.info("pMasterStock " + pMasterStock);

        if (lib_tt.isKit(node)) {

            if (lib_tt.isComponentOrderChanged(step, node)) {

                lib_tt.changeCompomentsOrder(step, node);
            }
        }

        var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
        var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);

        var pHomologySpeciesType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_Species");
        //STEP-6396
        var pHomologySpeciesRefs = pProduct.queryReferences(pHomologySpeciesType);

        pHomologySpeciesRefs.forEach(function (pHomologySpeciesRef) {
            pHomologySpeciesRef.delete();
            return true;
        });
        //STEP-6396

        var lstHomologySpecies = node.getValue("HOMOLOGOUS_SPECIES").getValues();
        if (lstHomologySpecies) {
            //create product to species references for Homology
            var tmSpecies = new java.util.TreeMap();

            for (var i = 0; i < lstHomologySpecies.size(); i++) {
                var sSpeciesCode = lstHomologySpecies.get(i).getValue();
                var eSpecies = step.getNodeHome().getObjectByKey("SPECIESNO", sSpeciesCode);
                if (eSpecies == null)
                    throw ("Unable to locate existing Species object. [" + sSpeciesCode + "]");
                else {
                    var idxSpecies = eSpecies.getValue("SPECIESINDEX").getSimpleValue();
                    if (!idxSpecies)
                        idxSpecies = -1;
                    pProduct.createReference(eSpecies, "Product_To_Species");
                    tmSpecies.put(idxSpecies, eSpecies);
                }
            }

            var lst = tmSpecies.entrySet().toArray();

            //populate XRSpeciesCodes_String
            var lst = tmSpecies.entrySet().toArray();
            var sHomologySpeciesCodes;
            var sHomologySpeciesName;
            for (var j = 0; j < lst.length; j++) {
                var eSpecies = lst[j].getValue();
                var sSpeciesCode = eSpecies.getValue("SPECIESCODE").getSimpleValue();
                var sSpeciesName = eSpecies.getValue("SPECIES").getSimpleValue();
                if (j == 0) {
                    sHomologySpeciesCodes = sSpeciesCode;
                    sHomologySpeciesName = sSpeciesName;
                } else {
                    sHomologySpeciesCodes = sHomologySpeciesCodes + ", " + sSpeciesCode;
                    sHomologySpeciesName = sHomologySpeciesName + ", " + sSpeciesName;
                }
            }

            log.info("sHomologySpeciesCodes_String" + sHomologySpeciesCodes)
            log.info("sHomologySpeciesName_String" + sHomologySpeciesName)

            if (sHomologySpeciesCodes)
                pProduct.getValue("Homology_Species_Abbr_Str").setSimpleValue(sHomologySpeciesCodes);
            if (sHomologySpeciesName)
                pProduct.getValue("Homology_Species_NameStr").setSimpleValue(sHomologySpeciesName);
        }

        var pRevision = lib_maintwf.getCurrentRevision(pProduct);
        if (pRevision == null) {
            pRevision = lib_maintwf.getWIPRevision(pProduct);
        }

        if (pMasterStock) {
            //#3 create reference ProductRevision_to_TechTransfer to the lot
            pRevision.createReference(node, "ProductRevision_to_Lot");

            //STEP-6722 Starts - create reference ProductRevision_to_TechTransfer to the lot for revisions in Revision Release WF
            var revInRevReleaseWF = Lib.getRevisionsOfProductInWorkflow(pProduct, "Revision_Release_Workflow");

            if (revInRevReleaseWF.length != 0) {
                revInRevReleaseWF.forEach(function loop(rev) {

                    var revMasterStock = Lib.getMasterStockForRevision(step, rev);

                    if (revMasterStock.getID() == pMasterStock.getID()) {
                        rev.createReference(node, "ProductRevision_to_Lot");
                    }

                    return true;
                });
            }
            //STEP-6722 Ends

            //STEP-6255
            if (bLotManaged == "Y" &&
                node.getValue("LOTNO").getSimpleValue() == pProduct.getValue("Shipping_Lot_No").getSimpleValue()) {
                pProduct.getValue("No_Shipping_Lot_Msg").setSimpleValue(null);
                noShippingLotMsgQueue.queueDerivedEvent(noShippingLotMsgEvent, pProduct);
                log.info("Reseting No_Shipping_Lot_Msg on the product " + pProduct.getValue("PRODUCTNO").getSimpleValue());
            }

            //Approve Tech Transfer Object
            node.approve();

            //STEP-6121 Passthrough attributes
            baTechTransferPassthroughAttributes.execute(node);

            //Approve REvision Object
            baApproveProdObjects.execute(pRevision);
            //baApproveProdObjects.execute(pProduct);


        }

        // Update Child Products Homology and Species 
        baUpdateChildSpeciesHomology.execute(pRevision);

    }
    //STEP-6588  - setting "ProdTeam_Planner_Product" attr in the end - after passthrough attributes are set because there is 
    //approving product and this attribute "ProdTeam_Planner_Product" is not able to be reverted if cancel initiation or maintenance
    if (ProdTeam_Planner_Product_chage) {
        prod.getValue("ProdTeam_Planner_Product").setSimpleValue(node.getValue("ProdTeam_Planner_Product").getSimpleValue());
    }

    log.info("======================= DONE BA_TechTransferCreateProdRevAction for node: " + node.getName())
} catch (err) {
    throw err;
}


function htmlEntities(key, value) {
    var maskedValue = value;
    // adding formulation as a key here in order to resolve new lines in the FORMULATION attribute
    if ((key == "ACTIVITY" || key == "BSA_Milk_in_WB_Statement" || key == "Description" || key == "DIRECTIONS_FOR_USE" || key == "FORMULATION" ||
        key == "ORDERINGDETAILSSTATEMENT" || key == "PRODUCTBACKGROUND" || key == "SOURCEPURIF" || key == "SPECIFSENSIV" || key == "STORAGE" || key == "PRODUCTDESCRIPTION" || key == "ENDOTOXIN")) {
        if (value) {
            if (String(value).search('<lt/>a href=') > -1) { //STEP-6206
                maskedValue = String(value); //STEP-6206
            } else {
                maskedValue = String(value).split('<lt/>').join('<').split('<gt/>').join('>');
            }
            maskedValue = maskedValue.replace(/\n/g, '<br/>');
            maskedValue = replaceSymbol(maskedValue)

        }
    }

    if ((key == "PRODUCTNAME" || key == "Figure_Caption" || key == "Figure_Image_Caption" || key == "Image_Caption")) {
        if (value) {
            maskedValue = String(value);
            maskedValue = maskedValue.replace(/[™®©℠]/g, '<sup>$&</sup>')
            maskedValue = maskedValue.replace(/<sup><sup>/gm, '<sup>')
            maskedValue = maskedValue.replace(/<\/sup><\/sup>/gm, '</sup>')
            maskedValue = maskedValue.replace(/<lt\/>sup<gt\/>/gm, '')
            maskedValue = maskedValue.replace(/<lt\/>\/sup<gt\/>/gm, '')
            maskedValue = replaceSymbol(String(maskedValue))
            maskedValue = replaceTrademarkSymbol(String(maskedValue))
        }
    }

    // STEP-5830
    if (key == "DIRECTIONS_FOR_USE" || key == "FORMULATION" || key == "STORAGE") {
        if (value) {
            const match = value.match(/(<PRODUCTDETAILPAGE target=\"(.*?)[\/]?[0-9]{4,}\">)/gi);

            if (match) {
                maskedValue = maskedValue.toString();

                for (var i = 0; i < match.length; i++) {
                    maskedValue = maskedValue.replace(match[i], "<a href=\"/product/productDetail.jsp?productId=" + match[i].match(/[0-9]{4,}/) + "\">");
                }
            }

            const matchEndTag = maskedValue.match(/(<\/PRODUCTDETAILPAGE>)/gi);

            if (matchEndTag) {
                for (var i = 0; i < matchEndTag.length; i++) {
                    maskedValue = maskedValue.replace(matchEndTag[i], "</a>");
                }
            }

            //STEP-6407
            const matchFullUrl = maskedValue.match(/<FULLURL target=/gi);

            if (matchFullUrl) {
                maskedValue = maskedValue.toString();

                for (var i = 0; i < matchFullUrl.length; i++) {
                    maskedValue = maskedValue.replace(matchFullUrl[i], "<a href=")
                }

                const matchFullUrlEnd = maskedValue.match(/<\/FULLURL>/gi);

                if (matchFullUrlEnd) {
                    for (var i = 0; i < matchFullUrlEnd.length; i++) {
                        maskedValue = maskedValue.replace(matchFullUrlEnd[i], "</a>")
                    }
                }
            }
            //END STEP-6407

            maskedValue = maskedValue.replace(/\n/g, '<br/>');
        }
    }

    return maskedValue;
}

function replaceSymbol(str) {
    var strMatch = str.match(/(<)([α-ωΑ-Ω]+)(\/>)/g)
    //log.info("strMatch"+strMatch)
    if (strMatch != null) {

        var strMatchList = strMatch;
        for (key in strMatchList) {
            // log.info(key);
            // log.info(strMatchList[key].match(/<([α-ωΑ-Ω]+)\/>/)[1]);
            str = str.replace(strMatchList[key], strMatchList[key].match(/<([α-ωΑ-Ω]+)\/>/)[1]);
        }
    }
    return str;
}

function replaceTrademarkSymbol(str) {
    str = str.replace(/<([R]+)\/>/g, '®')
    str = str.replace(/<([C]+)\/>/g, '©')
    str = str.replace(/<([DegS]+)\/>/g, '°')
    str = str.replace(/<([DaS]+)\/>/g, '†')
    str = str.replace(/<([DdS]+)\/>/g, '‡')
    str = str.replace(/<([TS]+)\/>/g, '™')
    return str;
}

// To merge Json (dictionaries) Objects
function mergeJsonObjects(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}
}