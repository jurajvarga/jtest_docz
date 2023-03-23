/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_JP_Regulation",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_JP_Regulation",
  "description" : "Calculating JP Regulation from JP DG Attributes",
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision", "SKU" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var poisDelet = node.getValue("Pois_Deleter_Substances_Control_Law").getSimpleValue();
var secLaw = node.getValue("Security_Law").getSimpleValue();
var prtr = node.getValue("PRTR").getSimpleValue();
var cartagena = node.getValue("Cartagena").getSimpleValue();
var fireSer = node.getValue("Fire_Service_Act").getSimpleValue();

var arr = [poisDelet, secLaw, prtr, cartagena, fireSer]
// log.info(poisDelet + " " + secLaw + " " + prtr + " " + cartagena + " " + fireSer)

node.getValue("JP_Regulation").setSimpleValue(getFlags(arr));
// log.info("JP_Regulation " + node.getValue("JP_Regulation").getSimpleValue());

function getFlags(input) {
	var arr = [];

    for (var i = 0; i<input.length; i++) {
        if (input[i] != null && input[i] != "-NULL-") {
            arr.push.apply(arr, [input[i].split(':')[0].trim()]);
        }
    }

    return arr.join('-');	
}
}