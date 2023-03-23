/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RedirectPreviewLink",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_RedirectPreviewLink",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "ServerLib"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,lookupTableHome,web,ServerLib) {
var productno = node.getValue("PRODUCTNO").getValue();
log.info(" productno "+productno);
var serverName=ServerLib.getServerEnvironment();
log.info(" serverName "+serverName);
var lookupname=serverName+"-webpreview-url"
log.info(" lookupname "+lookupname);
var serverURL=lookupTableHome.getLookupTableValue("ServerLookupURL",lookupname)
var path=""+productno;
var previewURL=serverURL+path;
log.info(" previewURL "+previewURL);
web.navigateUrl(previewURL,true);
}