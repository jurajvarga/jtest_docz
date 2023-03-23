/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CompleteOIEP_Preview_JSON_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Preview_Revision" ],
  "name" : "BA_CompleteOIEP_Preview_JSON_Formatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "Product", "Product_Kit", "Product_Revision" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_Maintenance"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation,BL_Library,BL_Maintenance) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult

Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType, actualRevision) {

    var mesg = {};
    // STEP-6286
    var notify = false;

    //If the Object is Product Revision/Kit Revision/Equipment_Revision ,get Parent.
    // STEP-6513
    var checkServiceRevision = true;
    if (BL_Library.isRevisionType(node, checkServiceRevision)) {
        node = node.getParent();
    }

    var kit = false;
    if (node.getObjectType().getID().equals("Product_Kit") || node.getObjectType().getID().equals("Kit_Revision")) {
        kit = true;
    }

    mesg.eventid = simpleEventType.getID() + "";

    var productstepid = node.getID() + "";
    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;



    //To Get Product Attributes
    var prodAttrJson = BL_JSONCreation.getObjectAttributesJson(node, false);

    mesg = BL_JSONCreation.mergeJsonObjects(mesg, prodAttrJson);

    var mss = [];
    var revs = []; // STEP-5961
    var currentRevision = BL_Maintenance.getCurrentRevision(node); // STEP-5961
    var wipRevision = BL_Maintenance.getWIPRevision(node); // STEP-5961

    var children = node.getChildren();
    for (i = 0; i < children.size(); i++) {

        var child = children.get(i);
        var childId = child.getObjectType().getID();
        //log.info("childId"+childId);
        if (childId == "MasterStock") {
            //To get Child Main Attributes
            var chJson = BL_JSONCreation.getObjectAttributesJson(child, false);

            var mssrevisionid = child.getID() + "";
            chJson["MASTERSTOCKSTEPID"] = mssrevisionid;


            //To Get Child of Child Values
            var gcl = [];
            var gcnameid = "";
            var grandchild = child.getChildren();
            for (j = 0; j < grandchild.size(); j++) {
                var gcobj = grandchild.get(j);

                var gcId = gcobj.getObjectType().getID();
                //log.info(" gcId "+gcId);
                gcnameid = gcId + "s";

                var skuid = gcobj.getID() + "";
                //logger.info("  skuid "+skuid);

                // json with SKU attributes
                var jsonGC = BL_JSONCreation.getObjectAttributesJson(gcobj, false);

                jsonGC["SKUSTEPID"] = skuid;
                gcl.push(jsonGC);

            }

            chJson[gcnameid] = gcl;
            mss.push(chJson);
            mesg[childId] = mss;
        }

        // STEP-5961
        if (BL_Library.isRevisionType(child, checkServiceRevision)) {
            var revision = {};
            revision["REVISIONNO"] = child.getValue("REVISIONNO").getSimpleValue() + "";
            revision["REVISIONSTATUS"] = child.getValue("REVISIONSTATUS").getSimpleValue() + "";

            var currentOrWipFlag = "";
            if(currentRevision && currentRevision.getName() == child.getName()) {
                currentOrWipFlag = "Current";
            }
            else if (wipRevision && wipRevision.getName() == child.getName()) {
                currentOrWipFlag = "WIP";
            }
            
            revision["Current_WIP_Flag"] = currentOrWipFlag;
            revision["Lots"] = BL_JSONCreation.getLots(manager, child, ["LOTNO", "LAR_Approved_Date", "Lot_Recombinant_Flag"]); // STEP-5824, STEP-6586
            revs.push(revision);
            mesg["All_Revisions"] = revs;
        }
    }
    //executionReportLogger.logInfo (" gcnameid "+gcnameid);


    // To get an alternate product
    var altprod = BL_JSONCreation.getAlternateProduct(manager, node);


    var krs = []; //kit revision sku
    //var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");

    //var prodCurRevReferences = node.getReferences__(prodCurRevReferenceType);
    var currev = [] //currev array
    //for (var j = 0; j < prodCurRevReferences.size(); j++) {

    var prodCurRevnode = actualRevision; //prodCurRevReferences.get(j).getTarget();
    //logger.info(" prodCurRevnode "+prodCurRevnode);

    var prodCurRevnodeID = prodCurRevnode.getID() + "";
    executionReportLogger.logInfo("mb prodCurRevnodeID: " + prodCurRevnodeID);

    //To Build SDS Links
    var sdslinks = []
    var prodCurRevchildren = prodCurRevnode.getChildren();
    for (i = 0; i < prodCurRevchildren.size(); i++) {

        var prodCurRevchild = prodCurRevchildren.get(i);
        var prodCurRevchildId = prodCurRevchild.getObjectType().getID();
        logger.info(" prodCurRevchildId " + prodCurRevchildId);
        if (prodCurRevchildId == "SDS_ASSET_URL_LINK") {

            var sdslinksJson = {}

            var sdsname = prodCurRevchild.getName() + "";

            //logger.info("  sdsname "+sdsname);

            sdslinksJson["Name"] = sdsname;

            //To get Child Main Attributes
            var setAttrSDS = prodCurRevchild.getValues();
            var itSDS = setAttrSDS.iterator();

            while (itSDS.hasNext()) {
                var attrValueSDS = itSDS.next();
                var attributeSDS = "";

                attributeSDS = attrValueSDS.getAttribute();
                attributeID = attributeSDS.getID();

                if (attributeID == "SDS_Link_URL" || attributeID == "SDS_Language" || attributeID == "PRODUCTNO" || attributeID == "Doc_Revision_No" || attributeID == "SDS_Subformat" ||
                    attributeID == "Plant" || attributeID == "SDS_Link_Status_CD" || attributeID == "REVISIONNO" || attributeID == "SDS_Format") {
                    var attValSDS = attrValueSDS.getSimpleValue() + "";
                    sdslinksJson[attributeSDS.getID()] = attValSDS;

                    //	logger.info("  "+attributeSDS.getName()+" = "+attValSDS);
                }

            }

            sdslinks.push(sdslinksJson);
        }

    }

    if (sdslinks.length == 0) {
        sdslinks = [{}];
    }


    //To get Application Protocol Information
    var appprotocol = []
    var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    var revAplicationProtocolReferences = prodCurRevnode.getClassificationProductLinks(refType);
    //logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());

    for (var i = 0; i < revAplicationProtocolReferences.size() > 0; i++) {
        var appProtocolJson = BL_JSONCreation.createAppProtocolJsonElement(revAplicationProtocolReferences, i);

        appprotocol.push(appProtocolJson);
    }

    if (appprotocol.length == 0) {
        appprotocol = [{}];
    }


    //To Get Tech Transfer Lot  Information
    var techtranslot = BL_JSONCreation.getLots(manager, prodCurRevnode);


    //To Get companion Product
    var compprod = BL_JSONCreation.getCompanionProduct(manager, node);


    //To get Asset Information
    var asset = []
    var prodfigs = []


    //Logic Followed to Get Product Figures and Product Revision Figures is as follows

    //Product Figures -> Images without Application and  Protocol No is related to product figures
    //Product Revision Figures -> Images without Application or  Protocol No is related to product  revision figures


    //To Get Figures and datasheet from revision
    var pubImgRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
    if (pubImgRefType != null) {
        var pubImgLinks = prodCurRevnode.queryReferences(pubImgRefType); //STEP-6396
        pubImgLinks.forEach(function(ref) { //STEP-6396
            var assetJson = {}
            var aImageTarget = ref.getTarget(); //STEP-6396
            var aFigureStatus = "";
            var aFigureHeading = "";
            var imgClassList = aImageTarget.getClassifications().toArray();
            if (imgClassList != null) {
                aFigureStatus = imgClassList[0].getValue("Figure_Status").getSimpleValue() + "";
            }
            var aImageStatus = aImageTarget.getValue("Image_Status").getSimpleValue() + "";
            var aImageTargetObjectID = aImageTarget.getObjectType().getID();

            assetJson["Figure_Object_Type"] = aImageTargetObjectID + "";
            assetJson["Is_Component_Asset"] = "N";
            assetJson["Figure_Status"] = aFigureStatus;

            if (aImageStatus == "Active") {

                //To Get Attributes for Assets
                var assetSystemAttrJson = BL_JSONCreation.getObjectAttributesJson(aImageTarget, false);
                assetJson = BL_JSONCreation.mergeJsonObjects(assetJson, assetSystemAttrJson);

                //To Get System Attibutes for Assets
                var assetSystemAttrJson = BL_JSONCreation.getObjectAttributesJson(aImageTarget, true);
                assetJson = BL_JSONCreation.mergeJsonObjects(assetJson, assetSystemAttrJson);

                asset.push(assetJson);
            }
            return true; //STEP-6396
        });
    }


    //To Get Datasheet
    var pubImgRefTypeDS = manager.getReferenceTypeHome().getReferenceTypeByID("DataSheet");
    if (pubImgRefTypeDS != null) {
        var pubImgLinksDS = prodCurRevnode.queryReferences(pubImgRefTypeDS);//STEP-6396
        pubImgLinksDS.forEach(function(ref) {    //STEP-6396
            var assetJson = {}
            var aImageTargetDS = ref.getTarget(); //STEP-6396
            var aFigureStatusDS = "";
            var imgClassListDS = aImageTargetDS.getClassifications().toArray();
            if (imgClassListDS != null) {
                aFigureStatusDS = imgClassListDS[0].getValue("Figure_Status").getSimpleValue() + "";
            }
            var aImageStatusDS = aImageTargetDS.getValue("Image_Status").getSimpleValue() + "";
            var aImageTargetDSObjectID = aImageTargetDS.getObjectType().getID();

            assetJson["Figure_Object_Type"] = aImageTargetDSObjectID + "";
            assetJson["Approved_DS_Name"] = productno + ".pdf";
            assetJson["Figure_Status"] = aFigureStatusDS;

            if (aImageStatusDS == "Active") {

                //To Get Attributes for Assets
                var assetAttrJson = BL_JSONCreation.getObjectAttributesJson(aImageTargetDS, false);
                assetJson = BL_JSONCreation.mergeJsonObjects(assetJson, assetAttrJson);

                //To Get System Attibutes for Assets
                var assetSystemAttrJson = BL_JSONCreation.getObjectAttributesJson(aImageTargetDS, true);
                assetJson = BL_JSONCreation.mergeJsonObjects(assetJson, assetSystemAttrJson);

                asset.push(assetJson);

            }
            return true; //STEP-6396
        });
    }



    //// To Get Entity - Target & Species

    var entity = [];
    var entityJson = {};

    //To Get Homology Species
    var SpeciesHomologyArray = BL_JSONCreation.getSpeciesHomology(manager, node);

    entityJson["SpeciesHomology"] = SpeciesHomologyArray;


    //To Get Target
    var targetArray = BL_JSONCreation.getTargets(manager, prodCurRevnode);

    entityJson["targets"] = targetArray;


    //To Get Species
    var speciesArray = BL_JSONCreation.getSpecies(manager, prodCurRevnode);

    entityJson["species"] = speciesArray;


    // Entity
    entity.push(entityJson);


    //var prodCurRevTargetName = prodCurRevnode.getName() + "";
    // executionReportLogger.logInfo (" prodCurRevTargetName "+prodCurRevTargetName);


    if (kit) {


        //Get All SKU Objects
        var kitComponents = new java.util.TreeMap();

        var kitRevskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
        var kitRevskuReferences = prodCurRevnode.queryReferences(kitRevskuReferenceType); //STEP-6396
        kitRevskuReferences.forEach(function(ref) {    //STEP-6396

            var kitRevSkuNode = ref.getTarget(); //STEP-6396
            // executionReportLogger.logInfo ( " kitRevSkuNode "+kitRevSkuNode);

            var kitRevSkuName = kitRevSkuNode.getName() + "";
            //executionReportLogger.logInfo ( " kitRevSkuName "+kitRevSkuName);

            kitComponents.put(kitRevSkuName, kitRevSkuNode)
            
            return true; //STEP-6396
        });
        // executionReportLogger.logInfo ( " size "+kitComponents.size());



        //Get Kit SKU attributes

        var curRevKitCompChildList = prodCurRevnode.getChildren();
        // executionReportLogger.logInfo ( " size "+curRevKitCompChildList.size());
        for (var i = 0; i < curRevKitCompChildList.size(); i++) {
            var curRevKitCompChild = curRevKitCompChildList.get(i);
            if (curRevKitCompChild.getObjectType().getID() == "Kit_Component") {

                var componentSku = curRevKitCompChild.getValue("COMPONENTSKU").getSimpleValue();

                var licenseOnlyFlag = curRevKitCompChild.getValue("LICENSINGONLYFLAG_YN").getSimpleValue();
                var promotionOnlyFlag = curRevKitCompChild.getValue("PROMOTIONONLY_YN").getSimpleValue();


                //executionReportLogger.info(" Component SKU "+componentSku +" licenseOnlyFlag "+licenseOnlyFlag+" promotionOnlyFlag "+promotionOnlyFlag);

                if (licenseOnlyFlag == "N" && promotionOnlyFlag == "N") {

                    var kitRevSkuTargetNode = kitComponents.get(componentSku);
                    if (kitRevSkuTargetNode != null) {
                        //executionReportLogger.logInfo (" kitRevSkuTargetNode "+kitRevSkuTargetNode);

                        //To get Kit SKU attributes
                        var ksJson = BL_JSONCreation.getObjectAttributesJson(kitRevSkuTargetNode, false);


                        //To Get Application Protocol for Kit Component
                        var skuappProt = BL_JSONCreation.buildAppProtocol(manager, kitRevSkuTargetNode.getParent().getParent());
                        //executionReportLogger.logInfo ( " skuappProt "+skuappProt.length);

                        var skuappProtArray = [];
                        for (var key in skuappProt) {
                            var value = skuappProt[key];
                            var skuappprotJson = {}
                            for (var key1 in value) {
                                var value1 = value[key1];
                                skuappprotJson[key1] = value1;
                                //executionReportLogger.logInfo ( " skuappProtArray1 "+key1+" =" +value1);
                            }
                            skuappProtArray.push(skuappprotJson);
                        }
                        //executionReportLogger.logInfo ( " skuappProtArray1 2 "+skuappProtArray);
                        ksJson["ApplicationProtocol"] = skuappProtArray;

                        var skuTTLot = BL_JSONCreation.buildKitTechTransferLot(manager, kitRevSkuTargetNode.getParent().getParent());
                        // executionReportLogger.logInfo ( " skuTTLot "+skuTTLot.length);


                        var skuTTLotArray = [];
                        for (var key in skuTTLot) {
                            var value = skuTTLot[key];
                            var skuTTLotJson = {}
                            for (var key2 in value) {
                                var value2 = value[key2];
                                skuTTLotJson[key2] = value2;
                                //executionReportLogger.logInfo ( " skuTTLotJson "+key2+" =" +value2);
                            }
                            skuTTLotArray.push(skuTTLotJson);
                        }
                        //executionReportLogger.logInfo ( " skuTTLotArray 2 "+skuTTLotArray);
                        ksJson["TechTransferLot"] = skuTTLotArray;

                        //To Get SKU Assets
                        var skuAssets = BL_JSONCreation.buildSKUAssets(manager, kitRevSkuTargetNode.getParent().getParent());
                        for (var key in skuAssets) {
                            var skuAssetObj = skuAssets[key];
                            var assetJson = {}

                            for (var skuAssetKey in skuAssetObj) {
                                var skuAssetVal = skuAssetObj[skuAssetKey];
                                assetJson[skuAssetKey] = skuAssetVal;

                            }
                            asset.push(assetJson);
                        }


                        var curRevKitCompChildValues = curRevKitCompChild.getValues();
                        var itKCVal = curRevKitCompChildValues.iterator();
                        while (itKCVal.hasNext()) {
                            var attrValueKCVal = itKCVal.next();
                            var attributeKCVal = "";
                            if (attrValueKCVal != null) {
                                attributeKCVal = attrValueKCVal.getAttribute();
                                var attributeID = attributeKCVal.getID();
                                //STEP-6759 attributeID == "COMPONENTINDEX" => "COMPONENTORDER"
                                if (attributeID == "PROMOTIONONLY_YN" || attributeID == "COMPONENTORDER" || attributeID == "SolutionColor" || attributeID == "LICENSINGONLYFLAG_YN" || attributeID == "COMPONENTCOUNT" ||
                                    attributeID == "COMPONENTSKUNAME" || attributeID == "COMPONENTPARENTKITSKU" || attributeID == "LabelNameOverride" || attributeID == "CapColor") {
                                    var attValKCVal = "";
                                    if (attrValueKCVal.getSimpleValue() != null) {
                                        attValKCVal = attrValueKCVal.getSimpleValue() + "";
                                        //executionReportLogger.logInfo (" *************** "+attributeKCVal.getID()+" "+attValKCVal);
                                        ksJson[attributeKCVal.getID()] = attValKCVal;
                                    }
                                }
                            }
                        }

                        
                        var kitComponentCurrRev = BL_Maintenance.getCurrentRevision(kitRevSkuTargetNode.getParent().getParent());

                        if (kitComponentCurrRev) {
                            ksJson["GENERALSTATEMENT"] = kitComponentCurrRev.getValue("GENERALSTATEMENT").getSimpleValue() + "";
                            ksJson["LEGALSTATEMENT"] = kitComponentCurrRev.getValue("LEGALSTATEMENT").getSimpleValue() + "";
                            ksJson["ORDERINGDETAILSSTATEMENT"] = kitComponentCurrRev.getValue("ORDERINGDETAILSSTATEMENT").getSimpleValue() + "";
                            ksJson["TRADEMARKSTATEMENT"] = kitComponentCurrRev.getValue("TRADEMARKSTATEMENT").getSimpleValue() + "";
                        }
                        else {
                            ksJson["GENERALSTATEMENT"] = "null";
                            ksJson["LEGALSTATEMENT"] = "null";
                            ksJson["ORDERINGDETAILSSTATEMENT"] = "null";
                            ksJson["TRADEMARKSTATEMENT"] = "null";
                        }

                        krs.push(ksJson);
                    }
                }
            }
        }

        mesg["KitRevisionToSKU"] = krs;
    }

    //Logic to add product figures if there is no application and no protocol
    for (var i = 0; i < asset.length; i++) {
        var assetJsonObj = asset[i];
        var assetFigKey = assetJsonObj.Figure_Key;
        var assetAppType = (assetJsonObj.Figure_Image_Application_Type === null || assetJsonObj.Figure_Image_Application_Type === 'null' || typeof assetJsonObj.Figure_Image_Application_Type === 'undefined' || assetJsonObj.Figure_Image_Application_Type == '') ? true : false;

        var assetProtNo = (typeof assetJsonObj.PROTOCOLNO === 'undefined') ? true : false;

        executionReportLogger.logInfo(" assetFigKey " + assetFigKey + " assetAppType  " + assetAppType + " assetProtNo " + assetProtNo);
        if (assetAppType && assetProtNo) {
            if (assetFigKey != null) {
                if (assetFigKey.indexOf("_ds") > 0 && assetFigKey.indexOf(productno) === 0) {
                    executionReportLogger.logInfo(" assetFigKey " + assetFigKey);
                    if (prodfigs.indexOf(assetFigKey) === -1) {
                        prodfigs.push(assetFigKey);
                    }
                } else if (assetFigKey.indexOf("_ds") === -1) {
                    executionReportLogger.logInfo(" assetFigKey Image " + assetFigKey);
                    if (prodfigs.indexOf(assetFigKey) === -1) {
                        prodfigs.push(assetFigKey);
                    }
                }
            }
        }
    }


    //Initialize Asset array if nothing present for Boomi
    if (asset.length == 0) {
        asset = [{}];
    }

    //Get  Attributes in current Revision
    //To get Current Revision  Attributes
    var crtarget = BL_JSONCreation.getObjectAttributesJson(prodCurRevnode, false);

    var prodCurRevname = prodCurRevnode.getName() + "";
    var masterStockStepID = BL_JSONCreation.getProductRevision_To_MasterStock(manager, prodCurRevnode, notify);

    crtarget["name"] = prodCurRevname;
    crtarget["PRODUCTSTEPID"] = productstepid;
    crtarget["PRODUCTNO"] = productno;
    crtarget["REVISIONID"] = prodCurRevnodeID;
    crtarget["ProductRevision_To_MasterStock"] = masterStockStepID;
    crtarget["Rev_Product_Figures"] = prodfigs;

    currev.push(crtarget);
    //}

    var assetUniqueFkeys = [];
    var assetUniqueList = [];
    if (asset != null) {
        if (asset.length > 0) {
            //There are scenarios Kit SKU is multiple,for these SKUs we need to have unique asset.
            for (var i = 0; i < asset.length; i++) {
                if (assetUniqueFkeys.indexOf(asset[i].Figure_Key) === -1) {
                    assetUniqueFkeys.push(asset[i].Figure_Key);
                    assetUniqueList.push(asset[i]);
                }
            }
        }
    }

    //STEP-5861
    if (prodCurRevnode.getValue("Workflow_No_Initiated").getSimpleValue() == "20") {
        mesg.PRODUCTNAME = prodCurRevnode.getValue("PRODUCTNAME").getSimpleValue();
    }

    mesg.SDSLinks = sdslinks;
    mesg.AlternateProduct = altprod;
    mesg.CompanionProduct = compprod;
    mesg.ApplicationProtocol = appprotocol;
    mesg.Asset = assetUniqueList;
    mesg.ProductToWIPRevision = currev;
    mesg.TechTransferLot = techtranslot;
    mesg.Entity = entity;

    return mesg;
};

//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();
//var nodeActualRev = node; //STEP-6160

if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null &&
        (node.getObjectType().getID().equals("Product_Kit") || node instanceof com.stibo.core.domain.Product ||
        node.getObjectType().getID().equals("Equipment") || BL_Library.isRevisionType(node, checkServiceRevision))
    ) {
    //executionReportLogger.logInfo(" Product Kit ");
    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        //STEP-6396
        var revPrm = node;
        var checkServiceConjugates = false;
        if (BL_Library.isProductType(node, checkServiceConjugates)) {
            revPrm = BL_Maintenance.getCurrentRevision(node) || node; 
        }
        //STEP-6396

        mesgfinal = Object.buildNodeMessage(node, simpleEventType, revPrm);
    }
    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
}
}