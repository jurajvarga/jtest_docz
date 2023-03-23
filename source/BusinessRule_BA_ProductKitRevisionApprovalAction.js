/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProductKitRevisionApprovalAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Product/Kit Revision Approval Action",
  "description" : "Populates Application Type on assets",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
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
// ProductKitRevisionApprovalAction - GLTH 20180420
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
	//logger.info(values.size());
	for (var vix=0; vix<values.size(); vix++) {
		values.get(vix).deleteCurrent();
	}
}


var assetRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
if (!assetRefType) {
   throw "Published_Product_Images reference type not found";
}
//STEP-6396
var assetReferences = node.queryReferences(assetRefType); 
assetReferences.forEach(function(ref) {
   var asset = ref.getTarget();
   //STEP-6396
   var typeValue = asset.getValue("Figure_Image_Application_Type").getSimpleValue();
   var figurekey=asset.getValue("Figure_Key").getSimpleValue();
   if (typeValue == null || typeValue.length() == 0) {
      typeValue = asset.getValue("Figure_Application_Type").getSimpleValue();
   }
   /* if (typeValue == null || typeValue.length() == 0) {
      typeValue = asset.getValue("Figure_Heading").getSimpleValue();
   }
   if (typeValue == null || typeValue.length() == 0) {
      typeValue = asset.getValue("Figure_Heading").getSimpleValue();
      
   }*/
   if (typeValue == "Western Blotting"){
      	typeValue ="W";
      }
  // logger.info("Found asset: "+asset.getID()+ " typeValue="+typeValue+" figurekey "+figurekey);
   if (typeValue != null && typeValue!="") {     // we will attempt to find a match to this value on the linked revisions...
      for (var cpix=0; cpix<cpLinks.size(); cpix++) {
         var cpLink = cpLinks.get(cpix);
         var classification = cpLink.getClassification();
         var abbrAttrID = classification.getObjectType().getID().equals("Application") ? "APPLICATIONABBR" : "PROTOCOLAPPLICATIONABBR";
         var appAbbr = classification.getValue(abbrAttrID).getSimpleValue();
         //logger.info(abbrAttrID+"="+appAbbr);
         if (typeValue.equals(appAbbr)) {      // It's a match
            //logger.info("Matched classification: "+classification.getID() + " on app abbr: "+appAbbr);
            var hasMatchingValue = false;
            var valueObject = cpLink.getValue("Rev_Application_Figures");
            var values = valueObject.getValues();     // expecting a MultiValue...
 		 /* logger.info(values.size());
            for (var vix=0; vix<values.size(); vix++) {
            	values.get(vix).deleteCurrent();
            }
            */
            var values1 = valueObject.getValues(); 
           //logger.info(values1.size());
            for (var vix=0; vix<values1.size(); vix++) {
               var currentValueString = values1.get(vix).getSimpleValue();
               if (figurekey.equals(currentValueString)) {
                  hasMatchingValue = true;
                  break;
               }
            }
            if (hasMatchingValue) {
              // logger.info("   value exists: "+valueObject.getAttribute().getID()+"=" +figurekey);
            } else {
               valueObject.addValue(figurekey);
               //logger.info("   value added: "+valueObject.getAttribute().getID()+"=" +figurekey);
            }
         }
      }
   }
   return true; //STEP-6396
});
}