/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_Approve",
  "description" : "Used for bulk update approval.  Mainly for Data Migration",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,bl_library) {
var businessRule = "Business Rule: BA_Approve";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();



try{		
		
	node.approve();
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