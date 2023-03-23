/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PrepopulateEQLQ",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_PrepopulateEQLQ",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
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
var uncode =  [1219,1230,1544,1648,1805,2265,2811,3082,3265,3270,3316,3334];
var maxml =  [500,500,1000,500,1000,1000,1000,1000,1000,500,500,1000];
var tunelcode = ['D/E','D/E','E','D/E','E','D/E','E','E','E','E','E','E'];

var unnumber = node.getValue("UN_Number").getSimpleValue();
var iata = node.getValue("IATA_LQ_QTY_PerInnerPackagingInMLG").getSimpleValue();
var eqty = node.getValue("EQ_QTY").getSimpleValue();
var tunnel = node.getValue("Tunnel_Code").getSimpleValue();

for(var i =0; i < uncode.length; i++ ) {
  if ( uncode[i] == unnumber ) {
     if( iata == null) {
        node.getValue("IATA_LQ_QTY_PerInnerPackagingInMLG").setSimpleValue(maxml[i]); 
     }
      if(eqty == null) {
        node.getValue("EQ_QTY").setSimpleValue(30);  
     }
      if(tunnel == null) {
        node.getValue("Tunnel_Code").setSimpleValue(tunelcode[i]); 
     }
  	
  }
}
}