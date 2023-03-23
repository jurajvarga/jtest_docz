/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_SK_JSON",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_SK_JSON",
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,log,revisionMasterStock) {
/*





Object.buildNodeMessage =function buildNodeMessage(node,kit){

	var mesg = {};
	mesg.stepid = node.getID() + "";

	mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";

	logger.info(" Product "+ node.getID() + "");

logger.info(" Product "+ node.getValue("PRODUCTNO").getSimpleValue() + "");

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
          //logger.info(" childId "+childId);
		if (childId=="MasterStock"){

		var mssrevisionstatus=child.getValue("REVISIONSTATUS").getSimpleValue()+"";
		var mssrevisionname=child.getName()+""; 
           	logger.info("  mssrevisionstatus "+mssrevisionstatus);
           	logger.info("  mssrevisionname "+mssrevisionname);
    
		//log.info("childId"+childId);
		
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




		//To Get Child of Child Values or SKU
		var gcl=[];
		var gcnameid="";
		var grandchild=child.getChildren();
		for (j = 0; j < grandchild.size(); j++) {
			var gcobj  = grandchild.get(j);
			var gcjson = {}; //SKU
			
			
			var gcId=gcobj.getObjectType().getID();
			logger.info(" gcId "+gcId);
			gcnameid=gcId+"s";

			var skuid=gcobj.getID()+""; 
           	logger.info("  skuid "+skuid);

			var skuname=gcobj.getName()+""; 
           	logger.info("  skuname "+skuname);
           	
								
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

	      			logger.info(" altProductnodename "+altProductnodename);
				  
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

	
		var krs=[]; //kit revision sku
		var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			  
	     var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);
	     var currev=[] //currev array
	     for (var j = 0; j < prodCurRevReferences.size(); j++) {
	     
	          var crtarget={};//currev 

	       	var prodCurRevnode = prodCurRevReferences.get(j).getTarget()
			//logger.info(" prodCurRevnode "+prodCurRevnode);
			logger.info(" prodCurRevnode ID "+prodCurRevnode.getID());
			
var prodCurRevStatus = prodCurRevnode.getValue("REVISIONSTATUS").getSimpleValue()+"";

logger.info(" prodCurRevStatus "+prodCurRevStatus);


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
								
								//logger.info("  "+attributeSDS.getName()+" = "+attValSDS);
							}
							
						}	

						sdslinks.push(sdslinksJson);
					}		
				
				}





			var prodCurRevname = prodCurRevnode.getName()+"";


//To get Application Protocol Information

                var appprotocol=[]
			  var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
			  var revAplicationProtocolReferences = prodCurRevnode.getClassificationProductLinks(refType);
			  logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());
		
			            for (var i = 0; i < revAplicationProtocolReferences.size() > 0; i++) {
			            	var appProtocolJson={}
			               var appProtocolObj = revAplicationProtocolReferences.get(i).getClassification();

			             var protocolno= appProtocolObj.getValue("PROTOCOLNO").getSimpleValue();
			          logger.info(" PROTOCOLNO "+protocolno);
			             
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
			            
					     appprotocol.push(appProtocolJson);
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
					         
					       // logger.info("  "+attributeCP.getName()+" = "+attValCP);
					         comprodJson[attributeCP.getID()] = attValCP;
					      }
					     
			
			            }
			            
					     compprod.push(comprodJson);
				   
				 }



//To get Asset Information
			var asset=[]
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
					          //chJson[attributeCh.getID()] = attValCh;
					         // executionReportLogger.logInfo("  "+attributeSV.getName()+" = "+attValSV);
					         assetJson[attributeSV.getName()] = attValSV;
					      }
					     
					    }

					     asset.push(assetJson);
			
			            }
			         }

 logger.info(" Asset JSON "+asset);
  					for (var i = 0; i<asset.length; i++) {
			            	var assetJsonObj=asset[i];
			             
 						logger.info(" Asset JSON idx = "+i+" value= "+assetJsonObj);
 						
						logger.info(" Asset JSON idx = "+i+" value= "+assetJsonObj.Figure_Key);

						
						logger.info(" Asset JSON idx = "+i+" value= "+assetJsonObj.Figure_Application_Type);
						logger.info(" Asset JSON idx = "+i+" value= "+assetJsonObj.PROTOCOLNO);

 						
			            }
			            
			     

//To Get Entity - Target & Species

			       var entity=[];
			        var targetMap=new Object();

			        //To Get Target
	   			  var targetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
			         if (targetRefType != null) {
			            var targetList = prodCurRevnode.getReferences(targetRefType);
			            for (var i = 0; i < targetList.size() > 0; i++) {
			            	
			               var targetObj = targetList.get(i).getTarget();

			             var targetno= targetObj.getValue("TARGETNO").getSimpleValue()
			             targetMap[targetno]=targetObj;
			             
						
			
			            }
			         }

//To Get Species
			             var speciesRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");
			         if (speciesRefType != null) {
			            var speciesList = prodCurRevnode.getReferences(speciesRefType);
			            for (var i = 0; i < speciesList.size() > 0; i++) {
			            	
			               var speciesObj = speciesList.get(i).getTarget();

			              var speciesno= speciesObj.getValue("SPECIESCODE").getSimpleValue()
			             targetMap[speciesno]=speciesObj;
					
					    }
			         }



		
			var prodCurRevTargetName = prodCurRevnode.getName()+"";
	        logger.info (" prodCurRevTargetName "+prodCurRevTargetName);
		if (kit){
	        var kitRevskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
		   var kitRevskuReferences = prodCurRevnode.getReferences(kitRevskuReferenceType);
 		  	 for (var j = 0; j < kitRevskuReferences.size(); j++) {
		    
			   var kitRevSkuTargetNode = kitRevskuReferences.get(j).getTarget();
			  // logger.info( " kitRevSkuTargetNode "+kitRevSkuTargetNode);

			   var kitRevSkuTargetName = kitRevSkuTargetNode.getName()+"";
			   //executionReportLogger.logInfo ( " kitRevSkuTargetName "+kitRevSkuTargetName);

			   //To get Kit SKU attributes
				var setAttrKS = kitRevSkuTargetNode.getValues();
				var itKS = setAttrKS.iterator();
				var ksJson={}
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

				krs.push(ksJson);

				//To Get Target from Kit Components

				 var targetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
			         if (targetRefType != null) {
			            var targetList = kitRevskuReferences.get(j).getTarget().getReferences(targetRefType);
			            for (var i = 0; i < targetList.size() > 0; i++) {
			            	var targetJson={}
			               var targetObj = targetList.get(i).getTarget();

			                 var targetno= targetObj.getValue("TARGETNO").getSimpleValue()
			              targetMap[targetno]=targetObj;
			            }
			         }
		   
			 }
		 
	     
			      
		mesg["KitRevisionToSKU"]=krs;
		}
  	   crtarget["name"]=prodCurRevname;
	   currev.push(crtarget);
		
		 }
	
	

//Add Target Species to JSON Map

		   for (var key in targetMap) {
 				var targetJson={}
						var targetObj=targetMap[key];
						logger.info(" Target Object "+targetObj);
						var setAttrTR = targetObj.getValues();
 						
					  	var itTR = setAttrTR.iterator();
					    
					    while (itTR.hasNext()) {
					    	 var attrValueTR = itTR.next();
					      var attributeTR ="";
					      if (attrValueTR!=null){
					        attributeTR =attrValueTR.getAttribute();
					       
					         var attValTR = attrValueTR.getSimpleValue() + "";	        
					       // executionReportLogger.logInfo("  "+attributeTR.getName()+" = "+attValTR);
					         targetJson[attributeTR.getID()] = attValTR;
					        
					      }
						}
						 entity.push(targetJson);
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

       



var mesgfinal;
if (node!=null && node.getObjectType().getID().equals("Product_Kit")) {

	logger.info(" Product Kit ");
	mesgfinal =Object.buildNodeMessage(node,true);
	//	display(mesgfinal);		
	

			    
} else if (node != null && node instanceof com.stibo.core.domain.Product) {
	logger.info(" Product ");	
	 mesgfinal =Object.buildNodeMessage(node,false);

	// display(mesgfinal);

	  
}


//Function to display object values
function display(dispobj){
	for(var key in dispobj) {
	var value = dispobj[key];
	//logger.info("dispobj "+key+"="+value);
	}
}
*/
//63839_rev1

var itemCode = node.getValue("SKU_Creation_Create").getSimpleValue();
var sourced=""
var customlot=""
//if(itemCode && itemCode != "Enter SKU Code...") {
	//itemCode = itemCode.toUpperCase();
	itemCode=""
	log.info(" itemCode "+itemCode);

	if (node!=null){
	
	//To Get Tech Transfer Lot  Information
		var refTypeTT = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
		var revTTLotReferences = node.getReferences(refTypeTT);
		//logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());

		for (var i = 0; i < revTTLotReferences.size() > 0; i++) {
			
			var ttLotObj = revTTLotReferences.get(i).getTarget();
			log.info(" ttLotObj " + ttLotObj);
			if (ttLotObj!=null){
				sourced = ttLotObj.getValue("Sourced").getSimpleValue();
				break;
			}
		}

	
	customlot = node.getValue("CustomLotRev_YN").getSimpleValue();

	log.info("sourced " + sourced)
	log.info("customlot " + customlot)
}

	var masterStock = null;
	var masterStockReferences = node.getReferences(revisionMasterStock);
	var usedItemCodes = []
	var avaiableItemCodes = []
	if(!masterStockReferences.isEmpty()) {
		masterStock = masterStockReferences.get(0).getTarget();
	}
	if(masterStock) {
		var usedSkus = masterStock.getChildren()
		for (var i=0; i<usedSkus.size();i++) {
			usedItemCodes.push(usedSkus.get(i).getValue("ItemCode").getSimpleValue())
		}		
		var defaultEntity = null;
		var sProductType = masterStock.getValue("PRODUCTTYPE").getSimpleValue();
		var nProduct = masterStock.getValue("PRODUCTNO").getSimpleValue();
		var sMasterItemCode = masterStock.getValue("MASTERITEMCODE").getSimpleValue();

		log.info(" sMasterItemCode "+sMasterItemCode);

		//Search for Entities with matching product type
		var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
		var type = com.stibo.core.domain.entity.Entity;
		var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
		var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);

		var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
		query.root = belowNode;

		var itemCodesList = searchHome.querySingleAttribute(query).asList(100).toArray();
		for (var i = 0; i < itemCodesList.length; i++) {
			var eSkuDefault = itemCodesList[i];
			var sDefaultItemCode =  eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
			var sDefaultMasterItemCode =  eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
			
			log.info(" sDefaultItemCode "+sDefaultItemCode);
			log.info(" sDefaultMasterItemCode "+sDefaultMasterItemCode);
			if (!checkSourcedOrCustomProducts(sourced,customlot)){
				if (sDefaultMasterItemCode == sMasterItemCode) {
					log.info(" sDefaultItemCode "+sDefaultItemCode);
					avaiableItemCodes.push(eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue())
					if(sDefaultItemCode == itemCode ) {
						log.info("Found matching Product Item Default for ) " + sDefaultMasterItemCode +" " +sDefaultItemCode);
						defaultEntity = eSkuDefault;
					}
				}
			}else{
				log.info(" sDefaultItemCode "+sDefaultItemCode);
					//log.info(" sDefaultItemCode1 "+itemCodesList[i].getValue("ItemCode_DFLT").getSimpleValue());
					avaiableItemCodes.push(eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue())
					if(sDefaultItemCode == itemCode ) {
						log.info("Found matching Product Item Default for ) " + sDefaultMasterItemCode +" " +sDefaultItemCode);
						defaultEntity = eSkuDefault;
					}
				}
		}
log.info(" ************************");
		log.info(" avaiableItemCodes "+avaiableItemCodes);
		log.info(" defaultEntity "+defaultEntity);
log.info(" ************************");
	/*	log.info("Did I find matching Product Item Default for ) " + sDefaultMasterItemCode +" " +sDefaultItemCode);
		if(defaultEntity) {
			var sDefaultItemCode = defaultEntity.getValue("ItemCode_DFLT").getSimpleValue();
			log.info("SKU exists? " + lib.isSkuExist(step, nProduct, sDefaultItemCode, log));
			if(!lib.isSkuExist(step, nProduct, sDefaultItemCode, log)) {
				log.info("creating sku");
				var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
				var newSku = lib.createSKU(step, masterStock, defaultEntity, nProduct, sDefaultItemCode, attrGroup);

			}
		} else {
			throw "Product does not have default entity";
		}
		var skusAvaiableArray = node.getValue("SKU_Creation_Available").getSimpleValue().split(",")
		var filteredCodes = avaiableItemCodes.filter(function(item) {
    			return (!avaiSkusIncludesUsedItemCode(item))
		})
		node.getValue("SKU_Creation_Available").setSimpleValue(filteredCodes.join())*/
	}
/*} else {
	throw "Product does not have Item Code(s)";
}
*/
function avaiSkusIncludesUsedItemCode(item) {
	var result = false
	for (var index = 0; index < usedItemCodes.length; index++) {
		if (usedItemCodes[index] == item || itemCode == item) {
			result = true
		}
	}
	return result;
}


function checkSourcedOrCustomProducts(sourcedAttr,customAttr) {
	var result = false;
	if ((sourcedAttr!="" && sourcedAttr!="Not Sourced") || customAttr == "Y"){
		result = true;
	}
	return result;
}
}