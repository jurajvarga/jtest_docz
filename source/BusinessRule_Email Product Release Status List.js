/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email Product Release Status List",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Release" ],
  "name" : "Email Product Release Status List",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_ReleaseCheck",
    "libraryAlias" : "BL_ReleaseCheck"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
exports.operation0 = function (mailHome,manager,lookUp,busCondCustomProd,busCondIsNewWorkflow,busCondComponentWF,busCondNotCustomOrComponent,BL_Email,BL_ReleaseCheck,bl_library) {
rollbackChanges = false;
BL_ReleaseCheck.sendDailyDigest(manager, lookUp, mailHome, busCondCustomProd, busCondIsNewWorkflow, busCondComponentWF, busCondNotCustomOrComponent, rollbackChanges);
}