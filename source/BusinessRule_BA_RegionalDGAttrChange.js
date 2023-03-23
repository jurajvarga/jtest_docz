/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalDGAttrChange",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_RegionalDGAttrChange",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
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
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wf,LibMaintenance) {
var wfInstance = null
var workflowType = node.getValue("Workflow_Type").getSimpleValue();
log.info(" workflowType " + workflowType);

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo " + wfInitiatedNo);

var sellFlag = "";
if (workflowType == "M") {
    if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)) {
        sellFlag = node.getValue("Sell_in_China_?").getSimpleValue();
/*
        var permision = node.getValue("Hazards_Chemical_Permisssion").getSimpleValue();
        var storage = node.getValue("Hazards_Chemical_Storage").getSimpleValue();
        var transport = node.getValue("Transportation_Mode").getSimpleValue();
        var result = sellFlag + ";" + permision + ";" + storage + ";" + transport;
*/
        var result = sellFlag
        wfInstance = node.getWorkflowInstanceByID("WF16_China_Maintenance_Workflow")
    } else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)) {
        sellFlag = node.getValue("Sell_in_Japan_?").getSimpleValue()
        var category = node.getValue("JP_Item_Category").getSimpleValue()

        // JP Regulation
        var poisonousDeleterious = node.getValue("Pois_Deleter_Substances_Control_Law").getSimpleValue();
        var fireServiceAct = node.getValue("Fire_Service_Act").getSimpleValue();
        var prtr = node.getValue("PRTR").getSimpleValue();
        var cartagena = node.getValue("Cartagena").getSimpleValue();
        var securityLaw = node.getValue("Security_Law").getSimpleValue();
        var regulation = node.getValue("JP_Regulation").getSimpleValue();
        
        wfInstance = node.getWorkflowInstanceByID("WF16_Japan_Maintenance_Workflow");
        var result = sellFlag + ";" + category + ";" + poisonousDeleterious + ";" +
            fireServiceAct + ";" + prtr + ";" + cartagena + ";" + securityLaw + ";" + regulation;
    }
    wfInstance.setSimpleVariable("Sell_Flag_Regional_Tmp", sellFlag)
    wfInstance.setSimpleVariable("MaintenanceTmp", result)

}
}