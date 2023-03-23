/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SK_OEIP_JSON_FORMATTER",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BA_SK_OEIP_JSON_FORMATTER",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "MasterStock", "Product", "Product_Kit", "Product_Revision", "SKU" ],
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
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult


//To Get Application Protocol for Kit Component Function

Object.buildAppProtocol=function buildAppProtocol(kitReferenceProduct){
	
	var appprotocol=[];
		if (kitReferenceProduct!=null) {

		  var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
                 var kitRefCurRevReferences = kitReferenceProduct.getReferences(prodCurRevReferenceType);
                 //logger.info(" kitRefCurRevReferences "+kitRefCurRevReferences);

			   //  executionReportLogger.logInfo(" kitRefCurRevReferences "+kitRefCurRevReferences.size());
			     
			    for (var j = 0; j < kitRefCurRevReferences.size(); j++) {
			     
			        var kitRefCurRevTarget = kitRefCurRevReferences.get(j).getTarget();
			       // logger.info(" kitRefCurRevTarget "+kitRefCurRevTarget);


			        var kitRefCurRevTargetName = kitRefCurRevTarget.getName()+"";
				//logger.info(" kitRefCurRevTargetName "+kitRefCurRevTargetName);
				if (kitRefCurRevTargetName!=null && kitRefCurRevTargetName.length>0){
					var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
					 var kitAppProtoRefList = kitRefCurRevTarget.getClassificationProductLinks(refType);

					//executionReportLogger.logInfo(" kitAppProtoRefList "+kitAppProtoRefList.size());

					//To get Application Protocol Information

              		   
			 
			  
		
			            for (var i = 0; i < kitAppProtoRefList.size() > 0; i++) {
			            	var appProtocolJson={}
			               var appProtocolObj = kitAppProtoRefList.get(i).getClassification();


			               var revAppProtClassValues=kitAppProtoRefList.get(i).getValues();

					
					
					    var itAPVal = revAppProtClassValues.iterator();
					    
					    while (itAPVal.hasNext()) {
					    	 var attrValueAPVal= itAPVal.next();
					      var attributeAPVal ="";
					      if (attrValueAPVal!=null){
					        attributeAPVal =attrValueAPVal.getAttribute();
					   
					         var attValAPVal = attrValueAPVal.getSimpleValue() + "";	 
					        //  executionReportLogger.logInfo("    "+attributeAPVal.getID()+" = "+attValAPVal);
					        appProtocolJson[attributeAPVal.getID()] = attValAPVal;
					      }
					     
					    }

			             var protocolno= appProtocolObj.getValue("PROTOCOLNO").getSimpleValue();
			            // logger.info(" PROTOCOLNO "+protocolno);

			               var application= appProtocolObj.getParent().getValue("Application").getSimpleValue()+"";

			             
						 //To Get Attributes for Application Protocol
 						var setAttrAP = appProtocolObj.getValues();
					  	var itAP = setAttrAP.iterator();
					    
					    while (itAP.hasNext()) {
					    	 var attrValueAP = itAP.next();
					      var attributeAP ="";
					      if (attrValueAP!=null){
					        attributeAP =attrValueAP.getAttribute();
					       
					         var attValAP = attrValueAP.getSimpleValue() + "";	        
					         
					       // logger.info("  "+attributeAP.getName()+" = "+attValAP);
					         appProtocolJson[attributeAP.getID()] = attValAP;
					      }
					     
			
			            }

			                  if (protocolno!=null){
			             	 appProtocolJson["Application"] = application;
			             	
			             	}
			            
					     appprotocol.push(appProtocolJson);
			           }

			          // executionReportLogger.logInfo(" appprotocol.length "+appprotocol.length);

			      if (appprotocol.length==0){
				 	appprotocol=[{}];
				 }

					
					
					}
				
			     }
		}

		return appprotocol;
};


Object.buildNodeMessage =function buildNodeMessage(node,simpleEventType,kit){

	var mesg = {};
	mesg.stepid = node.getID() + "";
	mesg.eventid = simpleEventType.getID() + "";
	mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";


	//To Get Product Attributes
	    var setAttr = node.getValues();
	    var it = setAttr.iterator();
	    while (it.hasNext()) {
	    	 var attrValue = it.next();
	      var attribute ="";
	      if (attrValue!=null){
	        attribute =attrValue.getAttribute();
	         var attVal = attrValue.getSimpleValue() + "";	        
	          mesg[attribute.getID()] = attVal;
	         
	      }
	     
	    }


		var mss = [] ;
		var children = node.getChildren();
		for (i = 0; i < children.size(); i++) {
		
		var child = children.get(i);
		var childId=child.getObjectType().getID();
		//log.info("childId"+childId);
		if (childId=="MasterStock"){
		//To get Child Main Attributes
		var setAttrCh = child.getValues();
		var itCh = setAttrCh.iterator();
		var chJson={}
		while (itCh.hasNext()) {
			var attrValueCh = itCh.next();
			var attributeCh ="";
			if (attrValueCh!=null){
				attributeCh =attrValueCh.getAttribute();
				//log.info(" attributeCh "+attributeCh);
				var attValCh = attrValueCh.getSimpleValue() + "";	        
				chJson[attributeCh.getID()] = attValCh;
				//logger.info("attValCh"+attValCh);
			}			
		}




		//To Get Child of Child Values
		var gcl=[];
		var gcnameid="";
		var grandchild=child.getChildren();
		for (j = 0; j < grandchild.size(); j++) {
			var gcobj  = grandchild.get(j);
			var gcjson = {}; //SKU
			
			
			var gcId=gcobj.getObjectType().getID();
			//log.info(" gcId "+gcId);
			gcnameid=gcId+"s";
								
			//To get Grand Child Main Attributes
			var setAttrGC = gcobj.getValues();
			var itGC = setAttrGC.iterator();
			var jsonGC={}
			while (itGC.hasNext()) {
				var attrValueGC = itGC.next();
				var attributeGC ="";
				if (attrValueGC!=null){
					attributeGC =attrValueGC.getAttribute();
					//log.info(" attributeGC "+attributeGC);
					var attValGC = attrValueGC.getSimpleValue() + "";	        
					jsonGC[attributeGC.getID()] = attValGC;
					//logger.info("attValCh"+attValCh);
				}
			
			}
				
			gcl.push(jsonGC);	
					
		}
			
		chJson[gcnameid]=gcl;
		mss.push(chJson);
		mesg[childId]=mss;
		}
		}
			//executionReportLogger.logInfo (" gcnameid "+gcnameid);	


			 var altprod=[]
			             var altProductReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT");
				var altProductReferences = node.getReferences(altProductReferenceType);
           		for (var j = 0; j < altProductReferences.size(); j++) {
				    var altprodJson={}
				   var altProductObj = altProductReferences.get(j).getTarget();
				   
					var altProductnodename = altProductObj.getName()+"";

	      			//logger.info(" altProductnodename "+altProductnodename);
				  
					 //To Get Attributes for Companion Product
					var setAttrATP = altProductObj.getValues();
				  	var itATP = setAttrATP.iterator();
				    
				    while (itATP.hasNext()) {
				    	 var attrValueATP = itATP.next();
				      var attributeATP ="";
				      if (attrValueATP!=null){
				        attributeATP =attrValueATP.getAttribute();
				       
				         var attValATP = attrValueATP.getSimpleValue() + "";	        
				         
				       // logger.info("  "+attributeCP.getName()+" = "+attValCP);
				         altprodJson[attributeATP.getID()] = attValATP;
				      }
				     
		
		            }
		            
				     altprod.push(altprodJson);
				   
				 }

				 if (altprod.length==0){
				 	altprod=[{}];
				 }
				 
	
		var krs=[]; //kit revision sku
		 var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			  
	     var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);
	     var currev=[] //currev array
	     for (var j = 0; j < prodCurRevReferences.size(); j++) {
	     
	          var crtarget={};//currev 

	        var prodCurRevnode = prodCurRevReferences.get(j).getTarget()
			//logger.info(" prodCurRevnode "+prodCurRevnode);


				//To Build SDS Links
                   var sdslinks=[]
				var prodCurRevchildren = prodCurRevnode.getChildren();
				for (i = 0; i < prodCurRevchildren.size(); i++) {
				
					var prodCurRevchild = prodCurRevchildren.get(i);
					var prodCurRevchildId=prodCurRevchild.getObjectType().getID();
			          logger.info(" prodCurRevchildId "+prodCurRevchildId);
					if (prodCurRevchildId=="SDS_ASSET_URL_LINK"){
	
						var sdslinksJson={}
						
						var sdsname=prodCurRevchild.getName()+""; 
	           		
	           		    //logger.info("  sdsname "+sdsname);
	
	  					sdslinksJson["Name"]=sdsname;
					
						//To get Child Main Attributes
						var setAttrSDS = prodCurRevchild.getValues();
						var itSDS = setAttrSDS.iterator();
						
						while (itSDS.hasNext()) {
							var attrValueSDS = itSDS.next();
							var attributeSDS ="";
							
							attributeSDS =attrValueSDS.getAttribute();
							attributeID=attributeSDS.getID();
							
							if (attributeID=="SDS_Link_URL" || attributeID=="SDS_Language"|| attributeID=="PRODUCTNO"|| attributeID=="Doc_Revision_No"|| attributeID=="SDS_Subformat"
							|| attributeID=="Plant"|| attributeID=="SDS_Link_Status_CD"|| attributeID=="REVISIONNO"|| attributeID=="SDS_Format"){
								var attValSDS = attrValueSDS.getSimpleValue() + "";	        
								sdslinksJson[attributeSDS.getID()] = attValSDS;
								
							//	logger.info("  "+attributeSDS.getName()+" = "+attValSDS);
							}
							
						}	

						sdslinks.push(sdslinksJson);
					}		
				
				}

				if (sdslinks.length==0){
				 	sdslinks=[{}];
				 }

			var prodCurRevname = prodCurRevnode.getName()+"";

			//To get Application Protocol Information

                var appprotocol=[]
			  var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
			  var revAplicationProtocolReferences = prodCurRevnode.getClassificationProductLinks(refType);
			  //logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());
		
			            for (var i = 0; i < revAplicationProtocolReferences.size() > 0; i++) {
			            	var appProtocolJson={}
			               var appProtocolObj = revAplicationProtocolReferences.get(i).getClassification();


			               var revAppProtClassValues=revAplicationProtocolReferences.get(i).getValues();

					
					
					    var itAPVal = revAppProtClassValues.iterator();
					    
					    while (itAPVal.hasNext()) {
					    	 var attrValueAPVal= itAPVal.next();
					      var attributeAPVal ="";
					      if (attrValueAPVal!=null){
					        attributeAPVal =attrValueAPVal.getAttribute();
					   
					         var attValAPVal = attrValueAPVal.getSimpleValue() + "";	        
					        appProtocolJson[attributeAPVal.getID()] = attValAPVal;
					      }
					     
					    }

			             var protocolno= appProtocolObj.getValue("PROTOCOLNO").getSimpleValue();
			        //  logger.info(" PROTOCOLNO "+protocolno);

			              var application= appProtocolObj.getParent().getValue("Application").getSimpleValue()+"";
			             

						 
						 //To Get Attributes for Application Protocol
 						var setAttrAP = appProtocolObj.getValues();
					  	var itAP = setAttrAP.iterator();
					    
					    while (itAP.hasNext()) {
					    	 var attrValueAP = itAP.next();
					      var attributeAP ="";
					      if (attrValueAP!=null){
					        attributeAP =attrValueAP.getAttribute();
					       
					         var attValAP = attrValueAP.getSimpleValue() + "";	        
					         
					       // logger.info("  "+attributeAP.getName()+" = "+attValAP);
					         appProtocolJson[attributeAP.getID()] = attValAP;
					      }
					     
			
			            }

			             if (protocolno!=null){
			             	 appProtocolJson["Application"] = application;
			             	
			             	}
						 
						 
			            
					     appprotocol.push(appProtocolJson);
			           }

			      if (appprotocol.length==0){
				 	appprotocol=[{}];
				 }


			                      //To Get companion Product
				var compprod=[]
			     var compProdReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Companion_Product");
				var compProdReferences = node.getReferences(compProdReferenceType);
           		for (var j = 0; j < compProdReferences.size(); j++) {
				    var comprodJson={}
				   var compProdObj = compProdReferences.get(j).getTarget();
				   logger.info( " compProdObj "+compProdObj);

				  
						 //To Get Attributes for Companion Product
 						var setAttrCP = compProdObj.getValues();
					  	var itCP = setAttrCP.iterator();
					    
					    while (itCP.hasNext()) {
					    	 var attrValueCP = itCP.next();
					      var attributeCP ="";
					      if (attrValueCP!=null){
					        attributeCP =attrValueCP.getAttribute();
					       
					         var attValCP = attrValueCP.getSimpleValue() + "";	        
					         if (attributeCP.getID()=="PRODUCTNO"){
					       // logger.info("  "+attributeCP.getName()+" = "+attValCP);
					         comprodJson[attributeCP.getID()] = attValCP;
					         }
					      }
					     
			
			            }
			            
					     compprod.push(comprodJson);
				   
				 }

				  if (compprod.length==0){
				 	compprod=[{}];
				 }



//To get Asset Information
			       var asset=[]
			       var prodfigs=[]
	   var pubImgRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
			         if (pubImgRefType != null) {
			            var pubImgLinks = prodCurRevnode.getReferences(pubImgRefType);
			            for (var i = 0; i < pubImgLinks.size() > 0; i++) {
			            	var assetJson={}
			               var aImageTarget = pubImgLinks.get(i).getTarget();
			             
						 //To Get Attributes for Assets
 						var setAttrIV = aImageTarget.getValues();
					  	var itIV = setAttrIV.iterator();
					    
					    while (itIV.hasNext()) {
					    	 var attrValueIV = itIV.next();
					      var attributeIV ="";
					      if (attrValueIV!=null){
					        attributeIV =attrValueIV.getAttribute();
					       
					         var attValIV = attrValueIV.getSimpleValue() + "";	        
					         if (attributeIV.getID()=="Figure_Key"){
					         	attValIV=attValIV.toLowerCase();
					       	var figkeylist=attValIV.split(/[.\-_]/)
					       	if (figkeylist!=null &&figkeylist.length==2){
					       		prodfigs.push(attValIV);
					       		}
					         }
					        // executionReportLogger.logInfo("  "+attributeIV.getName()+" = "+attValIV);
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
					        
					         // executionReportLogger.logInfo("  "+attributeSV.getName()+" = "+attValSV);
					         assetJson[attributeSV.getName()] = attValSV;
					      }
					     
					    }

					     asset.push(assetJson);
			
			            }
			         }

			       if (asset.length==0){
				 	asset=[{}];
				 }

//To Get Entity - Target & Species

			       var entity=[];
			       var entityJson={};
			        var targetMap=new Object();
                       var targetArray=[]
			        //To Get Target
	   			  var targetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
			         if (targetRefType != null) {
			            var targetList = prodCurRevnode.getReferences(targetRefType);
			            for (var i = 0; i < targetList.size() > 0; i++) {
			            	
			               var targetObj = targetList.get(i).getTarget();
						//var targetJson={}
			             	var targetno= targetObj.getValue("TARGETNO").getSimpleValue()
			                targetMap[targetno]=targetObj;


			        
			
			            }
			         
			            
			         }

			   
//To Get Species
 					var speciesArray=[]
			             var speciesRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");
			         if (speciesRefType != null) {
			            var speciesList = prodCurRevnode.getReferences(speciesRefType);
			            for (var i = 0; i < speciesList.size() > 0; i++) {
			            	
			               var speciesObj = speciesList.get(i).getTarget();
						var speciesJson={}
			              var speciesno= speciesObj.getValue("SPECIESCODE").getSimpleValue()
			           //  targetMap[speciesno]=speciesObj;

			             	 //To Get Attributes for Target
 						var setAttrSP = speciesObj.getValues();
					  	var itSP= setAttrSP.iterator();
					    
					    while (itSP.hasNext()) {
					    	 var attrValueSP = itSP.next();
					      var attributeSP ="";
					      if (attrValueSP!=null){
					        attributeSP =attrValueSP.getAttribute();
					       
					         var attValSP = attrValueSP.getSimpleValue() + "";	        
					         
					        // executionReportLogger.logInfo("  "+attributeIV.getName()+" = "+attValIV);
					         speciesJson[attributeSP.getID()] = attValSP;
					      }
					     
					    }
			             
						speciesArray.push(speciesJson);
						
					
					    }

					     if (typeof speciesArray !== 'undefined') {
				            	 if (speciesArray.length==0){
							 	speciesArray=[{}];
							 }
				            	
	
	 					  entityJson["species"]=speciesArray;
					     }
			            
					    
			         }



		
			var prodCurRevTargetName = prodCurRevnode.getName()+"";
	       // executionReportLogger.logInfo (" prodCurRevTargetName "+prodCurRevTargetName);

	        
		if (kit){
			var krsJson={};
	        var kitRevskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
		   var kitRevskuReferences = prodCurRevnode.getReferences(kitRevskuReferenceType);
 		  	 for (var j = 0; j < kitRevskuReferences.size(); j++) {
		    var ksJson={}
			   var kitRevSkuTargetNode = kitRevskuReferences.get(j).getTarget();
			  // logger.info( " kitRevSkuTargetNode "+kitRevSkuTargetNode);

			   var kitRevSkuTargetName = kitRevSkuTargetNode.getName()+"";
			   //executionReportLogger.logInfo ( " kitRevSkuTargetName "+kitRevSkuTargetName);

		       var kitRevSkuTargetValues=kitRevskuReferences.get(j).getValues();

				
				
				    var itKSVal = kitRevSkuTargetValues.iterator();
				    
				    while (itKSVal.hasNext()) {
				    	 var attrValueKSVal= itKSVal.next();
				      var attributeKSVal ="";
				      if (attrValueKSVal!=null){
				        attributeKSVal =attrValueKSVal.getAttribute();
				   
				         var attValKSVal = attrValueKSVal.getSimpleValue() + "";	        
				        ksJson[attributeKSVal.getID()] = attValKSVal;
				      }
				     
				    }

			   //To get Kit SKU attributes
				var setAttrKS = kitRevSkuTargetNode.getValues();
				var itKS = setAttrKS.iterator();
				
				while (itKS.hasNext()) {
					var attrValueKS = itKS.next();
					var attributeKS ="";
					if (attrValueKS!=null){
						attributeKS =attrValueKS.getAttribute();
						//log.info(" attributeCh "+attributeCh);
						var attValKS = attrValueKS.getSimpleValue() + "";	        
						ksJson[attributeKS.getID()] = attValKS;
						//logger.info("attValCh"+attValCh);
					}			
				}

				

			//To Get Application Protocol for Kit Component

				var skuappProt=Object.buildAppProtocol(kitRevSkuTargetNode.getParent().getParent());
				
			  // executionReportLogger.logInfo ( " skuappProt "+skuappProt.length);

			
                   var skuappProtArray=[];
				for(var key in skuappProt) {
					var value = skuappProt[key];
					var skuappprotJson={}	
					for(var key1 in value) {
						var value1 = value[key1];
						
						skuappprotJson[key1]=value1;
						
				//executionReportLogger.logInfo ( " skuappProtArray1 "+key1+" =" +value1);
						
					}
					skuappProtArray.push(skuappprotJson)
	
				}
				  
				//	executionReportLogger.logInfo ( " skuappProtArray1 2 "+skuappProtArray);
				
				ksJson["ApplicationProtocol"]=skuappProtArray

				
				

				krs.push(ksJson);

				//To Get Target from Kit Components

			
  				 
			        var targetMap=new Object();
                      
			        //To Get Target
	   			  var targetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
			         if (targetRefType != null) {
			            var targetList = prodCurRevnode.getReferences(targetRefType);
			            for (var i = 0; i < targetList.size() > 0; i++) {
			            	
			               var targetObj = targetList.get(i).getTarget();
						//var targetJson={}
			             	var targetno= targetObj.getValue("TARGETNO").getSimpleValue();
			               targetMap[targetno]=targetObj;


			          
			
			            }

			          
			            
			         }


			 }
		 
	     
			      
		mesg["KitRevisionToSKU"]=krs;
		}

		//Get Specific Attributes in current Revision
		
		var prodCurRevIsotype = prodCurRevnode.getValue("Isotype").getSimpleValue()+"";
		var prodCurRevLotFormulation = prodCurRevnode.getValue("Lot_Formulation").getSimpleValue()+"";
		var prodCurRevAbSense = prodCurRevnode.getValue("Antibody_Sensitivity").getSimpleValue()+"";
		var prodCurRevNo = prodCurRevnode.getValue("REVISIONNO").getSimpleValue()+"";
		
  	   crtarget["name"]=prodCurRevname;
  	   crtarget["Isotype"]=prodCurRevIsotype;
  	   crtarget["Lot_Formulation"]=prodCurRevLotFormulation;
  	   crtarget["Antibody_Sensitivity"]=prodCurRevAbSense;
  	   crtarget["REVISIONNO"]=prodCurRevNo;
  	   crtarget["Rev_Product_Figures"]=prodfigs;
	   currev.push(crtarget);
		
		 }


		 //Add Target from kit and Kit Components target

		 
		   for (var key in targetMap) {
 				var targetJson={}
				var targetObj=targetMap[key];
				


				var setAttrTG = targetObj.getValues();
			  	var itTG = setAttrTG.iterator();
			    
			    while (itTG.hasNext()) {
			    	 var attrValueTG = itTG.next();
			      var attributeTG ="";
			      if (attrValueTG!=null){
			        attributeTG =attrValueTG.getAttribute();
			       
			         var attValTG = attrValueTG.getSimpleValue() + "";	        
			         
			         targetJson[attributeTG.getID()] = attValTG;
			      }
			     
			    }
	             
				targetArray.push(targetJson);
	
	            }

	            if (typeof targetArray !== 'undefined') {
	             if (targetArray.length==0){
				 	targetArray=[{}];
				 }
	          
           		 entityJson["targets"]=targetArray;
             		entity.push(entityJson);
			 }            
		   
	
	



		mesg.SDSLinks=sdslinks;
		mesg.AlternateProduct=altprod;	
		mesg.CompanionProduct=compprod;
		mesg.ApplicationProtocol=appprotocol;
          mesg.Asset=asset;
		mesg.ProductToCurrentRevision=currev;
		mesg.Entity=entity;
	



	return mesg;
  };

       


var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
	executionReportLogger.logInfo("No event information available in node handler");
} else {
	executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();
 var mesgfinal;
if (node!=null && node.getObjectType().getID().equals("Product_Kit")) {

	//executionReportLogger.logInfo(" Product Kit ");
	
	if (nodeHandlerSource.isDeleted()) {
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesg));
	} else {
		
		mesgfinal =Object.buildNodeMessage(node,simpleEventType,true);
				
	}
     
	
	nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
			    
} else if (node != null && node instanceof com.stibo.core.domain.Product) {
				
	executionReportLogger.logInfo("Node handler handling product with URL: " + node.getURL());
	//
	//format the JSON message 
	//
	
	if (nodeHandlerSource.isDeleted()) {
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesg));
	} else {
		
		 mesgfinal =Object.buildNodeMessage(node,simpleEventType,false);
				
	}

	    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
	  
}
}