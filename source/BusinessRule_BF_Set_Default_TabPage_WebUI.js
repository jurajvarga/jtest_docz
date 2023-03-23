/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Set_Default_TabPage_WebUI",
  "type" : "BusinessFunction",
  "setupGroups" : [ "Business_Functions" ],
  "name" : "BF_Set_Default_TabPage_WebUI",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessFunctionWithBinds",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation",
  "functionReturnType" : "java.lang.Integer",
  "functionParameterBinds" : [ {
    "contract" : "NodeBindContract",
    "alias" : "p_node",
    "parameterClass" : "null",
    "value" : null,
    "description" : ""
  } ]
}
*/
exports.operation0 = function (p_node) {
// STEP-6020 Set a specific tab in a WebUI workflow as the default?
// new business function
// use in WEBUI for Tab Control
// only one BF is used now (The users would like to default to first tab for all workflows)
// the input parameter is mandatory
// function is triggered after evaluating of conditions on screen to display Tab Pages 
//           (exampole - Product Into/Product Info on Create Short Name and SKU Review )
// returns an integer 
//           it is the "order number" of the tab (counting from left to right) of the tab that should be in focus when the user opens the screen
// the description of return's value
//           the first Tab = 1
//           when out of screen tab counts => default behaviour (no default tab screen) = open the last one used tab
//           to put off the default screen displaying => set retunr value = 0
// the default screen could be set per each workflow screen

var result=1
return new java.lang.Integer(result);
}