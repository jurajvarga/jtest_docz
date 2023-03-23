/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteProductCitations",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_DeleteProductCitations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Bibliography_Citation" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "alias" : "BA_Delete",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Delete",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BA_Delete) {
if (node.getValue("Is_Last_Citation").getSimpleValue() && node.getValue("Is_Last_Citation").getSimpleValue() == "1") {
    var productBiblioFolder = node.getParent();
    var query = productBiblioFolder.queryChildren();

    query.forEach(function (child) {
        if (child.getValue("Citation_Status").getSimpleValue() == "Deleted") {
            try {
                BA_Delete.execute(child);
            }
            catch (e) {
                logger.info("Could not delete " + child.getID() + "; exception:" + e.javaException.getMessage());
            }
        }

        return true;
    });
}
}