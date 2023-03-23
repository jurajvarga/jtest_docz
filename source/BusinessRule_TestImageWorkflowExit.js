/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestImageWorkflowExit",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestImageWorkflowExit",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "BusinessActionBindContract",
    "alias" : "setRevAppFiguresBR",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,setRevAppFiguresBR) {
var pf2pRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var r2APRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    
var figStatus = node.getValue("Figure_Status").getSimpleValue();
logger.info("figStatus: " + figStatus);
if (figStatus.equals("Inactive")){
	var kids = node.getAssets();
	var kidsItr = kids.iterator();
     logger.info("inactive");
	while (kidsItr.hasNext()){
		var kid = kidsItr.next();
		var kot = kid.getObjectType().getID();

		if (kot.equals("ProductImage") || kot.equals("Product_DataSheet")){
			kid.getValue("Image_Status").setSimpleValue("Inactive");
			var refs = kid.getReferencedBy();
			var refsItr = refs.iterator();

			while (refsItr.hasNext()){
				var ref = refsItr.next();
				var rot = ref.getReferenceTypeString();
				if (rot.equals("Published_Product_Images") || rot.equals("DataSheet")){
					ref.delete();
				}
			}

			var name = node.getName();
			var parent = node.getParent();
			var prodRevs = getProductRevision(parent);
			for (var i = 0; i < prodRevs.length; i++){
				var prodRev = prodRevs[i];
				setRevAppFiguresBR.execute(prodRev);
			}

			
			/*// Run a modified version of “BA_Product/Kit Revision Approval” 
			var name = node.getName();
			var parent = node.getParent();
			var prodRevs = getProductRevision(parent);
			for (var i = 0; i < prodRevs.length; i++){
				var prodRev = prodRevs[i];

				var r2APs = prodRev.getClassificationProductLinks(r2APRefType);
				var r2APsItr = r2APs.iterator();

				while (r2APsItr.hasNext()){
					var r2AP = r2APsItr.next();
					var rafVal = r2AP.getValue("Rev_Application_Figures");
					var raf = rafVal.getSimpleValue();					
					
					if (raf != null && raf.contains(name)){
						logger.info("We are here");
						removeAttrValue(rafVal, name);
					}		
				}				
			}*/
		}		
	}
	// #4
	var parent = node.getParent();
	var prodRevs = getProductRevision(parent);
	//logger.info("HERE #4");

	//logger.info("prodRevs: " + prodRevs);
	for (var i = 0; i < prodRevs.length; i++){
		var prodRev = prodRevs[i];
		//node.createReference(prodRev, "Product_Rev_To_Figure_Folder");
		prodRev.createReference(node, "Product_Rev_To_Figure_Folder");

		if(isApproveInactive(parent)){
			if (!prodRev.isInWorkflow("WF6_Content_Review_Workflow")){
				prodRev.startWorkflowByID("WF6_Content_Review_Workflow");
			}
		}
	}
	//remove from WF
	var wfInst = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
	if (wfInst != null){
		wfInst.delete("Removed by BA_Initiate_Product_Revision");
	}			
} else {
	var imageStatus = getNumImageStatus(node);
	logger.info(" imageStatus "+imageStatus);
	if (imageStatus.cnt >= 2){
		var err = node.getID() + " contains more than one Active image";
		throw err;
	} else if (imageStatus.cnt == 0){
		var err = node.getID() + " contains no Active images";
		throw err;
	} else {
		var objImage = imageStatus.objs[0]; //should only be one
		logger.info("objImage: " + objImage);
		node.getValue("Figure_Status").setSimpleValue("Approved");

		var objImagetype = objImage.getObjectType().getID();
		var refID = null;
		if (objImagetype.equals("ProductImage")){
			refID = "Published_Product_Images";
		} else if (objImagetype.equals("Product_DataSheet")){
			refID = "DataSheet";
		}

          objImage.approve();

		if (refID != null){
			var parent = node.getParent();
			var prodRevs = getProductRevision(parent);
			logger.info("prodRevs: " + prodRevs);
			for (var i = 0; i < prodRevs.length; i++){
				var prodWIPRev = prodRevs[i];
				logger.info("Create ref: " + objImage.getID() + " refID: " + refID);
				prodWIPRev.createReference(objImage, refID);	
                    setRevAppFiguresBR.execute(prodWIPRev)
				
			}
		}

		
       
		// #4
		var parent = node.getParent();
		logger.info(" parent "+parent);
		var prodRevs = getProductRevision(parent);
		logger.info("isApproveInactive: " + isApproveInactive(parent));

		 for (var i = 0; i < prodRevs.length; i++){
			var prodRev = prodRevs[i];
			prodRev.createReference(node, "Product_Rev_To_Figure_Folder");

			if(isApproveInactive(parent)){
				if (!prodRev.isInWorkflow("WF6_Content_Review_Workflow")){
					prodRev.startWorkflowByID("WF6_Content_Review_Workflow", "Started by BR");
				}		
			} 
		}
		//remove from WF
		var wfInst = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
		if (wfInst != null){
			wfInst.delete("Removed by BA_Initiate_Product_Revision");
		}
		
	}
}



function getProductRevision(parent){
	var prs = [];
	var pf2ps = parent.getReferencedBy();
	var pf2psItr = pf2ps.iterator();

	while (pf2psItr.hasNext()){
		var pf2p = pf2psItr.next();
		if (pf2p.getReferenceTypeString().equals("Product_Folder_To_Product")){
			var pf2pTarget = pf2p.getSource();

			var p2WRs = pf2pTarget.getReferences(p2WRRefType);
			var p2WRsItr = p2WRs.iterator();
	
			while (p2WRsItr.hasNext()){
				var p2WR = p2WRsItr.next();
				var p2WRTarget = p2WR.getTarget();
	
				prs.push(p2WRTarget);
			}
		}
	}

	return prs;
}


function isApproveInactive(parent){
	var kids = parent.getChildren();
	
	var kidsItr = kids.iterator();

	while (kidsItr.hasNext()){
		var kid = kidsItr.next();
		var kot = kid.getObjectType().getID();

		logger.info("kot: " + kot);
		logger.info("kid name: " + kid.getName());

		if (kot.equals("Figure_Folder")){
			var fs = kid.getValue("Figure_Status").getSimpleValue();
			logger.info("fs: " + fs);
			if (fs == null){
				return false;
			} else if (!fs.equals("Approved") && !fs.equals("Inactive")){
				return false;
			}
		}
	}

	return true;
}


function getNumImageStatus(node){
	var asss = node.getAssets();
	var asssItr = asss.iterator();
	var cnt = 0;
	var objs = [];
	
	while (asssItr.hasNext()){
		var ass = asssItr.next();
		var aot = ass.getObjectType().getID();

		if (aot.equals("ProductImage") || aot.equals("Product_DataSheet")){
			var is = ass.getValue("Image_Status").getSimpleValue();
			if (is != null && is.equals("Active")){
				cnt++;
				objs.push(ass);
			}
		}
	}

	return {cnt: cnt, objs: objs};
}
}