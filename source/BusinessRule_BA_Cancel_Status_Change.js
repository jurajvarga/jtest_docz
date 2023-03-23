/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Cancel_Status_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Cancel_Status_Change",
  "description" : "WF-7B-PRODUCT STATUS CHANGE Cancel Transition",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
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
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baGenerateMaintenanceRevisionEvents",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Generate_Maintenace_Revision_Events",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCancelAuditAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CancelAuditAction",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,wf,web,logger,baGenerateMaintenanceRevisionEvents,baResetAuditInstanceID,baCancelAuditAction,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,bl_library) {
var businessRule = "Business Rule: BA_Cancel_Status_Change";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

var parent = node.getParent();
var refs = parent.getProductReferences();
var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var p2wipRefs = refs.get(p2wipRefType);

// remove reference to wip revision
if (p2wipRefs)  {
	if (p2wipRefs.size() == 1) {
		var p2wipRef = p2wipRefs.get(0)
		p2wipRef.delete();
	}
}
	
//Set Revision Status to Cancel & reset status change parameters on the product
node.getValue("REVISIONSTATUS").setSimpleValue("Canceled");

parent.getValue("PSC_Abandoned").setSimpleValue("");
parent.getValue("PSC_Discontinued").setSimpleValue("");
parent.getValue("PSC_InternalUseOnly").setSimpleValue("");
parent.getValue("PSC_Pending").setSimpleValue("");
parent.getValue("PSC_Pre-discontinued").setSimpleValue("");
parent.getValue("PSC_Released").setSimpleValue("");
parent.getValue("PSC_ReleasedOnHold").setSimpleValue("");
parent.getValue("Product_Status_Change_Reason").setSimpleValue("");
parent.getValue("SFDC_Number").setSimpleValue("");
parent.getValue("RELEASENOTES").setSimpleValue("");
parent.getValue("Lot_numbers_affected").setSimpleValue("");

//Changes Done for STEP- 5564 Starts
//Send to Backfeed queue for capturing Maintenance cancel event before Approval as outbound looks only Main workspace.
baGenerateMaintenanceRevisionEvents.execute(node);
//Changes Done for STEP- 5564 Ends
	
// remove from workflow
var wi = node.getWorkflowInstance(wf);
var sourceStateID = bl_library.getCurrentTaskState(wi);
wi.delete("Remove from Product Status Change workflow");

 //STEP-6061
 BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,wf.getID(),"Cancel_Action","Cancel_Product_Status_Change_Maintenance",sourceStateID,"Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
 //STEP-6061

try{	

	//Changes done for STEP-5612 starts
     //Reset Audit Instance
     baResetAuditInstanceID.execute(node);
      //Changes done for STEP-5612 ends
		
	node.approve();
	parent.approve();
}
catch(e){
	if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
		logger.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
		
	}else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
		logger.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
		
	} else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
		logger.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
	
	} else {
		logger.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
		throw(e);
	}
}



var screenId="homepage";
var workflowState=wf.getStateByID("Exit");
web.showAlert("ACKNOWLEDGMENT", "Cancel Action", "Item successfully canceled");
web.navigate(screenId,node,workflowState);
}