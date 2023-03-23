/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TC_TEST_ISF",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TC_TEST_ISF",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "referenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "Product_Folder_To_Product_Revision",
    "description" : null
  }, {
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
exports.operation0 = function (referenceType,node,manager) {
var sourceFolders = node.getReferences(referenceType);
if(!sourceFolders.isEmpty()) {
	var workflow = manager.getWorkflowHome().getWorkflowByID("PAG_App_Mgr_PC_Review_Workflow");
	var iter = sourceFolders.iterator();
	while(iter.hasNext()) {
		var target = iter.next().getTarget();
		var productFolder = target.getChildren();
		for (var i = 0; i < productFolder.size(); i++) {
			var figureFolder = productFolder.get(i)
			var figureStatus = figureFolder.getValue("Figure_Status").getSimpleValue()
			var goodStatus = (figureStatus == "Change Needed" || figureStatus == "Pending Review" || figureStatus == "Retired" || figureStatus == null)
			if ((!figureFolder.isInWorkflow(workflow.getID())) && goodStatus) {
				figureFolder.startWorkflowByID(workflow.getID(), "Initated from Production Workflow");
			}
		}
	}
}
}