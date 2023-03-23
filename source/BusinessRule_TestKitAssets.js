/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestKitAssets",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestKitAssets",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger) {
//Function to display object values
function display(dispobj){
	for(var key in dispobj) {
	var value = dispobj[key];
	//logger.info("dispobj "+key+"="+value);
	}
};

Object.buildSKUAssets=function buildSKUAssets(kitReferenceProduct){
	
			       var asset=[]
			       
		if (kitReferenceProduct!=null) {





                 var kitRefCurRevReferences = kitReferenceProduct.getReferences(prodCurRevReferenceType);
                 //logger.info(" kitRefCurRevReferences "+kitRefCurRevReferences);

			     logger.info(" kitRefCurRevReferences "+kitRefCurRevReferences.size());
			     
			    for (var j = 0; j < kitRefCurRevReferences.size(); j++) {
			     
			        var kitRefCurRevTarget = kitRefCurRevReferences.get(j).getTarget();
			        logger.info(" kitRefCurRevTarget "+kitRefCurRevTarget);


			        var kitRefCurRevTargetName = kitRefCurRevTarget.getName()+"";
				logger.info(" kitRefCurRevTargetName "+kitRefCurRevTargetName);
				if (kitRefCurRevTargetName!=null && kitRefCurRevTargetName.length>0){
					
				       //To Get Figures and datasheet from revision
		  			 var pubImgRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
				         if (pubImgRefType != null) {
				            var pubImgLinks = kitRefCurRevTarget.getReferences(pubImgRefType);
				            for (var i = 0; i < pubImgLinks.size() > 0; i++) {
				            	var assetJson={}
				               var aImageTarget = pubImgLinks.get(i).getTarget();
				             	var aFigureStatus=aImageTarget.getValue("Figure_Status").getSimpleValue();
	                       		var aImageTargetObjectID = aImageTarget.getObjectType().getID();
	                        		assetJson["Figure_Object_Type"] = aImageTargetObjectID+"";
	
				             if (aFigureStatus == "Approved" ){
							 //To Get Attributes for Assets
	 						var setAttrIV = aImageTarget.getValues();
						  	var itIV = setAttrIV.iterator();
						    
						    while (itIV.hasNext()) {
						    	 var attrValueIV = itIV.next();
						      var attributeIV ="";
						      if (attrValueIV!=null){
						        attributeIV =attrValueIV.getAttribute();
						       
						         var attValIV = attrValueIV.getSimpleValue() + "";	        
						        
						      //  logger.info("  "+attributeIV.getName()+" = "+attValIV);
						         assetJson[attributeIV.getID()] = attValIV;
						      }
						     
						    }
	
							 //To Get System Attibutes for Assets
	
							 var setAttrSV = aImageTarget.getSystemValues();
						  	 var itSV = setAttrSV.iterator();
						    
						    while (itSV.hasNext()) {
						    	 var attrValueSV = itSV.next();
						      var attributeSV ="";
						      if (attrValueSV!=null){
						        attributeSV =attrValueSV.getAttribute();
						       
						         var attValSV = attrValueSV.getSimpleValue() + "";	        
						        
						        // logger.info("  "+attributeSV.getName()+" = "+attValSV);
						         assetJson[attributeSV.getName()] = attValSV;
						      }
						     
						    }
	
						     asset.push(assetJson);
				
				            }
				            }
				         }
	
	
				         //To Get Datasheet
				         var pubImgRefTypeDS = manager.getReferenceTypeHome().getReferenceTypeByID("DataSheet");
				         if (pubImgRefTypeDS != null) {
				            var pubImgLinksDS = prodCurRevnode.getReferences(pubImgRefTypeDS);
				            for (var i = 0; i < pubImgLinksDS.size() > 0; i++) {
				            	var assetJson={}
				               var aImageTargetDS = pubImgLinksDS.get(i).getTarget();
				             	var aFigureStatusDS=aImageTargetDS.getValue("Figure_Status").getSimpleValue();
	                        		var aImageTargetDSObjectID = aImageTargetDS.getObjectType().getID();
	                        		assetJson["Figure_Object_Type"] = aImageTargetDSObjectID+"";
	
				             if (aFigureStatusDS == "Approved" ){
							 //To Get Attributes for Assets
	 						var setAttrIVDS = aImageTargetDS.getValues();
						  	var itIVDS = setAttrIVDS.iterator();
						    
						    while (itIVDS.hasNext()) {
						    	 var attrValueIVDS = itIVDS.next();
						      var attributeIVDS ="";
						      if (attrValueIVDS!=null){
						        attributeIVDS =attrValueIVDS.getAttribute();
						       
						         var attValIVDS = attrValueIVDS.getSimpleValue() + "";	        
						         
						       // logger.info("  "+attributeIVDS.getName()+" = "+attValIVDS);
						         assetJson[attributeIVDS.getID()] = attValIVDS;
						      }
						     
						    }
	
							 //To Get System Attibutes for Assets
	
							 var setAttrSVDS = aImageTargetDS.getSystemValues();
						  	  var itSVDS = setAttrSVDS.iterator();
						    
						    while (itSVDS.hasNext()) {
						    	 var attrValueSVDS = itSVDS.next();
						      var attributeSVDS ="";
						      if (attrValueSVDS!=null){
						        attributeSVDS =attrValueSVDS.getAttribute();
						       
						         var attValSVDS = attrValueSVDS.getSimpleValue() + "";	        
						        
						         //logger.info("  "+attributeSVDS.getName()+" = "+attValSVDS);
						         assetJson[attributeSVDS.getName()] = attValSVDS;
						      }
						     
						    }
	
						     asset.push(assetJson);
				
				            }
				            }
				         }
	
				       if (asset.length==0){
					 	asset=[{}];
					 }
					
					}
				
			     }
		}

		return asset;
};




		var kitTargets=[];
		 var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			  
			     var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);
			     var currev=[] //currev array
			     for (var j = 0; j < prodCurRevReferences.size(); j++) {
			     
			        var prodCurRevTarget = prodCurRevReferences.get(j).getTarget().getName()+"";
			        //logger.info(" prodCurRevTarget "+prodCurRevTarget);


			        var prodCurRevnode = prodCurRevReferences.get(j).getTarget()
			//	logger.info(" prodCurRevnode "+prodCurRevnode);
	


			     var kitRevskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
				var kitRevskuReferences = prodCurRevnode.getReferences(kitRevskuReferenceType);
           		for (var j = 0; j < kitRevskuReferences.size(); j++) {
				    
				   var kitRevSkuTarget = kitRevskuReferences.get(j).getTarget();

				    var kitRevSkuTargetName = kitRevskuReferences.get(j).getTarget().getName()+"";

				  //  kitTargets.push(kitRevSkuTarget);
				   logger.info(" -------- ");

				logger.info(" kitRevSkuTargetName "+kitRevSkuTargetName);
                      var skuAssets=Object.buildSKUAssets(kitRevSkuTarget.getParent().getParent());
					for(var key in skuAssets) {
						var value = skuAssets[key];
						logger.info("skuAssets "+key+"="+value);
						for(var key1 in value) {
							var value1 = value[key1];
							logger.info("skuAssets1 "+key1+"="+value1);
						}
					}
				   logger.info(" -------- ");	
				 
			      }
			     }
}