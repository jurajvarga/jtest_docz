/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "Inbound_Business_Rules" ],
  "name" : "BA_CopyProduct",
  "description" : "Copy values from the original product to the new created by Inbound process",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
  }, {
    "libraryId" : "BL_CopyProduct",
    "libraryAlias" : "BL_CopyProduct"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "sendEmail",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "Email_Copy_Product",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipBFQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_and_Kit_WIPBF_JSON_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ProductCopyCompleted",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ProductCopyCompleted",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,sendEmail,wipBFQueue,ProductCopyCompleted,BL_Approve,BL_CopyProduct) {
//STEP-6176
var businessRule = "Business Rule: BA_CopyProduct";
var currentDate = "Date: " + (new Date()).toLocaleString();

var parentProdNo = node.getValue("PARENT_PRODUCTNO").getSimpleValue();
var parentProduct = manager.getNodeHome().getObjectByKey("PRODUCTNO",parentProdNo);

BL_CopyProduct.duplicateProduct(manager,parentProduct,node); // STEP-6408

//approve node 
BL_Approve.approveObj(node);

//send to queue
wipBFQueue.queueDerivedEvent(ProductCopyCompleted, node)

//Send email
sendEmail.execute(node);
}