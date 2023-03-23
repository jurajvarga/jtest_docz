/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_UpdateKitComponentName",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_UpdateKitComponentName",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Component" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
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
exports.operation0 = function (node,manager,BA_Approve) {
var skuNo = node.getValue("COMPONENTSKU").getSimpleValue();
var sku = manager.getNodeHome().getObjectByKey("SKUNO", skuNo);

if(sku) {
    var skuProductName = sku.getValue("PRODUCTNAME").getSimpleValue() || "";
    var skuProductShortName = sku.getValue("PRODUCTSHORTNAME").getSimpleValue() || "";
    var kitComponentName = node.getValue("COMPONENTSKUNAME").getSimpleValue();

    if(kitComponentName != skuProductName) {
        if(kitComponentName != skuProductShortName) {
            var isKitComponentApproved = node.getApprovalStatus();

            if(skuProductShortName == null || skuProductShortName == "") {
                node.getValue("COMPONENTSKUNAME").setSimpleValue(null);
            }
            else {
                var shortNameSplited = skuProductShortName.split(" ");
                var kitName = "";

                for(var i=0; i<shortNameSplited.length; i++) {
                    if(shortNameSplited[i] != "") {
                        if(i == 0) {
                            kitName = shortNameSplited[i];
                        }
                        else {
                            kitName = kitName + " " + shortNameSplited[i];
                        }
                    }
                }

                node.getValue("COMPONENTSKUNAME").setSimpleValue(kitName);
            }

            if (isKitComponentApproved == "Completely Approved") {
                BA_Approve.execute(node);
            }
        }
    }
}
}