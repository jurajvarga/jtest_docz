/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Update_Lot_Recombinant_Flag",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Bulk_Update_Lot_Recombinant_Flag",
  "description" : "Bulk Update for adding Lot Recombinant Flag from Lot to Product Level",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
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
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,BA_Approve,node,BL_Library,BL_MaintenanceWorkflows) {
var isLotManaged = node.getValue("LOTMANAGED_YN").getSimpleValue();

if (isLotManaged == "Y") {
		
	var revision = BL_MaintenanceWorkflows.getCurrentRevision(node);
	if (revision == null) {
		revision = BL_MaintenanceWorkflows.getWIPRevision(node);
	}
	if(revision) {
		lotRecombinantFlag = BL_Library.getLotRecombinantFlag(manager, node, revision);
			
		var isProductApproved = node.getApprovalStatus().name();
	   	node.getValue("Lot_Recombinant_Flag").setSimpleValue(lotRecombinantFlag);
	     if (isProductApproved == "CompletelyApproved") {
			BA_Approve.execute(node);
		}
	}
}
}