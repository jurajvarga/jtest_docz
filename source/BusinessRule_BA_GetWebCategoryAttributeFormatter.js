/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetWebCategoryAttributeFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Web_Category" ],
  "name" : "BA_GetWebCategoryAttributeFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "MasterStock", "Product", "Product_Kit", "Product_Revision", "SKU" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_Library,BL_MaintenanceWorkflows) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {

    var mesg = {};
    var checkServiceRevision = false;
    //If the Object is Product Revision/Kit Revision ,get Parent.
    if (BL_Library.isRevisionType(node, checkServiceRevision)) {
        node = node.getParent();
    }

    mesg.eventid = simpleEventType.getID() + "";

    var productstepid = node.getID() + "";
    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";
    var productstatus = node.getValue("Product_Status").getSimpleValue() + "";



    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;
    mesg.Product_Status = productstatus;

    //Find the attribute value from current Revision

    //STEP-5886 use BL function to get current revision
    var prodCurRevnode = BL_MaintenanceWorkflows.getCurrentRevision(node);

    var setAttrCRN = prodCurRevnode.getValues();
    var itCRN = setAttrCRN.iterator();
    while (itCRN.hasNext()) {
        var attrValueCRN = itCRN.next();
        var attributeCRN = "";
        if (attrValueCRN != null) {
            attributeCRN = attrValueCRN.getAttribute();
            if (attributeCRN.getID() == "Web_Category") {
                var attValCRN = attrValueCRN.getSimpleValue() + "";
                webcategory = attValCRN;
            }
        }
    }


    mesg.Web_Category = webcategory;
    executionReportLogger.logInfo("Product no " + productno + " Web Category " + webcategory);
    return mesg;
}

var checkServiceRevision = false;
var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;


if (node != null && node.getApprovalStatus() == "Completely Approved") {
    executionReportLogger.logInfo("Node handler handling product with URL: " + node.getURL());
    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = {};
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        var product;
        var prodCurRevnode;
        var publishedFlag;
        if (BL_Library.isRevisionType(node, checkServiceRevision)) {
            product = node.getParent();
            publishedFlag = node.getValue("PUBLISHED_YN").getSimpleValue();
        } else {
            product = node;
            var prodCurRevnode = BL_MaintenanceWorkflows.getCurrentRevision(product);
            if (prodCurRevnode) {
                publishedFlag = prodCurRevnode.getValue("PUBLISHED_YN").getSimpleValue();
            }
        }

        // STEP-5886 check PUBLISHED_YN on rev instead of product, only do it if current revision exists for the product
        if (BL_MaintenanceWorkflows.getCurrentRevision(product)) {
            executionReportLogger.logInfo(" Status " + product.getValue("Product_Status").getSimpleValue() + " published " + publishedFlag);
            if (product.getValue("Product_Status").getSimpleValue() != "Pre-released" &&
                publishedFlag == "Y") {
                mesgfinal = Object.buildNodeMessage(node, simpleEventType);
                nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
            }
        }
        // STEP-5886 ends
    }
}
}