/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsUserValidforCatalogs",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_IsUserValidforCatalogs",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
function getcustomerlocation(node){
if (node.getObjectType().getID()=='CatalogCustomer')
{
parent=node.getParent();
getcustomerlocation(parent);
}
if (node.getObjectType().getID()=='CatalogDistributorHub')
{
parent =node.getParent();
getcustomerlocation(parent);
}
return parent;
}


var currentUser = step.getCurrentUser();
var groups = currentUser.getGroups();
var wherefound = 'UnRegistered_CatalogUser';
var nodeLocation = getcustomerlocation(node).getName();

if ((step.getGroupHome().getGroupByID("US_Catalog").isMember(currentUser)) && (nodeLocation == 'CR338408') ) { 
	wherefound = 'US';
}
if (step.getGroupHome().getGroupByID("CST_Japan_Catalog_Exporters").isMember(currentUser) && (nodeLocation == 'CR338405') ) { 
	wherefound = 'Japan';
}
if (step.getGroupHome().getGroupByID("CST_China_Catalog_Exporters").isMember(currentUser) && (nodeLocation == 'CR338406') ) { 
	wherefound = 'China';
}
if (step.getGroupHome().getGroupByID("CST_EU_Catalogs").isMember(currentUser) && (nodeLocation == 'CR338407') ) { 
	wherefound = 'EU';
}
if (step.getGroupHome().getGroupByID("Super user").isMember(currentUser)  ) { 
	wherefound = 'Admin';
}
log.info('User ' + currentUser + ' in group ' + wherefound + ' opened ' + node.getName() + ' Customer/Distributor within ' + nodeLocation);
if (wherefound=='UnRegistered_CatalogUser' ) { 
	return false;
} else {
	return true;
}


}