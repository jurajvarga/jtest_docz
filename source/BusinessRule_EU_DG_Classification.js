/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "EU_DG_Classification",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "EU DG Classification",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
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
exports.operation0 = function (node,logger,webui) {
//Blank out the field EU_DG_Classification

if ((node.getValue("UN_Number").getSimpleValue() != null)
	&& (node.getValue("Hazardous_Class_Div").getSimpleValue() != null)
	&& (node.getValue("Packing_Group").getSimpleValue() != null)
) {
	node.getValue("EU_DG_Classification").deleteCurrent();
	var sb = new java.lang.StringBuilder();
	var volPerInnerPackage = Number(node.getValue("Volume_Per_Inner_Package").getSimpleValue());
	var eqQty = Number(node.getValue("EQ_QTY").getSimpleValue());
	var iataQty = Number(node.getValue("IATA_LQ_QTY_PerInnerPackagingInMLG").getSimpleValue());
	//logger.info("volPerInnerPackage:" + volPerInnerPackage + " eqQty:" + eqQty + "  iataQty:" + iataQty);
	if (volPerInnerPackage < (eqQty + 1)) {
		sb.append("EQ");
	} else if (volPerInnerPackage < (iataQty + 1)) {
		sb.append("LQ");
	} else {
		sb.append("ADR");
	}
	//Append the text “ UN” to EU_DG_Classification. Append the text from field UN_Number to EU_DG_Classification
	sb.append(" UN").append(node.getValue("UN_Number").getSimpleValue() != null ? node.getValue("UN_Number").getSimpleValue() : "");

	//Append the text “ Class” to EU_DG_Classification. Append the text from field Hazardous_Class_Div to EU_DG_Classification
	sb.append(" C").append(node.getValue("Hazardous_Class_Div").getSimpleValue() != null ? node.getValue("Hazardous_Class_Div").getSimpleValue() : "");

	//Append the text “ PG” to EU_DG_Classification. Append the text from field Packing_Group to EU_DG_Classification
	if (node.getValue("Packing_Group").getSimpleValue() != 'N/A')
	{
		sb.append(" PG").append(node.getValue("Packing_Group").getSimpleValue() != null ? node.getValue("Packing_Group").getSimpleValue() : "");
	}

	//Build the final value for EU_DG_Classification
	node.getValue("EU_DG_Classification").setSimpleValue(sb.toString());

	//Build the final value for EU_DG_Classification 2
	sb.append(" ").append(node.getValue("Tunnel_Code").getSimpleValue() != null ? node.getValue("Tunnel_Code").getSimpleValue() : "");
	node.getValue("EU_DG_Classification_2").setSimpleValue(sb.toString().trim());
}
else {
	webui.showAlert("ERROR", "EU_DG_Classification", "Required data to generate EU DG Classification is not in the system.");
}
}