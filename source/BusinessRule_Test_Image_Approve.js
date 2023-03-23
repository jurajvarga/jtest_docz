/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_Image_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_Image_Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage", "Product_DataSheet", "Product_Rev_Folder" ],
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger) {
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
if( node.getObjectType().isClassificationType()){
		var children = node.getChildren().iterator();
		while(children.hasNext()){
			var child = children.next();
			log.info("child: " + child);
			if(child.getApprovalStatus().name() != "CompletelyApproved"){
				child.approve();
			}
			log.info("child: " + child.getApprovalStatus().name());
		}
}
*/
//node.approve();


var prodCurRevReferenceType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			  
	     var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);

	    logger.info(" prodCurRevReferences.size() "+prodCurRevReferences.size());
	    
	     for (var j = 0; j < prodCurRevReferences.size(); j++) {
	     	        
	        var prodCurRevnode = prodCurRevReferences.get(j).getTarget();
	     
			logger.info(" prodCurRevnode "+prodCurRevnode.getName());


			//To get Asset Information
			      

			       //To Get Product Figures and Datasheet
                    var pubImgRefTypePr = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
			         if (pubImgRefTypePr != null) {
			            var pubImgLinksPr = node.getReferences(pubImgRefTypePr);
			            for (var i = 0; i < pubImgLinksPr.size() > 0; i++) {
			           
			               var aImageTargetPr = pubImgLinksPr.get(i).getTarget();
			          
			              logger.info(" aImageTargetPr "+aImageTargetPr.getName());


			          var classList = aImageTargetPr.getClassifications().toArray();
			          var figureStatus="";
			          if (classList!=null){
			          	figureStatus=classList[0].getValue("Figure_Status").getSimpleValue();
			          	}
		
 					logger.info(" figureStatus "+figureStatus);


			           aImageTargetPr.getValue("Figure_Marking_Requirements").addValue("NA");			             
			              logger.info("aImageTargetPr: " + aImageTargetPr.getApprovalStatus().name());

					//	aImageTargetPr.approve();

						logger.info("aImageTargetPr: " + aImageTargetPr.getApprovalStatus().name());
			
			            }
			            }
			        


			         //To Get Datasheet
			         var pubImgRefTypeDSPr = node.getManager().getReferenceTypeHome().getReferenceTypeByID("DataSheet");
			         if (pubImgRefTypeDSPr != null) {
			            var pubImgLinksDSPr = node.getReferences(pubImgRefTypeDSPr);
			            for (var i = 0; i < pubImgLinksDSPr.size() > 0; i++) {
			            	
			               var aImageTargetDSPr = pubImgLinksDSPr.get(i).getTarget();

			                logger.info(" aImageTargetDSPr "+aImageTargetDSPr.getName());
					 logger.info("aImageTargetDSPr: " + aImageTargetDSPr.getApprovalStatus().name());
					
			var classDSList = aImageTargetDSPr.getClassifications().toArray();
			          var figureStatusDS="";
			          if (classDSList!=null){
			          	figureStatusDS=classDSList[0].getValue("Figure_Status").getSimpleValue();
			          	}
		
 					logger.info(" figureStatusDS "+figureStatusDS);


			              //  aImageTargetDSPr.approve();

			                  logger.info("aImageTargetDSPr : " + aImageTargetDSPr.getApprovalStatus().name());
			           
			            }
			            }
			         

			       


			       

			       //To Get Figures and datasheet from revision
	  			 var pubImgRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
			         if (pubImgRefType != null) {
			            var pubImgLinks = prodCurRevnode.getReferences(pubImgRefType);
			            for (var i = 0; i < pubImgLinks.size() > 0; i++) {
			            
			               var aImageTarget = pubImgLinks.get(i).getTarget();
			           
			                logger.info(" aImageTarget "+aImageTarget.getName());
			                 aImageTarget.getValue("Figure_Marking_Requirements").addValue("NA");
 logger.info("aImageTarget R: " + aImageTarget.getApprovalStatus().name());

var classImgList = aImageTarget.getClassifications().toArray();
			          var figureStatusImgDS="";
			          if (classImgList!=null){
			          	figureStatusImgDS=classImgList[0].getValue("Figure_Status").getSimpleValue();
			          	}
		
 					logger.info(" figureStatusImgDS "+figureStatusImgDS);

			              
 
			                // aImageTarget.approve();
			                 logger.info("aImageTargetDS R: " + aImageTarget.getApprovalStatus().name());
			
			            }
			            }
			         


			         //To Get Datasheet
			         var pubImgRefTypeDS = node.getManager().getReferenceTypeHome().getReferenceTypeByID("DataSheet");
			         if (pubImgRefTypeDS != null) {
			            var pubImgLinksDS = prodCurRevnode.getReferences(pubImgRefTypeDS);
			            for (var i = 0; i < pubImgLinksDS.size() > 0; i++) {
			            
			               var aImageTargetDS = pubImgLinksDS.get(i).getTarget();

			           logger.info(" aImageTargetDS "+aImageTargetDS.getName());
logger.info("aImageTargetDS R: " + aImageTargetDS.getApprovalStatus().name());

var classImgDSList = aImageTargetDS.getClassifications().toArray();
			          var figureStatusImgDS1="";
			          if (classImgDSList!=null){
			          	figureStatusImgDS1=classImgDSList[0].getValue("Figure_Status").getSimpleValue();
			          	}
		
 					logger.info(" figureStatusImgDS1 "+figureStatusImgDS1);
			              
 
 
			           // aImageTargetDS.approve();

			logger.info("aImageTargetDS R: " + aImageTargetDS.getApprovalStatus().name());
			            }
			         }

			      
				 
	     }
}