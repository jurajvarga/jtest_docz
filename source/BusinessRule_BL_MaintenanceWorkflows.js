/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_MaintenanceWorkflows",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_MaintenanceWorkflows",
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
    "libraryId" : "BL_Constant",
    "libraryAlias" : "BL_Constant"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
function getLatestRegRevision(product) {
    var latestRevisionNum = -1;
    var latestRevsion = null;
    var children = product.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var pRevision = children.get(i);
        var sObjectType = pRevision.getObjectType().getID();
        if (sObjectType == "Regional_Revision") {
            var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(), 10);
            if (nVersion > latestRevisionNum) {
                latestRevisionNum = nVersion;
                latestRevsion = pRevision;
            }
        }
    }
    return latestRevsion;
}

function getLatestRevisionFromSameMasterStock(revision, manager) {
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")
    //STEP-6396
    var msRef = revision.queryReferences(refType)
    var revisions = new java.util.ArrayList()
    
    msRef.forEach(function(ref) {
        var masterStock = ref.getTarget()
        var byRefsItr = masterStock.queryReferencedBy(refType)

        byRefsItr.forEach(function(byRef) {
            revisions.add(byRef.getSource())
            return true;
        });
        return false;
    });
    //STEP-6396
    var nLatestVersion = -1
    var pLatestRevsion = null;
    for (var i = 0; i < revisions.size(); i++) {
        var pRevision = revisions.get(i)
        var sObjectType = pRevision.getObjectType().getID()
        if (BL_Library.isRevisionType(pRevision, checkServiceRevision = false)) {
            var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(), 10);
            if (nVersion > nLatestVersion) {
                nLatestVersion = nVersion
                pLatestRevsion = pRevision
            }
        }
    }
    return pLatestRevsion
}

function getLatestRevisionForMasterStock(revision, manager) {

    var nLatestVersion = -1
    var pLatestRevsion = null;
    var pLatestRevisionMap = new Object();
    //Find MasterStock from selected revision
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")

   //STEP-6396
    var msRefs = revision.queryReferences(refType)
    msRefs.forEach(function(msRef) {
        var masterStock = msRef.getTarget()
        //Get All Revisions associated to MasterStock
        var byRefsItr = masterStock.queryReferencedBy(refType)
        
        byRefsItr.forEach(function(byRef) {

            var msRevision = byRef.getSource()
            //log.info(msRevision)
            if (msRevision) {
                //For Each Revision,find the Lot Associated
                var pRevtoTechTranType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
                var pTechTranLinks = msRevision.getProductReferences().get(pRevtoTechTranType);
                //If Lot Exists for the masterstock in revision,find highest Lot and associated revision
                if (pTechTranLinks.size() > 0) {
                    for (var i = 0; i < pTechTranLinks.size(); i++) {
                        var msRevLot = pTechTranLinks.get(i).getTarget();
                        //log.info(msRevLot);

                        // If it is a NonLot object type, return revision from the argument of the function
                        if (msRevLot.getObjectType().getID() == "NonLot") {
                            // STEP-6562 temporary fix for NonLot object type case to work in forEach loop
                            pLatestRevsion = revision;
                            return false;
                            // STEP-6562 ends
                        }

                        var nVersion = parseInt(msRevLot.getValue("LOTNO").getSimpleValue(), 10);
                        log.info("nVersion " + nVersion);

                        var existRevision = pLatestRevisionMap[nVersion];
                        //log.info("existRevision "+existRevision );
                        //If no matching version for lotno in map, add the revision & lot no to map
                        if (typeof existRevision == 'undefined') {
                            if (nVersion > nLatestVersion) {
                                nLatestVersion = nVersion
                                pLatestRevsion = msRevision

                                pLatestRevisionMap[nLatestVersion] = pLatestRevsion
                            }
                        } else {
                            //If  matching version for lotno in map ,replace the lot no with latest revision to map
                            nLatestVersion = nVersion
                            var nCurrRevVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                            log.info("existRevision: " + existRevision)
                            var nExistRevVersion = parseInt(existRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                            // log.info("nCurrRevVersion "+nCurrRevVersion );
                            // log.info("nExistRevVersion "+nExistRevVersion );
                            if (nCurrRevVersion > nExistRevVersion) {
                                pLatestRevsion = msRevision
                                pLatestRevisionMap[nLatestVersion] = msRevision
                            }

                        }
                    }
                } else {
                    //If there is no Lot for the masterstock in revision,find highest  associated revision
                    var nVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                    //log.info("nVersion "+nVersion );
                    //log.info("nLatestVersion "+nLatestVersion );
                    var existRevision = pLatestRevisionMap[nVersion];
                    //log.info("existRevision "+existRevision );
                    //If no matching version for revision in map, add the revision & revision no to map
                    if (typeof existRevision == 'undefined') {
                        if (nVersion > nLatestVersion) {
                            nLatestVersion = nVersion
                            pLatestRevsion = msRevision

                            pLatestRevisionMap[nLatestVersion] = pLatestRevsion
                        }
                    } else {
                        //If  matching version for revisionno in map ,replace the revision no with latest revision to map
                        nLatestVersion = nVersion
                        var nCurrRevVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                        var nExistRevVersion = parseInt(existRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                        // log.info("nCurrRevVersion "+nCurrRevVersion );
                        // log.info("nExistRevVersion "+nExistRevVersion );
                        if (nCurrRevVersion > nExistRevVersion) {
                            pLatestRevsion = msRevision
                            pLatestRevisionMap[nLatestVersion] = msRevision
                        }

                    }
                }


            }
            return true;
        });
        return false;
    });
    //STEP-6396

    return pLatestRevsion;
}


function deleteReferences(manager, node, refsToDelete) {
    //STEP-6396
    if (refsToDelete) {
        for (var i = 0; i < refsToDelete.length; i++) {
            var refType = manager.getReferenceTypeHome().getReferenceTypeByID(refsToDelete[i]);
            var refs = node.queryReferences(refType);

            refs.forEach(function(ref) {
                ref.delete();
                return true;
            });
        }
    }
    //STEP-6396
}


// STEP-6165
function deleteReferenceOfType(node, refTypeID) {
    var refType = node.getManager().getReferenceTypeHome().getReferenceTypeByID(refTypeID);

    if (refType) {
        var refs = node.queryReferences(refType);

        refs.forEach(function(ref) {
            ref.delete();

            return true;
        });
    }
}


function setRevMaintenanceAttributes(manager, revision, maintenanceWFNo, lookUp, wfinitiatedby) {
    // clean inherited values from the origin revision
    // maybe the attribute "Workflow_No_Current is the only one needed, but one never knows
    var attGroup = manager.getAttributeGroupHome().getAttributeGroupByID("Workflow_Variables");

    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();

        while (iterator.hasNext()) {
            var attribute = iterator.next();
            var attributeId = attribute.getID();
            revision.getValue(attributeId).setSimpleValue(null);
        }
    }

    var attGroupCleanUp = manager.getAttributeGroupHome().getAttributeGroupByID("Clean_Copied_Values");

    if (attGroupCleanUp != null) {
        var lstAttributes = attGroupCleanUp.getAttributes();
        var iterator = lstAttributes.iterator();

        while (iterator.hasNext()) {
            var attribute = iterator.next();
            var attributeId = attribute.getID();
            revision.getValue(attributeId).setSimpleValue(null);
        }
    }

    deleteReferences(manager, revision, ["Product_Status_Change_Documents", "Product_Maintenance_Documents"]); // added Product_Maintenance_Documents for STEP-5790, STEP-6225 removed "Alternate_Product" from array to delete

    var maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", maintenanceWFNo);

    if (wfinitiatedby && wfinitiatedby == "U") {
        revision.getValue("Workflow_Initiated_By").setSimpleValue(manager.getCurrentUser().getID());
    } else {
        revision.getValue("Workflow_Initiated_By").setSimpleValue(wfinitiatedby);
    }

    revision.getValue("Workflow_Name_Initiated").setSimpleValue(maintenanceWFName);
    revision.getValue("Workflow_No_Initiated").setSimpleValue(maintenanceWFNo);
    revision.getValue("Workflow_Type").setSimpleValue("M");
}


function getCurrentRevision(product) {
    var refs = product.getProductReferences();
    var p2currRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
    var p2currRefs = refs.get(p2currRefType);

    if (p2currRefs && p2currRefs.size() == 1) {
        var p2currRef = p2currRefs.get(0);
        return p2currRef.getTarget();
    } else {
        return null;
    }
}


function getWIPRevision(product) {
    var refs = product.getProductReferences();
    var p2wipRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
    var p2wipRefs = refs.get(p2wipRefType);

    if (p2wipRefs && p2wipRefs.size() == 1) {
        var p2wipRef = p2wipRefs.get(0);
        return p2wipRef.getTarget();
    } else {
        return null;
    }
}


function getRegionalWIPRevision(product, region) {
    //STEP-6396
    var p2RRRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Regional_Revision");
    var p2RegRevRefs = product.queryReferences(p2RRRefType);
    var ret_p2RegRevRef;

    p2RegRevRefs.forEach(function(p2RegRevRef) {
        if (p2RegRevRef.getTarget().getValue("REVISIONSTATUS").getSimpleValue() == "In-process") {
            if (region.equals(p2RegRevRef.getValue("Initiated_Country").getSimpleValue())) {
                ret_p2RegRevRef = p2RegRevRef.getTarget();
                return false;
            }
        }
        return true;
    });
    if (ret_p2RegRevRef) {
        return ret_p2RegRevRef;
    } else {
        return null;
    }
    //STEP-6396
}


function initiateMaintenanceWF(manager, product, maintenanceWFNo, lookUp, wfinitiatedby) {
    var wipRev = getWIPRevision(product);

    /* if (wipRev.isInWorkflow("WF5_Regional_Workflow"){

   } else if() {

   }
*/

    var isSystemInitiated = false;
    if (wfinitiatedby && wfinitiatedby != "U") {
        isSystemInitiated = true;
    }
    if (wipRev && wipRev.getValue("REVISIONSTATUS").getSimpleValue() == "In-process") {
        var message = getCurrentWorkflowAndStateOfProduct(manager, wipRev);

        message = "WIP revision in status 'In-process' exists for this product. " + message;

        return ["ERR", "WIP revision", message];
        //return ["ERR", "WIP revision", "WIP revision in status 'In-process' exists for this product."];
    } else {
        //When starting at product use current revision
        var currentRev = getCurrentRevision(product);
        //currentRev = getLatestRevision(product);
        if (!currentRev) {
            return ["ERR", "No revision", "No revision was found for a given product."];
        }
        log.info('initiateMaintenanceWF BL_CopyRevision.duplicateObject() - before');
        var newRevision = BL_CopyRevision.duplicateObject(manager, currentRev, isSystemInitiated);
        log.info('initiateMaintenanceWF BL_CopyRevision.duplicateObject() - after');
        setRevMaintenanceAttributes(manager, newRevision, maintenanceWFNo, lookUp, wfinitiatedby);
        log.info('initiateMaintenanceWF setRevMaintenanceAttributes - before');
        product.createReference(newRevision, "Product_To_WIP_Revision");
        return ["OK", newRevision];
    }
}

function initiateRegMaintenanceWF(manager, product, maintenanceWFNo, region, lookUp, wfinitiatedby) {
    var regRev = getRegionalWIPRevision(product, region);
    if (regRev) {
        //return ["ERR", "Regional WIP revision", "Regional revision in status 'In-process' exists for this product."];
        var message = getCurrentWorkflowAndStateOfProduct(manager, regRev);
        message = "Regional revision in status 'In-process' exists for this product. " + message;

        return ["ERR", "Regional WIP revision", message];
    }
    var baseRev = null
    if (maintenanceWFNo) {
        baseRev = getCurrentRevision(product)
        // baseRev = getLatestApprovedRevision(product);
    } else {
        baseRev = getWIPRevision(product);
    }
    if (!baseRev) {
        return ["ERR", "No revision", "No revision was found for a given product."];
    }

    var newRevision = BL_CopyRevision.createRegionalRevision(manager, baseRev, region);
    if (maintenanceWFNo) {
        setRevMaintenanceAttributes(manager, newRevision, maintenanceWFNo, lookUp, wfinitiatedby);
    }
    return ["OK", newRevision];
}


function initiateMaintenanceDGWF(manager, product, maintenanceWFNo, region, lookUp, wfinitiatedby) {

    var dgFlag = product.getValue("Dangerous_Goods_Flag_YN").getSimpleValue() == "Y"
    var sdsApproved = product.getValue("GHS_Label_Required_CB").getSimpleValue() != null
    var gtlApproved = product.getValue("COUNTRYOFORIGIN").getSimpleValue() != null

    //STEP-6396
    if (product.getObjectType().getID() == 'Product') {
        var objrefers
        objrefers = BL_Constant.getObjRefTypes(product);
        for (var i=0; i<objrefers.length; i++){  
            var refs = product.queryReferences(objrefers[i]);
            refs.forEach(function(ref) {
                var ii = ref.getTarget();
                //log.info( ii.getObjectType().getID());
                if (ii.getObjectType().getID() == 'Product_Revision') {
                    //log.info( ii.getObjectType().getID());
                    //log.info( ii.getValue('GHS_Label_Required_CB').getSimpleValue());
                    if (ii.getValue('GHS_Label_Required_CB').getSimpleValue() != null) {
                        sdsApproved = true;
                    }
                    if (ii.getValue('COUNTRYOFORIGIN').getSimpleValue() != null) {
                        gtlApproved = true;
                    }
                }
                return true;
            });
        }
    } 
    //STEP-6396
    
    if (!sdsApproved) {
        return ["ERR", "SDS Error", "Item is not SDS Approved!"];
    } else if (!gtlApproved) {
        return ["ERR", "GTL Error", "Item is not GTL Approved!"];
    } else if (!(dgFlag || (maintenanceWFNo == "16B2"))) {
        return ["ERR", "DG Flag Error", "Dangerous Flag is not Yes!"];
    } else {
        return initiateRegMaintenanceWF(manager, product, maintenanceWFNo, region, lookUp, wfinitiatedby);
    }
}

/**
 **   @purpose : generate error message
 **   @param  : manager
 **   @param  : node
 **   @return : String error message
 **   @author : Martin Mandak 2021-04-01
 **/
function getCurrentWorkflowAndStateOfProduct(manager, node) {
    var message = '';
    var workflow;
    var workflowState;
    var arrayState;
    var mapStatesByWorkflowIds = new java.util.HashMap();
    var arrayWorkflow = ["WF6_Content_Review_Workflow",
        "Revision_Release_Workflow",
        "WF16_EU_Maintenance_Workflow",
        "WF16_Japan_Maintenance_Workflow",
        "WF16_China_Maintenance_Workflow",
        "Marketing_Review_Workflow",
        "Product_Release_Workflow",
        "Production_Workflow",
        "SDS-DG Workflow",
        "PAG_App_Mgr_PC_Review_Workflow"
    ];


    arrayState = ["Initial", "Dev_Sci_Review", "Production_Review", "Copy_Editor_Review", "Exit"];
    mapStatesByWorkflowIds.put("WF6_Content_Review_Workflow", arrayState);

    arrayState = ["Revision_Release_Workflow", "Exit"];
    mapStatesByWorkflowIds.put("Revision_Release_Workflow", arrayState);

    arrayState = ["Initial", "EU_DG_Review", "EU_Pricing_Review", "Exit"];
    mapStatesByWorkflowIds.put("WF16_EU_Maintenance_Workflow", arrayState);

    arrayState = ["Initial", "Japan_DG_Review", "Japan_Pricing_Review", "Exit"];
    mapStatesByWorkflowIds.put("WF16_Japan_Maintenance_Workflow", arrayState);

    arrayState = ["Initial", "China_DG_Review", "China_Pricing_Review", "Exit"];
    mapStatesByWorkflowIds.put("WF16_China_Maintenance_Workflow", arrayState);

    arrayState = ["Marketing_Review", "Exit"];
    mapStatesByWorkflowIds.put("Marketing_Review_Workflow", arrayState);

    arrayState = ["Product_Release_Review", "Exit"];
    mapStatesByWorkflowIds.put("Product_Release_Workflow", arrayState);

    arrayState = ["GL_Figure_Review", "Create_Short_Name", "Exit"];
    mapStatesByWorkflowIds.put("Production_Workflow", arrayState);

    arrayState = ["SDS_Review", "DG_Review", "SDS_Approval", "SDS_Exit", "GTL_Review", "GTL_Exit", "Exit_SDS_Workflow"];
    mapStatesByWorkflowIds.put("SDS-DG Workflow", arrayState);

    arrayState = ["PAG_Review", "Exit"];
    mapStatesByWorkflowIds.put("PAG_App_Mgr_PC_Review_Workflow", arrayState);


    for (var l = 0; l < arrayWorkflow.length; l++) {
        if (node.isInWorkflow(arrayWorkflow[l])) {
            workflow = manager.getWorkflowHome().getWorkflowByID(arrayWorkflow[l]);
            //logger.info(workflow.getTitle());
            var state = 0;
            var states = '';
            for (var s = 0; s < mapStatesByWorkflowIds.get(arrayWorkflow[l]).length; s++) {
                if (node.isInState(arrayWorkflow[l], mapStatesByWorkflowIds.get(arrayWorkflow[l])[s])) {
                    var workflowState = workflow.getStateByID(mapStatesByWorkflowIds.get(arrayWorkflow[l])[s]);
                    if (state == 0) {
                        states = workflowState.getTitle();
                        state++;
                    } else {
                        states = states + '; ' + workflowState.getTitle();
                    }
                }
            }
            message = message + '[ Workflow: ' + workflow.getTitle() + '; State: ' + states + ' ]';
        }
    }
    return message;
}

function initiateMaintenanceWFRev(manager, revision, maintenanceWFNo, lookUp, wfinitiatedby) {
    var product = revision.getParent();
    var lotManaged = product.getValue("LOTMANAGED_YN").getSimpleValue()
    var wipRev = getWIPRevision(product);
    var isSystemInitiated = false;
    if (wfinitiatedby && wfinitiatedby != "U") {
        isSystemInitiated = true;
    }

    log.info(" lotManaged " + lotManaged);
    log.info(" isSystemInitiated " + isSystemInitiated);
    //Check for Wip Revision Available or not
    if (wipRev && wipRev.getValue("REVISIONSTATUS").getSimpleValue() == "In-process") {
        var message = getCurrentWorkflowAndStateOfProduct(manager, wipRev);

        message = message + "WIP revision in status 'In-process' exists for this product.";

        return ["ERR", "WIP revision", message];
    } else {
        if (lotManaged == "Y") {
            /*var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot")
           var lotRef = revision.getReferences__().get(refType)
          if (lotRef.size() == 0) {
                log.info( "No lot found for a given revision.")
              return ["ERR", "No lot", "No lot found for a given revision."]
          }*/
            //When starting at revision for lot-managed product,
            //use the highest revision for the lot tied to the masterstock tied to the revision
            var currentRev = getLatestRevisionForMasterStock(revision, manager)
            log.info(" currentRev " + currentRev);
            if (!currentRev) {
                log.info("No revision was found for a given product.")
                return ["ERR", "No revision", "No revision was found for a given product."];
            }

        } else if (lotManaged == "N") {

            var currentRev = getCurrentRevision(product);
            if (!currentRev) {
                return ["ERR", "No revision", "No revision was found for a given product."];
            }
        }

        var newRevision;

        // When Maintenance is initiated by a user, a new revision should be created according to the revision,
        // from which is the user initiating a maintenance
        if (!isSystemInitiated) {
            //STEP-5831 New WF for Publish Flag
            if (maintenanceWFNo == "21") {
                var currentRev = getCurrentRevision(product);
                newRevision = BL_CopyRevision.duplicateObject(manager, currentRev, isSystemInitiated);
                // STEP-6089 adding setting revision Main_Initiated_REVISIONNO
                newRevision.getValue("Main_Initiated_REVISIONNO").setSimpleValue(currentRev.getName());
            } else {
                newRevision = BL_CopyRevision.duplicateObject(manager, revision, isSystemInitiated);
                // STEP-6089 adding setting revision Main_Initiated_REVISIONNO
                newRevision.getValue("Main_Initiated_REVISIONNO").setSimpleValue(revision.getName());
            }
        } else {
            newRevision = BL_CopyRevision.duplicateObject(manager, currentRev, isSystemInitiated);
            // STEP-6089 adding setting revision Main_Initiated_REVISIONNO
            newRevision.getValue("Main_Initiated_REVISIONNO").setSimpleValue(currentRev.getName());
        }

        setRevMaintenanceAttributes(manager, newRevision, maintenanceWFNo, lookUp, wfinitiatedby);
        product.createReference(newRevision, "Product_To_WIP_Revision");
        return ["OK", newRevision];
    }
}

function isChinaMaintenanceWokflow(wfInitiatedNo) {

    var isChinaMaintenance = false;

    if (wfInitiatedNo != null) {
        if (wfInitiatedNo == "16C1" || wfInitiatedNo == "16C2") {
            isChinaMaintenance = true;
        }
    }

    return isChinaMaintenance;
}

function isJapanMaintenanceWokflow(wfInitiatedNo) {

    var isJapanMaintenance = false;

    if (wfInitiatedNo != null) {
        if (wfInitiatedNo.toUpperCase() == "16B1" || wfInitiatedNo.toUpperCase() == "16B2") {
            isJapanMaintenance = true;
        }
    }

    return isJapanMaintenance;
}


function isEUMaintenanceWokflow(wfInitiatedNo) {

    var isEUMaintenance = false;

    if (wfInitiatedNo != null) {
        if (wfInitiatedNo.toUpperCase() == "16A1" || wfInitiatedNo.toUpperCase() == "16A2") {
            isEUMaintenance = true;
        }
    }

    return isEUMaintenance;
}


function isFF2ContentOnlyRev(ff) {
    var prodFolder = ff.getParent();

    if (prodFolder) {
        var product; // STEP-6595
        var wipRevision;

        //STEP-6396
        var pf2pRefType = prodFolder.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product"); // STEP-6595
        var byRefs = prodFolder.queryReferencedBy(pf2pRefType);
        byRefs.forEach(function (byRef) {
            product = byRef.getSource();
            return false;
        });
        //STEP-6396
/*
        //Get WIP Revision
        var refs = product.getProductReferences();
        var p2wipRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
        var p2wipRefs = refs.get(p2wipRefType);

        if (p2wipRefs.size() == 1) {
            var p2wipRef = p2wipRefs.get(0);
            var wipRevision = p2wipRef.getTarget();
        }
*/
        if(product) { // STEP-6595
            wipRevision = getWIPRevision(product);
        }

        if (wipRevision && wipRevision.getValue("Workflow_No_Initiated").getSimpleValue() == "19") { // STEP-6595
            return true;
        } else {
            return false;
        }
    }
}


function createRegionalRevisionRequest(manager, product, maintenanceWFNo, region, lookUp) {
    var regRevisionInProcess = getRegionalWIPRevision(product, region);

    if (regRevisionInProcess) {
        return ["ERR", null, "Regional revision in status 'In-process' exists for this product " + getCurrentWorkflowAndStateOfProduct(manager, regRevisionInProcess)];
    }

    if (product.isInWorkflow("Regional_Initiation_Workflow")) {
        return ["ERR", null, "Product is already in Regional Initiation workflow."];
    }

    var prodNo = product.getValue("PRODUCTNO").getSimpleValue();
    var latestRegRev = getLatestRegRevision(product);

    var revNoNew = 500;
    if (latestRegRev) {
        var revNo = latestRegRev.getValue("REVISIONNO").getSimpleValue();
        revNoNew = Number(revNo) + 1;
    }

    var dup = product.createProduct("", "Regional_Revision");
    var newRegRevRef = product.createReference(dup, "Product_To_Regional_Revision");
    newRegRevRef.getValue("Initiated_Country").setSimpleValue(region);

    var name = prodNo + "_rev_" + region + "_" + revNoNew;
    var maintenanceWFName = lookUp.getLookupTableValue("MaintenanceWorkflowLookupTable", maintenanceWFNo);
    //Changes done for STEP-5612 starts
         //STEP-5929 & 6014
         BL_AuditUtil.createAuditInstanceID(product);
         BL_AuditUtil.createAuditInstanceID(dup);
         //Changes done for STEP-5612 & 6014
    dup.setName(name);
    dup.getValue("REVISIONNO").setSimpleValue(revNoNew);
    dup.getValue("REVISIONSTATUS").setSimpleValue("In-process");
    dup.getValue("Workflow_Name_Initiated").setSimpleValue(maintenanceWFName);
    dup.getValue("Workflow_Initiated_By").setSimpleValue(manager.getCurrentUser().getID());
    dup.getValue("Workflow_No_Initiated").setSimpleValue(maintenanceWFNo);
    dup.getValue("Workflow_Type").setSimpleValue("M");

    //STEP-5993
    dup.getValue("Audit_Message").deleteCurrent();
    dup.getValue("Audit_Message_Index").setSimpleValue("0");
    //STEP-5993

    return ["OK", dup, ""];
}


function createRegionalRevisionRequest_DG(manager, product, maintenanceWFNo, region, lookUp) {
    var dgFlag = product.getValue("Dangerous_Goods_Flag_YN").getSimpleValue() == "Y"
    var sdsApproved = product.getValue("GHS_Label_Required_CB").getSimpleValue() != null
    var gtlApproved = product.getValue("COUNTRYOFORIGIN").getSimpleValue() != null

    //STEP-6396
    if (product.getObjectType().getID() == 'Product') {
        var objrefers
        objrefers = BL_Constant.getObjRefTypes(product);
        for (var i=0; i<objrefers.length; i++){  
            var refs = product.queryReferences(objrefers[i]);
            refs.forEach(function(ref) {
                var ii = ref.getTarget();
                if (ii.getObjectType().getID() == 'Product_Revision') {
                    if (ii.getValue('GHS_Label_Required_CB').getSimpleValue() != null) {
                        sdsApproved = true;
                    }
                    if (ii.getValue('COUNTRYOFORIGIN').getSimpleValue() != null) {
                        gtlApproved = true;
                    }
                }
                return true;
            });
        }
    }
    //STEP-6396

    if (!sdsApproved) {
        return ["ERR", "SDS Error", "Item is not SDS Approved!"];
    } else if (!gtlApproved) {
        return ["ERR", "GTL Error", "Item is not GTL Approved!"];
    } else if (!(dgFlag || (maintenanceWFNo == "16B2"))) {
        return ["ERR", "DG Flag Error", "Dangerous Flag is not Yes!"];
    } else {
        return createRegionalRevisionRequest(manager, product, maintenanceWFNo, region, lookUp);
    }
}


function updateRegionalRevision(manager, regionalRevision, productRevision) {
    //STEP-6396
    var p2RRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Regional_Revision"); 
    var p2RegRevRefs = regionalRevision.getParent().queryReferences(p2RRRefType);
    
    p2RegRevRefs.forEach(function(p2RegRevRef) {
   
        if (p2RegRevRef.getTarget().getID() == regionalRevision.getID()) {
            p2RegRevRef.getValue("Initiated_REVISIONNO").setSimpleValue(productRevision.getValue("REVISIONNO").getSimpleValue());
            return false;
        }
        return true;
    });
    //STEP-6396

    // STEP-5985 Q: why do we copy SDS/kits here if we are also copying it in BL_CopyeRevision.createRegionalRevision
    //var revNo = productRevision.getValue("REVISIONNO").getSimpleValue();
    var revNoNew = regionalRevision.getValue("REVISIONNO").getSimpleValue();
    var sdsIter = productRevision.getChildren().iterator();
    log.info('******************======= BL_MaintenanceWorkflows itersize' + sdsIter.length);
    while (sdsIter.hasNext()) {
        var sds = sdsIter.next();
        var sdsObj = sds.getObjectType().getID();
        
	   //STEP-5990 -Do not copy over Deleted SDS
        if (sdsObj == "SDS_ASSET_URL_LINK" && sds.getValue("SDS_Link_Status_CD").getSimpleValue() == 'Active') {
            var sdsSubProduct = regionalRevision.createProduct("", sdsObj);
            var sdsName = sds.getName();
            if (sdsName == null) {
                sdsName = "";
            }

            // STEP-5920 correcting setting of the SDS name
            //var newSDSName = sdsName.replace("_Rev" + revNo + "_", "_Rev" + revNoNew + "_");
            var prodNo = regionalRevision.getValue("PRODUCTNO").getSimpleValue();
            var newSDSName = prodNo + "_Rev" + revNoNew + "_" +
                sds.getValue("SDS_Subformat").getSimpleValue() + "_" + sds.getValue("SDS_Language").getSimpleValue() + "_" +
                sds.getValue("Doc_Revision_No").getSimpleValue() + "_" + sds.getValue("SDS_Format").getSimpleValue() + "_" +
                sds.getValue("Plant").getSimpleValue();
            // STEP-5920 ends
            log.info(" ********++++++++ newSDSName " + newSDSName);
            sdsSubProduct.setName(newSDSName);
            // STEP-5985 setting correct value for SDS link
            sdsSubProduct.getValue("PRODUCTNO").setSimpleValue(prodNo + "_rev" + revNoNew);
            sdsSubProduct.getValue("REVISIONNO").setSimpleValue("Rev" + revNoNew);
            // STEP-5985 ends
			
			//STEP-5957
			//BL_CopyRevision.copyMetaAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES");
			BL_Library.copyAttributes(manager, sds, sdsSubProduct, "SDS_ATTRIBUTES", ["REVISIONNO"]);

        } else if (sdsObj == "Kit_Component") {
            var sdsSubProduct = regionalRevision.createProduct("", sdsObj);
            var componentSku = sds.getValue("COMPONENTSKU").getSimpleValue();
            var componentParentSku = sds.getValue("COMPONENTPARENTKITSKU").getSimpleValue();
            var newKitComponentName = componentParentSku + "_" + componentSku;
            sdsSubProduct.setName(newKitComponentName);
			//STEP-5957
            //BL_CopyRevision.copyMetaAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components");
			BL_Library.copyAttributes(manager, sds, sdsSubProduct, "Tech_Transfer_Rev_Components", ["REVISIONNO"]);
        }
    }

    var cVals = productRevision.getValues();
    var cValsItr = cVals.iterator();

    while (cValsItr.hasNext()) {
        var cVal = cValsItr.next();
        var attr = cVal.getAttribute();

        if (!cVal.isInherited()) {
            if (!attr.isDerived()) {
                if ( //STEP-5929
                    !attr.getID().equals("Audit_InstanceID") &&
                    !attr.getID().equals("Audit_Message") &&
                    //STEP-5929
                    !attr.getID().equals("REVISIONNO") &&
                    !attr.getID().equals("REVISIONSTATUS") &&
                    !attr.getID().equals("MakeRevisionEffectiveDate") &&
                    !attr.getID().equals("Revision_Switch") &&
                    !BL_Library.belonsgAttributeToGroup(manager, attr.getID(), "Workflow_Variables") &&
                    !BL_Library.belonsgAttributeToGroup(manager, attr.getID(), "Clean_Copied_Values")) {
                    regionalRevision.getValue(attr.getID()).setSimpleValue(cVal.getSimpleValue());
                }
            }
        }
    }

    //STEP-6396
    var objrefers
    objrefers = BL_Constant.getObjRefTypes(productRevision);
    for (var i=0; i<objrefers.length; i++){  
        var refs = productRevision.queryReferences(objrefers[i]);
        refs.forEach(function(ref) {
            var refType = ref.getReferenceType();
            try {
                if ("ProductRevision_To_MasterStock".equals(refType)) {
                    regionalRevision.createReference(ref.getTarget(), "RegionalRevision_To_MasterStock");
                } else if ("ProductRevision_to_Lot".equals(refType)) {
                    regionalRevision.createReference(ref.getTarget(), "RegionalRevision_to_Lot");
                } else if ("KitRevision_to_SKU".equals(refType)) {
                    regionalRevision.createReference(ref.getTarget(), "Regional_KitRevision_to_SKU");
                } else {
                    //STEP-5755 needed to change used function (previous one was not working for list with STEP objects)
                    if (BL_Library.isObjectValidForReferenceType(manager, regionalRevision, objrefers[i], false)) {
                        regionalRevision.createReference(ref.getTarget(), ref.getReferenceTypeString());
                    }
                }
            } catch (e) {
                logger.info("create ref: " + e);
            }
            return true;
        });
    }
    //STEP-6396

    //STEP-6396
    var byRefs = productRevision.queryReferencedBy(null);

    byRefs.forEach(function(byRef) {
        var bySource = byRef.getSource();
        var refType = byRef.getReferenceType();

        if (!"Product_To_Revision".equals(refType) && !byRef.getReferenceTypeString().equals("Product_To_Current_Revision")) {
            try {
                bySource.createReference(regionalRevision, byRef.getReferenceTypeString());
            } catch (e) {
                logger.info("by create ref: " + e);
            }
        }
        return true;
    });
    //STEP-6396

    var clsRefs = productRevision.getClassificationProductLinks();
    var clsRefsItr = clsRefs.asSet().iterator();

    while (clsRefsItr.hasNext()) {
        var clsRef = clsRefsItr.next();
        var cls = clsRef.getClassification();
        var linkType = clsRef.getLinkType();

        try {
            if (linkType.getID() != "Revision_to_ApplicationProtocol") {
                var clsProdRef = regionalRevision.createClassificationProductLink(cls, linkType);

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
}


// copied from acn-09f7a121-43d7-457e-b44a-af0f536ff8c9
function getInitiatedCountry(manager, revision) {
    //STEP-6396
    var result = null;
    var parent = revision.getParent();
    var p2RegRev = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Regional_Revision");
    var regRevs = parent.queryReferences(p2RegRev);

    regRevs.forEach(function(regRev) {
        if (regRev.getTarget().getID() == revision.getID()) {
            result = regRev.getValue("Initiated_Country").getSimpleValue();
            return false;
        }
        return true;
    });
    //STEP-6396
    return result;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getLatestRegRevision = getLatestRegRevision
exports.getLatestRevisionFromSameMasterStock = getLatestRevisionFromSameMasterStock
exports.getLatestRevisionForMasterStock = getLatestRevisionForMasterStock
exports.deleteReferences = deleteReferences
exports.deleteReferenceOfType = deleteReferenceOfType
exports.setRevMaintenanceAttributes = setRevMaintenanceAttributes
exports.getCurrentRevision = getCurrentRevision
exports.getWIPRevision = getWIPRevision
exports.getRegionalWIPRevision = getRegionalWIPRevision
exports.initiateMaintenanceWF = initiateMaintenanceWF
exports.initiateRegMaintenanceWF = initiateRegMaintenanceWF
exports.initiateMaintenanceDGWF = initiateMaintenanceDGWF
exports.getCurrentWorkflowAndStateOfProduct = getCurrentWorkflowAndStateOfProduct
exports.initiateMaintenanceWFRev = initiateMaintenanceWFRev
exports.isChinaMaintenanceWokflow = isChinaMaintenanceWokflow
exports.isJapanMaintenanceWokflow = isJapanMaintenanceWokflow
exports.isEUMaintenanceWokflow = isEUMaintenanceWokflow
exports.isFF2ContentOnlyRev = isFF2ContentOnlyRev
exports.createRegionalRevisionRequest = createRegionalRevisionRequest
exports.createRegionalRevisionRequest_DG = createRegionalRevisionRequest_DG
exports.updateRegionalRevision = updateRegionalRevision
exports.getInitiatedCountry = getInitiatedCountry