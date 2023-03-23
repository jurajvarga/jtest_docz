/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test_mm",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "test_mm",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
/*function getFigureAssignee(sApplication){
	var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
	var type = com.stibo.core.domain.entity.Entity;
	var att = step.getAttributeHome().getAttributeByID("APPLICATIONABBR");
	var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sApplication);
	
	var belowNode = step.getEntityHome().getEntityByID("Application_Folder");
	query.root = belowNode;
	
	var lstAssignment = searchHome.querySingleAttribute(query).asList(100).toArray();
	for( var i=0; i< lstAssignment.length; i++ ) {
		log.info("sAssignee " + lstAssignment[i].getValue("AssignmentGroup").getSimpleValue());
	}
	if(lstAssignment.length>0)
		return lstAssignment[0].getValue("AssignmentGroup").getSimpleValue();
	else 
		return null;
}
*/


//AM_Flow_Cytometry, AM_IHC, AM_IF and AM_ChIP
var sApplication = node.getValue("Figure_Application_Type").getSimpleValue();
if (sApplication){
var classification = step.getClassificationHome();

var group = null;
var classificationApplicationFolder = classification.getClassificationByID("Application_Folder");
var application = classificationApplicationFolder.getChildren();

for(var i = 0; i < application.size(); i++) {
	var applicationSelected = application.get(i);
	var applicationBR = applicationSelected.getValue("APPLICATIONABBR").getSimpleValue();

	if(applicationBR == sApplication) {
		logger.info(applicationSelected.getValue("AssignmentGroup").getSimpleValue());
		group = applicationSelected.getValue("AssignmentGroup").getSimpleValue();
		break;
	}
}
var instance = node.getWorkflowInstance(workflow);
if (group) {
			instance.getTaskByID("App_Manager").reassign(group);
			logger.info(group);
		}

	 /*if(sAssignee){
	 	//testing ONLY
		//should create a workflow variable and bind to Current workflow
		//var workflow = step.getWorkflowHome().getWorkflowByID("App_Mgr_Figure_Review");
		var instance = node.getWorkflowInstance(workflow);
		var group = step.getGroupHome().getGroupByID(sAssignee);
		log.info(group);
		if (group) {
			instance.getTaskByID("App_Manager").reassign(group);
		}else{
			//instance.setSimpleVariable("WorkflowErrorMessage", "Unable to determine assignee for App Mgr App_Manager");
		}
	 	
	 }*/
}
}