/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Shipping_Lot_No_Error_JSON_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_Shipping_Lot_No_Error" ],
  "name" : "BA_Shipping_Lot_No_Error_JSON_Formatter",
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
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_Maintenance"
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation,BL_Maintenance) {
Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {

    var mesg = {};

    mesg.eventid = simpleEventType.getID() + "";

    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";
    var productstepid = node.getID() + "";
    var shippingLotNo = node.getValue("Shipping_Lot_No").getSimpleValue() + "";
    var shippingLotErrMsg = node.getValue("No_Shipping_Lot_Msg").getSimpleValue() + "";
    var currentDate = (new Date()).toISOString() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;
    mesg.shippingLotNo = shippingLotNo;
    mesg.noShippingLotMsg = shippingLotErrMsg;
    mesg.currentDate = currentDate;

    // STEP-6458
    mesg.PRODUCTNAME = node.getValue("PRODUCTNAME").getSimpleValue() + "";
    mesg.PRODTEAM = node.getValue("ProdTeam_Planner_Product").getSimpleValue() + "";
    mesg.PUBLISHED_YN = node.getValue("PUBLISHED_YN").getSimpleValue() + "";
    mesg.Product_Status = node.getValue("Product_Status").getSimpleValue() + "";

    var conditions = com.stibo.query.condition.Conditions;
    var lots = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Lot"));
    var productNoEquals = conditions.valueOf(manager.getAttributeHome().getAttributeByID("PRODUCTNO")).eq(productno);
    var lotNoEquals = conditions.valueOf(manager.getAttributeHome().getAttributeByID("LOTNO")).eq(shippingLotNo);
    var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(lots.and(lotNoEquals).and(productNoEquals));
    var result = querySpecification.execute();

    result.forEach(function(lot) {
        mesg.LOTRELEASESTATUS = lot.getValue("LOTRELEASESTATUS").getSimpleValue() + "";
        return false;
    });
    // End of STEP-6458

    return mesg;
};

//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null && (node.getObjectType().getID().equals("Product_Kit") || node instanceof com.stibo.core.domain.Product ||
        node.getObjectType().getID().equals("Equipment"))) {

    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {

        mesgfinal = Object.buildNodeMessage(node, simpleEventType);
    }
    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
}
}