/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_UpdatePublishDate",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_UpdatePublishDate",
  "description" : "set to sysdate when publish date is blank, published product is Y, status is released or released on hold",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
var product = node.getParent();

var publishFlag = node.getValue("PUBLISHED_YN").getSimpleValue();
var status = node.getValue("Product_Status").getSimpleValue();

var publishDate = product.getValue("DATEPUBLISHED").getSimpleValue();
var releaseDate = product.getValue("DateReleased").getSimpleValue(); //STEP-6307

var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());

log.info("Evaluating " + node.getName() + " for BA_UpdatePublishDate: PUBLISHED_YN = " + publishFlag + ", DATEPUBLISHED = " + publishDate + ", Product_Status = " + status);

if (!publishDate && publishFlag == "Y" && (status == "Released" || status == "Released - On Hold")) {
    product.getValue("DATEPUBLISHED").setSimpleValue(today);
    log.info("Setting DATEPUBLISHED to " + product.getValue("DATEPUBLISHED").getSimpleValue() + " for " + node.getName());
}

//STEP-6307
if (!releaseDate && status == "Released") {
    product.getValue("DateReleased").setSimpleValue(today);
    log.info("Setting DateReleased to " + product.getValue("DateReleased").getSimpleValue() + " for " + node.getName());
}
//STEP-6307
}