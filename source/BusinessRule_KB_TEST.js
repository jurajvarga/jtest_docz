/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "KB_TEST",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "KB_TEST",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Constant",
    "libraryAlias" : "BL_Constant"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
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
exports.operation0 = function (manager,node,BL_Constant,BL_ServerAPI) {
//STEP-6729
function getEnvironmentConfiguration(manager, lookupTableName, lookupInputValue) {
    var currentEnvironment = BL_ServerAPI.getServerEnvironment();
    var lookupName=lookupTableName+currentEnvironment;  //"EnvironmentConfiguration_"+
    return manager.getHome(com.stibo.lookuptable.domain.LookupTableHome).getLookupTableValue(lookupName, lookupInputValue);
}

log.info(getEnvironmentConfiguration(manager, "EnvironmentConfiguration_", "SendEmailPricingWFtoRegion"));
log.info(BL_Constant.getEnvironmentConfiguration(manager, "EnvironmentConfiguration_", "SendEmailPricingWFtoRegion"));

}