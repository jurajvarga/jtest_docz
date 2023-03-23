/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Update_abbrWFName_FigFolders",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Bulk_Update_abbrWFName_FigFolders",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,manager,BA_Approve) {
var wipRevision = node;
var abbrWFName = wipRevision.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();

var productFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
var productFolderRefs = wipRevision.queryReferences(productFolderRefType);

productFolderRefs.forEach(function(productFolderRef) {
	var productFolder = productFolderRef.getTarget();
	var isApprovedPF = productFolder.getApprovalStatus().name();
	
	if (productFolder) {
		productFolder.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(abbrWFName);
		
		if (isApprovedPF == "CompletelyApproved") {
			BA_Approve.execute(productFolder);
		}
		
		var children = productFolder.queryChildren();
		children.forEach(function(child) {
			
			var isApprovedChild = child.getApprovalStatus().name();
			child.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(abbrWFName);

			if (isApprovedChild == "CompletelyApproved") {
				BA_Approve.execute(child);
			}
			return true;
		});
		
	}
	return true;
});
}