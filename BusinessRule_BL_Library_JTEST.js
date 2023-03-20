/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_Library",
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
// BL Libray
//STEP-5957
/**
 * @desc Copy Attribute values from the Group sAttGroupId From pSource object To pTarget object. 
 * @desc Only attributes that are valid for pTarget and are not excluded by list pExcludedAttributes
 * @param pSource  - Object for copying attributes from
 * @param pTarget  - Object for copying attributes to
 * @param pExcludedAttributes  - List of the attributes excluded from copying
 * @returns parentobjectid
 */
function copyAttributes(step, pSource, pTarget, sAttGroupId, pExcludedAttributes) {
    //log.info("++++++++=====Inside CopyAttribute " + sAttGroupId);
    //log.info("Copy from: " + pSource.getName());
    //log.info("Copy to: " + pTarget.getName());
    //log.info("Excluded for copy: " + pExcludedAttributes);
    var attGroup = step.getAttributeGroupHome().getAttributeGroupByID(sAttGroupId);
    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();
        while (iterator.hasNext()) {
            var attribute = iterator.next();
            //log.info("attribute " + attribute.getID());
            if (attribute.getValidForObjectTypes().contains(pTarget.getObjectType())) {
                var attID = attribute.getID();
                var val = pSource.getValue(attID).getSimpleValue();
                //Changes Done for SD ticket 301725 Starts 
                // if (val && val.toUpperCase()!="see STEP for current information".toUpperCase()) {
                //Correction for STEP-5877
                if (!isItemInArray(pExcludedAttributes, attID)) {
                    if (val == null) {
                        //log.info(" OLD value " + pTarget.getValue(attID).getSimpleValue())
                        //log.info(" New Valueee " + val)
                        pTarget.getValue(attID).setSimpleValue(val);
                    } else if (val.toUpperCase() != "see STEP for current information".toUpperCase()) {
                        //Changes Done for SD ticket 301725 Ends
                        try {
                            //log.info(" OLD value " + pTarget.getValue(attID).getSimpleValue())
                            //log.info(" New Valueee " + val)
                            pTarget.getValue(attID).setSimpleValue(val);
                        } catch (ex) {
                            log.info("Unable to copy attribute value [" + attribute.getID() + ":" + val + "] to " + pTarget.getName());
                        }
                    }
                }
            }
        }
    }
}
//STEP-5957
/**
 **   @param :  arrayOfvalues - array of items
 **   @param :  valueToFind - string
 **   @purpose : returns true or false depending if valueToFind is in array
 **/
function isItemInArray(arrayOfvalues, valueToFind) {
    var retVal = false;

    if (arrayOfvalues && valueToFind) {
        for (var i = 0; i < arrayOfvalues.length; i++) {
            if (arrayOfvalues[i] == valueToFind) {
                retVal = true;
                break;
            }
        }
    }

    return retVal;
}

/**
 * Copy Multi Valued Attribute with ID attrID from sourceObject to targetObject
 * @param attrID String, attribute ID 
 * @param sourceObject object, a product or a revision or any Step object which can have multi valued attributes
 * @param targetObject object, a product or a revision or any Step object which can have multi valued attributes
 * @param deleteFlag delete the values from targetValues that doesn't exist in sourceValues, true = delete them, false = no delete //STEP-6648
 */
function copyMultiValuedAttribute(attrID, sourceObject, targetObject, deleteFlag) {
    var targetMultiValue = targetObject.getValue(attrID)
    var targetValues = targetMultiValue.getValues();

    var sourceMultiValue = sourceObject.getValue(attrID);
    var sourceValues = sourceMultiValue.getValues();
    for (var i1 = 0; i1 < sourceValues.size(); i1++) {
        var sourceVal = sourceValues.get(i1).getSimpleValue();

        //Set, only if sourceVal doesn't exist in the set of targetValues    
        var hasMatchingValue = false;
        targetValues = targetMultiValue.getValues();

        for (var i2 = 0; i2 < targetValues.size(); i2++) {
            var targetVal = targetValues.get(i2).getSimpleValue();
            if (sourceVal.equals(targetVal)) {
                hasMatchingValue = true;
                break;
            }
        }

        if (hasMatchingValue) {
            log.info("   value exists: " + sourceMultiValue.getAttribute().getID() + "=" + sourceVal);
        } else {
            targetMultiValue.addValue(sourceVal);
            log.info("   value added: " + sourceMultiValue.getAttribute().getID() + "=" + sourceVal);
        }
    }

    if (deleteFlag == true) { //STEP-6648
        //delete the values from targetValues that doesn't exist in sourceValues
        var targetValues = targetMultiValue.getValues();
        for (var i2 = 0; i2 < targetValues.size(); i2++) {
            var targetVal = targetValues.get(i2).getSimpleValue();
            var hasMatchingValue = false;

            var sourceValues = sourceMultiValue.getValues();
            for (var i1 = 0; i1 < sourceValues.size(); i1++) {
                var sourceVal = sourceValues.get(i1).getSimpleValue();
                if (sourceVal.equals(targetVal)) {
                    hasMatchingValue = true;
                    break;
                }
            }
            if (!hasMatchingValue) {
                targetValues.get(i2).deleteCurrent();
            }
        }
    }
}

// Approves node
function getApprovedNode(step, obj) {
    var vObject = step.executeInWorkspace("Approved", function (appManager) {
        var appNode = appManager.getProductHome().getProductByID(obj.getID());
        return appNode;
    });
    return vObject;
}

// triggers object from one workflow state to another
function Trigger(instance, state, action, desc) {
    try {
        instance.getTaskByID(state).triggerLaterByID(action, desc);
    } catch (err) {
        instance.getTaskByID(state).triggerByID(action, desc);
    }
}

/**
 * triggers transition for an object in the specific workflow and state
 * @param object object in the workflow
 * @param transitionAction transition to trigger
 * @param wfID string with workflow id
 * @param stateID string with state id
 * @param bCreateAudit boolean, set to true if audit instance should be created
 */
function triggerTransition(object, transitionAction, wfID, stateID, bCreateAudit) {
    var task = object.getTaskByID(wfID, stateID);
    if (task != null) {
        if (bCreateAudit) {
            //STEP-5929 & 6014
            BL_AuditUtil.createAuditInstanceID(object);
        }
        try {
            task.triggerByID(transitionAction, "");
            return true;
        } catch (e) {
            // if trigger fails try trigger later
            task.triggerLaterByID(transitionAction, "");

        }
    }
}

// Sets Target Type
function isTargetTypeMotif(step, pProduct) {
    var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
    //STEP-6396
    var refs = pProduct.queryReferences(refType);
    var retValue = false;
    refs.forEach(function(ref) {
        var eTarget = ref.getTarget();
        var sTargetType = eTarget.getValue("TARGETTYPE").getSimpleValue();
        if (sTargetType == null && sTargetType == "Motif") {
            retValue = true;
            return false;
        }
        return true;
    });
    return retValue;
    //STEP-6396
}

// Looks up what subcategory the product is going to live under
/*function getSubCategory(sSubCategoryId, step){
	var eCategorizationLogicRoot = step.getEntityHome().getEntityByID("Product_Type_SubCategory_Logic");
	var children = eCategorizationLogicRoot.getChildren().iterator();
	while(children.hasNext()){
		var eMapping = children.next();
		if(eMapping.getValue("New_Product_Product_Type").getSimpleValue() == sSubCategoryId){
			return eMapping.getValue("New_Product_SubCategory_ID").getSimpleValue();
		}
	}
	return null;
}*/
function getSubCategory(sSubCategoryId, step) {
    var eCategorizationLogicRoot = step.getEntityHome().getEntityByID("ProductTypeDefaultsList");
    var children = eCategorizationLogicRoot.getChildren().iterator();
    while (children.hasNext()) {
        var eMapping = children.next();
        if (eMapping.getValue("PRODUCTTYPE_DFLT").getSimpleValue() == sSubCategoryId) {
            return eMapping.getValue("New_Product_SubCategory_ID").getSimpleValue();
        }
    }
    return null;
}

//STEP-5957
function getLatestRevision(product) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;
    var children = product.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var pRevision = children.get(i);

        if (isRevisionType(pRevision, checkServiceRevision = true)) {
            var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(), 10);
            if (nVersion > nLatestVersion) {
                nLatestVersion = nVersion;
                pLatestRevsion = pRevision;
            }
        }
    }

    return pLatestRevsion;
}

//STEP-5957
// determins the latest approved revision object
function getLatestApprovedRevision(product) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;
    var children = product.getChildren();
    for (var i = 0; i < children.size(); i++) {
        var pRevision = children.get(i);

        if (isRevisionType(pRevision, checkServiceRevision = false)) {
            var nVersion = Number(pRevision.getValue("REVISIONNO").getSimpleValue());
            if (nVersion > nLatestVersion) {
                if (pRevision.getApprovalStatus().name() != "NotInApproved") {
                    nLatestVersion = nVersion;
                    pLatestRevsion = pRevision;
                }
            }
        }
    }
    return pLatestRevsion;
}


// determins the latest non approved revision object
function getLatestNotApprovedRevision(product) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;
    var children = product.getChildren();
    for (var i = 0; i < children.size(); i++) {
        var pRevision = children.get(i);

        if (isRevisionType(pRevision, checkServiceRevision = false)) {
            var nVersion = Number(pRevision.getValue("REVISIONNO").getSimpleValue());
            if (nVersion > nLatestVersion) {
                if (pRevision.getApprovalStatus().name() == "NotInApproved") {
                    nLatestVersion = nVersion;
                    pLatestRevsion = pRevision;
                }
            }
        }
    }
    return pLatestRevsion;
}

//STEP-5957
function getLatestRevision_inApprovedState(product) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;
    var children = product.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var pRevision = children.get(i);

        if (isRevisionType(pRevision, checkServiceRevision = false)) {
            if (pRevision.getValue("REVISIONSTATUS").getSimpleValue() == "Approved") {
                var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(), 10);
                if (nVersion > nLatestVersion) {
                    nLatestVersion = nVersion;
                    pLatestRevsion = pRevision;
                }
            }
        }
    }
    return pLatestRevsion;
}

// determines the next RevisionNo for new Revisions
function getNextRevisionNo(pProduct) {
    var nLatestVersion = -1;
    if (pProduct != null) {
        var children = pProduct.getChildren();
        for (var i = 0; i < children.size(); i++) {
            var pRevision = children.get(i);

            if (isRevisionType(pRevision, checkServiceRevision = false)) {
                var nVersion = Number(pRevision.getValue("REVISIONNO").getSimpleValue());
                if (nVersion > nLatestVersion) {
                    nLatestVersion = nVersion;
                }
            }
        }
    }
    return nLatestVersion;
}


// get the masterstock linked revision object
function getLatestAssociatedRevision(pMasterStock) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;

    var list = pMasterStock.getReferencedByProducts();
    var iter = list.iterator();
    while (iter.hasNext()) {
        var ref = iter.next();
        var refType = ref.getReferenceTypeString();
        if (refType == "ProductRevision_To_MasterStock") {
            var pRevision = ref.getSource();
            //var pRevision =children.get(i);
            var sObjectType = pRevision.getObjectType().getID();
            var revStatus = pRevision.getValue("REVISIONSTATUS").getSimpleValue();
            // Skip Canceled Revisions
            if ((isRevisionType(pRevision, checkServiceRevision = true)) && revStatus != "Canceled") { // STEP-6003 added Service_Revision
                var nVersion = Number(pRevision.getValue("REVISIONNO").getSimpleValue());
                if (nVersion > nLatestVersion) {
                    //if (pRevision.getApprovalStatus().name()!= "NotInApproved"){
                    nLatestVersion = nVersion;
                    pLatestRevsion = pRevision;
                    //}
                }
            }
        }
    }

    return pLatestRevsion;
}


//Get the latest approved attribute
function getApprovedProductAttribute(manager, obj, idAttribute) {
    var apprProduct = manager.executeInWorkspace("Approved", function (apprManager) {
        var apprNode = apprManager.getProductHome().getProductByID(obj.getID());
        return apprNode;
    });
    if (apprProduct)
        return apprProduct.getValue(idAttribute).getSimpleValue();
    else
        return null;
}

//copy workflow variable from one workflow to another
function copyWorkflowVariable(step, obj, srcWorkflowId, dstWorkflowId, sVariableId) {
    if (obj.isInWorkflow(srcWorkflowId) && obj.isInWorkflow(dstWorkflowId)) {
        var srWorkflow = step.getWorkflowHome().getWorkflowByID(srcWorkflowId);
        var srcInstance = obj.getWorkflowInstance(srWorkflow);

        var dstWorkflow = step.getWorkflowHome().getWorkflowByID(dstWorkflowId);
        var dstInstance = obj.getWorkflowInstance(dstWorkflow);
        //log.info("Src-->" + srcInstance.getSimpleVariable(sVariableId));

        dstInstance.setSimpleVariable(sVariableId, srcInstance.getSimpleVariable(sVariableId));
        //log.info("Dst-->" + dstInstance.getSimpleVariable(sVariableId));
    }
}

//rounds digits to 2 decimals
function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if (n < 0) {
        negative = true;
        n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if (negative) {
        n = (n * -1).toFixed(2);
    }
    return n;
}

// join together an array of strings and object string representations
// join delimiter characters: semicolon and space
function logRecord(messageArray) {
    return messageArray.join("; ");
}

//Get Current Task
function getCurrentTaskState(workflow) {
    var taskState = "";
    var tasks = workflow.getTasks();
    var tasksItr = tasks.iterator();
    while (tasksItr.hasNext()) {
        task = tasksItr.next();
        if (task != null) {
            taskState = task.getState().getID();
        }
    }
    return taskState;
}

function isTaskExists(workflow, stateid) {
    var taskexist = false;
    var tasks = workflow.getTasks();
    var tasksItr = tasks.iterator();
    while (tasksItr.hasNext()) {
        task = tasksItr.next();
        if (task != null) {
            taskState = task.getState().getID();
            if (taskState == stateid) {
                taskexist = true;
            }
        }
    }
    return taskexist;
}


//returns reference attribute value for target
function getReferenceAttrValue(product, target, referenceType, attribute) {
    //STEP-6396
    var references = getQueryReferences(product, referenceType);
    var ret_iReference;
    references.forEach(function(iReference) {
        var iTargetRevision = iReference.getTarget();
        if (target.getID().equals(iTargetRevision.getID())) {
            ret_iReference = iReference.getValue(attribute).getSimpleValue();
            return false;
        }
        return true;
    });
    if (ret_iReference){
        return ret_iReference;
    } else {
        return null;
    }
    //STEP-6396
}

//returns reference attribute value
function getReferenceAttrValueWOTarget(product, referenceType, attribute) {
    //STEP-6396
    var references = getQueryReferences(product, referenceType);
    var ret_iTargetRevision;
    references.forEach(function(iReference) {
        var iTargetRevision = iReference.getTarget();
        ret_iTargetRevision = iTargetRevision.getValue(attribute).getSimpleValue();
        return false;
    });
    if (ret_iTargetRevision) {
        return ret_iTargetRevision;
    } else {
        return null;
    }
    //STEP-6396
}

//for  the product return all references of specified type
function getReferences(product, referenceType) {
    var refType = product.getManager().getReferenceTypeHome().getReferenceTypeByID(referenceType);
    return product.getReferences(refType);
}

//for  the product return all references of specified type by queryreferences
function getQueryReferences(product, referenceType) {
    var refType = product.getManager().getReferenceTypeHome().getReferenceTypeByID(referenceType);
    return product.queryReferences(refType);
}

//Returns all the revisions of a product
function getRevisions(product) {
    var revisionList = new java.util.ArrayList();
    var query = product.queryChildren();
    var resultList = query.asList(100);

    for (var i = 0; i < resultList.size(); i++) {
        var child = resultList.get(i);
        var childObjectTypeID = child.getObjectType().getID();

        if (isRevisionType(child, checkServiceRevision = false)) {

            revisionList.add(child);
        }
    }
    return revisionList;
}




function getProductMasterstock(product) {
    var msList = new java.util.ArrayList();
    var query = product.queryChildren();
    var resultList = query.asList(100);

    for (var i = 0; i < resultList.size(); i++) {
        var child = resultList.get(i);
        var childObjectTypeID = child.getObjectType().getID();

        if (childObjectTypeID == "MasterStock") {

            msList.add(child);
        }
    }
    return msList;
}


//Check Source or Custom Lot
function checkSourcedOrCustomLot(step, node, log) {
    var sourced = "";
    var customlot = "";
    var result = false;
    var customworkflow = "N";
    if (node != null) {
        //To Get Tech Transfer Lot  Information
        var refTypeTT = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
        var revTTLotReferences = node.queryReferences(refTypeTT); //STEP-6396
        //logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());
        revTTLotReferences.forEach(function(ref) {    //STEP-6396
            var ttLotObj = ref.getTarget(); //STEP-6396
            log.info(" ttLotObj " + ttLotObj);
            if (ttLotObj != null) {
                if (ttLotObj.getValue("Sourced").getSimpleValue() != null) {
                    sourced = ttLotObj.getValue("Sourced").getSimpleValue();
                    return false; //STEP-6396
                }
            }
            return true; //STEP-6396
        });
        if (node.getValue("CustomLotRev_YN").getSimpleValue() != null) {
            customlot = node.getValue("CustomLotRev_YN").getSimpleValue();
        }
        //STEP-6032
        var abbrWF = node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();
        var isCustom = abbrWF != null && abbrWF.toLowerCase() == "custom";
        if (isCustom || node.getValue("Custom_Workflow_YN").getSimpleValue() == "Y") {
            customworkflow = "Y";
        }
        log.info("sourced " + sourced + " customlot " + customlot + " customworkflow " + customworkflow)
    }
    if ((sourced != "" && sourced != "Not Sourced") || customlot == "Y" || customworkflow == "Y") {
        result = true;
    }
    return result;
}


//Returns target of the reference of the type refStr.
//If there are multiple references of the type exists, then use the first from the list
function getReferenceTarget(node, refStr) {
    var target;
    var refs = getQueryReferences(node, refStr); //STEP-6396
    refs.forEach(function(ref) { //STEP-6396
        target = ref.getTarget();  //STEP-6396
        return false; //STEP-6396
    });
    return target;
}

function deleteAssets(node) {
    if (node) {
        if (node.getObjectType().getID().equals("Figure_Folder")) {
            var objTypeItr = node.getAssets().iterator();
            while (objTypeItr.hasNext()) {
                objTypeItr.next().delete();
            }
        }
    }
}

function deleteRecursively(node) {
    if (node) {
        var children = node.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next();
            deleteRecursively(child);
            deleteAssets(child)
            child.delete();
        }
    }
}

//STEP-6332
function deleteRecursivelyWithApproval(node) {
    if (node) {
        var children = node.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next();
            deleteRecursivelyWithApproval(child);
            BL_Library.deleteAssets(child)
            child.delete().approve();
        }
    }
}

function deleteRefRecursively(node) {
    //STEP-6396
    if (node) {
		var objrefers
		objrefers = BL_Constant.getObjRefTypes(node);
		for (var i=0; i<objrefers.length; i++){  
     		var refs = node.queryReferences(objrefers[i]);
            
            refs.forEach(function(ref) {
                ref.delete();
                return true;
            });
        }
        var query = node.queryChildren();
        var resultList = query.asList(100);

        for (var i = 0; i < resultList.size(); i++) {
            var child = resultList.get(i);
            deleteRefRecursively(child);
        }
    }
    //STEP-6396
}

function deleteRefByRecursively(node) {
    //STEP-6396
    if (node) {
        var refs = node.queryReferencedBy(null);
        refs.forEach(function(ref) {
            ref.delete();
            return true;
        });

        var query = node.queryChildren();
        var resultList = query.asList(100);
        for (var i = 0; i < resultList.size(); i++) {
            var child = resultList.get(i);
            deleteRefByRecursively(child);
        }
    }
    //STEP-6396
}

function removeFromAllWF(node) {
    wfs = node.getWorkflowInstances().iterator()
    while (wfs.hasNext()) {
        var awf = wfs.next();
        awf.delete("");
    }
}


function updateHistoryAttribute(product, ProdfromStatus, ProdtoStatus) {
    var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var today = isoDateFormat.format(new Date());
    var attributeId = "Product_Status_History";
    var history = today + " :: " + ProdfromStatus + " to " + ProdtoStatus;
    if ((ProdtoStatus != null) && (ProdfromStatus != null)) {
        if ("Released".equals(ProdtoStatus)) {
            var oldDateRelease = product.getValue("DateReleased").getSimpleValue();
            if (!oldDateRelease) {
                product.getValue("DateReleased").setSimpleValue(today);
            }
        } else if ("Abandoned".equals(ProdtoStatus)) {
            product.getValue("Date_Abandoned").setSimpleValue(today);
        } else if ("Discontinued".equals(ProdtoStatus)) {
            product.getValue("Date_Discontinued").setSimpleValue(today);
        } else if ("Internal Use Only".equals(ProdtoStatus)) {
            product.getValue("Date_Internal_Use_Only").setSimpleValue(today);
        } else if ("Pending".equals(ProdtoStatus)) {
            product.getValue("Date_Pending").setSimpleValue(today);
        } else if ("Pre-discontinued".equals(ProdtoStatus)) {
            product.getValue("Date_Prediscontinued").setSimpleValue(today);
        } else if ("Released".equals(ProdtoStatus) || "OTS Conversion".equals(ProdtoStatus)) { // STEP-6460
            product.getValue("Date_ReReleased").setSimpleValue(today);
        } else if ("Released - On Hold".equals(ProdtoStatus)) {
            product.getValue("Date_Released_On_Hold").setSimpleValue(today);
        }
        // STEP-6460 added condition for Product_Status_History changes regarding OTS Conversion
        if ("OTS Conversion".equals(ProdtoStatus)) {
            product.getValue("Product_Status").setSimpleValue("Released");
        } else {
            product.getValue("Product_Status").setSimpleValue(ProdtoStatus);
        }
        
        // STEP-6460 Ends
        product.getValue("Date_Last_Status_Changed").setSimpleValue(today);
        if (product.getValue(attributeId).getSimpleValue()) {
            history = history + "\n" + product.getValue(attributeId).getSimpleValue();
        }
        if (history.length > 3000) {
            var strTmp = history.split("\n");
            strTmp.splice(-2, 2);
            history = strTmp.join("\n");
        }
        product.getValue(attributeId).setSimpleValue(history);
    }
}


/**
 * Return a string with lot numbers of lots bound to revision
 * @param node revision
 * @param manage STEP manager
 * @returns string with lot numbers of lots bound to revision
 */
function getLotNumbers(node, manager) {
    var lotNumbers = [];
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
    
    //STEP-6396
    var refLinks = node.queryReferences(refType);

    refLinks.forEach(function(ref) {
        var lotTarget = ref.getTarget();

        if (lotTarget) {
            var lotNo = Number(lotTarget.getValue("LOTNO").getSimpleValue());

            if (lotNo && lotNumbers.indexOf(lotNo) == -1) {
                lotNumbers.push(lotNo);
            }
        }
        return true;
    });  
    //STEP-6396

    return lotNumbers.sort().join(',');
}


/**
 * To get list with revisions in the workflow with the given workflow ID
 * @param product Product object (Product, Product_Kit, Equipment)
 * @param workflowID string
 * @returns list; empty list or filled with revisions in the workflow with the given workflow ID
 */
function getRevisionsOfProductInWorkflow(product, workflowID) {
    var revisionsInWF = [];

    var children = product.getChildren().iterator();
    while (children.hasNext()) {

        var child = children.next();
        var childObjType = child.getObjectType().getID();

        // STEP-6091 Added Regional_Revision
        if (isRevisionType(child, checkServiceRevision = true) || childObjType == "Regional_Revision") {
            if (child.isInWorkflow(workflowID)) {
                revisionsInWF.push(child);
            }
        }
    }

    return revisionsInWF;
}


/**
 * To get the master stock bound to the revision
 * @param manager Step manager
 * @param revision Revision object (Product_Revision, Kit_Revision, Equipment_Revision, Service_Revision, Regional_Revision)
 * @returns Master Stock bound to revision; null if not found
 */
function getMasterStockForRevision(manager, revision) {

    var rev2masterStockRefType;
    // STEP-6326 to also retrieve masterstock for regional revision
    if (revision.getObjectType().getID() == "Regional_Revision") {
        rev2masterStockRefType = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
    } else {
        rev2masterStockRefType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    }

    //STEP-6396
    var rev2masterStockRefs = revision.queryReferences(rev2masterStockRefType);

    var revMasterStock;
    //STEP-5957
    rev2masterStockRefs.forEach(function(ref) {
        revMasterStock = ref.getTarget();
        return false;
    });
    //STEP-6396

    return revMasterStock;
}


/**
 * Check if a revision cointains in its references tech transfer object (lot) a lot no equal to shippingLotNo
 * @param manager Step manager 
 * @param revision Revision object (Product_Revision, Kit_Revision, Equipment_Revision)
 * @param shippingLotNo string Shipping Lot No
 * @returns true if the revision has reference to a tech transfer object (lot) with lot no == shippingLotNo; false otherwise
 */
function revisionContainsShippingLot(manager, revision, shippingLotNo) {

    var bCurrentRevHasShippingLot = false;

    var rev2ttRefType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
    //STEP-6396
    var rev2ttRefs = revision.queryReferences(rev2ttRefType);

    rev2ttRefs.forEach(function(ref) {

        var ttObject = ref.getTarget();
        var lotNo = ttObject.getValue("LOTNO").getSimpleValue();

        if (lotNo == shippingLotNo) {
            bCurrentRevHasShippingLot = true;
            return false;
        }
        return true;
    });   
    //STEP-6396

    return bCurrentRevHasShippingLot;
}


/**
 * To retrieve string with MultiValue values separated with <multisep/>
 * @param multiValue STEP MultiValue object 
 * @returns string, contains values from MultiValue object
 */
function storeMultiValueInString(multiValue) {
    var multiValueString = "";

    var values = multiValue.getValues();

    if (values.size() == 0) {
        return null;
    }

    for (var i = 0; i < values.size(); i++) {

        var value = values.get(i).getSimpleValue();
        multiValueString += value;

        if (i != values.size() - 1) {
            multiValueString += "<multisep/>"
        }
    }

    return multiValueString;
}


// returns list of kits where a given product is as kit component
function getRelatedKits(step, revision) {
    var kits = new Array();
    var masterStockRefType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");

    //STEP-6396
    if (masterStockRefType) {
        var msReferences = revision.queryReferences(masterStockRefType);

        msReferences.forEach(function(msReference) {
            var ms = msReference.getTarget();
            var children = ms.getChildren();
            var kitRev2SKURefType = step.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");

            for (var j = 0; j < children.size(); j++) {
                var byRefs = children.get(j).queryReferencedBy(kitRev2SKURefType);

                byRefs.forEach(function(byRef) {
                    var bySource = byRef.getSource();
                    if (bySource.getName()) {
                        kits.push(bySource);
                    }
                    return true;
                });
            }
            return true;
        });
    }
    //STEP-6396

    return kits;
}


function belonsgAttributeToGroup(manager, attributeID, groupID) {
    var attGroup = manager.getAttributeGroupHome().getAttributeGroupByID(groupID);
    var retVal = false;

    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes().toArray();

        lstAttributes.forEach(function (attr) {
            if (attr.getID() == attributeID) {
                retVal = true;
                return true;
            }
        });
    }

    return retVal;
}


/**
 * To get previous price from price history
 * @param sku STEP SKU object 
 * @param region String (valid option: "US", "China", "Japan", "DE", "UK", "EU") 
 * @returns String with previous price retrieved from price history, retrieving "0" if history has only one row
 */
function getPreviousPrice(sku, region) {

    var currPrice;
    var hist;

    if (region == "US") {
        currPrice = sku.getValue("PRICE").getSimpleValue() != null ? Number(sku.getValue("PRICE").getSimpleValue()) : 0;
        hist = sku.getValue("Global_Base_Price_History").getSimpleValue();
    } else {
        currPrice = sku.getValue(region + "_CLP").getSimpleValue() != null ? Number(sku.getValue(region + "_CLP").getSimpleValue()) : 0;
        hist = sku.getValue(region + "_CLP_History").getSimpleValue();
    }

    if (hist) {

        var arr = hist.split("\n");

        // first history row is first SKU price setting
        if (arr.length == 1) {
            return "0";
        }

        for (var i = 0; i < arr.length; i++) {

            var row = arr[i];
            var glpChange = row.split(";")[2];
            var histCurrPrice;

            if(glpChange.split(":")[1] === undefined) { // ITSM-15574
                return "0";
            }
            else {
                var prices = glpChange.split(":")[1].trim();

                // if user previously changed price to null
                if (prices.split("-").length == 1) {
                    histCurrPrice = 0;
                } else {
                    histCurrPrice = prices.split("-")[1].trim();
        
                    if (histCurrPrice == null || histCurrPrice == "") {
                        histCurrPrice = 0;
                    } else {
                        histCurrPrice = Number(histCurrPrice);
                   }
                }

                if (histCurrPrice == currPrice) {
                    var previousPrice = prices.split("-")[0].trim();
                    previousPrice = previousPrice != "" ? previousPrice : "0";
                    return previousPrice;
                }
            }
        }
    }
    return "";
}


/**
 * To determine if the object is valid for creating a Reference
 * @param manager STEP manager
 * @param object STEP object (product, revision, ...)
 * @param referenceType STEP ReferenceType
 * @param isRefBy Boolean, set true for a Referenced By link, false for a Reference link
 * @returns true if is valid; false if not valid
 */
function isObjectValidForReferenceType(manager, object, referenceType, isRefBy) {
    var objType = object.getObjectType().getID();

    var validObjectTypes;

    if (isRefBy) {
        validObjectTypes = manager.getReferenceTypeHome().getReferenceTypeByID(referenceType).getValidTargetObjectTypes();
    } else {
        validObjectTypes = manager.getReferenceTypeHome().getReferenceTypeByID(referenceType).getValidForObjectTypes();
    }
    var validObjTypesIter = validObjectTypes.iterator();

    while (validObjTypesIter.hasNext()) {
        var validObjType = validObjTypesIter.next();
        var validObjTypeID = validObjType.getID();

        if (validObjTypeID == objType) {
            return true;
        }
    }

    return false;
}


/**
 * To determine if the object is valid for creating a ClassificationProduct Link
 * @param manager STEP manager
 * @param object STEP object (product, revision, ...)
 * @param linkType STEP ClassificationProductLinkType
 * @returns true if is valid; false if not valid
 */
function isObjectValidForClassificationProductLinkType(object, linkType) {
    var objType = object.getObjectType().getID();
    var validObjectTypes = linkType.getValidProductObjectTypes();
    var validObjTypesIter = validObjectTypes.iterator();

    while (validObjTypesIter.hasNext()) {
        var validObjType = validObjTypesIter.next();
        var validObjTypeID = validObjType.getID();

        if (validObjTypeID == objType) {
            return true;
        }
    }

    return false;
}


//STEP-6079
function getProductChildren(product, objectType) {
    var children = [];

    if (product != null) {
        var allChildren = product.getChildren();
        for (var i = 0; i < allChildren.size(); i++) {
            if (allChildren.get(i).getObjectType().getID() == objectType) {
                children.push(allChildren.get(i));
            }
        }
    }
    return children;
}


//STEP-6008
function isRevisionType(obj, checkServiceRevision) {
    var objectType = obj.getObjectType().getID();
    var isRevision = objectType == "Product_Revision" || objectType == "Kit_Revision" || objectType == "Equipment_Revision";

    if (checkServiceRevision == true) {
        return isRevision || objectType == "Service_Revision";
    } else {
        return isRevision;
    }
}

// STEP-6254
function isProductType(obj, checkServiceConjugates) {
    var objectType = obj.getObjectType().getID();
    var isProduct = objectType == "Product" || objectType == "Product_Kit" || objectType == "Equipment";

    if (checkServiceConjugates == true) {
        return isProduct || objectType == "Service_Conjugates";
    } else {
        return isProduct;
    }
}

//STEP-6159
// return true if two arrays are different    
function arrayDiff(a1, a2) {
    var a = [],
        diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    if (diff.length > 0)
        return true
    else
        return false;
}

//STEP-6198
/**
 * To get list with SKUs with the attribute MKTGQTYUNITS empty
 * @param step STEP manager
 * @param node revision
 * @returns list; empty list or filled with SKUs
 */
function getSkusMarketingEmpty(step, node) {
    var ms = getMasterStockForRevision(step, node);
    var skus = getProductChildren(ms, "SKU");
    var emptySkus = [];

    for (var i = 0; i < skus.length; i++) {
        if (skus[i].getValue("MKTGQTYUNITS").getSimpleValue() == null) {
            emptySkus.push(skus[i].getValue("Item_SKU").getSimpleValue());
        }
    }
    return emptySkus;
}


//STEP-6295
function setAttribute_Product_References(pProduct) {
    var folder = getProductChildren(pProduct, "Product_Bibliography_Folder");

    if (folder && folder.length == 1) {
        var biblioFolder = folder[0];
        var citations = getProductChildren(biblioFolder, "Product_Bibliography_Citation");
        var retval = [];

        if (citations && citations.length > 0) {
            for (var i = 0; i < citations.length; i++) {
                if (citations[i].getValue("Citation_Status").getSimpleValue() == "Active") {
                    retval.push({
                        idx: citations[i].getValue("PUBLICATION_LISTINDEX").getSimpleValue(),
                        group: citations[i].getValue("PUBLICATION_ASSOCIATION_TYPE").getSimpleValue(),
                        citation: citations[i].getValue("PUBLICATION_FORMATTEDSTR").getSimpleValue()
                    });
                }
            }

            retval.sort(function (a, b) {
                return parseInt(a.idx, 10) - (parseInt(b.idx, 10)) || a.group.localeCompare(b.group);
            });

            var productCitations = "";
            for (var j = 0; j < retval.length; j++) {
                productCitations += "(" + retval[j].idx + ") " + retval[j].citation + "\n";
            }

            pProduct.getValue("Product_References").setSimpleValue(productCitations);
        }
    }
}

//STEP-6395
function getRevDAMObjects(rev) {
    damObjects = [];
    var children = rev.getChildren().iterator();
    while(children.hasNext()){
        var child = children.next();
        if(child.getObjectType().getID() == "Digital_Asset_Metadata") {
            damObjects.push(child);
        }
    }
    return damObjects;
}

//STEP-6074
function clearAttributesInAttributeGroup(step, source, attGroupId, excludedAttributes) {
    var attGroup = step.getAttributeGroupHome().getAttributeGroupByID(attGroupId);
    if (attGroup != null) {
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();
        while (iterator.hasNext()) {
            var attribute = iterator.next();
            var attID = attribute.getID();
            if (!isItemInArray(excludedAttributes, attID)) {
                source.getValue(attID).setSimpleValue("");
            }
        }
    }
}


//STEP-6584
/**
 * @desc To republish ProductBibliography for revisions
 * @param node Revision
 * @param step STEP manager
 * @param biblioQueue Bibliography Product JSON (BIBILIOGRAPHY_PRODUCT_JSON_EP)
 * @param ProductBibliographyChanges event
 */
function republishProductBibliography(node, step, biblioQueue, ProductBibliographyChanges) {
    var product = node.getParent();

    if (product) {
        setAttribute_Product_References(product);
        var approveProductBiblioFolder = step.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_ApproveProductBibliographyFolder");
        approveProductBiblioFolder.execute(product);
        biblioQueue.queueDerivedEvent(ProductBibliographyChanges, node);
    }
}


//STEP-6526
/**
 * @desc To get WIP revision from Product_Folder_To_Product and Product_To_WIP_Revision reference
 * @param manager STEP manager
 * @param productFolder STEP Product_Folder object
 * @returns an array with a Product WIP Revision 
 */
function getProductWIPRevision(manager, productFolder) {
	var prs = [];

     var pf2pRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
     var pf2ps = productFolder.queryReferencedBy(pf2pRefType);

     pf2ps.forEach(function (pf2p) {
	     var pf2pTarget = pf2p.getSource();
          var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
          var p2WRs = pf2pTarget.queryReferences(p2WRRefType);

          p2WRs.forEach(function (p2WR) {
              var p2WRTarget = p2WR.getTarget();
              prs.push(p2WRTarget);
              return true;
          });
          return true;
      });
      return prs;
}


//STEP-6755
/**
 * @desc To get Lot_Recombinant_Flag from Product_Revision
 * @param manager STEP manager
 * @param product parent of revision
 * @param rev revision
 * @returns value of Lot_Recombinant_Flag
 */
function getLotRecombinantFlag(manager, product, rev) {
	var lotRecombinantFlag = null;
	var shippingLotNo = product.getValue("Shipping_Lot_No").getSimpleValue();

	var revToLot = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
	var lotRefs = rev.queryReferences(revToLot);
    	
	if(shippingLotNo) {
    		lotRefs.forEach(function (lot) {
			if(lot.getTarget().getValue("LOTNO").getSimpleValue() == shippingLotNo) {
				lotRecombinantFlag = lot.getTarget().getValue("Lot_Recombinant_Flag").getSimpleValue();
				return false;
			}
    			return true;
    		});
	}
	if (lotRecombinantFlag == null) {
		lotRecombinantFlag = getRecombinantFlagFromMostRecentLot(manager, rev);
	}
	return lotRecombinantFlag;
}

function getRecombinantFlagFromMostRecentLot(manager, rev) {
	var highestLotNo = -1;
	var highestLotID = -1;
	var highestLotRecombinantFlag = null;

	var revToLot = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
	var lotRefs = rev.queryReferences(revToLot);
	
	lotRefs.forEach(function (ref) {
		var lot = ref.getTarget();
		var lotID;
		
		if (Number(lot.getValue("LOTNO").getSimpleValue()) > highestLotNo) {	
			highestLotNo = Number(lot.getValue("LOTNO").getSimpleValue());														
			if (lot.getName().includes("lot")) {
				lotID = Number(lot.getID().slice(1));
			} else {
				lotID = Number(lot.getID());
			}
			
			if(lotID > highestLotID) {
				highestLotID = lotID;
				highestLotRecombinantFlag = lot.getValue("Lot_Recombinant_Flag").getSimpleValue();
			}
		}
		return true;
	});
	return highestLotRecombinantFlag;
}

//STEP-6645
/**
 * @desc To compare OG and New Shipping Conditions and set Shipping_Condition_Original on Revision to "Changed"
 * @param manager STEP manager
 * @param rev revision
 */
function toCompareOGandNewShippingConditions(manager, rev) {
	var masterStock = getMasterStockForRevision(manager, rev);
	var skus = masterStock.queryChildren();

	skus.forEach(function (sku) {
		var oldShipCond = sku.getValue("Shipping_Conditions_Original").getSimpleValue();
		var newShipCond = sku.getValue("ShippingConditions").getSimpleValue();
		if(oldShipCond != newShipCond) {
			rev.getValue("Shipping_Conditions_Original").setSimpleValue("Changed");
			return false;
		}
		return true;
	});
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.copyAttributes = copyAttributes
exports.isItemInArray = isItemInArray
exports.copyMultiValuedAttribute = copyMultiValuedAttribute
exports.getApprovedNode = getApprovedNode
exports.Trigger = Trigger
exports.triggerTransition = triggerTransition
exports.isTargetTypeMotif = isTargetTypeMotif
exports.getSubCategory = getSubCategory
exports.getLatestRevision = getLatestRevision
exports.getLatestApprovedRevision = getLatestApprovedRevision
exports.getLatestNotApprovedRevision = getLatestNotApprovedRevision
exports.getLatestRevision_inApprovedState = getLatestRevision_inApprovedState
exports.getNextRevisionNo = getNextRevisionNo
exports.getLatestAssociatedRevision = getLatestAssociatedRevision
exports.getApprovedProductAttribute = getApprovedProductAttribute
exports.copyWorkflowVariable = copyWorkflowVariable
exports.roundTo = roundTo
exports.logRecord = logRecord
exports.getCurrentTaskState = getCurrentTaskState
exports.isTaskExists = isTaskExists
exports.getReferenceAttrValue = getReferenceAttrValue
exports.getReferenceAttrValueWOTarget = getReferenceAttrValueWOTarget
exports.getReferences = getReferences
exports.getQueryReferences = getQueryReferences
exports.getRevisions = getRevisions
exports.getProductMasterstock = getProductMasterstock
exports.checkSourcedOrCustomLot = checkSourcedOrCustomLot
exports.getReferenceTarget = getReferenceTarget
exports.deleteAssets = deleteAssets
exports.deleteRecursively = deleteRecursively
exports.deleteRecursivelyWithApproval = deleteRecursivelyWithApproval
exports.deleteRefRecursively = deleteRefRecursively
exports.deleteRefByRecursively = deleteRefByRecursively
exports.removeFromAllWF = removeFromAllWF
exports.updateHistoryAttribute = updateHistoryAttribute
exports.getLotNumbers = getLotNumbers
exports.getRevisionsOfProductInWorkflow = getRevisionsOfProductInWorkflow
exports.getMasterStockForRevision = getMasterStockForRevision
exports.revisionContainsShippingLot = revisionContainsShippingLot
exports.storeMultiValueInString = storeMultiValueInString
exports.getRelatedKits = getRelatedKits
exports.belonsgAttributeToGroup = belonsgAttributeToGroup
exports.getPreviousPrice = getPreviousPrice
exports.isObjectValidForReferenceType = isObjectValidForReferenceType
exports.isObjectValidForClassificationProductLinkType = isObjectValidForClassificationProductLinkType
exports.getProductChildren = getProductChildren
exports.isRevisionType = isRevisionType
exports.isProductType = isProductType
exports.arrayDiff = arrayDiff
exports.getSkusMarketingEmpty = getSkusMarketingEmpty
exports.setAttribute_Product_References = setAttribute_Product_References
exports.getRevDAMObjects = getRevDAMObjects
exports.clearAttributesInAttributeGroup = clearAttributesInAttributeGroup
exports.republishProductBibliography = republishProductBibliography
exports.getProductWIPRevision = getProductWIPRevision
exports.getLotRecombinantFlag = getLotRecombinantFlag
exports.getRecombinantFlagFromMostRecentLot = getRecombinantFlagFromMostRecentLot
exports.toCompareOGandNewShippingConditions = toCompareOGandNewShippingConditions