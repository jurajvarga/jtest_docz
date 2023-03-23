/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test_sk2",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "test_sk2",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "alias" : "BA_Approve_Recursively",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve_Recursively",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_CreateDamObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateDamObjects",
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
exports.operation0 = function (manager,BA_Approve_Recursively,BA_Approve,BA_CreateDamObjects,node,BL_Library,BL_MaintenanceWorkflows) {
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();

if (wfInitiatedNo == 2 || wfInitiatedNo == 15 || wfInitiatedNo == 17 || wfInitiatedNo == 20) {
	BA_CreateDamObjects.execute(node);
	var damObjects = BL_Library.getRevDAMObjects(node);

	// dam object level
	for (var i = 0; i < damObjects.length; i++) {
	    var dam = damObjects[i];
	
	    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_DAM_Object");
	    var refs = dam.queryReferences(refType);
	    refs.forEach(function (ref) {
	        img = ref.getTarget();
	        var apprStatus = img.getApprovalStatus();
		   BA_Approve.execute(img);
	        return false;
	    });
	
	    //log.info(dam.getName())
	    // only approve and send to queue if image is approved
	    BA_Approve.execute(dam);
	}
}
}