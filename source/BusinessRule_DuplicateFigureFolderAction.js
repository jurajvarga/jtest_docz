/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "DuplicateFigureFolderAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "Duplicate Figure Folder Action",
  "description" : "To duplicate fig or ds figure folder",
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "bl_AssetUpdatesUtil"
  }, {
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "childObjectType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Figure_Folder",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,childObjectType,auditEventType,auditQueueMain,auditQueueApproved,BA_Approve,BL_AuditUtil,bl_AssetUpdatesUtil,bl_library) {
var businessRule = "Business Rule: DuplicateFigureFolderAction";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var parent = node.getParent();

// STEP-5991
var res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, true, null);
var ff = manager.getNodeHome().getObjectByKey("FIGUREFOLDERKEY", res[0]);

if (ff) {
    logger.info("Figure Folder " + res[0] + " already exists. Reset index and try again.");
    bl_AssetUpdatesUtil.resetFigureIndex(parent);
    res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, true, null);
}

var child = parent.createClassification(null, childObjectType.getID());

if (child) {
    child.setName(res[0]);
    child.getValue("Figure_Protocol_Name").setSimpleValue(node.getValue("Figure_Protocol_Name").getSimpleValue());
    child.getValue("Figure_Application_Type").setSimpleValue(node.getValue("Figure_Application_Type").getSimpleValue());
    child.getValue("Figure_Heading").setSimpleValue(node.getValue("Figure_Heading").getSimpleValue());
    child.getValue("Figure_Caption").setSimpleValue(node.getValue("Figure_Caption").getSimpleValue());
    child.getValue("PROTOCOLNO").setSimpleValue(node.getValue("PROTOCOLNO").getSimpleValue());
    child.getValue("Figure_Key").setSimpleValue(res[0]);
    //child.getValue("Figure_Display_Index").setSimpleValue(res[1]); //STEP-6283
    parent.getValue("Figure_Index").setSimpleValue(res[2]);

    bl_AssetUpdatesUtil.setProductandFigureFolderAttr("", child);

    log.info("New figure folder with name " + res[0] + " was created.");

    //STEP-5993
    BL_AuditUtil.buildAndSetAuditMessageForAction(child,manager, "PAG_App_Mgr_PC_Review_Workflow", "Create_Action", "Duplicate_Figure_Folder", "", "PAG_Review", false, "",auditEventType,auditQueueMain,auditQueueApproved);
    //STEP-5993

    BA_Approve.execute(parent);
}
// STEP-5991 end
}