/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_Update_App_Protocol_Attribute",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_Update_App_Protocol_Attribute",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
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
/*// ProductKitRevisionApprovalAction - GLTH 20180420
// node = Current Object
// logger = Logger
// validity: Product_Revision, Kit_Revision

var revAppProtocolLinkType = node.getManager().getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
if (!revAppProtocolLinkType) {
   throw "Revision_to_ApplicationProtocol link type not found";
}
var cpLinks = node.getClassificationProductLinks(revAppProtocolLinkType);

//Delete all the entries first
for (var cpix=0; cpix<cpLinks.size(); cpix++) {
	var cpLink = cpLinks.get(cpix);
	var valueObject = cpLink.getValue("Rev_Application_Figures");
	var values = valueObject.getValues();     // expecting a MultiValue...
	logger.info(values.size());
	for (var vix=0; vix<values.size(); vix++) {
		values.get(vix).deleteCurrent();
	}
}

var assetRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
if (!assetRefType) {
   throw "Published_Product_Images reference type not found";
}
var assetReferences = node.getReferences(assetRefType);
for (var aix=0; aix<assetReferences.size(); aix++) {
   var assetRef = assetReferences.get(aix);
   var asset = assetRef.getTarget();
   var typeValue = asset.getValue("Figure_Image_Application_Type").getSimpleValue();
   if (typeValue == null || typeValue.length() == 0) {
      typeValue = asset.getValue("Figure_Application_Type").getSimpleValue();
   }
   logger.info("*******************");
   logger.info("Found asset: "+asset.getID()+ " typeValue="+typeValue);
   if (typeValue != null && typeValue.length() > 0) {     // we will attempt to find a match to this value on the linked revisions...
      for (var cpix=0; cpix<cpLinks.size(); cpix++) {
         var cpLink = cpLinks.get(cpix);
         var classification = cpLink.getClassification();
         var abbrAttrID = classification.getObjectType().getID().equals("Application") ? "APPLICATIONABBR" : "PROTOCOLAPPLICATIONABBR";
         var appAbbr = classification.getValue(abbrAttrID).getSimpleValue();
         logger.info(abbrAttrID+"="+appAbbr);
         if (typeValue.equals(appAbbr)) {      // It's a match
            logger.info("Matched classification: "+classification.getID() + " on app abbr: "+appAbbr);
            var hasMatchingValue = false;
            var valueObject = cpLink.getValue("Rev_Application_Figures");
           // var values = valueObject.getValues();     // expecting a MultiValue...
            //logger.info(values.size());
          /*  for (var vix=0; vix<values.size(); vix++) {
            	values.get(vix).deleteCurrent();
            }*
//valueObject.addValue(asset.getID());
           var values1 = valueObject.getValues(); 
           logger.info(values1.size());
            for (var vix=0; vix<values1.size(); vix++) {
               var currentValueString = values1.get(vix).getSimpleValue();
                logger.info(" currentValueString "+currentValueString);
                
               if (asset.getID().equals(currentValueString)) {
                  hasMatchingValue = true;
                  break;
               }
            }
            if (hasMatchingValue) {
               logger.info("   value exists: "+valueObject.getAttribute().getID()+"=" +asset.getID());
            } else {
               valueObject.addValue(asset.getID());
               logger.info("   value added: "+valueObject.getAttribute().getID()+"=" +asset.getID());
            }
         }

         logger.info("-------------------");
      }
   }
}
*/
var applicationMap=new Object();

 var revAppProtocolLinkType = node.getManager().getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
        if (revAppProtocolLinkType != null) {
      	var cpLinks = node.getClassificationProductLinks(revAppProtocolLinkType);
      	for (var cpix=0; cpix<cpLinks.size(); cpix++) {
			var cpLinkTarget = cpLinks.get(cpix);
				logger.info(" cpLinkTarget "+cpLinkTarget);
				var classification = cpLinkTarget.getClassification();
         var abbrAttrID = classification.getObjectType().getID().equals("Application") ? "APPLICATIONABBR" : "PROTOCOLAPPLICATIONABBR";
         var sApplication = classification.getValue(abbrAttrID).getSimpleValue();
         logger.info(abbrAttrID+"="+sApplication);
           var sProtocolNo = classification.getValue("PROTOCOLNO").getSimpleValue();
            logger.info(abbrAttrID+"="+sProtocolNo);
			//var sApplication= cpLinkTarget.getValue("APPLICATIONABBR").getSimpleValue();
			//logger.info(" sApplication "+cpLinkTarget.getID());
			if (sProtocolNo){
				applicationMap[sProtocolNo]=classification;
				}else{
					applicationMap[sApplication]=classification;}
				
               
      	}
        }


         for (var key in applicationMap) {
         	logger.info(" key "+key);
        
        var targetObj = applicationMap[key];
        logger.info(" targetObj "+targetObj);
         
         }
}