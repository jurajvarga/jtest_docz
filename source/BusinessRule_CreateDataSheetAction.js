/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateDataSheetAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "Create Data Sheet Action",
  "description" : null,
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
    "contract" : "BusinessActionBindContract",
    "alias" : "busAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Initiate_Source_Folder",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
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
exports.operation0 = function (node,manager,childObjectType,busAction,logger,auditEventType,auditQueueMain,auditQueueApproved,BA_Approve,BL_AuditUtil,bl_AssetUpdatesUtil,bl_library) {
var businessRule = "Business Rule: CreateDataSheetAction";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

var parent = node.getParent();

var res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, false, "ds");	
var ff = manager.getNodeHome().getObjectByKey("FIGUREFOLDERKEY", res[0]);

if (ff) {
    logger.info("Figure Folder " + res[0] + " already exists. Reset index and try again.");
    bl_AssetUpdatesUtil.resetFigureIndex(parent);
    res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, false, "ds");
}

var child = parent.createClassification(null, childObjectType.getID());

if(child) {
    child.setName(res[0]);
    child.getValue("Figure_Key").setSimpleValue(res[0]);
    parent.getValue("Figure_Index").setSimpleValue(res[2]);

    //set attr to Figure Folder 
    bl_AssetUpdatesUtil.setProductandFigureFolderAttr("", child);

    //STEP-5929 && 5993
    //Set Audit for Child Figure Folder
    BL_AuditUtil.buildAndSetAuditMessageForAction(child,manager,"PAG_App_Mgr_PC_Review_Workflow","Create_Action","Create_Figure_Folder_Datasheet","","PAG_Review",false,"",auditEventType,auditQueueMain,auditQueueApproved);
    //STEP-5929 && 5993

    BA_Approve.execute(parent);
}
}