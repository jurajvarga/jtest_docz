/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_CopyRevision",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_CopyRevision",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Constant",
    "libraryAlias" : "BL_Constant"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
function createRegionalRevision(manager, current, region) {
    // STEP-5755 adding a log message
    log.info('BL_CopyRevision.createRegionalRevision : creating a regional revision from the revision ' + current.getName() + ' for the region ' + region);
    var parent = current.getParent();
    var prodNo = current.getValue("PRODUCTNO").getSimpleValue();

    var latestRev = BL_MaintenanceWorkflows.getLatestRegRevision(parent); // latest revision can have higher number than current revision

    var revNoNew = 500;
    if (latestRev) {
        var revNo = latestRev.getValue("REVISIONNO").getSimpleValue();
        revNoNew = Number(revNo) + 1;
    }
    var name = prodNo + "_rev_" + region + "_" + revNoNew;
    var dup = parent.createProduct("", "Regional_Revision");
    dup.setName(name);
    dup.getValue("REVISIONNO").setSimpleValue(revNoNew);

    var sdsIter = current.getChildren().iterator();

    while (sdsIter.hasNext()) {
        var sds = sdsIter.next();
        var sdsObj = sds.getObjectType().getID();
	   //STEP-5990 -Do not copy over Deleted SDS
        if (sdsObj == "SDS_ASSET_URL_LINK" && sds.getValue("SDS_Link_Status_CD").getSimpleValue() == 'Active') {
            var sdsSubProduct = dup.createProduct("", sdsObj);
            var sdsName = sds.getName();
            if (sdsName == null) {
                sdsName = ""
            }
            // STEP-5920 correcting setting of the SDS name
            var revNo = dup.getValue("REVISIONNO").getSimpleValue();
            var newSDSName = dup.getValue("PRODUCTNO").getSimpleValue() + "_Rev" + revNo + "_" +
                sds.getValue("SDS_Subformat").getSimpleValue() + "_" + sds.getValue("SDS_Language").getSimpleValue() + "_" +
                sds.getValue("Doc_Revision_No").getSimpleValue() + "_" + sds.getValue("SDS_Format").getSimpleValue() + "_" +
                sds.getValue("Plant").getSimpleValue();
            // STEP-5920 ends

            sdsSubProduct.setName(newSDSName);

            // STEP-5985 setting correct value for SDS link
            sdsSubProduct.getValue("PRODUCTNO").setSimpleValue(name);
            sdsSubProduct.getValue("REVISIONNO").setSimpleValue("Rev" + revNo);
            // STEP-5985 ends

			//STEP-5957
            //copyMetaAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES");
			BL_Library.copyAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES", ["REVISIONNO"]);
			
        } else if (sdsObj == "Kit_Component") {
            var sdsSubProduct = dup.createProduct("", sdsObj);
            var componentSku = sds.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = sds.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var newKitComponentName = componentParentSku + "_" + componentSku;
            sdsSubProduct.setName(newKitComponentName);
			//STEP-5957
            //copyMetaAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components");
			BL_Library.copyAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components", ["REVISIONNO"]);

        }
    }
    var cVals = current.getValues();
    var cValsItr = cVals.iterator();

    while (cValsItr.hasNext()) {
        var cVal = cValsItr.next();
        var attr = cVal.getAttribute();

        if (!cVal.isInherited()) {
            if (!attr.isDerived()) {
                if ((!attr.getID().equals("REVISIONNO")) //|| (!attr.getID().equals("Isotype"))
                ) {
                    dup.getValue(attr.getID()).setSimpleValue(cVal.getSimpleValue());
                }
            }
        }
    }

    // Copy Reference links section
	//STEP-6396
	var objrefers
	objrefers = BL_Constant.getObjRefTypes(current);
	for (var i=0; i<objrefers.length; i++){  
    	var refs = current.queryReferences(objrefers[i]);
		refs.forEach(function(ref) {
            var refType = ref.getReferenceType();
            
            try {
                if ("ProductRevision_To_MasterStock".equals(refType)) {
                    dup.createReference(ref.getTarget(), "RegionalRevision_To_MasterStock");
                } else if ("ProductRevision_to_Lot".equals(refType)) { // STEP-5317 added
                    dup.createReference(ref.getTarget(), "RegionalRevision_to_Lot");
                } else if ("KitRevision_to_SKU".equals(refType)) {
                    dup.createReference(ref.getTarget(), "Regional_KitRevision_to_SKU");
                } else {
                    // STEP-5755 checking if object type is valid for creating a Reference link
                    if (BL_Library.isObjectValidForReferenceType(manager, dup, refType, false)) {
                        dup.createReference(ref.getTarget(), ref.getReferenceTypeString());
                        //log.info("creating reference type: " + ref.getReferenceTypeString());
                    }
                    // STEP-5755 ends  
                }
            } catch (e) {
                logger.info("create ref error: " + e);
            }
            return true;
        });
    }
    //STEP-6396

    // Copy Referenced By links section
    //STEP-6396
    var byRefs = current.queryReferencedBy(null);

    byRefs.forEach(function(byRef) {    
        var bySource = byRef.getSource();
        var refType = byRef.getReferenceType();

        try {
            // STEP-5755 checking if object is valid for creating a Referenced By link
            if (BL_Library.isObjectValidForReferenceType(manager, dup, refType, true) && !byRef.getReferenceTypeString().equals("Product_To_Current_Revision")) {
                bySource.createReference(dup, byRef.getReferenceTypeString());
                //log.info("creating refBy type: " + byRef.getReferenceTypeString());
            }
        } catch (e) {
            logger.info("by create ref error: " + e);
        }
        return true;
    });  
    //STEP-6396

    // Copy classification section
    var clsRefs = current.getClassificationProductLinks();
    var clsRefsItr = clsRefs.asSet().iterator();

    while (clsRefsItr.hasNext()) {

        var clsRef = clsRefsItr.next();
        var cls = clsRef.getClassification();
        var linkType = clsRef.getLinkType();

        try {
            // STEP-5755 checking if object is valid for creating a ClassificationProduct link
            if (BL_Library.isObjectValidForClassificationProductLinkType(dup, linkType)) {
                var clsProdRef = dup.createClassificationProductLink(cls, linkType);
                //log.info("creating classification type: " + linkType);
                if (clsProdRef != null) {

                    clsProdRef.getValue("Rev_Application_Figures").setSimpleValue(clsRef.getValue("Rev_Application_Figures").getSimpleValue());
                    clsProdRef.getValue("Dilution_Low").setSimpleValue(clsRef.getValue("Dilution_Low").getSimpleValue());
                    clsProdRef.getValue("Dilution_High").setSimpleValue(clsRef.getValue("Dilution_High").getSimpleValue());
                    clsProdRef.getValue("DILUTIONFACTOR").setSimpleValue(clsRef.getValue("DILUTIONFACTOR").getSimpleValue());
                    clsProdRef.getValue("Appl_Species_Tested").setSimpleValue(clsRef.getValue("Appl_Species_Tested").getSimpleValue());
                }
            }

        } catch (e) {
            logger.info("create link type: " + e);
        }
    }
    var newRegRef = parent.createReference(dup, "Product_To_Regional_Revision");
    newRegRef.getValue("Initiated_REVISIONNO").setSimpleValue(current.getValue("REVISIONNO").getSimpleValue());
    newRegRef.getValue("Initiated_Country").setSimpleValue(region);

    dup.getValue("REVISIONSTATUS").setSimpleValue("In-process");
    //STEP-5288 Revision Release date needs to be cleared once a revision is created
    dup.getValue("MakeRevisionEffectiveDate").setSimpleValue(null);

    return dup;
}


function duplicateObject(manager, current, isSystemInitiated) {
    log.info('****************** function duplicateObject from ' + current.getName());
    var parent = current.getParent();
    var prodNo = current.getValue("PRODUCTNO").getSimpleValue();

    //STEP-5957
    var latestRev = BL_Library.getLatestRevision(parent); // latest revision can have higher number than current revision

    var revNo = latestRev.getValue("REVISIONNO").getSimpleValue();
    var revNoNew = Number(revNo) + 1;
    var name = prodNo + "_rev" + revNoNew;
    var parentObjectType = parent.getObjectType().getID();
    var dup = null;

    if (parentObjectType.equals("Product")) {
        dup = parent.createProduct("", "Product_Revision");
    } else if (parentObjectType.equals("Product_Kit")) {
        dup = parent.createProduct("", "Kit_Revision");
    } else if (parentObjectType.equals("Equipment")) {
        dup = parent.createProduct("", "Equipment_Revision");
    } else if (parentObjectType.equals("Service_Conjugates")) {
        dup = parent.createProduct("", "Service_Revision");
    }

    dup.setName(name);
    dup.getValue("REVISIONNO").setSimpleValue(revNoNew);

    var sdsIter = current.getChildren().iterator();
    //log.info('***********************======= bl_copyRevision itersize' + sdsIter.size());
    while (sdsIter.hasNext()) {
        var sds = sdsIter.next();
        var sdsObj = sds.getObjectType().getID();

        //STEP-5990 -Do not copy over Deleted SDS
        if (sdsObj == "SDS_ASSET_URL_LINK" && sds.getValue("SDS_Link_Status_CD").getSimpleValue() == 'Active') {
            var sdsSubProduct = dup.createProduct("", sdsObj);
            // STEP-5920 correcting setting of the SDS name
            var revNo = dup.getValue("REVISIONNO").getSimpleValue();
            var newSDSName = dup.getValue("PRODUCTNO").getSimpleValue() + "_Rev" + revNo + "_" +
                sds.getValue("SDS_Subformat").getSimpleValue() + "_" + sds.getValue("SDS_Language").getSimpleValue() + "_" +
                sds.getValue("Doc_Revision_No").getSimpleValue() + "_" + sds.getValue("SDS_Format").getSimpleValue() + "_" +
                sds.getValue("Plant").getSimpleValue();
            // STEP-5920 ends
            log.info(" ********++++++++ newSDSName " + newSDSName)
            sdsSubProduct.setName(newSDSName);
            // STEP-5985 setting correct value for SDS link
            sdsSubProduct.getValue("PRODUCTNO").setSimpleValue(name);
            sdsSubProduct.getValue("REVISIONNO").setSimpleValue("Rev" + revNo);
            // STEP-5985 ends

            //STEP-5957
            //copyMetaAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES");
            BL_Library.copyAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES", ["REVISIONNO"]);
        } else
        if (sdsObj == "Kit_Component" && !isSystemInitiated) {
            var sdsSubProduct = dup.createProduct("", sdsObj);
            var componentSku = sds.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = sds.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var newKitComponentName = componentParentSku + "_" + componentSku;
            sdsSubProduct.setName(newKitComponentName);

            //STEP-5957
            //copyMetaAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components");
            BL_Library.copyAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components", ["REVISIONNO"]);
        }
    }

    var cVals = current.getValues();
    var cValsItr = cVals.iterator();
    // STEP-5431 refractor product status change
    // STEP-6057 adding Revision_Switch to exclueded attributes
    // STEP-6262 Copy Product Status from Product
    var excludeAttrs = ["Product_Status", "FigureChanged_YN", "RELEASE_EMAIL_SENT_YN", "REVISIONNO", "PSC_Abandoned", "PSC_Discontinued", "PSC_InternalUseOnly", "PSC_Pending", "PSC_Pre-discontinued", "PSC_Released", "PSC_ReleasedOnHold", "Audit_InstanceID", "Audit_Message", "Audit_Message_Index", "Revision_Switch"]


    while (cValsItr.hasNext()) {
        var cVal = cValsItr.next();
        var attr = cVal.getAttribute();
        var attrId = attr.getID() + "";

        if (!cVal.isInherited()) {
            if (!attr.isDerived()) {
                // STEP-5431 refractor product status change
                if (excludeAttrs.indexOf(attrId) < 0) {
                    dup.getValue(attr.getID()).setSimpleValue(cVal.getSimpleValue());
                }
            }
        }
    }

    //STEP-6396
    var objrefers
    objrefers = BL_Constant.getObjRefTypes(current);
    for (var i=0; i<objrefers.length; i++){  
        var refs = current.queryReferences(objrefers[i]);    

        refs.forEach(function(ref) {
            var refType = ref.getReferenceType();
            //For system initiated do not add kit components during copy object,will be set as part of update.

            // STEP-5755 checking if object is valid for creating a Reference link
            var refAllowed = BL_Library.isObjectValidForReferenceType(manager, current, refType, false);

            if (isSystemInitiated && (refType == "KitRevision_to_SKU" || refType == "ProductRevision_to_Lot")) {
                refAllowed = false;
            }

            //log.info("refAllowed: " + refAllowed);
            if (refAllowed) {
                try {
                    //log.info("## here! " + ref.getTarget().getName())
                    dup.createReference(ref.getTarget(), ref.getReferenceTypeString());
                } catch (e) {
                    logger.info("create ref: " + e);
                }
            }
            return true;
        });
    }
    //STEP-6396

    //STEP-6396
    var byRefs = current.queryReferencedBy(null);

    byRefs.forEach(function(byRef) {
        var bySource = byRef.getSource();
        var refType = byRef.getReferenceType();

        try {
            // STEP-5755 checking if object is valid for creating a Referenced By link
            if (BL_Library.isObjectValidForReferenceType(manager, dup, refType, true) && !byRef.getReferenceTypeString().equals("Product_To_Current_Revision") && !byRef.getReferenceTypeString().equals("Product_To_WIP_Revision")) {
                bySource.createReference(dup, byRef.getReferenceTypeString());
            }
        } catch (e) {
            logger.info("by create ref: " + e);
        }
        return true;
    });
    //STEP-6396

    var clsRefs = current.getClassificationProductLinks();
    var clsRefsItr = clsRefs.asSet().iterator();

    while (clsRefsItr.hasNext()) {
        var clsRef = clsRefsItr.next();
        var cls = clsRef.getClassification();
        var linkType = clsRef.getLinkType();

        try {
            // STEP-5755 checking if object is valid for creating a ClassificationProduct link
            if (BL_Library.isObjectValidForClassificationProductLinkType(dup, linkType)) {
                var clsProdRef = dup.createClassificationProductLink(cls, linkType);
                if (clsProdRef != null) {

                    clsProdRef.getValue("Rev_Application_Figures").setSimpleValue(clsRef.getValue("Rev_Application_Figures").getSimpleValue());
                    clsProdRef.getValue("Dilution_Low").setSimpleValue(clsRef.getValue("Dilution_Low").getSimpleValue());
                    clsProdRef.getValue("Dilution_High").setSimpleValue(clsRef.getValue("Dilution_High").getSimpleValue());
                    clsProdRef.getValue("DILUTIONFACTOR").setSimpleValue(clsRef.getValue("DILUTIONFACTOR").getSimpleValue());
                    clsProdRef.getValue("Appl_Species_Tested").setSimpleValue(clsRef.getValue("Appl_Species_Tested").getSimpleValue());
                }
            }
        } catch (e) {
            logger.info("create link type: " + e);
        }
    }

    dup.getValue("REVISIONSTATUS").setSimpleValue("In-process");
    //STEP-5288 Revision Release date needs to be cleared once a revision is created
    dup.getValue("MakeRevisionEffectiveDate").setSimpleValue(null);
    log.info('duplicateObject' + dup.getValue("MakeRevisionEffectiveDate").getSimpleValue());

    return dup;
}


// STEP-6165
// sourceObj - from which object we read a reference of a given type
// targetObj - to which object we copy a reference of a given type
// refTypeID - string, ID of a reference
// deleteOld - boolean, if true deletes old references
function copyReferenceOfType(sourceObj, targetObj, refTypeID, deleteOld) {
    var refType = sourceObj.getManager().getReferenceTypeHome().getReferenceTypeByID(refTypeID);

    if (refType) {
        if(deleteOld == true) {
            BL_MaintenanceWorkflows.deleteReferenceOfType(node = targetObj, refTypeID = refTypeID);
        }

        var refs = sourceObj.queryReferences(refType);

        refs.forEach(function(ref) {
            try {
                targetObj.createReference(ref.getTarget(), refType);
            }
            catch (e) {
                if (e.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException)
                    null;
            }

            return true;
        });
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createRegionalRevision = createRegionalRevision
exports.duplicateObject = duplicateObject
exports.copyReferenceOfType = copyReferenceOfType