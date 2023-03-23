/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "Test_Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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
// Approves node
function getApprovedNode(step, obj){
	var vObject =step.executeInWorkspace("Approved", function(appManager){
		var appNode = appManager.getProductHome().getProductByID(obj.getID());
		return appNode;
	});
	return vObject;
}

// triggers object from one workflow state to another
function Trigger(instance,state,action,desc) {
	try {
		instance.getTaskByID(state).triggerLaterByID(action, desc);
	} catch(err) {
		instance.getTaskByID(state).triggerByID(action, desc);
	}
}	

// Sets Target Type
function isTargetTypeMotif(step, pProduct){
	var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
	var refs = pProduct.getReferences().get(refType);
	for (var k = 0; k < refs.size(); k++) {
		var eTarget = refs.get(k).getTarget();
		var sTargetType = eTarget.getValue("TARGETTYPE").getSimpleValue();
		if (sTargetType == null && sTargetType == "Motif") {
			return true;
		}
	}
	return false;
}

// Looks up what subcategory the product is going to live under
function getSubCategory(sSubCategoryId, step){
	var eCategorizationLogicRoot = step.getEntityHome().getEntityByID("Product_Type_SubCategory_Logic");
	var children = eCategorizationLogicRoot.getChildren().iterator();
	while(children.hasNext()){
		var eMapping = children.next();
		if(eMapping.getValue("New_Product_Product_Type").getSimpleValue() == sSubCategoryId){
			return eMapping.getValue("New_Product_SubCategory_ID").getSimpleValue();
		}
	}
	return null;
}

// determins the latest approved revision object
function getLatestRevision(product){
	var nLatestVersion=-1;
	var pLatestRevsion=null;
	var children =product.getChildren();
	for(var i=0;i<children.size(); i++){
		var pRevision =children.get(i);
		var sObjectType= pRevision.getObjectType().getID();
		if (sObjectType=="Product_Revision" || sObjectType=="Kit_Revision"){
			var nVersion= pRevision.getValue("REVISIONNO").getSimpleValue();
			if (nVersion>nLatestVersion){
				if (pRevision.getApprovalStatus().name()!= "NotInApproved"){
					nLatestVersion=nVersion;
					pLatestRevsion=pRevision;
				}
			}
		}
	}
	return pLatestRevsion;
}


// determins the latest non approved revision object
function getLatestNotApprovedRevision(product){
	var nLatestVersion=-1;
	var pLatestRevsion=null;
	var children =product.getChildren();
	for(var i=0;i<children.size(); i++){
		var pRevision =children.get(i);
		var sObjectType= pRevision.getObjectType().getID();
		if (sObjectType=="Product_Revision" || sObjectType=="Kit_Revision"){
			var nVersion= pRevision.getValue("REVISIONNO").getSimpleValue();
			if (nVersion>nLatestVersion){
				if (pRevision.getApprovalStatus().name()== "NotInApproved"){
					nLatestVersion=nVersion;
					pLatestRevsion=pRevision;
				}
			}
		}
	}
	return pLatestRevsion;
}


// determines the next RevisionNo for new Revisions
function getNextRevisionNo(pProduct){
	var nLatestVersion=-1;
	var children =pProduct.getChildren();
	for(var i=0;i<children.size(); i++){
		var pRevision =children.get(i);
		var sObjectType= pRevision.getObjectType().getID();
		if (sObjectType=="Product_Revision" || sObjectType=="Kit_Revision"){
			var nVersion= pRevision.getValue("REVISIONNO").getSimpleValue();
			if (nVersion>nLatestVersion){
				nLatestVersion=nVersion;
			}
		}
	}
	return nLatestVersion;
}


// get the masterstock linked revision object
function getLatestAssociatedRevision(pMasterStock){
	var nLatestVersion=-1;
	var pLatestRevsion=null;

	var list = pMasterStock.getReferencedByProducts();
	var iter = list.iterator();
	while (iter.hasNext()) {
		var ref = iter.next();
		var refType = ref.getReferenceTypeString();
		if (refType == "ProductRevision_To_MasterStock") {
			var pRevision = ref.getSource();
				//var pRevision =children.get(i);
				var sObjectType= pRevision.getObjectType().getID();
				if (sObjectType=="Product_Revision" || sObjectType=="Kit_Revision"){
					var nVersion= pRevision.getValue("REVISIONNO").getSimpleValue();
					if (nVersion>nLatestVersion){
						//if (pRevision.getApprovalStatus().name()!= "NotInApproved"){
							nLatestVersion=nVersion;
							pLatestRevsion=pRevision;
						//}
					}
				}
		}
	}
	
	return pLatestRevsion;
}

//Partial approval the provided Attribute
function partialApproveFields(node, lstIds, bParent, bName){
	log.info ("partialApproveFields");
      var nonApprObjs = node.getNonApprovedObjects();
      var itrNonApprObjs =nonApprObjs.iterator();
      var partsToApprove = new java.util.HashSet();
      while(itrNonApprObjs.hasNext()){
                      var objPart= itrNonApprObjs.next();
                      var objPartStr = objPart.toString();
                      log.info (objPartStr);
                      if(objPartStr.indexOf("ValuePartObject") != -1 && lstIds.contains(objPart.getAttributeID())){
                                      partsToApprove.add(objPart);
                      }else if(objPartStr.indexOf("ReferencePartObject") != -1 && lstIds.contains(objPart.getReferenceType())){
                                      partsToApprove.add(objPart);
                      }else if(objPartStr.toString().indexOf("ClassificationLinkPartObject") != -1 && lstIds.contains(objPart.getLinkTypeID())){
                                      partsToApprove.add(objPart);
                      }else if(objPartStr.indexOf("ParentPartObject") != -1 && bParent == true){
                                      partsToApprove.add(objPart);
                      } else if(objPartStr.indexOf("NamePartObject") != -1 && bName == true){
                                      partsToApprove.add(objPart);
                      }
      }
      if (partsToApprove.size()>0)
                      node.approve(partsToApprove);
                                
}

//Get the latest approved attribute
function getApprovedProductAttribute(manager, obj, idAttribute){
                var apprProduct =manager.executeInWorkspace("Approved", function(apprManager){
                var apprNode = apprManager.getProductHome().getProductByID(obj.getID());
                return apprNode;
});
if (apprProduct)
	return apprProduct.getValue(idAttribute).getSimpleValue();
else
	return null;
}

//copy workflow variable from one workflow to another
function copyWorkflowVariable(step, obj, srcWorkflowId, dstWorkflowId, sVariableId){
	if (obj.isInWorkflow(srcWorkflowId) && obj.isInWorkflow(dstWorkflowId)){
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
		if( n < 0) {
    	negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
    	n = (n * -1).toFixed(2);
    }
    return n;
}

// join together an array of strings and object string representations
// join delimiter characters: semicolon and space
function logRecord( messageArray ) {
    return messageArray.join("; ");
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.getApprovedNode = getApprovedNode
exports.Trigger = Trigger
exports.isTargetTypeMotif = isTargetTypeMotif
exports.getSubCategory = getSubCategory
exports.getLatestRevision = getLatestRevision
exports.getLatestNotApprovedRevision = getLatestNotApprovedRevision
exports.getNextRevisionNo = getNextRevisionNo
exports.getLatestAssociatedRevision = getLatestAssociatedRevision
exports.partialApproveFields = partialApproveFields
exports.getApprovedProductAttribute = getApprovedProductAttribute
exports.copyWorkflowVariable = copyWorkflowVariable
exports.roundTo = roundTo
exports.logRecord = logRecord