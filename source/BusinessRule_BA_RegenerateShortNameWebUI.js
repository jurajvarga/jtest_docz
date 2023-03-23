/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegenerateShortNameWebUI",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_RegenerateShortNameWebUI",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ProductShortnameCreation",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductShortnameCreation",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BA_ProductShortnameCreation,webui) {
var productType = node.getValue("PRODUCTTYPE").getSimpleValue();
var pHostSpecies = node.getValue("Host_Species_Name").getSimpleValue();
var isPolyclonal = productType != null && productType == "Polyclonal Antibody";
var isMonoclonal = productType != null && productType == "Monoclonal Antibody";
var hasHostSpecies = pHostSpecies != null && pHostSpecies.length() > 0;

if((isPolyclonal || isMonoclonal) && !hasHostSpecies) {
    if (!hasHostSpecies){
        webui.showAlert("WARNING", "Warning", "Can't create a shortname for poly, mono with no species.");
        return;
    }
}

BA_ProductShortnameCreation.execute(node);
}