/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateFigureFolderAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "Create Figure Folder Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder", "MaintenanceDocuments" ],
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
exports.operation0 = function (node,manager,childObjectType,logger,auditEventType,auditQueueMain,auditQueueApproved,BA_Approve,BL_AuditUtil,bl_AssetUpdatesUtil,bl_library) {
var businessRule = "Business Rule: CreateFigureFolderAction";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

var v_figure_heading;
var v_application_type;
var v_figure_caption;
var v_figure_notes;
var v_protocolno;

var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");
var parent;

if (node.getObjectType().getName() == "Maintenance Documents") {
    //STEP-6396
    var pf2ps = node.queryReferencedBy(p2WRRefType);

    pf2ps.forEach(function(pf2p) {
        if (pf2p.getValue("Figure_Heading").getSimpleValue() != null){
            v_figure_heading = pf2p.getValue("Figure_Heading").getSimpleValue(); 
        }
        if (pf2p.getValue("Figure_Application_Type").getSimpleValue() != null) {
            v_application_type = pf2p.getValue("Figure_Application_Type").getSimpleValue();
        }
        if (pf2p.getValue("Figure_Caption").getSimpleValue() != null) {
            v_figure_caption = pf2p.getValue("Figure_Caption").getSimpleValue();
        }
        if (pf2p.getValue("FigureDatasheetNotes").getSimpleValue() != null) {
            v_figure_notes = pf2p.getValue("FigureDatasheetNotes").getSimpleValue(); 
        }
        if (pf2p.getValue("PROTOCOLNO").getSimpleValue() != null) {
            v_protocolno = pf2p.getValue("PROTOCOLNO").getSimpleValue(); 
        }

        var pf2pTarget = pf2p.getSource();
        if (pf2pTarget.getObjectType().getName() == "Product Folder") {
            parent = pf2pTarget;
        }
        return true;
    });
    //STEP-6396    
} else {
    parent = node.getParent();
}

var res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, false, null);
var ff = manager.getNodeHome().getObjectByKey("FIGUREFOLDERKEY", res[0]);

if (ff) {
    logger.info("Figure Folder " + res[0] + " already exists. Reset index and try again.");
    bl_AssetUpdatesUtil.resetFigureIndex(parent);
    res = bl_AssetUpdatesUtil.getNewFigureFolderName(parent, node, false, null);
}
    
var child = parent.createClassification(null, childObjectType.getID());

if(child) {
    child.setName(res[0]);
    child.getValue("Figure_Key").setSimpleValue(res[0]);
    //child.getValue("Figure_Display_Index").setSimpleValue(res[1]); //STEP-6283
    
    if (v_figure_heading != null) {
        child.getValue("Figure_Heading").setSimpleValue(v_figure_heading);
    }
    if (v_application_type != null) {
        child.getValue("Figure_Application_Type").setSimpleValue(v_application_type);
    }
    if (v_figure_caption != null) {
        child.getValue("Figure_Caption").setSimpleValue(v_figure_caption);
    }
    if (v_figure_notes != null) {
        child.getValue("FigureDatasheetNotes").setSimpleValue(v_figure_notes);
    }
    if (v_protocolno != null) {
        child.getValue("PROTOCOLNO").setSimpleValue(v_protocolno);
    }

    parent.getValue("Figure_Index").setSimpleValue(res[2]);

    //set Figure Folder attributes
    bl_AssetUpdatesUtil.setProductandFigureFolderAttr("", child);

    log.info("New figure folder with name " + res[0] + " was created.");

    //STEP-5929 && 5993
    //Set Audit for Child Figure Folder
    BL_AuditUtil.buildAndSetAuditMessageForAction(child,manager,"PAG_App_Mgr_PC_Review_Workflow","Create_Action","Create_Figure_Folder","","PAG_Review",false,"",auditEventType,auditQueueMain,auditQueueApproved)
    //STEP-5929 && 5993

    BA_Approve.execute(parent);
}
}