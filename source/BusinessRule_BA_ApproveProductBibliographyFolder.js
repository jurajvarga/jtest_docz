/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveProductBibliographyFolder",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_ApproveProductBibliographyFolder",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BA_Approve,BL_Library) {
if (node.getApprovalStatus().name() != "NotInApproved") {
    var biblioFolder = BL_Library.getProductChildren(node, "Product_Bibliography_Folder");

    if (biblioFolder && biblioFolder.length > 0) {
        try {
            BA_Approve.execute(biblioFolder[0]);
        }
        catch (e) {
            null;
        }

        var query = biblioFolder[0].queryChildren();

        query.forEach(function (child) {
            try {
                BA_Approve.execute(child);
            }
            catch (e) {
                null;
            }
        
            return true;
        });

        try {
            BA_Approve.execute(node);
        }
        catch (e) {
            null;
        }
    }
}
}