/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email_Current_Revision_Setter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Business_Rules" ],
  "name" : "Email Current Revision Setter",
  "description" : "Test Email Address : STEPtest@cellsignal.com Live Email Address:?",
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
    "value" : "\nProduct <ref attrid=\"\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"objname\" separator=\";\"/> with Product Number: <ref attrid=\"PRODUCTNO\" attrname=\"Product No\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/> has been rejected from setting the Current Revision with the Revision linked to Lot:<ref attrid=\"Product_Inventory_Lot_No\" attrname=\"Product Inventory Lot No\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>.  It will remain the Current Revision workflow until it meets requirements. \n\nThanks\nSTEP: <ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"serverinfo\" separator=\";\" type=\"hostname\"/>"
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
    "value" : "**CST-DEV Test Email**  Current Revision Setting Issue needs attention."
  } ],
  "pluginType" : "Operation"
}
*/
