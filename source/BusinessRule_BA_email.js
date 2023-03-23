/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_email",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_email",
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
  "pluginId" : "SendEmailBusinessAction",
  "parameters" : [ {
    "id" : "Body",
    "type" : "java.lang.String",
    "value" : "test"
  }, {
    "id" : "Recipients",
    "type" : "java.util.List",
    "values" : [ "@path@stibosystems.com" ]
  }, {
    "id" : "Sender",
    "type" : "com.stibo.util.basictypes.EmailRecipient",
    "value" : "@"
  }, {
    "id" : "Subject",
    "type" : "java.lang.String",
    "value" : "test"
  } ],
  "pluginType" : "Operation"
}
*/
