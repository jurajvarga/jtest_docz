/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ClearAttributeValues",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_ClearAttributeValues",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
exports.operation0 = function (node,BL_Library) {
var apprStatus = node.getApprovalStatus();

var revisions = BL_Library.getRevisions(node);
for (var i = 0; i < revisions.length ; i++) {
    
    var revApprStatus = node.getApprovalStatus();
    
    revisions[i].getValue('DATEPLANNEDRELEASE').setSimpleValue(null);

    if(revApprStatus == "Completely Approved") {
        revisions[i].approve();
        //log.info('approved')
    }

    //log.info("rev: " + revisions[i].getName() + " " + revisions[i].getValue('DATEPLANNEDRELEASE').getSimpleValue())
}


node.getValue('Freezer_Date_Check').setSimpleValue(null);

if(apprStatus == "Completely Approved") {
    node.approve();
    //log.info('approved')
}

//log.info("product: " + node.getName() + " " + node.getValue('Freezer_Date_Check').getSimpleValue())
//log.info(node.getApprovalStatus());
}