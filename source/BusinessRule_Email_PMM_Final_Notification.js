/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email_PMM_Final_Notification",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Business_Rules" ],
  "name" : "Email PMM Final Product Notification",
  "description" : "Test Email Address : STEPtest@cellsignal.com Live Email Address:pmm@cellsignal.com",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
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
    "value" : "PMMs: \n\nProduct <ref attrid=\"\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"objname\" separator=\";\"/> with Product Number: <ref attrid=\"PRODUCTNO\" attrname=\"Product No\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>.  has a Release Date of <ref attrid=\"DATEPLANNEDRELEASE\" attrname=\"Planned Release Date\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/> in United States. \n\nThanks\nSTEP: <ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"serverinfo\" separator=\";\" type=\"hostname\"/>"
  }, {
    "id" : "Recipients",
    "type" : "java.util.List",
    "values" : [ "@pimentos@cellsignal.com" ]
  }, {
    "id" : "Sender",
    "type" : "com.stibo.util.basictypes.EmailRecipient",
    "value" : "@noreply+devstep@cellsignal.com"
  }, {
    "id" : "Subject",
    "type" : "java.lang.String",
    "value" : "**CST-DEV Test Email**  New Product Is Ready For Release."
  } ],
  "pluginType" : "Operation"
}
*/
