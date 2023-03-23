/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Product_Kit_Discontinued",
  "type" : "BusinessAction",
  "setupGroups" : [ "NewEmail" ],
  "name" : "BA_Product_Kit_Discontinued",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,mailHome,manager,lookupTableHome,BL_Email,BL_MaintenanceWorkflows) {
if ((node.getValue("PSC_Pre-discontinued").getSimpleValue() == "Discontinued") ||
    (node.getValue("PSC_InternalUseOnly").getSimpleValue() == "Discontinued") ||
    (node.getValue("PSC_Pending").getSimpleValue() == "Discontinued")) {
    var parent = node.getParent()
    var discontinuedRevisions = []
    //STEP-6396
    var prod2MSReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock")
    var prod2MSReferences = parent.queryReferences(prod2MSReferenceType);
    prod2MSReferences.forEach(function(prod2MSReference) {    
        var prod2MSNode = prod2MSReference.getTarget()
        var children = prod2MSNode.getChildren()
        var kitskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU")    
        for (var i = 0; i < children.size(); i++) {
            var byRefs = children.get(i).queryReferencedBy(kitskuReferenceType);
            byRefs.forEach(function(byRef) {  
                var bySource = byRef.getSource();
                discontinuedRevisions.push(bySource.getName())
                return true;
            });
        }
        return true;
    });
    //STEP-6396
    if (discontinuedRevisions.length > 0) {
        var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookupTableHome, "WorkflowEmailUserGroupMapTable", "10");
        
        // STEP-5944 refactor email sending (using function)
        if (recipientsEmails) {
            
            var subject = parent.getName() + " is discontinued";
            var body = "Prod Teams,<BR>" +
                "Please be aware that this component " + parent.getName() + " No: " + parent.getValue("PRODUCTNO").getSimpleValue() + " has been discontinued. It is also used in the following kits:<BR>" +
                discontinuedRevisions.sort().join(", ") +
                "<BR> Thanks.";

            BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, body);
        }
    }
}
}