/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ChangeReferenceCase",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_ChangeReferenceCase",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BL_CopyRevision,BL_MaintenanceWorkflows,libWF) {
//Dymecki, S.M. et al. (1990) <lt/>cite<gt/>Science<lt/>/cite<gt/> 247, 332-336.


var pubAssocType=node.getValue("PUBLICATION_ASSOCIATION_TYPE").getSimpleValue();
log.info(" pubAssocType " + pubAssocType);
pubAssocType=pubAssocType.toUpperCase();
log.info(" pubAssocType Upper " + pubAssocType);
node.getValue("PUBLICATION_ASSOCIATION_TYPE").setSimpleValue(pubAssocType);
log.info(" pubAssocType After " + node.getValue("PUBLICATION_ASSOCIATION_TYPE").getSimpleValue());
}