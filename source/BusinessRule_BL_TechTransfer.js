/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_TechTransfer",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_TechTransfer",
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
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_ReleaseCheck",
    "libraryAlias" : "BL_ReleaseCheck"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "libsku"
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
// Compare attributes from group sAttGroupId - pSource with pTarget
// return true if exists different attribute
function areDifferentAttributes(step, pSource, pTarget, sAttGroupId, log) {
    log.info("++++++++=====Inside areDifferentAttributes " + sAttGroupId);
    var attGroup = step.getAttributeGroupHome().getAttributeGroupByID(sAttGroupId);
    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();
        while (iterator.hasNext()) {
            var attribute = iterator.next();
            log.info("attribute " + attribute)
            var attID = attribute.getID();
            if (pSource.getValue(attID).getSimpleValue() != pTarget.getValue(attID).getSimpleValue()) {
                return true;
            }
        }
    }
    return false;
}

/**
 * @desc STEP-6753
 * @desc Compare two objects and their children of object type for the content of the same Attribute group
 * @param pObject1  - Object 1
 * @param pObject1Type - Object type pObject1 ("Lot_Component")
 * @param pObject1Key - the part of key to put it as key value to TreeMap variable ("COMPONENTSKU"), the key will be pObject1Key + attribute from sAttGroupId
 * @param pObject2  - Object 2
 * @param pObject2Type - related to the pObject2, Object type of pObject2 ("Kit_Component")
 * @param pObject2Key - related to the pObject2, part of key to put it as key value to TreeMap variable ("COMPONENTSKU"), the key will be pObject1Key + attribute from sAttGroupId
 * @param sAttGroupId  - Attribute group ("Tech_Transfer_Rev_Components")
 * @param sExcludedAttrs - Excluded attributes from the attribute group  ("COMPONENTSKUNAME","COMPONENTINDEX")
 * @returns true if there are differences in content of attributes, false the content is the same
 */
function areDiffObjTypeAttr(step, pObject1, pObject1Type, pObject1Key, pObject2, pObject2Type, pObject2Key, sAttGroupId, sExcludedAttrs, log) {

    // local function
    function getObjectValuesString (pObj, pObjType, pObjKey, attGroup, pexcludedAttrs){
      var pObjValues = new java.util.TreeMap();
      var pObjChildren = pObj.getChildren();
      
      for (var i = 0; i < pObjChildren.size(); i++) {
          var ref = pObjChildren.get(i);
      
          if (ref.getObjectType().getID() == pObjType) {  //"Lot_Component" 
              var partKey = ref.getValue(pObjKey).getSimpleValue();   //"COMPONENTSKU" 
              var pAttributes = attGroup.getAttributes();
              var iterator = pAttributes.iterator();
              while (iterator.hasNext()) {
                  var attribute = iterator.next();
                  var attID = attribute.getID();
                  if (!Lib.isItemInArray(pexcludedAttrs, attID)) {
                      var val = attID +": " + ref.getValue(attID).getSimpleValue();
                      var key = partKey +": " + attID;
                      pObjValues.put(key,val);
                  }
              }
          }
      }
      return pObjValues;
  }

  // main function
  var attGroup = step.getAttributeGroupHome().getAttributeGroupByID(sAttGroupId);
  if (attGroup != null) {

      var pObject1ValuesResult;
      var pObject2ValuesResult;
    
      pObject1ValuesResult = getObjectValuesString (pObject1, pObject1Type, pObject1Key, attGroup, sExcludedAttrs);
      pObject2ValuesResult = getObjectValuesString (pObject2, pObject2Type, pObject2Key, attGroup, sExcludedAttrs);
      
      if (pObject1ValuesResult.equals(pObject2ValuesResult) == false ){
          var sObjValuesResult = "Differences are SKU(Object1/Object2)";
          var aObject1Val = pObject1ValuesResult.entrySet().toArray();
          var aObject2Val = pObject2ValuesResult.entrySet().toArray();
          for (var j = 0; j < aObject1Val.length; j++) {
               var sValue1 = aObject1Val[j].getValue();
                  var sValue2 = aObject2Val[j].getValue();
                  var attrID = aObject1Val[j].getKey().substring(0,aObject1Val[j].getKey().indexOf(": "))
                  if (sValue1 != sValue2)
                     sObjValuesResult = sObjValuesResult + "-" + attrID + "(" + sValue1 +" / " + sValue2 + ")";
              }
              log.info(sObjValuesResult);
          return true;                
      }
      else
          return false;
  }
  return false;
}

function createRevisionReferences(step, pRevision, pTechTransfer) {
    var children = pTechTransfer.getChildren();
    var tmApplications = new java.util.TreeMap();
    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Component") {
            //Create Kit Component as Sub Product
            var pKitComponent = pRevision.createProduct(null, "Kit_Component");

            //Set Name
            var componentSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = child.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var nProduct = child.getValue("PRODUCTNO").getSimpleValue();
            var nRevisionNo = pRevision.getValue("REVISIONNO").getSimpleValue();
            var kitComponentName = nProduct + "_rev" + nRevisionNo + "_" + componentParentSku + "_" + componentSku;

            pKitComponent.setName(kitComponentName);

			//STEP-5957
            //copyMetaAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components");
			Lib.copyAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components", null);

            var nSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var pSku = step.getNodeHome().getObjectByKey("SKUNO", nSku);
            if (pSku == null)
                throw ("Unable to locate existing SKU object. [" + nSku + "]");
            else {
                var ref = pRevision.createReference(pSku, "KitRevision_to_SKU");
                // copyMetaAttributes(step, child, ref, "Tech_Transfer_Rev_Components");
            }
        }
    }
}


function createRevisionReferences(step, pRevision, pTechTransfer, isLot) {
    var children = pTechTransfer.getChildren();
    var tmApplications = new java.util.TreeMap();
    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Component") {
            //Create Kit Component as Sub Product
            var pKitComponent = pRevision.createProduct(null, "Kit_Component");
            //Set Name
            var componentSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = child.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var nProduct = child.getValue("PRODUCTNO").getSimpleValue();
            var nRevisionNo = pRevision.getValue("REVISIONNO").getSimpleValue();
            var kitComponentName = nProduct + "_rev" + nRevisionNo + "_" + componentParentSku + "_" + componentSku;

            pKitComponent.setName(kitComponentName);
			//STEP-5957
            //copyMetaAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components");
			Lib.copyAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components", null);

            var nSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var pSku = step.getNodeHome().getObjectByKey("SKUNO", nSku);
            if (pSku == null)
                throw ("Unable to locate existing SKU object. [" + nSku + "]");
            else {
                var ref = pRevision.createReference(pSku, "KitRevision_to_SKU");
                // copyMetaAttributes(step, child, ref, "Tech_Transfer_Rev_Components");
            }
        } else if (child.getObjectType().getID() == "Lot_Application" && isLot) {
            var sAppResult = child.getValue("RESULT").getSimpleValue();
            if (sAppResult == "Positive") {
                var sApplication = child.getValue("APPLICATIONABBR").getSimpleValue();
                var cApplication = step.getNodeHome().getObjectByKey("APPLICATIONNO", sApplication);
                var sProtocol = child.getValue("PROTOCOLNO").getSimpleValue();
                var ref;
                var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
                if (sProtocol) {
                    var cProtocol = step.getNodeHome().getObjectByKey("PROTOCOLNO", sProtocol);
                    if (cProtocol == null)
                        throw ("Unable to locate existing Protocol object. [" + sProtocol + "]");
                    ref = pRevision.createClassificationProductLink(cProtocol, refType);
                    //cApplication = cProtocol.getParent();
                } else {
                    if (cApplication == null)
                        throw ("Unable to locate existing Application object. [" + sApplication + "]");
                    try {
                        ref = pRevision.createClassificationProductLink(cApplication, refType);
                    } catch (err) {
                        if (err.message.indexOf("UniqueConstraintException") == -1)
                            throw err;
                    }
                }
                ref.getValue("Dilution_Low").setSimpleValue(child.getValue("Dilution_Low").getSimpleValue());
                ref.getValue("Dilution_High").setSimpleValue(child.getValue("Dilution_High").getSimpleValue());
                ref.getValue("DILUTIONFACTOR").setSimpleValue(child.getValue("DILUTIONFACTOR").getSimpleValue());
                ref.getValue("Appl_Species_Tested").setSimpleValue(child.getValue("Appl_Species_Tested").getSimpleValue());
                var idxApplication = cApplication.getValue("APPLICATIONINDEX").getSimpleValue();
                tmApplications.put(idxApplication, sApplication);
            }
        }
    }

    if (isLot) {
        //Through the Revision_to_ApplicationProtocol reference, on the product revision, attribute AppCodes_String needs to be populated with the Application ID’s on the Applications.
        //They need to be comma delimited and in a sorted order, based on the Application_Index attribute on the Application.
        var lst = tmApplications.entrySet().toArray();
        var sAppCodes;
        for (var j = 0; j < lst.length; j++) {
            var sAppCode = lst[j].getValue();
            if (j == 0)
                sAppCodes = sAppCode;
            else
                sAppCodes = sAppCodes + ", " + sAppCode;
        }
        if (sAppCodes)
            pRevision.getValue("ApplCodes_String").setSimpleValue(sAppCodes);
    }
}



function isKit(obj) {
    var children = obj.getChildren();
    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Component") {
            return true;
        }
    }
    return false;
}


function getSortedSpecies(step, obj, sRefType) {
    var sResult;
    var tmSpecies = new java.util.TreeMap();
    var refType = step.getReferenceTypeHome().getReferenceTypeByID(sRefType);
    //STEP-6396
    var refLinks = obj.queryReferences(refType); 
    refLinks.forEach(function(ref) {
        var oTarget = ref.getTarget();
        var sCode = oTarget.getValue("SPECIESCODE").getSimpleValue();
        tmSpecies.put(sCode, sCode);
        return true;
    });
    //STEP-6396
    var lst = tmSpecies.entrySet().toArray();
    for (var j = 0; j < lst.length; j++) {
        var sValue = lst[j].getValue();
        if (j == 0)
            sResult = sValue;
        else
            sResult = sResult + sValue;
    }

    return sResult;
}


function getSystemInitiatedWF(step, log, pTechTransfer, pRevision, pMasterStock, lookupTableHome) {
    // Change in Atomic Value on Product Lot (TT) vs current (most recent approved) revision
    // Storage-temperature, Shipping-conditions, Concentration,
    // Recombinant-YN, Clone-UID, Formulation, Rabbit,
    // Lot-Validated-Species [m] () ()
    //
    //Create an Attribute group (New_Revision_Evaluation_Attributes) to store above attributes.
    //
    //Attributes of Attribute group (New_Revision_Evaluation_Attributes)  Modified in PDP/PLM
    var systemInitiatedWF = "0"
    var systemInitiatedMessage = "Changes initiated for ";

    // skip checks for setting the systemInitiatedWF and set systemInitiatedWF dirrectly to 18 (Custom Lot) if CustomLotRev_YN is Y
    if (pTechTransfer.getValue("CustomLotRev_YN").getSimpleValue() == "Y") {

        log.info("Initiated by Tech Transfer, this will initiate a Custom Lot WF to Specification_Change in lookup table.");

        systemInitiatedWF = "18";
        systemInitiatedMessage = systemInitiatedMessage + "Custom Lot changes " + ",";

    } else {

        // if TechTransferLot should not start the Custom Lot WF (CustomLotRev_YN is N)

        var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("New_Revision_Evaluation_Attributes");
        if (attGroup != null) {
            var lstAttributes = attGroup.getAttributes();
            var iterator = lstAttributes.iterator();
            while (iterator.hasNext()) {
                var attribute = iterator.next();
                var sAttributeID = attribute.getID();
                //STEP-6010
                var pAttribute = "";
                var pAttribute2 = "";
                if (attribute.getValidForObjectTypes().contains(pRevision.getObjectType()) ||
                    attribute.getValidForObjectTypes().contains(pMasterStock.getObjectType()) || sAttributeID == "ProdTeam_Planner_Product") {
                    var sAttributeName = attribute.getName();
                    log.info(" ************* ");
                    log.info(" sAttributeID " + sAttributeID + " sAttributeName " + sAttributeName);

                    var ttAttributeValue = ""
                    if (pTechTransfer.getValue(sAttributeID).getSimpleValue() != null) {
                        // 06/30/2021 Using a new function replaceSpecialCharacterStrings
                        //ttAttributeValue = pTechTransfer.getValue(sAttributeID).getSimpleValue().replace("<lt/>", "<").replace("<gt/>", ">")
                        ttAttributeValue = replaceSpecialCharacterStrings(pTechTransfer.getValue(sAttributeID).getSimpleValue())
                    }
                    log.info(" pTechTransferAttribute " + ttAttributeValue);

                    //If StorageTemp get from masterstock
                    //STEP-6010
                    if (sAttributeID == "ProdTeam_Planner_Product") {
                        var product = pRevision.getParent();
                        pAttribute = replaceSpecialCharacterStrings(product.getValue(sAttributeID).getSimpleValue());
                    }	
                    else if (attribute.getValidForObjectTypes().contains(pMasterStock.getObjectType())){
                        // 6/29/2021 in order to prevent starting maintenance when pTechTransferAttribute is "" and pMasterStockAttribute is null, changing pMasterStockAttribute to ""
                        // 6/30/2021 Using a new function replaceSpecialCharacterStrings
                         pAttribute = replaceSpecialCharacterStrings(pMasterStock.getValue(sAttributeID).getSimpleValue());

                         //For ProdTeam_Planner_MasterStock compare 2 attributes on MS: ProdTeam_Planner_MasterStock and ProdTeam_Planner_Product
                         if (sAttributeID == "ProdTeam_Planner_MasterStock") {
                            pAttribute2 = replaceSpecialCharacterStrings(pMasterStock.getValue("ProdTeam_Planner_Product").getSimpleValue());
                         }
                         

                    } else {    
                        // 6/29/2021 in order to prevent starting maintenance when pTechTransferAttribute is "" and pRevisionAttribute is null, changing pRevisionAttribute to ""
                        // 6/30/2021 Using a new function replaceSpecialCharacterStrings
                        pAttribute = replaceSpecialCharacterStrings(pRevision.getValue(sAttributeID).getSimpleValue());
                    }

                    log.info(" pAttribute " + pAttribute);
                    
                    if (ttAttributeValue != pAttribute || (sAttributeID == "ProdTeam_Planner_MasterStock" && ttAttributeValue != pAttribute2)) {
                        var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", sAttributeID);
                        //log.info(" tmpSysInitiatedWF "+tmpSysInitiatedWF);
                        if (tmpSysInitiatedWF != "") {
                            if (parseInt(systemInitiatedWF, 10) == 0) {
                                systemInitiatedWF = tmpSysInitiatedWF;
                                systemInitiatedMessage = systemInitiatedMessage + sAttributeName + ",";
                            } else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                                systemInitiatedWF = tmpSysInitiatedWF;
                                systemInitiatedMessage = systemInitiatedMessage + sAttributeName + ",";
                            }
                        }
                    }
                }
                log.info(" systemInitiatedWF loop " + systemInitiatedWF);
                log.info(" ************* ");
                
            }
        }
        /*	if (getSortedSpecies(step, pTechTransfer, "Lot_To_Species") != getSortedSpecies(step, pRevision, "Product_Revision_To_Species")) {
                var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", "Product_Revision_To_Species");
                if (tmpSysInitiatedWF!=""){
                    if (parseInt(systemInitiatedWF, 10) == 0){
                        systemInitiatedWF = tmpSysInitiatedWF;
                        systemInitiatedMessage=systemInitiatedMessage+"Application Species"+",";
                    }else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                        systemInitiatedWF = tmpSysInitiatedWF;
                        systemInitiatedMessage=systemInitiatedMessage+"Application Species"+",";
                    }
                }
                log.info(" systemInitiatedWF loop 1 "+systemInitiatedWF);
            }*/

        if (pTechTransfer.getObjectType().getID() != "NonLot") {
            //Application and Species Modified in PDP/PLM
            if (checkValidatedApplications(step, pTechTransfer, pRevision) == "maintenance") {
                if (checkImageChanged(step, pTechTransfer, pRevision, log)) {
                    var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", "Specification_Change");
                    log.info("Initiated by Tech Transfer, this will initiate a WF bound to Specification_Change in lookup table.");
                    if (tmpSysInitiatedWF != "") {
                        if (parseInt(systemInitiatedWF, 10) == 0) {
                            systemInitiatedWF = tmpSysInitiatedWF;
                            systemInitiatedMessage = systemInitiatedMessage + "Lot Application with new images " + ",";
                        } else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                            systemInitiatedWF = tmpSysInitiatedWF;
                            systemInitiatedMessage = systemInitiatedMessage + "Lot Application with new images " + ",";
                        }
                    }
                } else {
                    var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", "Revision_to_ApplicationProtocol");
                    log.info("Initiated by Tech Transfer, this will initiate a WF bound to Revision_to_ApplicationProtocol in lookup table.");
                    if (tmpSysInitiatedWF != "") {
                        if (parseInt(systemInitiatedWF, 10) == 0) {
                            systemInitiatedWF = tmpSysInitiatedWF;
                            systemInitiatedMessage = systemInitiatedMessage + "Lot Application" + ",";
                        } else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                            systemInitiatedWF = tmpSysInitiatedWF;
                            systemInitiatedMessage = systemInitiatedMessage + "Lot Application" + ",";
                        }
                    }
                }
                log.info(" systemInitiatedWF loop 2 " + systemInitiatedWF);
            }
        }

        //Targets Modified in PDP/PLM
        if (checkTargetsValidation(step, pTechTransfer, pRevision, log)) {
            var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", "Product_to_Target");
            log.info("Initiated by Tech Transfer, this will initiate a WF bound to Product_to_Target in lookup table.");
            if (tmpSysInitiatedWF != "") {
                if (parseInt(systemInitiatedWF, 10) == 0) {
                    systemInitiatedWF = tmpSysInitiatedWF;
                    systemInitiatedMessage = systemInitiatedMessage + "Target" + ",";
                } else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                    systemInitiatedWF = tmpSysInitiatedWF;
                    systemInitiatedMessage = systemInitiatedMessage + "Target" + ",";
                }
            }
            log.info(" systemInitiatedWF loop 2 " + systemInitiatedWF);
        }

        //Components Modified in PDP/PLM
        if (isKit(pTechTransfer)) {
            if (checkComponents(pTechTransfer, pRevision, log)) {
                var tmpSysInitiatedWF = lookupTableHome.getLookupTableValue("AttributeSystemInitiatedWFMappingTable", "Kit_Component");
                log.info("Initiated by Tech Transfer, this will a WF bound to Kit_Component in lookup table.");
                if (tmpSysInitiatedWF != "") {
                    if (parseInt(systemInitiatedWF, 10) == 0) {
                        systemInitiatedWF = tmpSysInitiatedWF;
                        systemInitiatedMessage = systemInitiatedMessage + "Kit Component" + ",";
                    } else if (parseInt(systemInitiatedWF, 10) > parseInt(tmpSysInitiatedWF, 10)) {
                        systemInitiatedWF = tmpSysInitiatedWF;
                        systemInitiatedMessage = systemInitiatedMessage + "Kit Component" + ",";
                    }
                }
                log.info(" systemInitiatedWF loop 2 " + systemInitiatedWF);
            }
        }
    }

    if (systemInitiatedMessage != null && systemInitiatedMessage.indexOf(",") > -1) {
        systemInitiatedMessage = systemInitiatedMessage.slice(0, -1) + " in PDP/PLM";
    } else {
        systemInitiatedMessage = systemInitiatedMessage + " in PDP/PLM";
    }
    log.info(" systemInitiatedWF return " + systemInitiatedWF);
    log.info(" systemInitiatedMessage return " + systemInitiatedMessage);

    return [systemInitiatedWF, systemInitiatedMessage];
}


function checkAtomicValues(step, pTechTransfer, pRevision, pMasterStock, log) {
    // Change in Atomic Value on Product Lot (TT) vs current (most recent approved) revision
    // Storage-temperature, Shipping-conditions, Concentration,
    // Recombinant-YN, Clone-UID, Formulation, Rabbit,
    // Lot-Validated-Species [m] () ()
    //
    //Create an Attribute group (New_Revision_Evaluation_Attributes) to store above attributes.
    //
    var bResult = false;
    var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("New_Revision_Evaluation_Attributes");
    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();
        while (iterator.hasNext()) {
            var attribute = iterator.next();
            var sAttributeID = attribute.getID();
            if (attribute.getValidForObjectTypes().contains(pRevision.getObjectType()) ||
                attribute.getValidForObjectTypes().contains(pMasterStock.getObjectType()) || sAttributeID == "ProdTeam_Planner_Product") {
 
                //If StorageTemp get from masterstock
                log.info(" sAttributeID " + sAttributeID);
                var ttAttributeValue = ""
                var objAttributeValue = ""
                var objAttributeValue2 = "";
                if (pTechTransfer.getValue(sAttributeID).getSimpleValue() != null) {
                    // ttAttributeValue = pTechTransfer.getValue(sAttributeID).getSimpleValue().replace("<lt/>", "<").replace("<gt/>", ">")
                    ttAttributeValue = replaceSpecialCharacterStrings(pTechTransfer.getValue(sAttributeID).getSimpleValue())
                }
                log.info(" ttAttributeValue " + ttAttributeValue);
                // log.info(" ms value " + pMasterStock.getValue(sAttributeID).getSimpleValue());
                // log.info(" rev value " + pRevision.getValue(sAttributeID).getSimpleValue());
                //STEP-6010
                if (sAttributeID == "ProdTeam_Planner_Product") {
                    var product = pRevision.getParent();
                    if (product.getValue(sAttributeID).getSimpleValue() != null) {
                        objAttributeValue = replaceSpecialCharacterStrings(product.getValue(sAttributeID).getSimpleValue())
                    }
                } else if (attribute.getValidForObjectTypes().contains(pMasterStock.getObjectType())) {
                
                        if (pMasterStock.getValue(sAttributeID).getSimpleValue() != null) {
                            //objAttributeValue = pMasterStock.getValue(sAttributeID).getSimpleValue().replace("<lt/>", "<").replace("<gt/>", ">")
                            objAttributeValue = replaceSpecialCharacterStrings(pMasterStock.getValue(sAttributeID).getSimpleValue());
                        }
                        //For ProdTeam_Planner_MasterStock compare 2 attributes on MS: ProdTeam_Planner_MasterStock and ProdTeam_Planner_Product
                        if (sAttributeID == "ProdTeam_Planner_MasterStock") {
                            objAttributeValue2 = replaceSpecialCharacterStrings(pMasterStock.getValue("ProdTeam_Planner_Product").getSimpleValue());
                        }

                } else {
                    if (pRevision.getValue(sAttributeID).getSimpleValue() != null) {
                        //objAttributeValue = pRevision.getValue(sAttributeID).getSimpleValue().replace("<lt/>", "<").replace("<gt/>", ">")
                        objAttributeValue = replaceSpecialCharacterStrings(pRevision.getValue(sAttributeID).getSimpleValue());
                    }
                 
                }
                
                if (ttAttributeValue != objAttributeValue || (sAttributeID == "ProdTeam_Planner_MasterStock" && ttAttributeValue != objAttributeValue2)) {
                    log.info(" TT Value " + ttAttributeValue + " Value " + objAttributeValue);
                
                    bResult = true;
                    break;
                }
            }
        }
    }

    /* This change is handled as part of applications
        if (getSortedSpecies(step, pTechTransfer, "Lot_To_Species") != getSortedSpecies(step, pRevision, "Product_Revision_To_Species")) {
            // return false;
            return true;
        }*/
    // return true;
    return bResult;
}


function checkValidatedApplications(step, pTechTransfer, pRevision) {
var lotAppl = [];
var revAppl = [];
var lotSpecies = [];
var revSpecies = [];
var sLotSpecies = "";
var sRevSpecies = "";
var lotApplications = new java.util.TreeMap();
var revApplications = new java.util.TreeMap();
var lotDilutions = new java.util.TreeMap();
var revDilutions = new java.util.TreeMap();

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

//lot_application
var children = pTechTransfer.getChildren();

log.info(" child "+children.size());

for (var i = 0; i < children.size(); i++) {
    var child = children.get(i);
    if (child.getObjectType().getID() == "Lot_Application" || child.getObjectType().getID() == "Product_Application" /*STEP-6195*/) {
        var sAppResult = child.getValue("RESULT").getSimpleValue();
        log.info(" sAppResult "+sAppResult);

        if (sAppResult == "Positive") {
            var sApplication = child.getValue("APPLICATIONABBR").getSimpleValue();
            var nProtocol = child.getValue("PROTOCOLNO").getSimpleValue();
            if (!nProtocol)
                nProtocol = "";

            var cApplication = step.getNodeHome().getObjectByKey("APPLICATIONNO", sApplication);
            //log.info(" cApplication "+cApplication);
            var sExportFlag = cApplication.getValue("APPLICATIONEXPORTFLAG_YN").getSimpleValue();
            //log.info(" sExportFlag "+sExportFlag);
            if (sExportFlag == "Y" || nProtocol) {
                var sDilutionLow = child.getValue("Dilution_Low").getSimpleValue();
                var sDilutionHigh = child.getValue("Dilution_High").getSimpleValue();
                var sDilution = child.getValue("DILUTIONFACTOR").getSimpleValue();
                //STEP-6279
                var dilutions = [sDilution, sDilutionLow, sDilutionHigh];
                lotDilutions.put(sApplication, dilutions);
                var sSpecies = child.getValue("Appl_Species_Tested").getSimpleValue();
                var sChildString = sApplication + "_" + nProtocol + "_" + sSpecies + "_" + sDilution + "_" + sDilutionLow + "_" + sDilutionHigh;
                lotApplications.put(sApplication, sChildString);
              
                //STEP-6159 STEP-6279
                if(sSpecies){
                    sLotSpecies = sLotSpecies + ";" + sSpecies;
                }//STEP-6279                  
                lotAppl.push(sApplication + "_" + nProtocol);
            }
        }
    }
} 
sLotSpecies = sLotSpecies.substr(1);
lotSpecies = sLotSpecies.split(";"); 
var uniqueLotSpecies = lotSpecies.filter(onlyUnique);
//STEP-6159 end

//rev application  -- Revision_to_ApplicationProtocol
var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
var links = pRevision.getClassificationProductLinks(refType);
//log.info(" links.size() "+links.size());
for (var i = 0; i < links.size(); i++) {
    var ref = links.get(i);
    var cApplication = ref.getClassification();
    // log.info(" links.cApplication() "+cApplication);
    var sApplication = cApplication.getValue("APPLICATIONABBR").getSimpleValue();
    //log.info("i= " + i + "  links.sApplication() " + sApplication);
    var nProtocol = cApplication.getValue("PROTOCOLNO").getSimpleValue();
    //log.info(" links.nProtocol() " + nProtocol);
    if (!nProtocol) {
        nProtocol = "";
    } else {
        sApplication = cApplication.getValue("PROTOCOLAPPLICATIONABBR").getSimpleValue();
    }

    //log.info(" links.nProtocol() 1 " + nProtocol);
    var sExportFlag = cApplication.getValue("APPLICATIONEXPORTFLAG_YN").getSimpleValue();
    //log.info(" links.sExportFlag() "+sExportFlag);
    if (sExportFlag == "Y" || nProtocol) {
        var sDilutionLow = ref.getValue("Dilution_Low").getSimpleValue();
        var sDilutionHigh = ref.getValue("Dilution_High").getSimpleValue();
        var sDilution = ref.getValue("DILUTIONFACTOR").getSimpleValue();
        //STEP-6279
        var dilutions = [sDilution, sDilutionLow, sDilutionHigh];
        revDilutions.put(sApplication, dilutions);

        var sSpecies = ref.getValue("Appl_Species_Tested").getSimpleValue();
        if (sSpecies != null) {
            sSpecies = sSpecies.replace("<multisep/>", ";")
        }
       // var sChildString = sApplication + "_" + sSpecies;
        var sChildString = sApplication + "_" + nProtocol + "_" + sSpecies + "_" + sDilution + "_" + sDilutionLow + "_" + sDilutionHigh;
        revApplications.put(sApplication, sChildString);
        //log.info(" links.sSpecies() 1 " + sSpecies);
        //STEP-6159 STEP-6279
        if(sSpecies != null){
            sRevSpecies = sRevSpecies + ";" + sSpecies;
        }//STEP-6279
        revAppl.push(sApplication + "_" + nProtocol);
    }
}
//STEP-6159
sRevSpecies = sRevSpecies.substr(1);
revSpecies = sRevSpecies.split(";"); 
var uniqueRevSpecies = revSpecies.filter(onlyUnique);

log.info("uniqueLotSpecies: " + uniqueLotSpecies);
log.info("uniqueRevSpecies: " + uniqueRevSpecies);

log.info("lotAppl: " + lotAppl);
log.info("revAppl: " + revAppl);

//if there are different applications or different unique Species
if(Lib.arrayDiff(lotAppl,revAppl) || Lib.arrayDiff(uniqueLotSpecies,uniqueRevSpecies))

    return "maintenance";

else {    
    var sLotApplicationResult = "";
    var lst = lotApplications.entrySet().toArray();
    for (var i = 0; i < lst.length; i++) {
        var sValue = lst[i].getValue(); 
        if (i == 0)
            sLotApplicationResult = sValue;
        else
            sLotApplicationResult = sLotApplicationResult + "::" + sValue;
    }

 //STEP-6159
    var sRevApplicationResult = "";
    var revlst = revApplications.entrySet().toArray();
    for (var j = 0; j < revlst.length; j++) {
        var sValue = revlst[j].getValue();
        if (j == 0)
            sRevApplicationResult = sValue;
        else
            sRevApplicationResult = sRevApplicationResult + "::" + sValue;
    }

    log.info(" sLotApplicationResult " + sLotApplicationResult);
    log.info(" sRevApplicationResult " + sRevApplicationResult);

    if (sLotApplicationResult == sRevApplicationResult)
        return "noChange";
    else //STEP-6279
   	   if (checkDilutionsChanges(lotDilutions, revDilutions) == "maintenance")
	            return "maintenance";
	   else 
	            return "passthrough";

}
}

//STEP-6279
//lotDilutions, revDilutions - set:
//key: application
//value: [sDilution, sDilutionLow, sDilutionHigh]
function checkDilutionsChanges(lotDilutions, revDilutions){
    if(lotDilutions == revDilutions)
    	return "no change";
    else {
    	  var lst = lotDilutions.entrySet().toArray();
    	  for (var i = 0; i < lst.length; i++) {
		var lotAppl = lst[i].getKey();
		var revDilution = revDilutions.get(lotAppl)[0];
		var lotDilution = lotDilutions.get(lotAppl)[0];
		var revDilutionLow = revDilutions.get(lotAppl)[1];
		var revDilutionHigh = revDilutions.get(lotAppl)[2];
		var lotDilutionLow = lotDilutions.get(lotAppl)[1];
		var lotDilutionHigh = lotDilutions.get(lotAppl)[2];

		if(revDilution){
			if((lotDilutionLow && revDilution < lotDilutionLow) || 
			   (lotDilutionHigh && revDilution > lotDilutionHigh))
			   return "maintenance"; 
		} else 
			if(revDilutionLow != lotDilutionLow || revDilutionHigh != lotDilutionHigh)
			  return "maintenance";  
	
		if  (lotDilution !=  revDilution)
			 return  "maintenance";		        
    	  }
    	  return "passthrough";
    }
}



/**
 * Check if Figure Keys for Figure Folders coming in the Tech Transfer object pTechTransfer are different 
 * from Figure Keys for Figures refered by the reference Published_Product_Images under the pRevision 
 * @param step Step Manager
 * @param pTechTransfer Tech Transfer (Lot) object
 * @param pRevision Revision
 * @param log logger
 * @returns Returns false if there are no FigureFolders in the pTechTranfer or no Figures in pRevision refered by the Published_Product_Images reference.
 * 
 * Returns false if all figure keys in pTechTranfer are same as in the pRevision.
 * 
 * Returns true otherwise.
 */
function checkImageChanged(step, pTechTransfer, pRevision, log) {
    var lotFigFolderKeyList = new java.util.TreeMap();
    var revFigFolderKeyList = new java.util.TreeMap();

    //Tech Transfer Lot  New Figures
    var refType = step.getReferenceTypeHome().getReferenceTypeByID("Tech_Transfer_To_Source_Figure_Folder");
    if (refType != null) {
        var refLinks = pTechTransfer.queryReferences(refType); //STEP-6396
        refLinks.forEach(function(ref) {//STEP-6396
            var aImageObject = ref.getTarget();//STEP-6396
            var figFolderKey = aImageObject.getValue("Figure_Key").getSimpleValue();
            log.info(" figure folder key : " + figFolderKey);
            lotFigFolderKeyList.put(figFolderKey, figFolderKey);
            return true; //STEP-6396
        });
    }


    if (lotFigFolderKeyList.size() == 0)
        return false;

    log.info(" lotFigFolderKeyList.size() " + lotFigFolderKeyList.size());


    //Get Figure Keys from Revision
    var refTypeRev = step.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
    if (refTypeRev != null) {
        var refRevLinks = pRevision.queryReferences(refTypeRev);//STEP-6396
        refRevLinks.forEach(function(ref) {//STEP-6396
            var aImageObjectRev = ref.getTarget();//STEP-6396
            var figFolderKeyRev = aImageObjectRev.getValue("Figure_Key").getSimpleValue();
            log.info(" figure folder key Rev : " + figFolderKeyRev);
            revFigFolderKeyList.put(figFolderKeyRev, figFolderKeyRev);
            return true;//STEP-6396
        });
    }

    log.info(" revFigFolderKeyList.size() " + revFigFolderKeyList.size());

    if (revFigFolderKeyList.size() == 0)
        return false;




    var sLotFigFolderKeyResult;
    var lst = lotFigFolderKeyList.entrySet().toArray();
    for (var i = 0; i < lst.length; i++) {
        var sValue = lst[i].getValue();
        if (i == 0)
            sLotFigFolderKeyResult = sValue;
        else
            sLotFigFolderKeyResult = sLotFigFolderKeyResult + "!" + sValue;
    }


    var sRevAFigFolderKeyResult;
    var lst = revFigFolderKeyList.entrySet().toArray();
    for (var j = 0; j < lst.length; j++) {
        var sValue = lst[j].getValue();
        if (j == 0)
            sRevAFigFolderKeyResult = sValue;
        else
            sRevAFigFolderKeyResult = sRevAFigFolderKeyResult + "!" + sValue;
    }

    log.info(" sLotFigFolderKeyResult " + sLotFigFolderKeyResult);
    log.info(" sRevAFigFolderKeyResult " + sRevAFigFolderKeyResult);
    if (sLotFigFolderKeyResult == sRevAFigFolderKeyResult)
        return false;
    else
        return true;
}


function checkComponents(pTechTransfer, pRevision, log) {
    var lotComponents = new java.util.TreeMap();
    var revComponents = new java.util.TreeMap();
    var manager = pTechTransfer.getManager(); //STEP-6753
    //lot_components
    var children = pTechTransfer.getChildren();

    /*for (var i = 0; i < children.size(); i++) {
       var child = children.get(i);
       log.info(" Checking Lot_Component reference");

         if (child.getObjectType().getID() == "Lot_Component") {
            var nSku =child.getValue("Item_SKU").getSimpleValue();
            var nCount = child.getValue("COMPONENTCOUNT").getSimpleValue();
            log.info(" getting Lot_Component nCount= "+nCount + " pRevision " + pRevision + " nSku "+ nSku+ " nSku+_+nCount "+ nSku+"_"+nCount);
            lotComponents.put(nSku, nSku+"_"+nCount);

         }
      }*/

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);

        if (child.getObjectType().getID() == "Lot_Component") {
            var nSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var compName = child.getName();
            lotComponents.put(nSku, compName);

        }
    }

    //rev componets
    /* var refType = step.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
    log.info(" getting KitRevision_to_SKU reftype= "+refType + " pRevision " + pRevision);
    var refs = pRevision.getProductReferences().get(refType);
    for (var i = 0; i < refs.size(); i++) {
       var ref = refs.get(i);
       var pSku = ref.getTarget();

       var nSku =pSku.getValue("Item_SKU").getSimpleValue();
       var nCount = ref.getValue("COMPONENTCOUNT").getSimpleValue();
       revComponents.put(nSku, nSku+"_"+nCount);
    }*/

    var refs = pRevision.getChildren();

    for (var i = 0; i < refs.size(); i++) {
        var ref = refs.get(i);

        if (ref.getObjectType().getID() == "Kit_Component") {
            var nSku = ref.getValue("COMPONENTSKU").getSimpleValue();
            var compParentSKU = ref.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            //log.info(" nSku "+nSku+" compParentSKU "+compParentSKU);
            var compName = compParentSKU + "_" + nSku;
            revComponents.put(nSku, compName);
        }
    }

    var sLotComponentsResult;
    var lst = lotComponents.entrySet().toArray();
    for (var i = 0; i < lst.length; i++) {
        var sValue = lst[i].getValue();
        if (i == 0)
            sLotComponentsResult = sValue;
        else
            sLotComponentsResult = sLotComponentsResult + "-" + sValue;
    }

    var sRevComponentResult;
    var lst = revComponents.entrySet().toArray();
    for (var j = 0; j < lst.length; j++) {
        var sValue = lst[j].getValue();
        if (j == 0)
            sRevComponentResult = sValue;
        else
            sRevComponentResult = sRevComponentResult + "-" + sValue;
    }
    log.info(" sLotComponentsResult " + sLotComponentsResult);
    log.info(" sRevComponentResult " + sRevComponentResult);

    if (sLotComponentsResult == sRevComponentResult)
        return areDiffObjTypeAttr(manager, pTechTransfer, "Lot_Component", "COMPONENTSKU", pRevision, "Kit_Component", "COMPONENTSKU", "Tech_Transfer_Rev_Components", ["COMPONENTSKUNAME","COMPONENTINDEX","COMPONENTORDER"], log);  
        //STEP-6753 replaced return false
        //in the case there are the same Components we need to check/compare the component's attributes values except COMPONENTSKUNAME,COMPONENTINDEX
        //STEP-6759 added COMPONENTORDER
    else
        return true;
}


/**
 * Check of Targets have been changed
 * @param {*} step STEP manager
 * @param {*} pTechTransfer STEP Tech Transfer / Nonlot object
 * @param {*} pRevision STEP Revision object
 * @returns true - number of targets changed OR targets are not the same; false - otherwise
 */
function checkTargetsValidation(step, pTechTransfer, pRevision) {

    //Get Existing Targets from pTechTransfer lot/nonlot object
    var sLotTargetResult = [];
    var lotTargets = pTechTransfer.getValue("ProductTargets").getValues();

    //Get Targets from pRevision revision
    var targetRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
    //STEP-6396
    var revTargets = pRevision.queryReferences(targetRefType); 
    var revTargetsSize = 0
    revTargets.forEach(function(ref) {
        revTargetsSize++;
        return true;	
    });
    //STEP-6396

    //STEP-6396
    log.info("Number of targets on lot: " + lotTargets.size() + ". Number of targets on the compared revision: " + revTargetsSize); 
    // Number of targets are different
    if (revTargetsSize != lotTargets.size()) {
        return true;
    }
    //STEP-6396

    if (lotTargets) {
        for (var i = 0; i < lotTargets.size(); i++) {
            var tTargetCode = String(lotTargets.get(i).getValue());
            log.info("tTargetCode: " + tTargetCode);
            sLotTargetResult.push(tTargetCode);
        }
    }

    // Check if targets are same disregard their order
    //STEP-6396
    var retValue = false;
    revTargets.forEach(function(ref) {

        var targetObj = ref.getTarget();
        var sTargetno = String(targetObj.getValue("TARGETNO").getSimpleValue());
        log.info("sTargetno: " + sTargetno);
        //log.info("sLotTargetResult.indexOf(sTargetno): " + sLotTargetResult.indexOf(sTargetno));
        if (sLotTargetResult.indexOf(sTargetno) == -1) {
            retValue = true;
            return false;
        }
        return true;
    });
    if (retValue) {
        return true;
    }
    //STEP-6396

    return false;
}


function createProduct(step, log, node, pSubCategory, bKit, bNewProduct) {
    var pProduct;
    // var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
    var nProduct = node.getValue("PRODUCTNO").getSimpleValue();

    if (bNewProduct && bNewProduct == "Y") {
        log.info("--->pProduct");

        if (bKit)
            pProduct = pSubCategory.createProduct(null, "Product_Kit");
        else
            pProduct = pSubCategory.createProduct(null, "Product");

        log.info(pProduct);
        pProduct.getValue("PRODUCTNO").setSimpleValue(nProduct);
        //copy data from TT to Product
        //Tech_Transfer_Product
		//STEP-5957
        Lib.copyAttributes(step, node, pProduct, "Tech_Transfer_Product", null)
        pProduct.setName(pProduct.getValue("PRODUCTNAME").getSimpleValue().trim());
        pProduct.getValue("Product_Status").setSimpleValue("Commercialization");
        Lib.updateHistoryAttribute(pProduct, "Tech Transfer", "Commercialization");

        // Create Parent Product References STEP-1384
        var nPProduct = node.getValue("PARENT_PRODUCTNO").getSimpleValue(); //Parent Product Addition
        var nParProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nPProduct);
        log.info(nParProduct);

        if (nParProduct == null)
            log.info("No Parent Product");
        else
            pProduct.createReference(nParProduct, "Product_To_Parent_Product");

        log.info("Product " + pProduct.getID() + "Refs to Parent Product" + nParProduct);

        /*
        Through the Product_To_Species Reference Type.  We need to populate Product Attributes: HOMOLGOUS_SPECIES on the product with the SPECIESCODE values on the Species.
        They need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.  For example H (human) should always be first, then M (mouse).
        HomologySpeciesName_String, on the product should be populated by SPECIES values on the Species.
        This is the species names, they need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.
         */
        //populate Product Attributes: HOMOLGOUS_SPECIES
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
        //create product to target references
        var lstTarget = node.getValue("ProductTargets").getValues();
        if (lstTarget) {
            for (var i = 0; i < lstTarget.size(); i++) {
                var sTargetCode = lstTarget.get(i).getValue();
                var eTarget = step.getNodeHome().getObjectByKey("TARGETNO", sTargetCode);
                if (eTarget == null)
                    throw ("Unable to locate existing Target object. [" + sTargetCode + "]");
                else
                    pProduct.createReference(eTarget, "Product_to_Target");
            }
        }
    } else {
        pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
        if (pProduct == null)
            throw ("Unable to locate existing Product object. [" + nProduct + "]");
    }
    log.info("Product " + pProduct.getID());

    return pProduct;
}



/**
 * To create a new revision, used for a NPI or a first revision for a new masterstock
 * @param step STEP manager
 * @param ttObject Tech Transfer / Non-lot object
 * @param pProduct Product object
 * @param bNewProduct flag with "Y" or "N" values
 * @param nProduct String, product number
 * @param bKit Boolean
 * @param bNewRevision flag with "Y" or "N" values
 * @returns STEP revision object
 */
function createRevision(step, ttObject, pProduct, bNewProduct, nProduct, bKit, bNewRevision) {

    var pRevision;
    //var bNewRevision = node.getValue("NewRevisionFlag_YN").getSimpleValue();
    var nRevision = ttObject.getValue("REVISIONNO").getSimpleValue();
    var nLotManagedFlag = ttObject.getValue("LOTMANAGED_YN").getSimpleValue();

    if (nRevision == 0 && bNewRevision == "Y") {
        nRevision = 1;
    }
    log.info("nRevision-->" + nRevision + " NewRevisionFlag_YN " + bNewRevision);

    if (bNewRevision && bNewRevision == "Y") {
        if (bKit) {
            pRevision = pProduct.createProduct(null, "Kit_Revision");
            //set Product # and Revision #
            pRevision.getValue("KITITEMNO").setSimpleValue(nProduct);
        } else {
            log.info("createProduct Product_Revision -->" + nRevision);

            pRevision = pProduct.createProduct(null, "Product_Revision");

            log.info("createProduct Product_Revision pRevision -->" + pRevision);

            //set Product # and Revision #
            pRevision.getValue("PRODUCTNO").setSimpleValue(nProduct);
        }
        pRevision.getValue("NewProductFlag_YN").setSimpleValue(bNewProduct);

        // STEP-5843 Setting correct flag if this is not new product 
        if (bNewProduct == "Y") {
            pRevision.getValue("Workflow_Type").setSimpleValue("N");
            //STEP-6257 - Add NPI labeling
            pRevision.getValue("Workflow_Name_Initiated").setSimpleValue("NPI");
            pRevision.getValue("Workflow_No_Initiated").setSimpleValue("1");
        } else {
            pRevision.getValue("Workflow_Type").setSimpleValue("M");
        }

        pRevision.getValue("REVISIONNO").setSimpleValue(nRevision);
        //copy data from TT to Revision
        //Tech_Transfer_Product_Revision
	   //STEP-5957
        Lib.copyAttributes(step, ttObject, pRevision, "Tech_Transfer_Product_Revision", null);

        //STEP-6648
        var ttConjFlagYN = ttObject.getValue("CONJUGATEFLAG_YN").getSimpleValue();
        var ttparentProduct = ttObject.getValue("PARENT_PRODUCTNO").getSimpleValue();
        var parentProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", ttparentProduct); 
        if (ttConjFlagYN == "Y" && parentProduct ) {
            var parentProductCurrRev =  BL_MaintenanceWorkflows.getCurrentRevision(parentProduct);
            if (parentProductCurrRev) {
               setConjugateDefaults(ttObject, pRevision, parentProduct, parentProductCurrRev)
            }
        }

        //STEP-6032
        var abbrWF = ttObject.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();
        var isCustom = abbrWF != null && abbrWF.toLowerCase() == "custom";
        if(isCustom || ttObject.getValue("ABBR_WORKFLOW_NAME").getSimpleValue() == "component") {
            pRevision.getValue("PUBLISHED_YN").setSimpleValue("N");
        }

        //Populate Kit Component for kit and Application for lot managed
        if (nLotManagedFlag && nLotManagedFlag == "Y") {
            createRevisionReferences(step, pRevision, ttObject, true);
        } else {
            createRevisionReferences(step, pRevision, ttObject, false);
        }

        //
        //Product to REV reference  -> it supports WebUI user experience
        //
        pRevision.setName(nProduct + "_rev" + nRevision);
        var tmSpecies = new java.util.TreeMap();

        var lotToSpeRefType = ttObject.getManager().getReferenceTypeHome().getReferenceTypeByID("Lot_To_Species");
        if (lotToSpeRefType) {
             var speciesList = ttObject.queryReferences(lotToSpeRefType); //STEP-6396
            // Look for a bibliography product with its STEP ID matching the PRODUCTNO.

            // STEP-5953 unique list to eliminate duplicate species
            var uniqueSpeciesList = [];
            speciesList.forEach(function(ref) { //STEP-6396
                var speciesObj = ref.getTarget(); //STEP-6396
                if (speciesObj != null) {
                    var sSpeciesCode = speciesObj.getValue("SPECIESCODE").getSimpleValue();
                    log.info(" sSpeciesCode " + sSpeciesCode);
                    if (uniqueSpeciesList.indexOf(sSpeciesCode) == -1) {
                        var eSpecies = step.getNodeHome().getObjectByKey("SPECIESNO", sSpeciesCode);
                        log.info(" eSpecies " + eSpecies);
                        if (eSpecies == null)
                            throw ("Unable to locate existing Species object. [" + sSpeciesCode + "]");
                        else {
                            var idxSpecies = eSpecies.getValue("SPECIESINDEX").getSimpleValue();
                            if (!idxSpecies)
                                idxSpecies = -1;
                            pRevision.createReference(eSpecies, "Product_Revision_To_Species");
                            tmSpecies.put(idxSpecies, eSpecies);
                            uniqueSpeciesList.push(sSpeciesCode);
                            // STEP-5953 ends
                        }
                    }
                }
                return true; //STEP-6396
            });
        }
        /*
        Through the Product_Revision_To_Species reference, on the product revision, attribute XRSpeciesCodes_String needs to be populated with the SPECIESCODE values on the Species.
        They need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.  For example H (human) should always be first, then M (mouse).
        XRSpeciesName_String, on the product should be populated by SPECIES values on the Species.
        This is the species names, they need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.
         */
        //populate XRSpeciesCodes_String
        var lst = tmSpecies.entrySet().toArray();
        var sXRSpeciesCodes;
        var sXRSpeciesName;
        for (var j = 0; j < lst.length; j++) {
            var eSpecies = lst[j].getValue();
            var sSpeciesCode = eSpecies.getValue("SPECIESCODE").getSimpleValue();
            var sSpeciesName = eSpecies.getValue("SPECIES").getSimpleValue();
            if (j == 0) {
                sXRSpeciesCodes = sSpeciesCode;
                sXRSpeciesName = sSpeciesName;
            } else {
                sXRSpeciesCodes = sXRSpeciesCodes + ", " + sSpeciesCode;
                sXRSpeciesName = sXRSpeciesName + ", " + sSpeciesName;
            }
        }
        log.info("XRSpeciesCodes_String" + sXRSpeciesCodes)
        log.info("XRSpeciesName_String" + sXRSpeciesName)
        if (sXRSpeciesCodes)
            pRevision.getValue("Species_Codes_XRStr").setSimpleValue(sXRSpeciesCodes);
        if (sXRSpeciesName)
            pRevision.getValue("Species_Names_XRStr").setSimpleValue(sXRSpeciesName);

    } else {
        pRevision = step.getNodeHome().getObjectByKey("PRODUCTREVNO", nProduct + "_rev" + nRevision);
        //  pRevision = step.getNodeHome().getObjectByKey("PRODUCTREVNO", nProduct + "-" + nRevision);
        log.info("pRevision --> " + pRevision);

        if (pRevision == null)
            //throw ("Unable to locate existing Product Revision object. [" + nProduct + "-" + nRevision + "]");
            throw ("Unable to locate existing Product Revision object. [" + nProduct + "_rev" + nRevision + "]");
    }
    log.info("Revision ID " + pRevision.getID());


    // create Product_To_WIP_Revision only if AutoAdd_YN Attribute value in node is not Y (MF is not coming from TT for Monoclonal/Polyclonal Antibodies) STEP-5396
    var autoAddFlag = ttObject.getValue("AUTOADD_YN").getSimpleValue();

    if (autoAddFlag != "Y") {

        var p2wipRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
        var p2wipRefs = pProduct.getProductReferences().get(p2wipRefType);

        // Only one reference is expected but we make no assumption here...
        for (var ix = 0; ix < p2wipRefs.size(); ix++) {
            var p2wipRef = p2wipRefs.get(ix);
            p2wipRef.delete();
        }

        pProduct.createReference(pRevision, p2wipRefType.getID());
        log.info(p2wipRefType.getID() + " created from " + pProduct.getID() + " to " + pRevision.getID());
        //Set Revision Status  STEP-1688
        pRevision.getValue("REVISIONSTATUS").setSimpleValue("In-process");
    }


    //Pivotree Comment, Jul-30-2019: Delete existing ProductRevision_to_TechTransfer links. Only one should exist based on the requirements.
    var pRevtoTechTranType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
    var pTechTranLinks = pRevision.getProductReferences().get(pRevtoTechTranType);
    for (var i = 0; i < pTechTranLinks.size(); i++) {
        pTechTranLinks.get(i).delete();
    }
    //#3 create reference ProductRevision_to_TechTransfer
    pRevision.createReference(ttObject, "ProductRevision_to_Lot");

    //STEP-6666 - If NPI create derivative products
    if (bNewProduct == "Y" && nLotManagedFlag == "Y") 
        BL_ReleaseCheck.updateDerivativeProducts(step, pRevision);

    //STEP-6734
    if (bNewProduct == "Y")
        BL_ReleaseCheck.updateProductsToKit(pProduct);        

    //3b. copy figure links from previous Product Revision to new Product Revision
    //
    //copy all the figure link (Published_Product_Images) from previous Revision except the deleted application
    //

    //If there is no revision
    //Check Product_Folder_To_Product & Product_Folder_To_Product_Revision Reference exists for the Product Folder ,If not create Reference

    var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.Classification;
    var searchAttribute = step.getAttributeHome().getAttributeByID("Figure_Key");
    var searchValue = nProduct;
    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
    var lstProdFolderClass = searchHome.querySingleAttribute(query).asList(1).toArray();

    if (lstProdFolderClass != null) {
        var prodFolderObj = lstProdFolderClass[0];

        log.info(" No Latest Revision  prodFolderObj " + prodFolderObj);

        if (typeof prodFolderObj !== 'undefined') {
            var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
            //STEP-6396
            var refs = pRevision.queryReferences(refType);
            var refsSize = 0;

            refs.forEach(function(ref) {
                refsSize++;
                return true;
            });
            
            log.info(" No Latest Revision  refs " + refsSize);

            // TO Refactor : can probably go to different BR which coppies other figure folder/ product folder attributes
            // check how much work this is --> do in this story or in a new story
            if (refsSize == 0) {
                pRevision.createReference(prodFolderObj, "Product_Folder_To_Product_Revision");
                //STEP-6130
                /*prodFolderObj.getValue("Figure_Folder_DevSci").setSimpleValue(ttObject.getValue("DEV_SCI").getSimpleValue());
                prodFolderObj.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(ttObject.getValue("Fastlane_YN_Flag").getSimpleValue());
                prodFolderObj.getValue("Figure_Folder_production_team").setSimpleValue(ttObject.getValue("ProdTeam_Planner_Product").getSimpleValue());

                var childrenFigFolders = prodFolderObj.getChildren();

                for (var i = 0; i < childrenFigFolders.size(); i++) {
                    var fig_folder = childrenFigFolders.get(i);
                    fig_folder.getValue("Figure_Folder_DevSci").setSimpleValue(ttObject.getValue("DEV_SCI").getSimpleValue());
                    fig_folder.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(ttObject.getValue("Fastlane_YN_Flag").getSimpleValue());
                    fig_folder.getValue("Figure_Folder_production_team").setSimpleValue(ttObject.getValue("ProdTeam_Planner_Product").getSimpleValue());
                }*/
            }    
            //STEP-6396

            var refTypePr = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
            //STEP-6396
            var refsPr = pProduct.queryReferences(refTypePr);
            var refsSize = 0;

            refsPr.forEach(function(ref) {
                refsSize++;
                return true;
            });
            log.info(" No Latest Revision  refsPr " + refsSize);

            if (refsSize == 0) {
                pProduct.createReference(prodFolderObj, "Product_Folder_To_Product");
            }
            //STEP-6396
        }
    }
    
   //STEP-5957
    var pLatestRevision = Lib.getLatestApprovedRevision(pProduct);
    log.info(" Latest Revision " + pLatestRevision);

    if (pLatestRevision) {
        //Copy Published Product Images from Latest Revision
        refType = step.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");

        if (refType != null) {
            //STEP-6396
            var refLinks = pLatestRevision.queryReferences(refType);
            refLinks.forEach(function(ref) {
                var aImage = ref.getTarget();
                pRevision.createReference(aImage, "Published_Product_Images");
                return true;
            });
            //STEP-6396
        }

        //Copy Datasheet from Latest Revision
        refType = step.getReferenceTypeHome().getReferenceTypeByID("DataSheet");

        if (refType != null) {
            //STEP-6396
            var refLinks = pLatestRevision.queryReferences(refType);
            refLinks.forEach(function(ref) {
                var aImage = ref.getTarget();
                pRevision.createReference(aImage, "DataSheet");
                return true;
            });
            //STEP-6396
        }

        //Product_Rev_To_Figure_Folder
        //Copy Product_Rev_To_Figure_Folder Reference from Latest Revision
        refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
        if (refType != null) {
            //STEP-6396
            var refLinks = pLatestRevision.queryReferences(refType);
            refLinks.forEach(function(ref) {
                var aFigFolder = ref.getTarget();
                pRevision.createReference(aFigFolder, "Product_Rev_To_Figure_Folder");
                return true;
            });
            //STEP-6396 
        }

    }

    return pRevision;
}


function createMasterStock(step, node, pProduct, bKit) {
    var pMasterStock;
    var bNewMasterStock = node.getValue("NewMasterStockFlag_YN").getSimpleValue();
    var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();

    log.info("---> BA_CreateRevisionMasterItemForLot");
    log.info("bNewMasterStock" + bNewMasterStock);
    log.info("nMasterStock" + nMasterStock);

    if (bNewMasterStock && bNewMasterStock == "Y") {
        pMasterStock = pProduct.createProduct(null, "MasterStock");

        //set Master Stock #
        pMasterStock.getValue("MasterStock_SKU").setSimpleValue(nMasterStock);
        //copy data from TT to Master Stock
        //Tech_Transfer_MasterStock
	   //STEP-5957
        Lib.copyAttributes(step, node, pMasterStock, "Tech_Transfer_MasterStock", null);


        pMasterStock.setName(nMasterStock);
        //Product to REV reference  -> it supports WebUI user experience
        var ref = pProduct.createReference(pMasterStock, "Product_To_MasterStock");

        // Update CLP Lot Concentration on the new MasterStock
        //log.info("### node: " + node + ", pMasterStock: " + pMasterStock);
        if (pMasterStock) {
            updateClpLotConcentration(node, pMasterStock);
        }

        if (bKit) {
            var children = node.getChildren();
            log.info(" children " + children)

            //Get all Techtransfersku
            var techTransferSkuList = [];
            for (var i = 0; i < children.size(); i++) {
                var childNode = children.get(i);
                log.info("childNode.getObjectType().getID() = " + childNode.getObjectType().getID());
                if (childNode.getObjectType().getID() == "TechTransferSKU") {
                    techTransferSkuList.push(childNode);
                }
            }

            for (var j = 0; j < techTransferSkuList.length; j++) {
                var ttSkuObject = techTransferSkuList[j]
                log.info("ttSkuObject.getObjectType().getID() = " + ttSkuObject.getObjectType().getID());
                log.info("ttSkuObject.getID() = " + ttSkuObject.getID());
                //Create SKUs
                //************************
                //#5 create SKU
                //************************
                var nProduct = ttSkuObject.getValue("PRODUCTNO").getSimpleValue();
                var nMasterItemCode = ttSkuObject.getValue("MASTERITEMCODE").getSimpleValue();
                var nMasterStock = ttSkuObject.getValue("MasterStock_SKU").getSimpleValue();
                var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
                var nItemCode = ttSkuObject.getValue("ItemCode").getSimpleValue();
                var nProductType = pProduct.getValue("PRODUCTTYPE").getSimpleValue();

                log.info("nItemCode = " + nItemCode + " nMasterItemCode = " + nMasterItemCode + " nProductType = " + nProductType);
                if (pProduct == null) {
                    throw ("Unable to locate existing Product object. [" + nProduct + "]");
                } else {
                    var skuExists = libsku.isSkuExist(step, nProduct, nItemCode, log);
                    log.info(" skuExists = " + skuExists);
                    if (!skuExists) {
                        //Find ItemDefaults and create new
                        var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
                        var type = com.stibo.core.domain.entity.Entity;
                        var att = step.getAttributeHome().getAttributeByID("MASTERITEMCODE_DFLT");
                        var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, nMasterItemCode);
                        var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
                        query.root = belowNode;
                        var lstDefault = searchHome.querySingleAttribute(query).asList(100).toArray();
                        var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
                        for (var i = 0; i < lstDefault.length; i++) {
                            var eSkuDefault = lstDefault[i];
                            var sDefaultItemCode = eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
                            var sDefaultProductType = eSkuDefault.getValue("PRODUCTTYPE_DFLT").getSimpleValue();
                            var sDefaultMasterItemCode = eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
                            log.info("sDefaultMasterItemCode " + sDefaultMasterItemCode + "==" + sDefaultItemCode + "==" + sDefaultProductType);

                            if ((sDefaultMasterItemCode == nMasterItemCode) && (sDefaultProductType == nProductType) && (sDefaultItemCode == nItemCode)) {

                                var pSKU = libsku.createSKU(step, pMasterStock, eSkuDefault, nProduct, sDefaultItemCode, attrGroup);
						  //STEP-5957
                                Lib.copyAttributes(step, node, pSKU, "Tech_Transfer_MasterStock", ["ItemCode"]); //STEP-5972
                                log.info("SKU  " + pSKU.getID());
                                //break;
                            }

                        }

                    }
                }

            }

        }
    } else {
        pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);

        if (pMasterStock == null)
            throw ("Unable to locate existing Master Stock object. [" + nMasterStock + "]");
    }
    log.info("Master Stock " + pMasterStock.getID());

    return pMasterStock;
}

function createReference_ProductRevision_To_MasterStockWithoutEvent(step, node, pRevision, pMasterStock) {
    var refType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var refs = pRevision.getProductReferences().get(refType);

    if (refs != null && refs.size() == 0)
        pRevision.createReference(pMasterStock, "ProductRevision_To_MasterStock");
}

function createReference_ProductRevision_To_MasterStock(step, node, pRevision, pMasterStock, wipBFQueue, techTransferRevisionCreated) {
    /* var refType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
     var refs = pRevision.getProductReferences().get(refType);
     var autoAddFlag = node.getValue("AUTOADD_YN").getSimpleValue();

     if ( refs!=null && refs.size() == 0)
         pRevision.createReference(pMasterStock, "ProductRevision_To_MasterStock");

     if (pRevision.getApprovalStatus().name() != "Approved" && autoAddFlag != "Y") {
         if (pRevision.isInWorkflow("Production_Workflow") == false)
             pRevision.startWorkflowByID("Production_Workflow", "Initiated Production Workflow - WF1.");
         wipBFQueue.queueDerivedEvent(techTransferRevisionCreated, pRevision);
     }*/
    //Create Reference
    createReference_ProductRevision_To_MasterStockWithoutEvent(step, node, pRevision, pMasterStock);

    //Add to Wip  BF Queue to update status in PDP
    if (pRevision.getApprovalStatus().name() != "Approved") {
        if (pRevision.isInWorkflow("Production_Workflow") == false)
            pRevision.startWorkflowByID("Production_Workflow", "Initiated Production Workflow - WF1.");
        wipBFQueue.queueDerivedEvent(techTransferRevisionCreated, pRevision);
    }

}

function updateRevisionReferences(step, pRevision, pTechTransfer, isLot, log) {

    //Delete old existing Application duplicated from a previous revision

    var revAppProtocolLinkType = step.getReferenceTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    if (revAppProtocolLinkType != null) {
        var cpLinks = pRevision.getClassificationProductLinks(revAppProtocolLinkType);
        for (var i = 0; i < cpLinks.size() > 0; i++) {
            cpLinks.get(i).delete();
        }
    }

    //Create Application References

    var children = pTechTransfer.getChildren();
    var tmApplications = new java.util.TreeMap();
    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Component") {

            //Create Kit Component as Sub Product
            var pKitComponent = pRevision.createProduct(null, "Kit_Component");
            //Set Name
            var componentSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = child.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var nProduct = child.getValue("PRODUCTNO").getSimpleValue();
            var nRevisionNo = pRevision.getValue("REVISIONNO").getSimpleValue();
            var kitComponentName = nProduct + "_rev" + nRevisionNo + "_" + componentParentSku + "_" + componentSku;

            pKitComponent.setName(kitComponentName);
			//STEP-5957
            //copyMetaAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components");
			Lib.copyAttributes(step, child, pKitComponent, "Tech_Transfer_Rev_Components", null);

            var nSku = child.getValue("COMPONENTSKU").getSimpleValue();
            var pSku = step.getNodeHome().getObjectByKey("SKUNO", nSku);
            if (pSku == null)
                throw ("Unable to locate existing SKU object. [" + nSku + "]");
            else {
                // STEP-5452
                // log.info('pSku: ' + pSku.getID())
                // To Get SKU from Kit revisions
                var kitRevToSkuRefType = pRevision.getManager().getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
                if (kitRevToSkuRefType) {
                    var skuList = pRevision.queryReferences(kitRevToSkuRefType);//STEP-6396
                    // Look for Kit Revision references to SKU
                    var refExists = false;
                    skuList.forEach(function(ref) {   //STEP-6396
                        var skuObj = ref.getTarget();//STEP-6396
                        var skuObjID = skuObj.getID()
                        if (pSku.getID() == skuObjID) {
                            refExists = true;
                        }
                        return true;//STEP-6396
                    });
                }
                if (!refExists) {
                    var ref = pRevision.createReference(pSku, "KitRevision_to_SKU");
                }
                // copyMetaAttributes(step, child, ref, "Tech_Transfer_Rev_Components");
            }

        } else if (child.getObjectType().getID() == "Lot_Application" && isLot) {
            var sAppResult = child.getValue("RESULT").getSimpleValue();
            //change to get applications with result other than Negative instead of Positive to correspong with Tech Transfer Boomi process
            if (sAppResult == "Positive") {
                var sApplication = child.getValue("APPLICATIONABBR").getSimpleValue();
                var sProtocol = child.getValue("PROTOCOLNO").getSimpleValue();

                var cApplication = step.getNodeHome().getObjectByKey("APPLICATIONNO", sApplication);
                var ref;
                log.info("sApplication " + sApplication);
                log.info("sProtocol " + sProtocol);
                log.info("cApplication " + cApplication);

                // Adding protocols
                if (sProtocol) {

                    var cProtocol = step.getNodeHome().getObjectByKey("PROTOCOLNO", sProtocol);
                    if (cProtocol == null)
                        throw ("Unable to locate existing Protocol object. [" + sProtocol + "]");
                    ref = pRevision.createClassificationProductLink(cProtocol, revAppProtocolLinkType);
                    if (ref != null) {
                        ref.getValue("Dilution_Low").setSimpleValue(child.getValue("Dilution_Low").getSimpleValue());
                        ref.getValue("Dilution_High").setSimpleValue(child.getValue("Dilution_High").getSimpleValue());
                        ref.getValue("DILUTIONFACTOR").setSimpleValue(child.getValue("DILUTIONFACTOR").getSimpleValue());
                        ref.getValue("Appl_Species_Tested").setSimpleValue(child.getValue("Appl_Species_Tested").getSimpleValue());
                    }

                } else {

                    // Adding applications

                    //	log.info("cApplication " + cApplication);
                    if (cApplication == null)
                        throw ("Unable to locate existing Application object. [" + sApplication + "]");
                    try {
                        ref = pRevision.createClassificationProductLink(cApplication, revAppProtocolLinkType);
                        if (ref != null) {
                            ref.getValue("Dilution_Low").setSimpleValue(child.getValue("Dilution_Low").getSimpleValue());
                            ref.getValue("Dilution_High").setSimpleValue(child.getValue("Dilution_High").getSimpleValue());
                            ref.getValue("DILUTIONFACTOR").setSimpleValue(child.getValue("DILUTIONFACTOR").getSimpleValue());
                            ref.getValue("Appl_Species_Tested").setSimpleValue(child.getValue("Appl_Species_Tested").getSimpleValue());
                        }
                    } catch (err) {
                        if (err.message.indexOf("UniqueConstraintException") == -1)
                            throw err;
                    }

                }

                if (ref != null) {

                    var idxApplication = cApplication.getValue("APPLICATIONINDEX").getSimpleValue();
                    log.info("idxApplication " + idxApplication);
                    log.info("sApplication " + sApplication);
                    tmApplications.put(idxApplication, sApplication);
                }
            }
        }
    }

    // log.info("--------------");
    // revAppProtocolLinkType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    // if (revAppProtocolLinkType != null) {
    //     var cpLinks = pRevision.getClassificationProductLinks(revAppProtocolLinkType);
    //     for (var cpix = 0; cpix < cpLinks.size(); cpix++) {
    //         var cpLinkTarget = cpLinks.get(cpix);
    //         var classification = cpLinkTarget.getClassification();
    //         var abbrAttrID = classification.getObjectType().getID().equals("Application") ? "APPLICATIONABBR" : "PROTOCOLAPPLICATIONABBR";
    //         var sApplication = classification.getValue(abbrAttrID).getSimpleValue();
    //         var sProtocolNo = classification.getValue("PROTOCOLNO").getSimpleValue();
    //         if (sProtocolNo) {
    //             //applicationMap[sProtocolNo] = classification;
    //             log.info("Classification application protocol " + cpix + ": " + classification.getName());
    //         } else {
    //             //applicationMap[sApplication] = classification;
    //             log.info("Classification application " + cpix + ": " + classification.getName());
    //         }
    //     }
    // }
    // log.info("--------------");

    if (isLot) {
        //Through the Revision_to_ApplicationProtocol reference, on the product revision, attribute AppCodes_String needs to be populated with the Application ID’s on the Applications.
        //They need to be comma delimited and in a sorted order, based on the Application_Index attribute on the Application.
        var lst = tmApplications.entrySet().toArray();
        var sAppCodes;
        for (var j = 0; j < lst.length; j++) {
            var sAppCode = lst[j].getValue();
            if (j == 0)
                sAppCodes = sAppCode;
            else
                sAppCodes = sAppCodes + ", " + sAppCode;
        }
        log.info("sAppCodes " + sAppCodes);
        if (sAppCodes)
            pRevision.getValue("ApplCodes_String").setSimpleValue(sAppCodes);
    }
}

/**
 * To update Species, Targets, Product_to_Target, ProductRevision_to_Lot, Applications and Compoments, Figures references and populate XRSpeciesCodes_String on the pRevision and pProduct according to the node.
 * @param step Step Manager
 * @param log Logger
 * @param node Tech Transfer (lot) / Nonlot object
 * @param pRevision Revision
 * @param pProduct Product
 * @returns pRevision
 */
function updateRevision(step, log, node, pRevision, pProduct) {

    var nLotManagedFlag = node.getValue("LOTMANAGED_YN").getSimpleValue();

    // Atomic Values Attributes
	//STEP-5957
    Lib.copyAttributes(step, node, pRevision, "New_Revision_Evaluation_Attributes", null);

    // Species
    // Delete Existing Species in Revision
    var tmSpecies = new java.util.TreeMap();
    var speciesRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");
    if (speciesRefType != null) {
        //STEP-6396
        var speciesList = pRevision.queryReferences(speciesRefType);
        speciesList.forEach(function(ref) {
            ref.delete();
            return true;
        });
        //STEP-6396
    }

    // To Get Species
    var lotToSpeRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Lot_To_Species");
    if (lotToSpeRefType) {
        var speciesList = node.queryReferences(lotToSpeRefType);//STEP-6396
        // Look for a bibliography product with its STEP ID matching the PRODUCTNO.

        speciesList.forEach(function(ref) {    //STEP-6396
            var speciesObj = ref.getTarget();//STEP-6396
            if (speciesObj != null) {
                var sSpeciesCode = speciesObj.getValue("SPECIESCODE").getSimpleValue();
                log.info(" sSpeciesCode " + sSpeciesCode);
                var eSpecies = step.getNodeHome().getObjectByKey("SPECIESNO", sSpeciesCode);
                log.info(" eSpecies " + eSpecies);
                if (eSpecies == null)
                    throw ("Unable to locate existing Species object. [" + sSpeciesCode + "]");
                else {
                    var idxSpecies = node.getValue("SPECIESINDEX").getSimpleValue();
                    if (!idxSpecies)
                        idxSpecies = -1;
                    pRevision.createReference(eSpecies, "Product_Revision_To_Species");
                    tmSpecies.put(idxSpecies, eSpecies);
                }
            }
            return true; //STEP-6396
        }); 
    }

    // Populate XRSpeciesCodes_String
    var lst = tmSpecies.entrySet().toArray();
    var sXRSpeciesCodes;
    var sXRSpeciesName;
    for (var j = 0; j < lst.length; j++) {
        var eSpecies = lst[j].getValue();
        var sSpeciesCode = eSpecies.getValue("SPECIESCODE").getSimpleValue();
        var sSpeciesName = eSpecies.getValue("SPECIES").getSimpleValue();
        if (j == 0) {
            sXRSpeciesCodes = sSpeciesCode;
            sXRSpeciesName = sSpeciesName;
        } else {
            sXRSpeciesCodes = sXRSpeciesCodes + ", " + sSpeciesCode;
            sXRSpeciesName = sXRSpeciesName + ", " + sSpeciesName;
        }
    }
    log.info("XRSpeciesCodes_String" + sXRSpeciesCodes)
    log.info("XRSpeciesName_String" + sXRSpeciesName)
    if (sXRSpeciesCodes)
        pRevision.getValue("Species_Codes_XRStr").setSimpleValue(sXRSpeciesCodes);
    if (sXRSpeciesName)
        pRevision.getValue("Species_Names_XRStr").setSimpleValue(sXRSpeciesName);

    // Tech Transfer Lot Mapping
    // Delete existing lot references in the revision pRevsion
    var pRevtoTechTranType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
    var pTechTranLinks = pRevision.getProductReferences().get(pRevtoTechTranType);
    for (var i = 0; i < pTechTranLinks.size(); i++) {
        pTechTranLinks.get(i).delete();
    }
    // To create a reference ProductRevision_to_TechTransfer for the revision pRevision to the TechTransfer object / Nonlot object
    pRevision.createReference(node, "ProductRevision_to_Lot");

    // Target
    var pProduct = pRevision.getParent();
    // Delete all Existing Targets
    if (pProduct) {
        var targetRefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
        if (targetRefType != null) {
            //STEP-6396
            var targetList = pProduct.queryReferences(targetRefType);
            targetList.forEach(function(ref) {
                ref.delete();
                return true;
            });
            //STEP-6396
        }
        //create Product To Target references
        var lstTarget = node.getValue("ProductTargets").getValues();
        if (lstTarget) {
            for (var i = 0; i < lstTarget.size(); i++) {
                var sTargetCode = lstTarget.get(i).getValue();
                var eTarget = step.getNodeHome().getObjectByKey("TARGETNO", sTargetCode);
                if (eTarget == null)
                    throw ("Unable to locate existing Target object. [" + sTargetCode + "]");
                else
                    pProduct.createReference(eTarget, "Product_to_Target");
            }
        }
    }

    // Application  && Component
    // Populate Kit Component for kit and Application for lot managed
    if (nLotManagedFlag && nLotManagedFlag == "Y") {
        updateRevisionReferences(step, pRevision, node, true, log);
    } else {
        updateRevisionReferences(step, pRevision, node, false, log);
    }

    return pRevision;
}

/**
 * Checks if TechTransferLot has different order of components from order of components in Current Revision for the related product
 * @param  manager
 * @param  techTransferLot
 * @return true if TechTransferLot has different order of components from order of components in Current Revision for the related product, false otherwise
 */
function isComponentOrderChanged(manager, techTransferLot) {

    // Getting Lot Components Order
    var lotComponentsOrderJson = {};
    var children = techTransferLot.getChildren();

    for (var i = 0; i < children.size(); i++) {

        var child = children.get(i);

        if (child.getObjectType().getID() == "Lot_Component") {

            var compName = child.getName();

            var compOrder = child.getValue("COMPONENTINDEX").getSimpleValue();
            lotComponentsOrderJson[compName] = compOrder
            //log.info("lot component name: " + compName + ", order index: " + compOrder);
        }
    }

    // Checking if the Component Order in the Current Revision is different to the order in Tech Transfer Lot
    var productNo = techTransferLot.getValue("PRODUCTNO").getSimpleValue();
    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productNo);


    // STEP-6384
    //var nMasterStockSKU = techTransferLot.getValue("MasterStock_SKU").getSimpleValue(); // STEP-6384 revert STEP-6759
    //var pMasterStock = manager.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStockSKU); // STEP-6384 revert STEP-6759
    //var pRevision = Lib.getLatestAssociatedRevision(pMasterStock);  // STEP-6384 revert STEP-6759    
    var currRevision = BL_MaintenanceWorkflows.getCurrentRevision(product); // STEP-6384 revert STEP-6759
    // STEP-6384 changed currRevision to pRevision

    //log.info("Current Revision: " + currRevision.getName());

    var refs = currRevision.getChildren(); // STEP-6384 revert STEP-6759 pRevision -> currRevision

    for (var i = 0; i < refs.size(); i++) {

        var ref = refs.get(i);

        if (ref.getObjectType().getID() == "Kit_Component") {

            var nSku = ref.getValue("COMPONENTSKU").getSimpleValue();
            var compParentSKU = ref.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var compName = compParentSKU + "_" + nSku;

            var compOrder = ref.getValue("COMPONENTORDER").getSimpleValue(); //STEP-6759 COMPONENTINDEX => COMPONENTORDER
            //log.info("rev component name: " + compName + ", order index: " + compOrder);

            if (lotComponentsOrderJson[compName] != compOrder) {

                log.info("There was a change in order of the components.")
                log.info("Component name: " + compName + ", index of order coming from TT: " +
                    lotComponentsOrderJson[compName] + ", index of order in the Current Revision " + currRevision.getName() + ": " + compOrder); // STEP-6384 revert STEP-6759 pRevision -> currRevision

                return true
            }
        }
    }

    return false;
}

/**
 * Changes the order of components for the Current Revision and revisions with higher revision numbers based on order in TechTransferLot
 * @param  manager
 * @param  techTransferLot
 */
function changeCompomentsOrder(manager, techTransferLot) {

    // Getting Lot Components Order
    var lotComponentsOrderJson = {};
    var children = techTransferLot.getChildren();

    for (var i = 0; i < children.size(); i++) {

        var child = children.get(i);

        if (child.getObjectType().getID() == "Lot_Component") {

            var compName = child.getName();

            var compOrder = child.getValue("COMPONENTINDEX").getSimpleValue();
            lotComponentsOrderJson[compName] = compOrder
            //log.info("lot component name: " + compName + ", order index: " + compOrder);
        }
    }

    // Getting Current Revision of the product related to the Tech Transfer Lot
    var productNo = techTransferLot.getValue("PRODUCTNO").getSimpleValue();
    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productNo);
    //log.info(product.getName());

    // STEP-6384
    //var nMasterStockSKU = techTransferLot.getValue("MasterStock_SKU").getSimpleValue(); // STEP-6384 revert STEP-6759
    //var pMasterStock = manager.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStockSKU); // STEP-6384 revert STEP-6759
    //var pRevision = Lib.getLatestAssociatedRevision(pMasterStock);     // STEP-6384 revert STEP-6759
    var currRev = BL_MaintenanceWorkflows.getCurrentRevision(product); // STEP-6384 revert STEP-6759
    // STEP-6384 changed currRev to pRevision and currRevNo to pRevNo

    var pRevNo = currRev.getValue("REVISIONNO").getSimpleValue(); // STEP-6384 revert STEP-6759 pRevision -> currRev
    log.info("Current Revision Number: " + pRevNo);

    children = product.getChildren();

    for (var i = 0; i < children.size(); i++) {

        var child = children.get(i);

        if (child.getObjectType().getID() == "Kit_Revision" &&
            Number(child.getValue("REVISIONNO").getSimpleValue()) >= Number(pRevNo)) {    //STEP-6759 fix to correct compare - Number

            var krChildren = child.getChildren();

            for (var j = 0; j < krChildren.size(); j++) {     //STEP-6759 fix j instead of i

                var krChild = krChildren.get(j);

                if (krChild.getObjectType().getID() == "Kit_Component") {

                    var nSku = krChild.getValue("COMPONENTSKU").getSimpleValue();
                    var compParentSKU = krChild.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
                    var compName = compParentSKU + "_" + nSku;

                    var compOrder = krChild.getValue("COMPONENTORDER").getSimpleValue(); //STEP-6759 COMPONENTINDEX => COMPONENTORDER
                    //log.info("rev component name: " + compName + ", order index: " + compOrder);

                    if (lotComponentsOrderJson[compName] != compOrder) {

                        //log.info("There was a change in order of the components.")
                        log.info("BEFORE: Component name: " + compName + ", index of order in the Revision " + child.getName() + ": " + compOrder);

                        krChild.getValue("COMPONENTORDER").setSimpleValue(lotComponentsOrderJson[compName]);  //STEP-6759 set value for COMPONENTORDER based on TT Lot

                        compOrder = krChild.getValue("COMPONENTORDER").getSimpleValue();  //STEP-6759 COMPONENTINDEX => COMPONENTORDER
                        log.info("AFTER: Component name: " + compName + ", index of order in the Revision " + child.getName() + ": " + compOrder);
                    }
                }
            }
        }
    }
}

function copyPassThroughAttributes(step, node, log) {
    log.info("copyPassThroughAttributes")
    var productNo = node.getValue("PRODUCTNO").getSimpleValue();
    var product = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);
    var masterStock = node.getValue("MasterStock_SKU").getSimpleValue();
    var masterStockObj = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", masterStock);
    var revision = Lib.getLatestAssociatedRevision(masterStockObj);
    //STEP-5957
    Lib.copyAttributes(step, node, product, "TTPT_Product_Attributes", null);
    Lib.copyAttributes(step, node, masterStockObj, "TTPT_Masterstock_Attributes", null);
    Lib.copyAttributes(step, node, revision, "TTPT_Product_Revision_Attributes", null);
    log.info("Done copyPassThroughAttributes")

}


/**
 * Calculates and updates the CLP_Lot_Concentration_Units attribute on the masterStock according to the techTransferLot object
 * @param techTransferLot 
 * @param masterStock 
 */
function updateClpLotConcentration(techTransferLot, masterStock) {

    var lotConc = techTransferLot.getValue("Lot_Concentration").getSimpleValue();
    var lotConcUnits = techTransferLot.getValue("Lot_Concentration_Units").getSimpleValue();

    if (lotConc && lotConcUnits) {
        var clpLotConcWithUnits = lotConc + " " + lotConcUnits;
        masterStock.getValue("CLP_Lot_Concentration_Units").setSimpleValue(clpLotConcWithUnits);
    }
    //log.info(masterStock.getValue("CLP_Lot_Concentration_Units").getSimpleValue());
}


/**
 * Replaces all special character html strings in the attrVal
 * @param attrVal string with attribute value
 * @returns attrVal with special characters instead of special character html strings
 */
function replaceSpecialCharacterStrings(attrVal) {
    var map = {
        '&lt;lt/&gt;': '<lt/>',
        '&lt;gt/&gt;': '<gt/>',
        '&amp;': '&',
        '<p>': '',
        '</p>': '',
        '<lt/>': '<',
        '<gt/>': '>',
        '&lt;gt/&gt': '>',
        '<sup>®</sup>': '®',
        '<sup>©</sup>': '©',
        '<sup>™</sup>': '™',
        '<sup>℠</sup>': '℠'
    };
    if (attrVal) {
        // replace all html strings
        for (key in map) {
            //log.info(key);
            attrVal = attrVal.replace(key, map[key]);
        }
        return attrVal;
    }
}

// Update MasterStock attr from TTobject to Masterstock associated to revision
// STEP-5738
//STEP-6010
function updateMSfromTT(step, node, TTobject, refType) {
    var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("New_Revision_Evaluation_Attributes");
   //STEP-6396
    var msRefs = node.queryReferences(refType) 
    
    msRefs.forEach(function(msRef) {
        var masterStock = msRef.getTarget()
        if (masterStock != null && attGroup != null) {
            var lstAttributes = attGroup.getAttributes();
            var iterator = lstAttributes.iterator();

            while (iterator.hasNext()) {
                var attribute = iterator.next();
                if (attribute.getValidForObjectTypes().contains(masterStock.getObjectType())) {
                    var sAttributeID = attribute.getID();
                    if (sAttributeID != "ProdTeam_Planner_Product") {
                        if (masterStock.getValue(sAttributeID).getSimpleValue() != TTobject.getValue(sAttributeID).getSimpleValue()) {
                            masterStock.getValue(sAttributeID).setSimpleValue(TTobject.getValue(sAttributeID).getSimpleValue());
                        }
                    } //For ProdTeam_Planner_MasterStock update 2 attributes on MS: ProdTeam_Planner_MasterStock and ProdTeam_Planner_Product
                    if (sAttributeID == "ProdTeam_Planner_MasterStock") {
                        if (masterStock.getValue("ProdTeam_Planner_Product").getSimpleValue() != TTobject.getValue(sAttributeID).getSimpleValue()) {
                            masterStock.getValue("ProdTeam_Planner_Product").setSimpleValue(TTobject.getValue(sAttributeID).getSimpleValue());
                        }
                    }
                }
            }
            // STEP-5713
            //copy passthrough MS attributes  
            //STEP-6121
            // Lib.copyAttributes(step, TTobject, masterStock, "TTPT_Masterstock_Attributes", null);
        }
        return false;
    });
    //STEP-6396
}


/**
 * To remove duplicate species on the lot applications of tt object
 * @param ttObject tech transfer (lot, nonlot) object
 */
function removeDuplicateSpecies(ttObject) {
    var children = ttObject.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Application") {

            var speciesStr = child.getValue("Appl_Species_Tested").getSimpleValue();
            //log.info("species before: " + speciesStr);

            // STEP-6038 handling case with a null value
            if (speciesStr) {
                var speciesList = speciesStr.split(';');

                var uniqueSpeciesList = [];
                for (var j = 0; j < speciesList.length; j++) {
                    var speciesCode = String(speciesList[j]);

                    if (uniqueSpeciesList.indexOf(speciesCode) == -1) {
                        //log.info(typeof (speciesCode))
                        uniqueSpeciesList.push(speciesCode);
                    }
                }

                var uniqueSpeciesStr = uniqueSpeciesList.join(';');
                //log.info("species after: " + uniqueSpeciesStr);

                child.getValue("Appl_Species_Tested").setSimpleValue(uniqueSpeciesStr);
            }
        }
    }
}

//STEP-6648 SOURCEPURIF, SPECIFSENSIV, LEGALSTATEMENT
//STEP-6758 TRADEMARKSTATEMENT, GENERALSTATEMENT
/** 
* @param ttObject tech transfer object
* @param ttRevision new WIP revision for TT
* @param parentProduct parent product
* @param parentProductRev currenbt revision of Parent product
*/
function setConjugateDefaults(ttObject, ttRevision, parentProduct, parentProductRev) {
    //SOURCEPURIF
    var parentProductRevSOURCEPURIF = parentProductRev.getValue("SOURCEPURIF").getSimpleValue();
    ttRevision.getValue("SOURCEPURIF").setSimpleValue(parentProductRevSOURCEPURIF);
 
    //SPECIFSENSIV
    var parentProductRevSPECIFSENSIV = parentProductRev.getValue("SPECIFSENSIV").getSimpleValue();
    var parentProductPRODUCTNAME = parentProduct.getValue("PRODUCTNAME").getSimpleValue();
    var ttPRODUCTNAME = ttObject.getValue("PRODUCTNAME").getSimpleValue();
    var ttRevisionSPECIFSENSIV = parentProductRevSPECIFSENSIV.replace(parentProductPRODUCTNAME,ttPRODUCTNAME);
    ttRevision.getValue("SPECIFSENSIV").setSimpleValue(ttRevisionSPECIFSENSIV);

    //LEGALSTATEMENT STEP-6648
    Lib.copyMultiValuedAttribute("LEGALSTATEMENT", parentProductRev, ttRevision, false);
    
    //TRADEMARKSTATEMENT STEP-6758
    Lib.copyMultiValuedAttribute("TRADEMARKSTATEMENT", parentProductRev, ttRevision, false);
    
    //GENERALSTATEMENT STEP-6758
    Lib.copyMultiValuedAttribute("GENERALSTATEMENT", parentProductRev, ttRevision, false);
}

//STEP-6163
function setCarrierFreeDefaults(step, rev) {
    var productNo = Lib.getReferenceTarget(rev.getParent(), "Product_To_Parent_Product").getValue("PRODUCTNO").getSimpleValue();

    /*var defaults = {
        "FORMULATION"       : "Supplied in 1X PBS, BSA and Azide Free.&lt;br/&gt;&lt;br/&gt;For standard formulation of this product see product #&lt;a href=\"/product/productDetail.jsp?productId=" + productNo + "\" target=\"_blank\"&gt;" + productNo + "&lt;/a&gt;",
        "STORAGE"           : "Store at -20°C.&lt;em&gt;This product will freeze at -20°C so it is recommended to aliquot into single-use vials to avoid multiple freeze/thaw cycles.&lt;/em&gt; A slight precipitate may be present and can be dissolved by gently vortexing. This will not interfere with antibody performance.",
        "SPECIFSENSIV"      : getParentSpecifSensiv(productNo),
        "DIRECTIONS_FOR_USE": "This product is the carrier free version of product #" + productNo + ". All data were generated using the same antibody clone in the standard formulation which contains BSA and glycerol.&lt;br/&gt;&lt;br/&gt;" +
            "This formulation is ideal for use with technologies requiring specialized or custom antibody labeling, including fluorophores, metals, lanthanides, and oligonucleotides. It is not recommended " +
            "for ChIP, ChIP-seq, CUT&RUN or CUT&Tag assays. If you require a carrier free formulation for chromatin profiling, please &lt;a href=\"https://www.cellsignal.com/services/carrier-free-and-customized-formulations/custom-formulations-request\" target=\"_blank\"&gt; contact us&lt;/a&gt;. Optimal dilutions/concentrations should be determined by the end user."
    }*/

   var defaults = {
        "FORMULATION"       : "Supplied in 1X PBS, BSA and Azide Free.<lt/>br /<gt/><lt/>br /<gt/>For standard formulation of this product see product #<lt/>a href=\"/product/productDetail.jsp?productId=" + productNo + "\" target=\"_blank\"<gt/>" + productNo + "<lt/>/a<gt/>",
        "STORAGE"           : "Store at -20°C. <lt/>em<gt/>This product will freeze at -20°C so it is recommended to aliquot into single-use vials to avoid multiple freeze/thaw cycles.<lt/>/em<gt/> A slight precipitate may be present and can be dissolved by gently vortexing. This will not interfere with antibody performance.",
        "SPECIFSENSIV"      : getParentSpecifSensiv(productNo),
        "DIRECTIONS_FOR_USE": "This product is the carrier free version of product #" + productNo + ". All data were generated using the same antibody clone in the standard formulation which contains BSA and glycerol.<lt/>br /<gt/><lt/>br /<gt/>" +
            "This formulation is ideal for use with technologies requiring specialized or custom antibody labeling, including fluorophores, metals, lanthanides, and oligonucleotides. It is not recommended " +
            "for ChIP, ChIP-seq, CUT&RUN or CUT&Tag assays. If you require a carrier free formulation for chromatin profiling, please <lt/>a href=\"https://www.cellsignal.com/services/carrier-free-and-customized-formulations/custom-formulations-request\" target=\"_blank\"<gt/> contact us<lt/>/a<gt/>. Optimal dilutions/concentrations should be determined by the end user."
    }

    for (var k in defaults) {
        rev.getValue(k).setSimpleValue(defaults[k]);
    }

    var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");

    if (refType != null) {
        //STEP-6396
        var refLinks = rev.queryReferences(refType);
        var refLinksSize = 0; 
        var productRevFolder
        refLinks.forEach(function(ref) {
            refLinksSize++;
            if (refLinksSize == 1) {
                productRevFolder = ref.getTarget();
                return true;
            } else {
                return false;
            }
            ;	
        });
        //STEP-6396

        if (refLinksSize == 1) { // should be max 1 //STEP-6396
            var figureFolders = productRevFolder.queryChildren();

            figureFolders.forEach(function(folder) {
                if (folder.getObjectType().getID() == "Figure_Folder" && !folder.getName().contains("_ds")) {
                    var folderCaption = folder.getValue("Figure_Caption").getSimpleValue() || "";

                    if (folderCaption) {
                        if(!folderCaption.endsWith("Data were generated using the standard formulation of this product.")) {
                             folderCaption = removeStringFormulated(inputString = folderCaption); // STEP-6408
                             folder.getValue("Figure_Caption").setSimpleValue((folderCaption.trim() + " Data were generated using the standard formulation of this product."));
                        }
                    }
                    else {
                        folder.getValue("Figure_Caption").setSimpleValue("Data were generated using the standard formulation of this product.");
                    }
                    
                    var kids = folder.getAssets();
                    var kidsItr = kids.iterator();

                    while (kidsItr.hasNext()) {
                        var kid = kidsItr.next();
                        var figureCaption = kid.getValue("Figure_Caption").getSimpleValue() || "";

                        if(figureCaption) {
                            if (!figureCaption.endsWith("Data were generated using the standard formulation of this product.")) {
                                figureCaption = removeStringFormulated(inputString = figureCaption); // STEP-6408
                                kid.getValue("Figure_Caption").setSimpleValue((figureCaption.trim() + " Data were generated using the standard formulation of this product."));
                            }
                        }
                        else {
                            kid.getValue("Figure_Caption").setSimpleValue("Data were generated using the standard formulation of this product.");
                        }
                    }
                }

                return true;
            });
        }
    }

    function getParentSpecifSensiv(productNo) {
        var retVal = null;

        var parentProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);

        if (parentProduct) {
            var parentProductCurrRev = BL_MaintenanceWorkflows.getCurrentRevision(product = parentProduct);
            var parentSpecifSensiv = parentProductCurrRev.getValue("SPECIFSENSIV").getSimpleValue();

            if (parentSpecifSensiv) {
                var parentProdName = parentProduct.getName().toString(); // getName() != getValue("PRODUCTNAME").getSimpleValue(); - issue with #72359 and html entities see STEP-6605
                
                if (parentSpecifSensiv.includes(parentProdName)){ //STEP-6605 getName()  
                    retVal = parentSpecifSensiv.replace(parentProdName, removeStringFormulated(inputString = parentProdName) + " (BSA and Azide Free)"); //STEP-6408
                } else {
                    var parentProdName = parentProduct.getValue("PRODUCTNAME").getSimpleValue(); //STEP-6605 getValue("PRODUCTNAME")
                    retVal = parentSpecifSensiv.replace(parentProdName, removeStringFormulated(inputString = parentProdName) + " (BSA and Azide Free)"); //STEP-6408
                }
            }
        }

        return retVal;
    }
}


// STEP-6408
function removeStringFormulated(inputString) {
    var retVal = inputString;

    if(inputString) {
        var myMatch = inputString.match(/(\s?\(\S*\s*Formulated\)\s?\.?)/gi);

        if (myMatch) {
            myMatch = myMatch.toString();

            if(myMatch.substring(myMatch.length - 1) == ".") {
                retVal = inputString.replace(myMatch, ".");
            }
            else if (myMatch.substring(myMatch.length - 1) == " " && myMatch.substring(0, 1) == " ") {
                retVal = inputString.replace(myMatch, " ");
            }
            else {
                retVal = inputString.replace(myMatch, "");
            }
        }
    }

    return retVal;
}


//STEP-6222
function copyApplicationsAttributes(step, pTechTransfer, pRevision){
	//lot_application
	var children = pTechTransfer.getChildren();
	log.info(" child "+children.size());
	
	//rev application  -- Revision_to_ApplicationProtocol
	var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
	var links = pRevision.getClassificationProductLinks(refType);
	log.info(" links.size() "+links.size());
	
	for (var i = 0; i < children.size(); i++) {
	    var child = children.get(i);
	    if (child.getObjectType().getID() == "Lot_Application" || child.getObjectType().getID() == "Product_Application" ) {
	        var sAppResult = child.getValue("RESULT").getSimpleValue();
	        log.info(sAppResult);
	        if (sAppResult == "Positive") {
	            var lotApplication = child.getValue("APPLICATIONABBR").getSimpleValue();
	            var nProtocol = child.getValue("PROTOCOLNO").getSimpleValue();
	            log.info(lotApplication);      
	            for (var j = 0; j < links.size(); j++) {
	                var ref = links.get(j);
	                var crApplication = ref.getClassification();
	                var revApplication = crApplication.getValue("APPLICATIONABBR").getSimpleValue();
	                var nProtocol = crApplication.getValue("PROTOCOLNO").getSimpleValue();
	                if (!nProtocol) {
	                    nProtocol = "";
	                } else {
	                    revApplication = crApplication.getValue("PROTOCOLAPPLICATIONABBR").getSimpleValue();
	                } 	                
	                if (lotApplication == revApplication){
	                    //replace the revision values with lot application values
	                    ref.getValue("Dilution_Low").setSimpleValue(child.getValue("Dilution_Low").getSimpleValue());
	                    ref.getValue("Dilution_High").setSimpleValue(child.getValue("Dilution_High").getSimpleValue());
	                    ref.getValue("DILUTIONFACTOR").setSimpleValue(child.getValue("DILUTIONFACTOR").getSimpleValue());
	                    ref.getValue("Appl_Species_Tested").setSimpleValue(child.getValue("Appl_Species_Tested").getSimpleValue());
	                    //log.info("changed!!!");
	                    break;
	                }
	            }
	        }
	    }
	} 
	log.info("Done copyApplicationsAttributes");
}


//STEP-6199
//Create Product_Bibliography_Folder and it's name under Product, and Product_Bibliography_Citation under Bibliography folder
function createBiblioCitations(step, pProduct, pTechTransfer) {
	var productBibFolder = pProduct.createProduct(null, "Product_Bibliography_Folder");
	var productNo = pTechTransfer.getValue("PRODUCTNO").getSimpleValue();
	productBibFolder.setName(productNo + "_Bibliography");
	//Copy attributes from Lot_Bibliography object to Product_Bibliography_Citation object
	var children = pTechTransfer.getChildren();
	if (children) {
        for (var i = 0; i < children.size(); i++) {
            var child = children.get(i);
            if (child.getObjectType().getID() == "Lot_Bibliography") {
                var productBibCit = productBibFolder.createProduct(null, "Product_Bibliography_Citation");
                var techTransferTitle = child.getValue("PUBLICATION_TITLE").getSimpleValue();
                productBibCit.setName(techTransferTitle);
                Lib.copyAttributes(step, child, productBibCit, "Tech_Transfer_Lot_Bibliography", null);
            }
        }

        Lib.setAttribute_Product_References(pProduct); //STEP-6295
    }
}
//STEP-6199 ENDS


// STEP-6165
function createRevisionCarrierFree(step, ttObject, wipBFQueue, techTransferRevisionCreated) {
    log.info("BL_TechTransfer.createRevisionCarrierFree()");

    var bNewProduct = ttObject.getValue("NewProductFlag_YN").getSimpleValue();
    var bKit = isKit(ttObject);
    var nProduct = ttObject.getValue("PRODUCTNO").getSimpleValue();
    var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
    var bNewRevision = ttObject.getValue("NewRevisionFlag_YN").getSimpleValue();
    var dateFormat = new java.text.SimpleDateFormat("YYYYMMddHHmmss");

    var pParentProduct = Lib.getReferenceTarget(pProduct, "Product_To_Parent_Product");
    var nParentProduct = pParentProduct.getValue("PRODUCTNO").getSimpleValue();
    var pParentRevision = BL_MaintenanceWorkflows.getCurrentRevision(pParentProduct);

    Lib.copyAttributes(step, ttObject, pProduct, "TTPT_Product_Attributes", null);

    BL_CopyRevision.copyReferenceOfType(sourceObj = pParentProduct, targetObj = pProduct, refTypeID = "Product_to_Target", deleteOld = false);
    BL_CopyRevision.copyReferenceOfType(sourceObj = pParentProduct, targetObj = pProduct, refTypeID = "Companion_Product", deleteOld = false);
    BL_CopyRevision.copyReferenceOfType(sourceObj = pParentProduct, targetObj = pProduct, refTypeID = "Product_To_Species", deleteOld = false);

    var pRevision = createRevision(step, ttObject, pProduct, bNewProduct, nProduct, bKit, bNewRevision);

    if (pRevision) {
        log.info("BL_TechTransfer.createRevisionCarrierFree() pRevision:" + pRevision);
        pRevision.getValue("Workflow_Name_Initiated").setSimpleValue("NPI");
        pRevision.getValue("Workflow_No_Initiated").setSimpleValue("1");
        pRevision.getValue("Workflow_Type").setSimpleValue("N");
        pRevision.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(pProduct.getValue("COPYTYPE").getSimpleValue()); // CarrierFree
        pRevision.getValue("PUBLISHED_YN").setSimpleValue("Y");

        // STEP-6583 Remove Carrier Free value from Copy type in Parent Product after child products are added to workflow.
        var approvalStatusBefore = pParentProduct.getApprovalStatus().name();
        pParentProduct.getValue("COPYTYPE").setSimpleValue(null);
        if (approvalStatusBefore == "CompletelyApproved"){
	   	  var approveParentProduct = step.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_Approve");
		  approveParentProduct.execute(pParentProduct);
        }
        //STEP-6583 Finish

        BL_AuditUtil.createAuditInstanceID(pRevision);

        var pMasterStock = createMasterStock(step = step,
                                             node = ttObject,
                                             pProduct = pProduct,
                                             bKit = bKit);

        var productFolder = step.getNodeHome().getObjectByKey("PRODUCTFOLDERKEY", nProduct);

        if(!productFolder) { // Product Folder
            var assetFolder = step.getClassificationHome().getClassificationByID("ProductImageRoot");
            productFolder = assetFolder.createClassification(null, "Product_Rev_Folder");
            productFolder.setName(nProduct);
            productFolder.getValue("Figure_Key").setSimpleValue(nProduct);
            productFolder.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(pRevision.getValue("ABBR_WORKFLOW_NAME").getSimpleValue());

            pProduct.createReference(productFolder, "Product_Folder_To_Product");
            pRevision.createReference(productFolder, "Product_Folder_To_Product_Revision");
        }

        if (pParentRevision) {
            pProduct.getValue("ORIGIN_PRODNO_REVNO").setSimpleValue(pParentRevision.getName());
        	
            var refTypePublishedImg = step.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
            var refTypeDataSheet = step.getReferenceTypeHome().getReferenceTypeByID("DataSheet");
            var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
            var refLinks = pParentRevision.queryReferences(refType); //STEP-6396
            var excludedTypes = ['IP', 'ChIP', 'ChIP-seq', 'CUT&RUN', 'CUT&Tag', 'C&R', 'C&T', 'Chromatin IP', 'Chromatin IP-seq'];
            var productFolderIdx = 0; // STEP-6643
            
            refLinks.forEach(function(ref) {   //STEP-6396
                var parentFolder = ref.getTarget(); //STEP-6396 

                if (parentFolder.getValue("Figure_Status").getSimpleValue() == "Approved") {
                    //STEP-6353 Excluded figure folders for carrier free products
                    if ((parentFolder.getValue("Figure_Heading").getSimpleValue() != null
                    && Lib.isItemInArray(excludedTypes, parentFolder.getValue("Figure_Heading").getSimpleValue()))
                        || (parentFolder.getValue("Figure_Application_Type").getSimpleValue() != null
                    && Lib.isItemInArray(excludedTypes, parentFolder.getValue("Figure_Application_Type").getSimpleValue())))
                        return true; //STEP-6396 
                    var parentFolderName = parentFolder.getName();
                    var folderKey = parentFolderName.replace(nParentProduct, nProduct);
                    var folder = step.getNodeHome().getObjectByKey("FIGUREFOLDERKEY", folderKey);

                    if (!folder) {
                        var displayIndex = parseInt(productFolder.getValue("Figure_Index").getSimpleValue() || 0, 10) + 1;
                        var figureFolder = productFolder.createClassification(null, "Figure_Folder");
                        
                        figureFolder.setName(folderKey);
                        figureFolder.getValue("Figure_Key").setSimpleValue(folderKey);
                        figureFolder.getValue("Figure_Display_Index").setSimpleValue(displayIndex);
                        figureFolder.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(productFolder.getValue("ABBR_WORKFLOW_NAME").getSimpleValue());
                        productFolder.getValue("Figure_Index").setSimpleValue(displayIndex);

                        Lib.copyAttributes(step = step,
                                           pSource = parentFolder,
                                           pTarget = figureFolder,
                                           sAttGroupId = "Figure_Attributes_CarrierFree",
                                           pExcludedAttributes = null);

                        productFolderIdx = Math.max(productFolderIdx, parseInt(figureFolder.getValue("Figure_Display_Index").getSimpleValue() || 0, 10)); // STEP-6643

                        pRevision.createReference(figureFolder, "Product_Rev_To_Figure_Folder");

                        var kids = parentFolder.getAssets();
                        var kidsItr = kids.iterator();

                        while (kidsItr.hasNext()) {
                            var kid = kidsItr.next();

                            if (kid.getValue("Image_Status").getSimpleValue() == "Active") {
                                var figure = figureFolder.createAsset(null, kid.getObjectType().getID());
                                figure.setName(folderKey);
                                figure.getValue("Figure_Key").setSimpleValue(folderKey);
                                figure.getValue("Modified_Date").setSimpleValue(dateFormat.format(new Date()));
                                figure.getValue("Figure_Display_Index").setSimpleValue(displayIndex);

                                Lib.copyAttributes(step = step,
                                                   pSource = kid,
                                                   pTarget = figure,
                                                   sAttGroupId = "Image_Attributes_CarrierFree",
                                                   pExcludedAttributes = null);

                                var outputStream = new java.io.ByteArrayOutputStream();
                	            kid.download(outputStream);

                                var inputStream = new java.io.ByteArrayInputStream(outputStream.toByteArray());
                                figure.upload(data = inputStream, orgFileName = null);

                                outputStream.close();

                                var parentFolderRefByImg = kid.queryReferencedBy(refTypePublishedImg);

                                parentFolderRefByImg.forEach(function(pubImg) {
                                    if(pubImg.getSource().getID() == pParentRevision.getID()) {
                                        pRevision.createReference(figure, "Published_Product_Images");
                                    }

                                    return true;
                                });

                                var parentFolderRefByDS = kid.queryReferencedBy(refTypeDataSheet);

                                parentFolderRefByDS.forEach(function(ds) {
                                    if(ds.getSource().getID() == pParentRevision.getID()) {
                                        pRevision.createReference(figure, "DataSheet");
                                    }

                                    return true;
                                });
                            }
                        }
                    }
                }
                return true;  //STEP-6396
            });

            productFolder.getValue("Figure_Index").setSimpleValue(productFolderIdx); // STEP-6643

            Lib.copyAttributes(step, pParentRevision, pRevision, "WebUI_Content_Review", null);

            // start STEP-6590
            var excludedTrademarkStatements = ["Alexa Trademark", "SimpleChIP"]; // STEP-6696
            var trademarkStatements = pRevision.getValue("TRADEMARKSTATEMENT").getValues();

            trademarkStatements.forEach(function(trademarkStatement) {
                if(Lib.isItemInArray(excludedTrademarkStatements, trademarkStatement.getID())) {
                    trademarkStatement.deleteCurrent();
                }

                return true;
            });

            var excludedLegalStatements = ["Alexa License (L-027) (Primary Abs)", "Alexa License (K-00436) (Secondary Abs)"]; // STEP-6696
            var legalStatements = pRevision.getValue("LEGALSTATEMENT").getValues();

            legalStatements.forEach(function(legalStatement) {
                if(Lib.isItemInArray(excludedLegalStatements, legalStatement.getID())) {
                    legalStatement.deleteCurrent();
                }

                return true;
            });
            // end STEP-6590

            //Fix added to remove workflow notes from parent for carrier Free
            pRevision.getValue("Workflow_Notes").setSimpleValue("");
        }

        setCarrierFreeDefaults(step = step, rev = pRevision);

        Lib.updateHistoryAttribute(product = pProduct, ProdfromStatus = pProduct.getValue("Product_Status").getSimpleValue(), ProdtoStatus = "Commercialization");
        pProduct.getValue("Product_Status").setSimpleValue("Commercialization");

        // STEP-6589
	   pProduct.getValue("PUBLISHED_YN").setSimpleValue(ttObject.getValue("PUBLISHED_YN").getSimpleValue());
	   // STEP-6589
        
        createReference_ProductRevision_To_MasterStock(step = step,
                                                       node = ttObject,
                                                       pRevision = pRevision,
                                                       pMasterStock = pMasterStock,
                                                       wipBFQueue = wipBFQueue,
                                                       techTransferRevisionCreated = techTransferRevisionCreated); // this initiates Production_Workflow
    }
    else {
        throw "Revision was not created.";
    }

    return pRevision;
}


//STEP-6805
/**
 * @desc Get apps and dilution factor for LOT object
 * @param ttObject  - Tech Transfer object
 * @returns Applications with dilution factor/range
 */
function getAppsForAppsSpeciesAttr(ttObject) {
    var children = ttObject.getChildren();
    var appsLot = [];
    var dApps = [];
    var apps = [];

    for (var k = 0; k < children.size(); k++) {
        if (children.get(k).getObjectType().getID() == "Lot_Application") {
            appsLot.push(children.get(k));
        }
    }

    appsLot.forEach(function (appLot) {
        var sDilution = appLot.getValue("DILUTIONFACTOR").getSimpleValue();
        var sDilutionHigh = appLot.getValue("Dilution_High").getSimpleValue();
        var sDilutionLow = appLot.getValue("Dilution_Low").getSimpleValue();
        var sDilutionRange = appLot.getValue("Dilution_Range").getSimpleValue();

        if (sDilution != null) {
            dApps.push("    • " + appLot.getName() + "\n" + "       - Dilution Factor: " + sDilution + "\n");
        }
        else if (sDilutionHigh != null && sDilutionLow != null) {
            dApps.push("    • " + appLot.getName() + "\n" + "       - Dilution Range: " + sDilutionRange + "\n");
        }
        else {
            dApps.push("    • " + appLot.getName() + "\n");
        }

        return true;
    });

    if (appsLot.length == 0) {
        apps.push(" Applications: " + "\n" + "N/A");
    }
    else if (appsLot.length == 1) {
        apps.push(" Application: " + "\n" + dApps.sort().join("\n"));
    }
    else {
        apps.push(" Applications: " + "\n" + dApps.sort().join("\n"));
    }

    return apps;
}


//STEP-6805
/**
 * @desc Get species for LOT object
 * @param manager  - STEP manager object
 * @param ttObject - Tech Transfer object
 * @returns Species
 */
function getSpeciesForAppsSpeciesAttr(manager, node) {
    var speciesRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Lot_To_Species");
    var refLinks = node.queryReferences(speciesRefType);
    var specListNames = [];
    var specList = [];

    refLinks.forEach(function (refLink) {
        var species = refLink.getTarget();
        specListNames.push("    • " + species.getName());

        return true;
    });

    if (specListNames.length != 0) {
        specList.push(" Species: " + "\n" + specListNames.sort().join("\n"));
    }
    else {
        specList.push(" Species: " + "\n" + "N/A");
    }

    return specList;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.areDifferentAttributes = areDifferentAttributes
exports.areDiffObjTypeAttr = areDiffObjTypeAttr
exports.createRevisionReferences = createRevisionReferences
exports.createRevisionReferences = createRevisionReferences
exports.isKit = isKit
exports.getSortedSpecies = getSortedSpecies
exports.getSystemInitiatedWF = getSystemInitiatedWF
exports.checkAtomicValues = checkAtomicValues
exports.checkValidatedApplications = checkValidatedApplications
exports.checkDilutionsChanges = checkDilutionsChanges
exports.checkImageChanged = checkImageChanged
exports.checkComponents = checkComponents
exports.checkTargetsValidation = checkTargetsValidation
exports.createProduct = createProduct
exports.createRevision = createRevision
exports.createMasterStock = createMasterStock
exports.createReference_ProductRevision_To_MasterStockWithoutEvent = createReference_ProductRevision_To_MasterStockWithoutEvent
exports.createReference_ProductRevision_To_MasterStock = createReference_ProductRevision_To_MasterStock
exports.updateRevisionReferences = updateRevisionReferences
exports.updateRevision = updateRevision
exports.isComponentOrderChanged = isComponentOrderChanged
exports.changeCompomentsOrder = changeCompomentsOrder
exports.copyPassThroughAttributes = copyPassThroughAttributes
exports.updateClpLotConcentration = updateClpLotConcentration
exports.replaceSpecialCharacterStrings = replaceSpecialCharacterStrings
exports.updateMSfromTT = updateMSfromTT
exports.removeDuplicateSpecies = removeDuplicateSpecies
exports.setConjugateDefaults = setConjugateDefaults
exports.setCarrierFreeDefaults = setCarrierFreeDefaults
exports.removeStringFormulated = removeStringFormulated
exports.copyApplicationsAttributes = copyApplicationsAttributes
exports.createBiblioCitations = createBiblioCitations
exports.createRevisionCarrierFree = createRevisionCarrierFree
exports.getAppsForAppsSpeciesAttr = getAppsForAppsSpeciesAttr
exports.getSpeciesForAppsSpeciesAttr = getSpeciesForAppsSpeciesAttr