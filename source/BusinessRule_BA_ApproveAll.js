/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveAll",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_ApproveAll",
  "description" : "Approve Recursively mainly for data migration or bulk update",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Constant",
    "libraryAlias" : "BL_Constant"
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
exports.operation0 = function (node,logger,BL_Constant,bl_library) {
var businessRule = "Business Rule: BA_ApproveAll";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

function approveHierarchy(obj){
	var parent = obj.getParent();
	if(parent){
		approveHierarchy(parent);
		parent.approve();
		logger.info( bl_library.logRecord( ["Approving parent:", businessRule, currentObjectID, currentDate,  parent.getName() ] ) );
		
		//log.info("approving parent: " + parent.getName());
	}
}

function approveObj(obj){
	//log.info("STARTING OBJECT: " + obj.getName() + " | " + obj.getID());
	var date2 = new Date();
	if(date2 - date >= 15000){
		throw "error, ran too long";
	}
	
	if(obj.getObjectType().isAssetType()){
		var classifications = obj.getClassifications().iterator();
		while(classifications.hasNext()){
			var oClass = classifications.next()
			if(oClass.getApprovalStatus().name() != "CompletelyApproved"){
				approveObj(oClass);
			}
		}
		obj.approve()
	}
	
	else{
		if(obj.getObjectType().getID() == "Product" || obj.getObjectType().isClassificationType()){
			approveHierarchy(obj);
		}
	
	     //STEP-6396
		//references
		var objrefers
		objrefers = BL_Constant.getObjRefTypes(obj);
		for (var i=0; i<objrefers.length; i++){  
     		var refs = obj.queryReferences(objrefers[i]);
			refs.forEach(function(ref) {
				var target = ref.getTarget();
				if(!target.getObjectType().isEntityType()){ //not entity
					logger.info( bl_library.logRecord( ["Reference from node:", businessRule, currentObjectID, currentDate, obj.getName()," to target: " , target.getID() ] ) );
						
					if(obj.getApprovalStatus().name() != "CompletelyApproved"){
						approveObj(target);
					}
				}
				return true;
			});
		}
		//STEP-6396
		
		obj.approve();
		logger.info( bl_library.logRecord( ["Approving Object:", businessRule, currentObjectID, currentDate,  obj.getName() ] ) );
		
		
		var children = obj.getChildren().iterator();
		while(children.hasNext()){
			var child = children.next();
			logger.info( bl_library.logRecord( ["child:", businessRule, currentObjectID, currentDate,  child ] ) );
			
			if(child.getApprovalStatus().name() != "CompletelyApproved"){
				approveObj(child);
			}
		}
	}

	//log.info("ENDING OBJECT: " + obj.getName() + " | " + obj.getID());
}

var date = new Date();
try{		
		
	approveObj(node);
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