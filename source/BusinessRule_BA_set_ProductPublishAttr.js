/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_set_ProductPublishAttr",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_set_ProductPublishAttr",
  "description" : "Sets attributes from Content Only revision on the all product revisions in Product evision WF",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,baApprove,BL_Library) {
//STEP-5831 Create new wf for publish flag change
// Set all attributes updatable in the Content Review WF from the revision in Content Only WF 
//For all revisions of the producet in the Revision_Release_Workflow
var businessRule = "Business Rule: BA_set_ProductPublishAttr";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();
	    
var product = node.getParent();       
var children = product.getChildren().iterator();
	   
 //For all revisions of the producet in the Revision_Release_Workflow
 while (children.hasNext()) {
	var child = children.next();  

	if (BL_Library.isRevisionType(child, checkServiceRevision = false)
		&& child.getName() != node.getName() && child.isInWorkflow("Revision_Release_Workflow"))
	{
        //update PRODUCTNAME, PRODUCTSHORTNAME and PUBLISHED_YN in all revisions in revision release wf 
        child.getValue("PUBLISHED_YN").setSimpleValue(node.getValue("PUBLISHED_YN").getSimpleValue());
        child.getValue("PRODUCTNAME").setSimpleValue(node.getValue("PRODUCTNAME").getSimpleValue());
        child.getValue("PRODUCTSHORTNAME").setSimpleValue(node.getValue("PRODUCTSHORTNAME").getSimpleValue());    
 
        log.info(child.getName()+" - Revision changed by revision "+ node.getName()+" from Product Publish Flag changes");

		baApprove.execute(child);

	}
}
}