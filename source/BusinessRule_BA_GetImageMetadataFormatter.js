/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetImageMetadataFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Approved_Image_Metadata" ],
  "name" : "BA_GetImageMetadataFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage", "Product_DataSheet" ],
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,Lib) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {
    var mesg = {};
    var assetJson = {};
    var setAttr = node.getValues();
    var it = setAttr.iterator();
    while (it.hasNext()) {
        var attrValue = it.next();
        var attribute = "";
        if (attrValue != null) {
            attribute = attrValue.getAttribute();
            var attVal = attrValue.getSimpleValue() + "";
            //executionReportLogger.logInfo("  "+attribute.getName()+" = "+attVal);
            assetJson[attribute.getID()] = attVal;
        }

    }

    var nodeObjectID = node.getObjectType().getID();
    var nodeID = node.getID();
    assetJson["Figure_ID"] = nodeID + "";
    assetJson["Figure_Object_Type"] = nodeObjectID + "";

    //To Get System Attributes for Assets

    var setAttrSV = node.getSystemValues();
    var itSV = setAttrSV.iterator();

    while (itSV.hasNext()) {
        var attrValueSV = itSV.next();
        var attributeSV = "";
        if (attrValueSV != null) {
            attributeSV = attrValueSV.getAttribute();

            var attValSV = attrValueSV.getSimpleValue() + "";

            //  executionReportLogger.logInfo("  "+attributeSV.getName()+" = "+attValSV);
            assetJson[attributeSV.getName()] = attValSV;
        }

    }

    //To Get Product Types for filtering datasheet only for non print from web categories
    var sources = node.getReferencedBy();
    var pProduct
    var pWorkingRevision
    var iter = sources.iterator();
    while (iter.hasNext()) {
        var reference = iter.next();
        if (reference.getReferenceTypeString() == "Published_Product_Images" || reference.getReferenceTypeString() == "DataSheet") {
            var pRevision = reference.getSource();
            //  executionReportLogger.logInfo(" pRevision "+pRevision.getName());
            pProduct = pRevision.getParent();
            if (pProduct != null) {
                break;
            }

        }
    }

    if (pProduct != null) {
        //  executionReportLogger.logInfo(" pProduct "+pProduct.getName());
        //Check WIP Revision Exists for the asset
        var prodWIPRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
        var prodWIPRevReferences = pProduct.getReferences(prodWIPRevReferenceType);

        for (var j = 0; j < prodWIPRevReferences.size(); j++) {
            pWorkingRevision = prodWIPRevReferences.get(j).getTarget();

        }
        //If wip revision not found ,check for current revision
        if (pWorkingRevision == null) {
            var prodCurRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
            var prodCurRevReferences = pProduct.getReferences(prodCurRevReferenceType);

            for (var j = 0; j < prodCurRevReferences.size(); j++) {
                pWorkingRevision = prodCurRevReferences.get(j).getTarget();

            }
        }

        //If no wip revision or current revision,get the latest approved revision
        if (pWorkingRevision == null) {
            //STEP-5957
            pWorkingRevision = Lib.getLatestApprovedRevision(pProduct);
        }


        //  executionReportLogger.logInfo(" pWorkingRevision "+pWorkingRevision);
    }

    if (pWorkingRevision != null) {
        //var prodWorkingRevisionnodeID = pWorkingRevision.getID()+"";

        //  executionReportLogger.logInfo(" prodWorkingRevisionnodeID "+prodWorkingRevisionnodeID);
        //  executionReportLogger.logInfo(" Web Category "+pWorkingRevision.getValue("Web_Category").getSimpleValue());
        //  executionReportLogger.logInfo(" SCIQUESTCATEGORY "+pWorkingRevision.getValue("SCIQUESTCATEGORY").getSimpleValue());
        //  executionReportLogger.logInfo(" CONJUGATEFLAG_YN "+pWorkingRevision.getValue("CONJUGATEFLAG_YN").getSimpleValue());
        //  executionReportLogger.logInfo(" PRODUCTTYPE "+pWorkingRevision.getValue("PRODUCTTYPE").getSimpleValue());
        var webCategory = pWorkingRevision.getValue("Web_Category").getSimpleValue() + "";
        var sciQuestCategory = pWorkingRevision.getValue("SCIQUESTCATEGORY").getSimpleValue() + "";
        var conjugatFlagYN = pWorkingRevision.getValue("CONJUGATEFLAG_YN").getSimpleValue() + "";
        var productType = pWorkingRevision.getValue("PRODUCTTYPE").getSimpleValue() + "";
        var orderableOnWebFlag = pWorkingRevision.getValue("Orderable_On_Web_Flag").getSimpleValue() + "";

        assetJson["Web_Category"] = webCategory;
        assetJson["SCIQUESTCATEGORY"] = sciQuestCategory;
        assetJson["CONJUGATEFLAG_YN"] = conjugatFlagYN;
        assetJson["PRODUCTTYPE"] = productType;
        assetJson["Orderable_On_Web_Flag"] = orderableOnWebFlag;

    }

    mesg.Image_Metadata = assetJson;
    return mesg;
}


if (nodeHandlerSource != null) {
    var simpleEventType = nodeHandlerSource.getSimpleEventType();
    if (simpleEventType == null) {
        executionReportLogger.logInfo("No event information available in node handler");
    } else {
        executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
    }
    if (nodeHandlerSource.getNode() != null) {
        var node = nodeHandlerSource.getNode();
        var mesgfinal;
        if (node != null && node.getApprovalStatus() == "Completely Approved") {
            if (node.getObjectType().getID().equals("ProductImage") || node.getObjectType().getID().equals("Product_DataSheet")) {
                //executionReportLogger.logInfo(" Product Kit ");
                if (nodeHandlerSource.isDeleted()) {
                    mesgfinal = {};
                    nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
                } else {
                    mesgfinal = Object.buildNodeMessage(node, simpleEventType);
                }
                nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
            }
        }
    }
}
}