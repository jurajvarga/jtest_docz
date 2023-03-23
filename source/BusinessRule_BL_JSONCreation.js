/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_JSONCreation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_JSONCreation",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
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
//To Get Application Protocol for Kit Component Function
function buildAppProtocol(manager, kitReferenceProduct) {

    var appprotocol = [];
    if (kitReferenceProduct != null) {

        var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
        var kitRefCurRevReferences = kitReferenceProduct.queryReferences(prodCurRevReferenceType); //STEP-6396
        //logger.info(" kitRefCurRevReferences "+kitRefCurRevReferences);

        //  executionReportLogger.logInfo(" kitRefCurRevReferences "+kitRefCurRevReferences.size());

        kitRefCurRevReferences.forEach(function(ref) { //STEP-6396

            var kitRefCurRevTarget = ref.getTarget(); //STEP-6396
            // logger.info(" kitRefCurRevTarget "+kitRefCurRevTarget);


            var kitRefCurRevTargetName = kitRefCurRevTarget.getName() + "";
            //logger.info(" kitRefCurRevTargetName "+kitRefCurRevTargetName);
            if (kitRefCurRevTargetName != null && kitRefCurRevTargetName.length > 0) {
                var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
                var kitAppProtoRefList = kitRefCurRevTarget.getClassificationProductLinks(refType);

                //executionReportLogger.logInfo(" kitAppProtoRefList "+kitAppProtoRefList.size());


                //To get Application Protocol Information
                for (var i = 0; i < kitAppProtoRefList.size() > 0; i++) {

                    var appProtocolJson = createAppProtocolJsonElement(kitAppProtoRefList, i);

                    appprotocol.push(appProtocolJson);
                }

                // executionReportLogger.logInfo(" appprotocol.length "+appprotocol.length);

                if (appprotocol.length == 0) {
                    appprotocol = [{}];
                }



            }
            return true; //STEP-6396
        });
    }

    return appprotocol;
}

// To Get Tech Transfer Lot for Kit Component Function
function buildKitTechTransferLot(manager, kitReferenceProduct) {

    var techtranslot = [];

    if (kitReferenceProduct != null) {

        var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
        var kitRefCurRevReferences = kitReferenceProduct.queryReferences(prodCurRevReferenceType); //STEP-6396
        //logger.info(" kitRefCurRevReferences "+kitRefCurRevReferences);

        //  executionReportLogger.logInfo(" kitRefCurRevReferences "+kitRefCurRevReferences.size());

        kitRefCurRevReferences.forEach(function(ref) {    //STEP-6396

            var kitRefCurRevTarget = ref.getTarget(); //STEP-6396
            // logger.info(" kitRefCurRevTarget "+kitRefCurRevTarget);

            var kitRefCurRevTargetName = kitRefCurRevTarget.getName() + "";
            //logger.info(" kitRefCurRevTargetName "+kitRefCurRevTargetName);
            if (kitRefCurRevTargetName != null && kitRefCurRevTargetName.length > 0) {

                techtranslot.push.apply(techtranslot, getLots(manager, kitRefCurRevTarget));
            }
            return true; //STEP-6396
        });
    }

    return techtranslot;
}

// To Get Node Delete Message Function
function buildNodeDeleteMessage(node, simpleEventType) {

    var mesg = {};

    var productstepid = node.getID() + "";
    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";

    mesg.eventid = simpleEventType.getID() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;

    return mesg;
}

//To Get Asses for Kit Component Function
function buildSKUAssets(manager, kitReferenceProduct) {

    var asset = [];
    if (kitReferenceProduct != null) {

        var kitRefProductno = kitReferenceProduct.getValue("PRODUCTNO").getSimpleValue();
        var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");

        var kitRefCurRevReferences = kitReferenceProduct.queryReferences(prodCurRevReferenceType); //STEP-6396
        //executionReportLogger.logInfo(" kitRefCurRevReferences "+kitRefCurRevReferences.size());

        kitRefCurRevReferences.forEach(function(ref) {    //STEP-6396

            var kitRefCurRevTarget = ref.getTarget(); //STEP-6396
            //executionReportLogger.logInfo(" kitRefCurRevTarget "+kitRefCurRevTarget);
            var kitRefCurRevTargetName = kitRefCurRevTarget.getName() + "";
            //executionReportLogger.logInfo(" kitRefCurRevTargetName "+kitRefCurRevTargetName);

            if (kitRefCurRevTargetName != null && kitRefCurRevTargetName.length > 0) {

                //To Get Figures and datasheet from revision
                var pubImgRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
                if (pubImgRefType != null) {
                    var pubImgLinks = kitRefCurRevTarget.queryReferences(pubImgRefType); //STEP-6396
                    pubImgLinks.forEach(function(ref) {    //STEP-6396 
                        var assetJson = {}
                        var aImageTarget = ref.getTarget(); //STEP-6396
                        var aFigureStatus = "";
                        var imgClassList = aImageTarget.getClassifications().toArray();
                        if (imgClassList != null) {
                            aFigureStatus = imgClassList[0].getValue("Figure_Status").getSimpleValue() + "";
                        }
                        var aImageStatus = aImageTarget.getValue("Image_Status").getSimpleValue() + "";
                        var aImageTargetObjectID = aImageTarget.getObjectType().getID();
                        assetJson["Figure_Object_Type"] = aImageTargetObjectID + "";
                        assetJson["Is_Component_Asset"] = "Y";
                        assetJson["Figure_Status"] = aFigureStatus;
                        if (aImageStatus == "Active") {
                            //To Get Attributes for Assets
                            var assetSystemAttrJson = getObjectAttributesJson(aImageTarget, false);
                            assetJson = mergeJsonObjects(assetJson, assetSystemAttrJson);

                            //To Get System Attibutes for Assets
                            var assetSystemAttrJson = getObjectAttributesJson(aImageTarget, true);
                            assetJson = mergeJsonObjects(assetJson, assetSystemAttrJson);

                            asset.push(assetJson);
                        }
                        return true;  //STEP-6396
                    });
                }


                //To Get Datasheet
                var pubImgRefTypeDS = manager.getReferenceTypeHome().getReferenceTypeByID("DataSheet");
                if (pubImgRefTypeDS != null) {
                    var pubImgLinksDS = kitRefCurRevTarget.queryReferences(pubImgRefTypeDS); //STEP-6396
                    pubImgLinksDS.forEach(function(ref) {     //STEP-6396
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
                        assetJson["Approved_DS_Name"] = kitRefProductno + ".pdf";
                        assetJson["Is_Component_Asset"] = "Y";

                        assetJson["Figure_Status"] = aFigureStatusDS;
                        if (aImageStatusDS == "Active") {

                            //To Get Attributes for Assets
                            var assetAttrJson = getObjectAttributesJson(aImageTargetDS, false);
                            assetJson = mergeJsonObjects(assetJson, assetAttrJson);
        
                            //To Get System Attibutes for Assets
                            var assetSystemAttrJson = getObjectAttributesJson(aImageTargetDS, true);
                            assetJson = mergeJsonObjects(assetJson, assetSystemAttrJson);
        
                            asset.push(assetJson);
                        }
                        return true;  //STEP-6396 
                    });
                }

                if (asset.length == 0) {
                    asset = [{}];
                }
            }
            return true; //STEP-6396
        });
    }

    return asset;
}

// Creates a dictionary, which will be pushed in a list with Application Protocols
function createAppProtocolJsonElement(appProtoRefList, index) {
    var appProtocolJson = {}
    var appProtocolObj = appProtoRefList.get(index).getClassification();

    var revAppProtClassValues = appProtoRefList.get(index).getValues();
    var itAPVal = revAppProtClassValues.iterator();

    while (itAPVal.hasNext()) {
        var attrValueAPVal = itAPVal.next();
        var attributeAPVal = "";
        if (attrValueAPVal != null) {
            attributeAPVal = attrValueAPVal.getAttribute();

            var attValAPVal = attrValueAPVal.getSimpleValue() + "";
            //  executionReportLogger.logInfo("    "+attributeAPVal.getID()+" = "+attValAPVal);
            appProtocolJson[attributeAPVal.getID()] = attValAPVal;
        }

    }

    //To Get Attributes for Application Protocol
    var setAttrAP = appProtocolObj.getValues();
    var itAP = setAttrAP.iterator();

    while (itAP.hasNext()) {
        var attrValueAP = itAP.next();
        var attributeAP = "";
        if (attrValueAP != null) {
            attributeAP = attrValueAP.getAttribute();

            var attValAP = attrValueAP.getSimpleValue() + "";

            // logger.info("  "+attributeAP.getName()+" = "+attValAP);
            appProtocolJson[attributeAP.getID()] = attValAP;
        }

    }

    var protocolno = appProtocolObj.getValue("PROTOCOLNO").getSimpleValue();
    // logger.info(" PROTOCOLNO "+protocolno);

    if (protocolno != null) {

        var application = appProtocolObj.getParent().getValue("Application").getSimpleValue() + "";
        var applicationIDX = appProtocolObj.getParent().getValue("APPLICATIONINDEX").getSimpleValue() + "";
        var applicationGroup = appProtocolObj.getParent().getValue("APPLICATIONGROUP").getSimpleValue() + "";
        var applicationID = appProtocolObj.getParent().getID() + "";

        appProtocolJson["Application"] = application;
        appProtocolJson["APPLICATIONGROUP"] = applicationGroup;
        appProtocolJson["APPLICATIONINDEX"] = applicationIDX;
        appProtocolJson["APPLICATIONID"] = applicationID;
        var applicationObject = appProtocolObj.getParent();
        var setAttrAPO = applicationObject.getValues();
        var itAPO = setAttrAPO.iterator();
        while (itAPO.hasNext()) {
            var attrValueAPO = itAPO.next();
            var attributeAPO = "";
            if (attrValueAPO != null) {
                attributeAPO = attrValueAPO.getAttribute();
                var attValAPO = attrValueAPO.getSimpleValue() + "";
                //logger.info("  "+attributeAPO.getName()+" = "+attValAPO);
                appProtocolJson[attributeAPO.getID()] = attValAPO;
            }
        }

    } else {

        applicationID = appProtocolObj.getID() + "";


        appProtocolJson["APPLICATIONID"] = applicationID;

    }

    return appProtocolJson;

}

// Creates a dictionary filled with attributes of an object
function getObjectAttributesJson(object, getSystemValues) {
    var json = {}
    var setAtrr;
if (object!=null){
    if (getSystemValues == true) {
    		
      	 setAtrr = object.getSystemValues();
    		
    } else {
	    	
	        setAtrr = object.getValues();
	    
    }

    //log.info("###### Object name: " + object.getName())

    var iter = setAtrr.iterator();

    while (iter.hasNext()) {
        var attrElement = iter.next();

        if (attrElement != null) {
            
            var attr = attrElement.getAttribute();
            //log.info("Attribude: " + attr)
            
            var attrValue = attrElement.getSimpleValue() + "";
            //log.info("Value: " + attrValue);

            json[attr.getID()] = attrValue;
        }
    }
}
    return json;

}

// can be used to get all attributes of an object
function getObjectAttributes(manager, object, referenceTypeID) {
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID(referenceTypeID);
    var jsonArray = [];

    if (refType != null) {
        var referencesArr = object.queryReferences(refType); //STEP-6396 

        referencesArr.forEach(function(ref) {  //STEP-6396
            var refTarget = ref.getTarget();  //STEP-6396 
            
            //log.info("### Ref Target: " + refTarget.getName());
            
            var jsonArrayItem = {};
            var setAttrSP = refTarget.getValues();
            var itSP = setAttrSP.iterator();

            while (itSP.hasNext()) {
                var attrValueSP = itSP.next();

                if (attrValueSP != null) {
                    var attributeSP = attrValueSP.getAttribute();
                    //log.info("Attribute: " + attributeSP);
                    
                    var attValSP = attrValueSP.getSimpleValue() + "";
                    //log.info("Value: " + attValSP);

                    // For getting only PRODUCTNO and PRODUCTNAME attributes in case of getting Companion Product
                    // otherwise get all attributes
                    if (referenceTypeID == "Companion_Product") {
                        if (attributeSP.getID() == "PRODUCTNO" || attributeSP.getID() == "PRODUCTNAME") {
                            jsonArrayItem[attributeSP.getID()] = attValSP;
                        }
                    } else {
                        jsonArrayItem[attributeSP.getID()] = attValSP;
                    }
                }
            }

            jsonArray.push(jsonArrayItem);
            return true; //STEP-6396
        });
    }

    return jsonArray.length != 0 ? jsonArray : [{}];
}


// STEP-5961
// returns required attributes
function getObjectAttributes(manager, object, referenceTypeID, attributes) {
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID(referenceTypeID);
    var jsonArray = [];

    if (refType != null) {
         var referencesArr = object.queryReferences(refType); //STEP-6396

         referencesArr.forEach(function(ref) {  //STEP-6396
            var refTarget = ref.getTarget();  //STEP-6396 
            
            var jsonArrayItem = {};
            var setAttrSP = refTarget.getValues();
            var itSP = setAttrSP.iterator();

            while (itSP.hasNext()) {
                var attrValueSP = itSP.next();

                if (attrValueSP != null) {
                    var attributeSP = attrValueSP.getAttribute();
                    var attValSP = attrValueSP.getSimpleValue() + "";
				//STEP-5957
                    if (attributes && BL_Library.isItemInArray(attributes, attributeSP.getID())) {
                        jsonArrayItem[attributeSP.getID()] = attValSP;
                    }
                    else {
                        if (!attributes) {
                            jsonArrayItem[attributeSP.getID()] = attValSP;
                        }
                    }
                }
            }

            jsonArray.push(jsonArrayItem);
            return true; //STEP-6396
        });
    }

    return jsonArray.length != 0 ? jsonArray : [{}];
}


// To get Alternate Product
function getAlternateProduct(manager, node) {

    return getObjectAttributes(manager, node, "ALTERNATE_PRODUCT");
}

// To get companion Product
function getCompanionProduct(manager, node) {

    return getObjectAttributes(manager, node, "Companion_Product");
}


// To get Lots from Product Revision
function getLots(manager, productRevision) {
    // STEP-5684
    return getObjectAttributes(manager, productRevision, "ProductRevision_to_Lot");
/*
    var techtranslot = [];

    // For sorting if more than one lot get the highest lot no
    var techtranslotTemp = getObjectAttributes(manager, productRevision, "ProductRevision_to_Lot");

    techtranslotTemp.sort(function (a, b) {
        return parseInt(b.LOTNO) - parseInt(a.LOTNO);
    });

    if (techtranslotTemp.length != 0) {
        techtranslot.push(techtranslotTemp[0])
    }

    if (techtranslot.length == 0) {
        techtranslot = [{}];
    }

    return techtranslot;
*/
}


// STEP-5961
function getLots(manager, productRevision, attributes) {
    return getObjectAttributes(manager, productRevision, "ProductRevision_to_Lot", attributes);
}


// To get Species from Revision
function getSpecies(manager, productRevision) {

    return getObjectAttributes(manager, productRevision, "Product_Revision_To_Species");
}

// To get Homology Species from Product
function getSpeciesHomology(manager, product) {

    return getObjectAttributes(manager, product, "Product_To_Species");
}

// To get Targets from a product revision
function getTargets(manager, productRevision) {

    return getObjectAttributes(manager, productRevision, "Product_to_Target");
}


function getProductRevision_To_MasterStock(manager, revision, notify) {
    // STEP-6286 added function parameter notify (boolean) => use true for sending email notification
    var masterStockStepID = "";
    //STEP-5957
    var masterStock = BL_Library.getMasterStockForRevision(manager, revision);
    
    if (masterStock != null){
        masterStockStepID = masterStock.getID() + "";
    }
    else {
        // STEP-6286
	   if (notify != true) {
	       return;
	   }
   	   // if (masterStockStepID == null || masterStockStepID == "") { // STEP-6018 added email notification
        var emailAddress = null;
        var srv = String(BL_ServerAPI.getServerEnvironment());

        switch(srv) {
	       case "UNKNOWN":
	           break;
	       case "prod":
	           emailAddress = "stepprod@cellsignal.com";
	           break;
	       default:
	           emailAddress = "steptest@cellsignal.com";
	           break;
        }

        if(emailAddress) {
            var mailHome = manager.getHome(com.stibo.mail.home.MailHome);
            BL_Email.sendEmail(mailHome.mail(), emailAddress, "No reference to MasterStock", "Reference from the revision (" + revision.getName() + ") to MasterStock was not found. Please check data and regenerate JSON file again.");
        }
    }

    return masterStockStepID;
}


function htmlEntities(key, value) {
    var maskedValue = value;
    if ((key == "ACTIVITY" || key == "BSA_Milk_in_WB_Statement" || key == "Description" || key == "DIRECTIONS_FOR_USE" ||
            key == "ORDERINGDETAILSSTATEMENT" || key == "PRODUCTBACKGROUND" || key == "SOURCEPURIF" || key == "SPECIFSENSIV" || key == "STORAGE" || key == "PRODUCTDESCRIPTION" || key=="ENDOTOXIN" )) {
        if (value) {
            if (String(value).search('<lt/>a href=')>-1) { //STEP-6206
            	maskedValue = String(value); //STEP-6206
            } else {
               maskedValue = String(value).split('<lt/>').join('<').split('<gt/>').join('>');
            }
            maskedValue = maskedValue.replace(/\n/g, '<br/>');
            maskedValue = replaceSymbol(maskedValue)

        }
    }

    if ((key == "PRODUCTNAME" ||key == "Figure_Caption" ||key == "Figure_Image_Caption" ||key == "Image_Caption" )) {
        if (value) {
            maskedValue = String(value);
            maskedValue = maskedValue.replace(/[™®©℠]/g, '<sup>$&</sup>');
            // STEP-6333 Unexpected difference in product name
            maskedValue = maskedValue.replace(/<sup> *<sup>/gm, '<sup>');
        	  maskedValue = maskedValue.replace(/<\/sup> *<\/sup>/gm, '</sup>');

            maskedValue = maskedValue.replace(/<lt\/>sup<gt\/>/gm, '');
            maskedValue = maskedValue.replace(/<lt\/>\/sup<gt\/>/gm, '');
            
            //Added to fix the scenario where </sup> tag has no space ,if not add space otherwise ignore)
		  maskedValue = maskedValue.replace(/(<\/sup>)(?=[a-zA-z0-9])/gm, '$1 ');
            maskedValue = replaceSymbol (String(maskedValue));
            maskedValue = replaceTrademarkSymbol (String(maskedValue));
        }
    }

    // STEP-5830
    if (key == "DIRECTIONS_FOR_USE" || key == "FORMULATION" || key == "STORAGE") {
    	   var foundhttps=false;
    	   if (value) {
             match = value.match(/(<PRODUCTDETAILPAGE target=\"(.*?)[\/]?[0-9]{4,}\">)/gi);

             var matchFound = false;
    
            if (match) {
                matchFound = true;
            } 
            if (!matchFound) {
                match = value.match(/(<PRODUCTDETAILPAGE target=\"https?:\/\/)/gi);
                if (match) {
                    matchFound = true;
                    foundhttps = true;
                    
                }
            
            } 

            if (match) {
            	maskedValue = maskedValue.toString();

	           for (var i=0; i < match.length; i++) {
                 if (foundhttps){
                    maskedValue = maskedValue.replace(match[i], "<a href=\"https://");
                 }else{
                      maskedValue = maskedValue.replace(match[i], "<a href=\"/product/productDetail.jsp?productId=" + match[i].match(/[0-9]{4,}/) + "\">");
                }
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

           if(matchFullUrl) {
           	maskedValue = maskedValue.toString();

               for(var i=0; i<matchFullUrl.length; i++) {
                   maskedValue = maskedValue.replace(matchFullUrl[i], "<a href=")
               }

               const matchFullUrlEnd = maskedValue.match(/<\/FULLURL>/gi);

               if(matchFullUrlEnd) {
                   for(var i=0; i<matchFullUrlEnd.length; i++) {
                       maskedValue = maskedValue.replace(matchFullUrlEnd[i], "</a>")
                   }
               }
           }
           //END STEP-6407

           maskedValue = maskedValue.replace(/\n/g, '<br />');
    	   }
    }

    return maskedValue;
}

function replaceSymbol(str){
  var strMatch=str.match(/(<)([α-ωΑ-Ω]+)(\/>)/g)
  //log.info("strMatch"+strMatch)
  if (strMatch!=null){
   
    var strMatchList=strMatch;
	    for (key in strMatchList) {
	    	// log.info(key);
	     // log.info(strMatchList[key].match(/<([α-ωΑ-Ω]+)\/>/)[1]);
           str = str.replace(strMatchList[key], strMatchList[key].match(/<([α-ωΑ-Ω]+)\/>/)[1]);
	    }
	}
  return str;
}

function replaceTrademarkSymbol(str){
	str=str.replace(/<([R]+)\/>/g,'®')
	str=str.replace(/<([C]+)\/>/g,'©')
	str=str.replace(/<([DegS]+)\/>/g,'°')
	str=str.replace(/<([DaS]+)\/>/g,'†')
	str=str.replace(/<([DdS]+)\/>/g,'‡')
	str=str.replace(/<([TS]+)\/>/g,'™')
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


//STEP-6584
/**
 * @desc To get attributes and set json elements for Bibliography Json
 * @param obj Revision
 * @returns array of json objects
 */
function getBiblioJsonAttrForRevisions(obj) {
    var citation = [];

    if (obj) {
        var citJson = {};
        var product = obj.getParent();
        var currRev = BL_MaintenanceWorkflows.getCurrentRevision(product);
        var wipRev = BL_MaintenanceWorkflows.getWIPRevision(product);

        if (currRev && (currRev.getID() == obj.getID())) {
            obj = currRev;
            citJson["IsWIP"] = "N";
            citJson["event"] = "Create";
        }
        else if (wipRev && (wipRev.getID() == obj.getID())) {
            obj = wipRev;
            citJson["IsWIP"] = "Y";
            citJson["event"] = "SendToPreview";
        }

        citJson["PUBLISHED_YN"] = obj.getValue("PUBLISHED_YN").getSimpleValue() + "";
        citJson["REVISIONSTATUS"] = obj.getValue("REVISIONSTATUS").getSimpleValue() + "";
        citation.push(citJson);
    }

    return citation;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.buildAppProtocol = buildAppProtocol
exports.buildKitTechTransferLot = buildKitTechTransferLot
exports.buildNodeDeleteMessage = buildNodeDeleteMessage
exports.buildSKUAssets = buildSKUAssets
exports.createAppProtocolJsonElement = createAppProtocolJsonElement
exports.getObjectAttributesJson = getObjectAttributesJson
exports.getObjectAttributes = getObjectAttributes
exports.getObjectAttributes = getObjectAttributes
exports.getAlternateProduct = getAlternateProduct
exports.getCompanionProduct = getCompanionProduct
exports.getLots = getLots
exports.getLots = getLots
exports.getSpecies = getSpecies
exports.getSpeciesHomology = getSpeciesHomology
exports.getTargets = getTargets
exports.getProductRevision_To_MasterStock = getProductRevision_To_MasterStock
exports.htmlEntities = htmlEntities
exports.replaceSymbol = replaceSymbol
exports.replaceTrademarkSymbol = replaceTrademarkSymbol
exports.mergeJsonObjects = mergeJsonObjects
exports.getBiblioJsonAttrForRevisions = getBiblioJsonAttrForRevisions