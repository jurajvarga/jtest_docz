/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_AllowMarketingWorkflow",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Condition" ],
  "name" : "BC_AllowMarketingWorkflow",
  "description" : "To Allow Marketing from anywhere",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isCustomWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProduct",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isNewWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isMaintenanceWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsMaintenaceWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (isCustomWF,node,isNewWF,isMaintenanceWF,isComponentWF) {
var isNewWFResult = isNewWF.evaluate(node);
var isCustomWFResult = isCustomWF.evaluate(node);
var isMaintenanceWFResult = isMaintenanceWF.evaluate(node);
var isComponentWFResult = isComponentWF.evaluate(node);

log.info(" isNewWFResult.isAccepted() "+isNewWFResult.isAccepted());
log.info(" isCustomWFResult.isAccepted() "+isCustomWFResult.isAccepted());
log.info(" isComponentWFResult.isAccepted() "+isComponentWFResult.isAccepted())
log.info(" isMaintenanceWFResult.isAccepted() "+isMaintenanceWFResult.isAccepted())


//Redirect to Marketing Workflow for NPI except Component product
//For NPI,Custom Product or Product Supply final Step Go to Marketing

var allowMarketing=false; //Don't allow marketing 

//If New Workflow and Custom Workflow,allow marketing
if (isNewWFResult.isAccepted() && isCustomWFResult.isAccepted()){
	allowMarketing=true;
}

//If New Workflow and revision is in supply chain send to marketing workflow
if (isNewWFResult.isAccepted() && !allowMarketing && node.isInWorkflow("WF3B_Supply-Chain") ){
	allowMarketing=true;
}


//If New Workflow and Component Workflow,don't allow marketing
if (isNewWFResult.isAccepted()  && isComponentWFResult.isAccepted()){
	allowMarketing=false;
}

//For maintenance is handled in routing BR
if (isMaintenanceWFResult.isAccepted()  ){
	allowMarketing=false;
}

log.info(" allowMarketing "+allowMarketing)

return allowMarketing;
}