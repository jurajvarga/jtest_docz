/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetCurrentRevision_PSC",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA Set Current Revision PSC",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "currentRevisionProductStatusUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CurrentRevisionProductStatusUpdated",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baResetAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ResetAuditInstanceID",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveRevisionObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveRevisionObjects",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,baApproveProductObjects,previewQueueApproved,sendToPreview,liveQueue,currentRevisionProductStatusUpdated,baResetAuditInstanceID,BA_ApproveRevisionObjects,BL_Approve,bl_library) {
var businessRule = "Business Rule: BA_SetCurrentRevision_PSC ";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

var wipRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var curRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
var parent = node.getParent();

//STEP-6396
var wipRefs = parent.queryReferences(wipRefType);
wipRefs.forEach(function(wipRef) {
	wipRef.delete();
	return true;
});

var curRefs = parent.queryReferences(curRefType);
curRefs.forEach(function(curRef) {
	curRef.delete();
	return true;
});
//STEP-6396

parent.createReference(node, "Product_To_Current_Revision");

var pStatus = parent.getValue("Product_Status").getSimpleValue();
log.info("Product Status " + pStatus);

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

node.getValue("REVISIONSTATUS").setSimpleValue("Approved");
node.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");
node.getValue("Product_Status").setSimpleValue(pStatus);

try{		
	baResetAuditInstanceID.execute(node);
	//STEP-6465 Starts
	//baApproveProductObjects.execute(parent);	
	//baApproveProductObjects.execute(node);
	BA_ApproveRevisionObjects.execute(node);
	//STEP-6465 Ends
	previewQueueApproved.queueDerivedEvent(sendToPreview, parent);
	liveQueue.queueDerivedEvent(currentRevisionProductStatusUpdated, parent);	
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
}