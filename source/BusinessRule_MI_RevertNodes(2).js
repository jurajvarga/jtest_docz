/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MI_RevertNodes(2)",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "MI_RevertNodes(2)",
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
	   log.info(child.getName() + " - " + child.getApprovalStatus());
	   
	if (child.getApprovalStatus() != "Completely Approved") {
	  
	  // node from the approved workspace
	  var childAppWs = bl_library.getApprovedNode(manager,child);
	  // if the child exists in the approved Workspace
	  if (childAppWs)
	  {log.info(child.getName() + " - " + child.getApprovalStatus());
	  }
	  else{
	  	bl_library.deleteRefRecursively(child)
	  	child.delete();
	  		  	log.info("Deleted SKU: " + child.getID());
	  }
	}    		
}
}