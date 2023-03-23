/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Email_PriceChange",
  "type" : "BusinessAction",
  "setupGroups" : [ "Email_Business_Rules" ],
  "name" : "Email PriceChange",
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
    "value" : "Price Change: \n\nThe Product SKU: <ref attrid=\"Item_SKU\" attrname=\"Item SKU\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>  will have a GBP Change of:  <ref attrid=\"Future_List_Price\" attrname=\"Future Global Base Price\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/> on <ref attrid=\"Future_List_Price_Date\" attrname=\"Future Global Base Price Date\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>, because <ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"New_Future_Global_Base_Price_Rational\"/> <ref attrid=\"Future_Global_Base_Price_Rational\" attrname=\"Future Global Base Price Rational\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>.\n\n\n<ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"Future_List_Price\"/>\n\n<ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"PRICE\"/>\n\n<ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"Future_Global_Base_Price\"/>\n\n<ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"Future_Global_Base_Price_Date\"/>\n\n<ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" includevarvalue=\"true\" includeworkflowid=\"false\" objecturl=\"step://stepworkflow?id=Price_Change_Workflow_MVP2\" resolveto=\"workflowvar\" separator=\";\" workflowvarid=\"Future_Global_Base_Price_Rational\"/>\n\n\n<ref attrid=\"Future_Global_Base_Price\" attrname=\"Future Global Base Price\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>\n\n<ref attrid=\"Future_Global_Base_Price_Date\" attrname=\"Future Global Base Price Date\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>\n<ref attrid=\"Future_Global_Base_Price_Rationale\" attrname=\"Future Global Base Price Rationale\" dynamicobject=\"true\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"valueandunit\" separator=\";\"/>\n\nThanks\n\nSTEP : <ref attrid=\"\" equalsign=\"=\" includeattrname=\"false\" objecturl=\"\" resolveto=\"serverinfo\" separator=\";\" type=\"hostname\"/>"
  }, {
    "id" : "Recipients",
    "type" : "java.util.List",
    "values" : [ "@pimentos@cellsignal.com;" ]
  }, {
    "id" : "Sender",
    "type" : "com.stibo.util.basictypes.EmailRecipient",
    "value" : "@noreply+devstep@cellsignal.com"
  }, {
    "id" : "Subject",
    "type" : "java.lang.String",
    "value" : "**CST-DEV Email**  Release Product has a new Global Base Price."
  } ],
  "pluginType" : "Operation"
}
*/
