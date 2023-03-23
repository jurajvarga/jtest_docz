/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MI_RevertNodes",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "MI_RevertNodes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,bl_library) {
// Reverts specific attributes of all children that are not in the approval status = "Completely Approved" to the values from the Approved Workspace.
// Applied to the Master Stock of the input node (product revision)
var businessRule = "Business Rule: BA_RevertNodes";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();
logger.info( bl_library.logRecord( [ businessRule, currentObjectID, currentDate ] ) );

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
//log.info("wfInitiatedNo " + wfInitiatedNo)

if (wfInitiatedNo == "12" || wfInitiatedNo == "13") 
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
else
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");

var msRef = node.getReferences().get(refType);
var masterStock = msRef.get(0).getTarget();    
var reverted = "N";

var childIter = masterStock.getChildren().iterator();
while (childIter.hasNext()) {

	var	child = childIter.next();
	   //log.info(child.getName() + " - " + child.getApprovalStatus());
	   
	if (child.getApprovalStatus() != "Completely Approved") {
	  
	  // node from the approved workspace
	  var childAppWs = bl_library.getApprovedNode(manager,child);
	  // if the child exists in the approved Workspace
	  if (childAppWs){
	  	
		  switch(String(wfInitiatedNo)) {
			  	 case "13":
					var valueAppWs = childAppWs.getValue("PRICE").getSimpleValue();
			        	child.getValue("PRICE").setSimpleValue(valueAppWs);
					//log.info("PRICE after cancel = " + child.getValue("PRICE").getSimpleValue());
			       
					valueAppWs = childAppWs.getValue("Global_Base_Price_Rationale").getSimpleValue();
			         	child.getValue("Global_Base_Price_Rationale").setSimpleValue(valueAppWs);
			 
					log.info("Cancel from Maintain US Price ");
					reverted = "Y";
					break;
					
			  	 case "12":
					var valueAppWs = childAppWs.getValue("ITEMACTIVE_YN").getSimpleValue();
					child.getValue("ITEMACTIVE_YN").setSimpleValue(valueAppWs);
					//log.info("ITEMACTIVE_YN  after cancel = " + child.getValue("ITEMACTIVE_YN").getSimpleValue());
			       
					valueAppWs = childAppWs.getValue("PUBLISH_YN").getSimpleValue();
			          child.getValue("PUBLISH_YN").setSimpleValue(valueAppWs);
			 
					valueAppWs = childAppWs.getValue("EBSFLAG_YN").getSimpleValue();
					child.getValue("EBSFLAG_YN").setSimpleValue(valueAppWs);
			  
					valueAppWs = childAppWs.getValue("BLOCKCUSTSHIP_YN").getSimpleValue();
			  	     child.getValue("BLOCKCUSTSHIP_YN").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("ITEMSTOCKFORMAT").getSimpleValue();
					child.getValue("ITEMSTOCKFORMAT").setSimpleValue(valueAppWs);
			  	
					valueAppWs = childAppWs.getValue("StorageTemp").getSimpleValue();
			          child.getValue("StorageTemp").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("STORAGEOPT").getSimpleValue();
					child.getValue("STORAGEOPT").setSimpleValue(valueAppWs);
			  
					valueAppWs = childAppWs.getValue("ShippingConditions").getSimpleValue();
			  	     child.getValue("ShippingConditions").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("ASSEMBLYOPT").getSimpleValue();
					child.getValue("ASSEMBLYOPT").setSimpleValue(valueAppWs);
			  
					valueAppWs = childAppWs.getValue("ShelfLife").getSimpleValue();
			 	     child.getValue("ShelfLife").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("TESTCOUNT").getSimpleValue();
					child.getValue("TESTCOUNT").setSimpleValue(valueAppWs);
			  
					valueAppWs = childAppWs.getValue("Aliquot_Fill_Quantity").getSimpleValue();
			 	     child.getValue("Aliquot_Fill_Quantity").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("UOM_BASE").getSimpleValue();
					child.getValue("UOM_BASE").setSimpleValue(valueAppWs);
			  
					valueAppWs = childAppWs.getValue("QTY_MKTG").getSimpleValue();
			 	     child.getValue("QTY_MKTG").setSimpleValue(valueAppWs);
			
					valueAppWs = childAppWs.getValue("MKTGQTYUNITS").getSimpleValue();
					child.getValue("MKTGQTYUNITS").setSimpleValue(valueAppWs);
					
			  		log.info("Canceled from Publish SKU "); 
			  		reverted = "Y";        
					break;
					
			  	 case "16A1":
					var valueAppWs = childAppWs.getValue("EU_CLP").getSimpleValue();
					child.getValue("EU_CLP").setSimpleValue(valueAppWs);
					//log.info("EU_CLP after cancel = " + child.getValue("EU_CLP").getSimpleValue());
		       
					valueAppWs = childAppWs.getValue("EU_CLP_Rationale").getSimpleValue();
		  	          child.getValue("EU_CLP_Rationale").setSimpleValue(valueAppWs);
	
					valueAppWs = childAppWs.getValue("UK_CLP").getSimpleValue();
		  	          child.getValue("UK_CLP").setSimpleValue(valueAppWs);
			 
					valueAppWs = childAppWs.getValue("UK_CLP_Rationale").getSimpleValue();
		  	          child.getValue("UK_CLP_Rationale").setSimpleValue(valueAppWs);
			 
					valueAppWs = childAppWs.getValue("DE_CLP").getSimpleValue();
		  	          child.getValue("DE_CLP").setSimpleValue(valueAppWs);
			 
					valueAppWs = childAppWs.getValue("DE_CLP_Rationale").getSimpleValue();
		  	          child.getValue("DE_CLP_Rationale").setSimpleValue(valueAppWs);
			 		 
					log.info("Cancel from EU Pricing Review ");
					reverted = "Y";
					break;
					
		 	   	 case "16B1":
					var valueAppWs = childAppWs.getValue("Japan_CLP").getSimpleValue();
					child.getValue("Japan_CLP").setSimpleValue(valueAppWs);           
					//log.info("Japan_CLP after cancel = " + child.getValue("Japan_CLP").getSimpleValue());
			
					valueAppWs = childAppWs.getValue("Japan_CLP_Rationale").getSimpleValue();
			  	     child.getValue("Japan_CLP_Rationale").setSimpleValue(valueAppWs);
			 
					log.info("Cancel from Japan Pricing Review ");
					reverted = "Y";
					break;
					
		    		 case "16C1":
					var valueAppWs = childAppWs.getValue("China_CLP").getSimpleValue();
					child.getValue("China_CLP").setSimpleValue(valueAppWs);
					//log.info("China_CLP after cancel = " + child.getValue("China_CLP").getSimpleValue());
			       
					valueAppWs = childAppWs.getValue("China_CLP_Rationale").getSimpleValue();
			     	child.getValue("China_CLP_Rationale").setSimpleValue(valueAppWs);
			 
					log.info("Cancel from China Pricing Review ");
					reverted = "Y";
					break;
					
			  	default:
					log.info("Workflow with no revert attributes after cancel = " + wfInitiatedNo);
	 		}       
	
			 try {
				   if (reverted = "Y") {
				   	child.approve();
				   	}				    
			} 
			 catch(e) {
				if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
					logger.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
					
				} else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
					logger.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
					
				} else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
					logger.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
				
				} else {
					logger.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
					throw(e);
				}
			}
	  }
	}    		
}
}