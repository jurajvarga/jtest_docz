/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "testMAWE",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "testMAWE",
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
 
var attGroupRevDefaults = step.getAttributeGroupHome().getAttributeGroupByID("Product_Revision_Defaults");
 if (attGroupRevDefaults != null) {
                var iterator = attGroupRevDefaults.getAttributes().iterator();
                while (iterator.hasNext()) {
                    var dfltAttribute = iterator.next();
                    var attributeId = dfltAttribute.getID().replace("_DFLT", "");
                     log.info(" attributeId "+attributeId)
                    var attribute = step.getAttributeHome().getAttributeByID(attributeId);
                   
                    if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
                    	log.info("true");
                    }
                }
 }
}