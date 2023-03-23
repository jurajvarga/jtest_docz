/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteDgAttributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_DeleteDgAttributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "contract" : "MailHomeBindContract",
    "alias" : "mail",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mail,lookup,step,BL_Email,BL_Library) {
var businessRule = "Business Rule: BA_DeleteDgAttributes";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();


// prod fix 07-14-2022 removing "CAS_Number" from the list, removing Commercial CAS Number from development story part
if(node.getValue("Dangerous_Goods_Flag_YN").getSimpleValue() == "N") {
   // STEP-6390 removed attribute "Dangerous_Goods_Flag_YN" from attrsToDelete	
    var attrsToDelete = ["UN_Number",
                         "UN_Number_Justification",
                         "Proper_Shipping_Name",
                         "Hazardous_Class_Div",
                         "Packing_Group",
                         "Signal_Words",
                         "Number_Of_Inner_Packages",
                         "Volume_Per_Inner_Package",
                         "UnitOfMeasurePerInnerPackage",
                         "Component_Volume_Per_Inner_Package",
                         "Outer_Packaging _Omverpakking",
                         "Excepted_Quantity_Code",
                         "GHS_Symbols",
                         "DG_Review_Comments",

                         "EQ_QTY",
                         "IATA_LQ_QTY_PerInnerPackagingInMLG",
                         "Tunnel_Code",
                         "eClass_Code",
                         "eClass_81_Code",
                         "EU_DG_Classification",
                         "EU_DG_Classification_2",

                         "Sell_in_Japan_?",
                         "JP_Item_Category",
                         "Pois_Deleter_Substances_Control_Law",
                         "Security_Law",
                         "PRTR",
                         "Cartagena",
                         "Fire_Service_Act",
                         "JP_Regulation"];

    for(var i=0; i < attrsToDelete.length; i++) {
        node.getValue(attrsToDelete[i]).setSimpleValue(null);
    }

    var product = node.getParent();
    var qChildren = product.queryChildren();

    qChildren.forEach(function(child) {
        if(child.getObjectType().getID() == "MasterStock") {
            var qGrandChildren = child.queryChildren();

            qGrandChildren.forEach(function(grandChild) {
                if(grandChild.getObjectType().getID() == "SKU") {
                	for(var i=0; i < attrsToDelete.length; i++) {
                        grandChild.getValue(attrsToDelete[i]).setSimpleValue(null);
                	}
                }

                return true;
            });
        }

        return true;
    });

    var wfInstance = node.getWorkflowInstanceByID("SDS-DG Workflow");
    var previousDGFlag = String(wfInstance.getSimpleVariable("tmpDGFlag"));

    if(previousDGFlag == "Y") {
        var body = "PIM Team,<br>";
        body += "on product " + node.getValue("PRODUCTNAME").getSimpleValue() + " the DG flag has been changed from '" + previousDGFlag + "' to '" + node.getValue("Dangerous_Goods_Flag_YN").getSimpleValue() + "'.<br><br>";
        body += "Thanks<br>STEP";

        var recipientsAddres = BL_Email.getEmailsFromGroup(manager = step,
                                                           lookupTableHome = lookup,
                                                           lookupTableName = "WorkflowEmailUserGroupMapTable",
                                                           wfInitiatedNo = "DG_Flag_Change"); 

        if(recipientsAddres) { 
            BL_Email.sendEmail(mailInstance = mail.mail(),
                               recipients = recipientsAddres,
                               subject = "DG flag change on " + node.getName(),
                               body = body);
        }
    }
}

BL_Library.triggerTransition(object = node, 
                             transitionAction = "Submit", 
                             wfID = "SDS-DG Workflow",
                             stateID = "SDS_Approval",
                             bCreateAudit = true);
}