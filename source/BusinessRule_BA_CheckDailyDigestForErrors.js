/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CheckDailyDigestForErrors",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_CheckDailyDigestForErrors",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_ReleaseCheck",
    "libraryAlias" : "BL_ReleaseCheck"
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
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondCustomProd",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProduct",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondIsNewWorkflow",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondNotCustomOrComponent",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isNotCustomProductOrComponentWF",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,lookUp,mailHome,busCondCustomProd,busCondIsNewWorkflow,busCondComponentWF,busCondNotCustomOrComponent,BL_Email,BL_ReleaseCheck) {
var rollbackChanges = true;
BL_ReleaseCheck.sendDailyDigest(manager, lookUp, mailHome, busCondCustomProd, busCondIsNewWorkflow, busCondComponentWF, busCondNotCustomOrComponent, rollbackChanges);
}