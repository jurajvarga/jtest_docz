/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DAMMetadataJSONFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound DAMMetadata" ],
  "name" : "BA_DAMMetadataJSONFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,executionReportLogger,nodeHandlerSource,nodeHandlerResult,step,BL_JSONCreation) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {
    var mesg = {};

    mesg.eventid = simpleEventType.getID() + "";
    mesg.damObjectId = node.getID() + "";
    mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";

    //STEP-6576
    var product_name = node.getValue("PRODUCTNAME").getSimpleValue().replace("<sup>", "").replace("</sup>", "").replace("<lt/>", "<").replace("<gt/>", ">");
    mesg.PRODUCTNAME = BL_JSONCreation.replaceSymbol(product_name + "");
   //mesg.PRODUCTNAME = BL_JSONCreation.replaceSymbol(node.getValue("PRODUCTNAME").getSimpleValue() + "");

    mesg.PRODUCTTYPE = node.getValue("PRODUCTTYPE").getSimpleValue() + "";

    //STEP-6576
    var figure_caption = node.getValue("Figure_Caption").getSimpleValue();
    if (figure_caption){
        figure_caption = figure_caption.replace("<sup>", "").replace("</sup>", "").replace("<lt/>", "<").replace("<gt/>", ">");
    }    
    mesg.Figure_Caption = BL_JSONCreation.replaceSymbol(figure_caption + "");
    //mesg.Figure_Caption = BL_JSONCreation.replaceSymbol(node.getValue("Figure_Caption").getSimpleValue() + "");

    mesg.Figure_Key = node.getValue("Figure_Key").getSimpleValue() + "";
    mesg.Figure_Application_Type = node.getValue("Figure_Application_Type").getSimpleValue() + "";
    mesg.APPLICATIONGROUP = node.getValue("APPLICATIONGROUP").getSimpleValue() + "";
    mesg.HOSTSPECIES = node.getValue("HOSTSPECIES").getSimpleValue() + "";
    mesg.Approved_Figure_Name = node.getValue("Approved_Figure_Name").getSimpleValue() + "";
    mesg.DAM_Asset_SubType = node.getValue("DAM_Asset_SubType").getSimpleValue() + "";
    mesg.DAM_Asset_Type = node.getValue("DAM_Asset_Type").getSimpleValue() + "";
    mesg.DAM_Date_Added = node.getValue("DAM_Date_Added").getSimpleValue() + "";
    mesg.DAM_Date_Published = node.getValue("DAM_Date_Published").getSimpleValue() + "";
    mesg.DAM_Media_ID = node.getValue("DAM_Media_ID").getSimpleValue() + "";
    mesg.DAM_Media_Name = node.getValue("DAM_Media_Name").getSimpleValue() + "";
    mesg.DAM_Original_Filename = node.getValue("DAM_Original_Filename").getSimpleValue() + "";
    mesg.GNAMES = node.getValue("GNAMES").getSimpleValue() + "";
    mesg.Appl_Species_Tested = node.getValue("Appl_Species_Tested").getSimpleValue() + "";
    //mesg.UNIPROT = node.getValue("UNIPROT").getSimpleValue() + "";
    mesg.Web_Category = node.getValue("Web_Category").getSimpleValue() + "";
    mesg.MODIFICATION = node.getValue("MODIFICATION").getSimpleValue() + ""; // start STEP-6479
    mesg.PNAME = node.getValue("PNAME").getSimpleValue() + "";
    mesg.Sent_From_Step = "true";

    mesg.DEPLOYMENT_CHANNEL = "cellsignal.com";
    //mesg.LANGUAGE = "English"; // STEP-6654
    mesg.REGION = "Global";
    mesg.USAGE_RIGHTS = "Approved for External Usage";
    // end STEP-6479

    var refType = step.getReferenceTypeHome().getReferenceTypeByID("Published_DAM_Object");
    var refs = node.queryReferences(refType);
    var img
    refs.forEach(function(ref) {
        img = ref.getTarget();
        return false;
    });
    mesg['asset.ID'] = img.getID() + "";
    mesg['asset.pixel-width'] = img.getValue("asset.pixel-width").getSimpleValue() + "";
    mesg['asset.extension'] = img.getValue("asset.extension").getSimpleValue() + "";
    mesg['asset.mime-type'] = img.getValue("asset.mime-type").getSimpleValue() + "";
    mesg['asset.colorspace'] = img.getValue("asset.colorspace").getSimpleValue() + "";
    mesg['asset.depth'] = img.getValue("asset.depth").getSimpleValue() + "";
    mesg['asset.samples'] = img.getValue("asset.samples").getSimpleValue() + "";
    mesg['asset.size'] = img.getValue("asset.size").getSimpleValue() + "";
    mesg['asset.compression'] = img.getValue("asset.compression").getSimpleValue() + "";
    mesg['asset.pixel-height'] = img.getValue("asset.pixel-height").getSimpleValue() + "";
    mesg['asset.filename'] = img.getValue("asset.filename").getSimpleValue() + "";
    mesg['asset.format'] = img.getValue("asset.format").getSimpleValue() + "";
    mesg['asset.uploaded'] = img.getValue("asset.uploaded").getSimpleValue() + "";
    mesg['asset.class'] = img.getValue("asset.class").getSimpleValue() + "";
    executionReportLogger.logInfo(" return mesg:" + mesg);
    return mesg;
}

executionReportLogger.logInfo(" Start ");
var simpleEventType = nodeHandlerSource.getSimpleEventType();

executionReportLogger.logInfo(" simpleEventType "+simpleEventType);
if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;
if (node != null) {
    executionReportLogger.logInfo(" node in Audit Message "+node + " approvalStatus " + node.getApprovalStatus()); // STEP-6160
    //executionReportLogger.logInfo(" approvalStatus " + node.getApprovalStatus()); // STEP-6160

    if (nodeHandlerSource.isDeleted()) {
        mesgfinal ={};
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }

    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
}
}