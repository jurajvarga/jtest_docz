/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "michael_test",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "michael_test",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,step,lookupTableHome,bl_library) {
var mesg = {};

    //If the Object is Product Revision/Kit Revision ,get Parent.
    if (node.getObjectType().getID().equals("Bibliography_Citation")) {
        node = node.getParent();
    }

    //Citation Parent Information
    mesg.eventid = node.getID() + "";

    var citProductstepid = node.getID() + "";

    mesg.citationprodid = citProductstepid;
    mesg.citationprodname = node.getName() + "";

    var citList = [];
    //Citation Product child Information
    var bibCitation = node.getChildren();
    for (i = 0; i < bibCitation.size(); i++) {

        var citation = bibCitation.get(i);
        var citationObjectTypeId = citation.getObjectType().getID();
        logger.info("citationObjectTypeId " + citationObjectTypeId);


        //Get Product Information from Reference
        var sources = citation.getReferencedByProducts();
        logger.info("sources " + sources);
        var pProduct
        var iter = sources.iterator();
        while (iter.hasNext()) {
            var reference = iter.next();
            logger.info(" reference.getReferenceTypeString() " + reference.getReferenceTypeString());
            if (reference.getReferenceTypeString() == "Product_To_Bibliography") {
                pProduct = reference.getSource();

                if (pProduct != null) {
                    logger.info(" pProduct " + pProduct.getName());
                    break;
                }

            }
        }

        //If Product exists , filter for  status  which is not in commercialization
        var citJson = {}
        if (pProduct != null) {
            var prodstatus = pProduct.getValue("Product_Status").getSimpleValue() + "";
            var prodType = pProduct.getValue("PRODUCTTYPE").getSimpleValue() + "";
            var prodObjectType = pProduct.getObjectType().getID() + "";
     
           // if (prodstatus != null && prodstatus != "Commercialization") {
           //modified for 290866
           if (prodstatus != null) {
               logger.info(" prodstatus " + prodstatus + " prodType " + prodType + " prodObjectType " + prodObjectType);
                citJson["Product_Status"] = prodstatus;
                citJson["PRODUCTTYPE"] = prodType;
                citJson["Product_Object_Type"] = prodObjectType;

                //To get Child Main Attributes
                var setAttrCh = citation.getValues();
                var itCh = setAttrCh.iterator();
                var citationid = citation.getID() + "";

                while (itCh.hasNext()) {
                    var attrValueCh = itCh.next();
                    var attributeCh = "";
                    if (attrValueCh != null) {
                        attributeCh = attrValueCh.getAttribute();
                        var attValCh = attrValueCh.getSimpleValue() + "";
                        citJson[attributeCh.getID()] = attValCh;
                        logger.info("ID " + attributeCh.getID() + " Value " + attValCh);
                    }
                }

                citJson["CITATIONID"] = citationid;
                citList.push(citJson);
                mesg[citationObjectTypeId] = citList;
            }

        }

    }
   logger.info(" mesg "+mesg);
}