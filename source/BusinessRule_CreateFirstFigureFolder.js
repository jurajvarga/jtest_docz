/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateFirstFigureFolder",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "Create First Figure Folder",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Rev_Folder" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
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
exports.operation0 = function (node,manager,childObjectType,webui,auditEventType,auditQueueMain,auditQueueApproved,BA_Approve,BL_AuditUtil,bl_AssetUpdatesUtil,bl_library) {
var children = node.getChildren();

if (children.size() > 0) {
	webui.showAlert("WARNING", "Warning", "Please, use other button to create a figure folder.");
}
else {
    var businessRule = "Business Rule: CreateFirstFigureFolder";
    var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
    var currentDate ="Date: "+ (new Date()).toLocaleString();

    var res = bl_AssetUpdatesUtil.getNewFigureFolderName(node, null, false, null);

    var child = node.createClassification(null, childObjectType.getID());

    if(child) {
        child.setName(res[0]);
        child.getValue("Figure_Key").setSimpleValue(res[0]);
        child.getValue("Figure_Folder_production_team").setSimpleValue(node.getValue("Figure_Folder_production_team").getSimpleValue());
        //child.getValue("Figure_Display_Index").setSimpleValue(res[1]); //STEP-6283
        node.getValue("Figure_Index").setSimpleValue(res[2]);

        //set attr to Figure Folder
        bl_AssetUpdatesUtil.setProductandFigureFolderAttr("", child);

        log.info("New figure folder with name " + res[0] + " was created.");
        
        //STEP-5929 && 5993
        BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"PAG_App_Mgr_PC_Review_Workflow","Create_Action","Create_First_Figure_Folder","PAG_Review","PAG_Review",false,"",auditEventType,auditQueueMain,auditQueueApproved);
        //STEP-5929 && 5993

        BA_Approve.execute(node);
    }
}
}