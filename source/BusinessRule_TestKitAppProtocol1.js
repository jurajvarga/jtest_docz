/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestKitAppProtocol1",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestKitAppProtocol1",
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

Object.buildAppProtocol=function buildAppProtocol(kitReferenceProduct){
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
					var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
					 var kitAppProtoRefList = kitRefCurRevTarget.getClassificationProductLinks(refType);

					logger.info(" kitAppProtoRefList "+kitAppProtoRefList.size());

					//To get Application Protocol Information

              		   var appprotocol=[]
			 
			  
		
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
					         //logger.info("    "+attributeAPVal.getID()+" = "+attValAPVal);
					        appProtocolJson[attributeAPVal.getID()] = attValAPVal;
					      }
					     
					    }

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

			      if (appprotocol.length==0){
				 	appprotocol=[{}];
				 }

					//display(appprotocol);
					
					}
				
			     }
		}

		return appprotocol;
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
                      var skuappProt=Object.buildAppProtocol(kitRevSkuTarget.getParent().getParent());
				for(var key in skuappProt) {
	var value = skuappProt[key];
	logger.info("skuappProt "+key+"="+value);
for(var key1 in value) {
	var value1 = value[key1];
	logger.info("skuappProt1 "+key1+"="+value1);
}
	
	}
				   logger.info(" -------- ");	
				 
			      }
			     }


//logger.info(" kitTargets "+kitTargets);



			     
			       

// }
 
          

/*for (k=0;k<kitTargets.length;k++){

	      var kitReferenceProduct = kitTargets[k].getParent().getParent();
				    
//logger.info(" kitReferenceProduct "+kitReferenceProduct);

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
					var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
					 var kitAppProtoRefList = kitRefCurRevTarget.getClassificationProductLinks(refType);

					logger.info(" kitAppProtoRefList "+kitAppProtoRefList.size());

					//To get Application Protocol Information

              		   var appprotocol=[]
			 
			  
		
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
					         logger.info("    "+attributeAPVal.getID()+" = "+attValAPVal);
					        appProtocolJson[attributeAPVal.getID()] = attValAPVal;
					      }
					     
					    }

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

			      if (appprotocol.length==0){
				 	appprotocol=[{}];
				 }

					display(appprotocol);
					
					}
				
			     }
		}
	
	
	}*/
}