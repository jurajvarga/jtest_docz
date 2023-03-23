/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestKitAppProtocol",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestKitAppProtocol",
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
    "contract" : "LoggerBindContract",
    "alias" : "logger1",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger1,manager) {
var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			  
	     var prodCurRevReferences = node.getReferences(prodCurRevReferenceType);
	     var currev=[] //currev array
	     for (var j = 0; j < prodCurRevReferences.size(); j++) {
	     
	          var crtarget={};//currev 

	        var prodCurRevnode = prodCurRevReferences.get(j).getTarget()
		


			var prodCurRevname = prodCurRevnode.getName()+"";
	//logger1.info(" prodCurRevname "+prodCurRevname);

    
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
					           logger1.info("  App "+attributeAPVal.getID()+" = "+attValAPVal);        
					        appProtocolJson[attributeAPVal.getID()] = attValAPVal;
					      }
					     
					    }

			             var protocolno= appProtocolObj.getValue("PROTOCOLNO").getSimpleValue();
			          logger1.info(" PROTOCOLNO "+protocolno);

			          var application= appProtocolObj.getParent().getValue("Application").getSimpleValue()
			          
			          var applicationIDX= appProtocolObj.getParent().getValue("APPLICATIONINDEX").getSimpleValue()
			               
			           var applicationGroup= appProtocolObj.getParent().getValue("APPLICATIONGROUP").getSimpleValue()
			               
			            var applicationID= appProtocolObj.getParent().getID();
			             logger1.info(" application "+application);

			             logger1.info(" applicationIDX "+applicationIDX);

			             logger1.info(" applicationGroup "+applicationGroup);
			             

			             logger1.info(" applicationID "+applicationID);

						 //To Get Attributes for Application Protocol
 						var setAttrAP = appProtocolObj.getValues();
					  	var itAP = setAttrAP.iterator();

					  	
					    
					    while (itAP.hasNext()) {
					    	 var attrValueAP = itAP.next();
					      var attributeAP ="";
					      if (attrValueAP!=null){
					        attributeAP =attrValueAP.getAttribute();
					       
					         var attValAP = attrValueAP.getSimpleValue() + "";	        
					         
					        logger1.info(" Prot "+attributeAP.getID()+" = "+attValAP);
					        
					         appProtocolJson[attributeAP.getID()] = attValAP;
					      }
					     
			
			            }
			             if (protocolno!=null){
			             	 appProtocolJson["Application"] = application;
			             	 
			             	 appProtocolJson["APPLICATIONGROUP"] = applicationGroup;
			             	 appProtocolJson["APPLICATIONINDEX"] = applicationIDX;
			             	 appProtocolJson["APPLICATIONID"] = applicationID;
			             	
			             	}else{

			             		 appProtocolJson["APPLICATIONID"] = appProtocolObj.getID();
			             		 
							logger1.info(" ID "+appProtocolObj.getID());

			             		}
					     appprotocol.push(appProtocolJson);
			           }

			      if (appprotocol.length==0){
				 	appprotocol=[{}];
				 }
				
	     }
}