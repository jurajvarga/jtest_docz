/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestActionRIMA",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestActionRIMA",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib) {
/*  refType = step.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
  if (refType !=null){
                  var refLinks = node.getReferences(refType);
                 for(var i=0; i<refLinks.size()>0; i++){
                 	log.info(refLinks.get(i).getTarget().getObjectType().getID());
                 }
  }

var pRevision = step.getProductHome().getProductByID("pr816596");
	var refType = step.getReferenceTypeHome().getReferenceTypeByID("Tech_Transfer_To_Figure_Folder");
	var refs = node.getReferences().get(refType);
	for (var k = 0; k < refs.size(); k++) {
		var cFigure = refs.get(k).getTarget();
		log.info("cFigure " + cFigure);
		try{
			pRevision.createReference(cFigure, "Product_Rev_To_Figure_Folder");
		}catch(ex){
			
		}
	}
/*var sDiscontinuationDate = node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();
var from = sDiscontinuationDate.split("-");

log.info(sDiscontinuationDate);

var dtDiscontinuation = new Date(from[0], from[1] - 1, from[2]);
log.info(dtDiscontinuation);*/


//node.getTaskByID("Product_Status_Change_Workflow", "Pre-Discontinuation_Date_Hold").setDeadline(dtDiscontinuation);
//log.info("deadline: " + node.getTaskByID("Product_Status_Change_Workflow", "Pre-Discontinuation_Date_Hold").getDeadline());

/*function approveHierarchy(obj){
	var parent = obj.getParent();
	if(parent){
		approveHierarchy(parent);
		parent.approve();
		log.info("approving parent: " + parent.getName());
	}
}

function approveObj(obj){
	//log.info("STARTING OBJECT: " + obj.getName() + " | " + obj.getID());
	var date2 = new Date();
	if(date2 - date >= 15000){
		throw "error, ran too long";
	}
	
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
		if(obj.getObjectType().getID() == "Product" || obj.getObjectType().isClassificationType()){
			approveHierarchy(obj);
		}
	
		//references
		var refs = obj.getReferences().asSet().iterator();
		while(refs.hasNext()){
			var target = refs.next().getTarget();
			if(!target.getObjectType().isEntityType()){ //not entity
				log.info("Reference from node: " + obj.getName() + " to target: " + target.getID());
				if(obj.getApprovalStatus().name() != "CompletelyApproved"){
					approveObj(target);
				}
			}
		}
		
		obj.approve();
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

	//log.info("ENDING OBJECT: " + obj.getName() + " | " + obj.getID());
}

var date = new Date();
approveObj(node);
// var pRev = Lib.getLatestAssociatedRevision(node);
 var pRev =Lib.getLatestRevision(node);
 if (pRev)
 log.info(pRev.getName()  + " " + pRev.getURL());
 else
 log.info("No Rev");
 /*
var nLatestVersion=-1;
var pLatestRevsion=null;
var children =node.getChildren();
for(var i=0;i<children.size(); i++){
	var child =children.get(i);
	if (child.getObjectType().getID()=="Product_Revision"){
		var nVersion= child.getValue("REVISIONNO").getSimpleValue();
		if (nVersion>nLatestVersion){
			if (child.getApprovalStatus().name()!= "NotInApproved"){
				nLatestVersion=nVersion;
				pLatestRevsion=child;
			}
		}
	}
}
log.info("LatestVersion"+  nLatestVersion);*/
var nProduct='95102'
var pRevision=node;
var pProduct=node.getParent()
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
            var refs = pRevision.getReferences().get(refType);
            log.info(" No Latest Revision  refs " + refs.size());

            // TO Refactor : can probably go to different BR which coppies other figure folder/ product folder attributes
            // check how much work this is --> do in this story or in a new story
            if (refs.size() == 0) {
                pRevision.createReference(prodFolderObj, "Product_Folder_To_Product_Revision");
                prodFolderObj.getValue("Figure_Folder_DevSci").setSimpleValue(ttObject.getValue("DEV_SCI").getSimpleValue());
                prodFolderObj.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(ttObject.getValue("Fastlane_YN_Flag").getSimpleValue());
                prodFolderObj.getValue("Figure_Folder_production_team").setSimpleValue(ttObject.getValue("ProdTeam_Planner_Product").getSimpleValue());

                var childrenFigFolders = prodFolderObj.getChildren();

                for (var i = 0; i < childrenFigFolders.size(); i++) {
                    var fig_folder = childrenFigFolders.get(i);
                    fig_folder.getValue("Figure_Folder_DevSci").setSimpleValue(ttObject.getValue("DEV_SCI").getSimpleValue());
                    fig_folder.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(ttObject.getValue("Fastlane_YN_Flag").getSimpleValue());
                    fig_folder.getValue("Figure_Folder_production_team").setSimpleValue(ttObject.getValue("ProdTeam_Planner_Product").getSimpleValue());
                }
            }

            var refTypePr = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
            var refsPr = pProduct.getReferences().get(refTypePr);
            log.info(" No Latest Revision  refsPr " + refsPr.size());

            /*if (refsPr.size() == 0) {
                pProduct.createReference(prodFolderObj, "Product_Folder_To_Product");
            }*/
        }
    }
}