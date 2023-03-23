/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Approve",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_Approve",
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
function approveHierarchy(obj){
	var isParent=false;
	var checkServiceConjugates = false;
	if (BL_Library.isProductType(obj, checkServiceConjugates)){
		   	isParent=true;
		   }
	if (!isParent ){
		   	logger.info(" 4 ");
	var parent = obj.getParent();

	if(parent ){
		  logger.info(" 5 ");
		   	
		approveHierarchy(parent);
		parent.approve();
		logger.info("approving parent: " + parent.getName());
	}
	}
}

function approveObj(obj){
	logger.info(" 1 ");
	if(obj.getObjectType().isAssetType()){
		var classifications = obj.getClassifications().iterator();
		while(classifications.hasNext()){
			var oClass = classifications.next()
			if(oClass.getApprovalStatus().name() != "CompletelyApproved"){
				approveObj(oClass);
			}
		}
		obj.approve()
	}	
	else{
		var checkServiceConjugates = false;
		logger.info(" 2 ");
		if(BL_Library.isProductType(obj, checkServiceConjugates) ||
		   obj.getObjectType().isClassificationType()){
		   	logger.info(" 3 ");
			approveHierarchy(obj);
			obj.approve();
		}
	     obj.approve();
		//STEP-6396
		var objrefers
		objrefers = BL_Constant.getObjRefTypes(obj);
		for (var i=0; i<objrefers.length; i++){  
     		var refs = obj.queryReferences(objrefers[i]);
			refs.forEach(function(ref) {
				var target = ref.getTarget();
				if(!target.getObjectType().isEntityType()){
					log.info("Reference from node: " + obj.getName() + " to target: " + target.getID()+"Status :"+obj.getApprovalStatus().name());
					if(obj.getApprovalStatus().name() != "CompletelyApproved"){
						approveObj(target);
					}
				}
				return true;
			});
		}
		//STEP-6396
		
		log.info("approved object: " + obj.getName());
		
		var children = obj.getChildren().iterator();
		while(children.hasNext()){
			var child = children.next();
			log.info("child: " + child);
			if(child.getApprovalStatus().name() != "CompletelyApproved"){
				approveObj(child);
			}
		}
		
	}
}



//Partial approval the provided Attribute
function partialApproveFields(node, lstIds, bParent, bName){
      var nonApprObjs = node.getNonApprovedObjects();
      var itrNonApprObjs =nonApprObjs.iterator();
      var partsToApprove = new java.util.HashSet();
      while(itrNonApprObjs.hasNext()){
                      var objPart= itrNonApprObjs.next();
                      var objPartStr = objPart.toString();
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
/*===== business library exports - this part will not be imported to STEP =====*/
exports.approveHierarchy = approveHierarchy
exports.approveObj = approveObj
exports.partialApproveFields = partialApproveFields