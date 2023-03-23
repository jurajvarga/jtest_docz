/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetBibliographyProductFormatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Bibiliography" ],
  "name" : "BA_GetBibliographyProductFormatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  }, {
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation,BL_Library,BL_MaintenanceWorkflows) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {
    //STEP-6584 Starts
    var product;
    var isRevision = false;

    if (BL_Library.isProductType(node, false)) {
        product = node;
    }
    else if (BL_Library.isRevisionType(node, false)) {
        product = node.getParent();
        isRevision = true;
    }

    var mesg = {};
    mesg.eventid = simpleEventType.getID() + "";
    mesg.citationprodid = product.getValue("PRODUCTNO").getSimpleValue() + "";

    var bibFolder = BL_Library.getProductChildren(product, "Product_Bibliography_Folder");
    if (bibFolder && bibFolder.length > 0) {
        var bibCit = BL_Library.getProductChildren(bibFolder[0], "Product_Bibliography_Citation");

        if (bibCit && bibCit.length > 0) {
            var prodstatus = product.getValue("Product_Status").getSimpleValue() + "";
            var prodType = product.getValue("PRODUCTTYPE").getSimpleValue() + "";
            var prodObjectType = product.getObjectType().getID() + "";
            var prodDateReleased = product.getValue("DateReleased").getSimpleValue() + "";
            var referenceProduct = product.getValue("PRODUCTNO").getSimpleValue() + "";
            var validObject;

            if (isRevision) {
                if (node.getValue("REVISIONSTATUS").getSimpleValue() == "In-process" && node.getValue("Workflow_Name_Initiated").getSimpleValue() == "OTS Conversion") {
                    validObject = node;
                }
                else {
                    validObject = BL_MaintenanceWorkflows.getCurrentRevision(product) || BL_MaintenanceWorkflows.getWIPRevision(product);
                }
            }
            else {
                validObject = BL_MaintenanceWorkflows.getCurrentRevision(product) || BL_MaintenanceWorkflows.getWIPRevision(product);
            }

            var bibAttr = BL_JSONCreation.getBiblioJsonAttrForRevisions(validObject);
            var isWIP = "";
            var prodPublished = "";
            var revisionStatus = "";
            var event = "";

            if(bibAttr && bibAttr.length > 0) {
                isWIP = bibAttr[0].IsWIP;
                prodPublished = bibAttr[0].PUBLISHED_YN;
                revisionStatus = bibAttr[0].REVISIONSTATUS;
                event = bibAttr[0].event;
            }
            //STEP-6584 Ends

            var citList = [];

            for (var i = 0; i < bibCit.length; i++) {
                if (bibCit[i].getValue("Citation_Status").getSimpleValue() == "Active") {
                    if (prodstatus != null) {
                        var citJson = {};
                        citJson["ID"] = bibCit[i].getID() + "";
                        citJson["Product_Status"] = prodstatus;
                        citJson["PRODUCTTYPE"] = prodType;
                        citJson["Product_Object_Type"] = prodObjectType;
                        citJson["PUBLISHED_YN"] = prodPublished;
                        citJson["DateReleased"] = prodDateReleased;
                        citJson["REVISIONSTATUS"] = revisionStatus;
                        citJson["event"] = event;
                        citJson["IsWIP"] = isWIP;
                        citJson["Reference_Product"] = referenceProduct;
                        citJson["PUBLICATION_PUBMEDID"] = bibCit[i].getValue("PUBLICATION_PUBMEDID").getSimpleValue() + "";
                        citJson["PUBLICATION_ASSOCIATION_TYPE"] = bibCit[i].getValue("PUBLICATION_ASSOCIATION_TYPE").getSimpleValue() + "";
                        citJson["PUBLICATION_CITATION"] = bibCit[i].getValue("PUBLICATION_CITATION").getSimpleValue() + "";
                        citJson["PUBLICATION_LISTINDEX"] = bibCit[i].getValue("PUBLICATION_LISTINDEX").getSimpleValue() + "";
                        citJson["PUBLICATION_TITLE"] = bibCit[i].getValue("PUBLICATION_TITLE").getSimpleValue() + "";
                        citJson["PUBLICATION_YEAR"] = bibCit[i].getValue("PUBLICATION_YEAR").getSimpleValue() + "";
                        citJson["PUBLICATION_FORMATTEDSTR"] = bibCit[i].getValue("PUBLICATION_FORMATTEDSTR").getSimpleValue() + "";

                        citList.push(citJson);
                    }
                }
            }

            mesg["Bibliography_Citation"] = citList;
        }
    }
    return mesg;
}


var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null && (BL_Library.isProductType(node, false) || BL_Library.isRevisionType(node, false))) { //STEP-6584
    executionReportLogger.logInfo("Processing bibliography for product # '" + node.getValue("PRODUCTNO").getSimpleValue());
    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = {};
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }

    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal));
}
}