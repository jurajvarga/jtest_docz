/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ResetAuditInstanceID",
  "type" : "BusinessAction",
  "setupGroups" : [ "Workflow Auditing" ],
  "name" : "BA_ResetAuditInstanceID",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApprove",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,baApprove,BL_Library) {
//STEP-6243
var checkServiceRevision = true;
var isRevisionObject = BL_Library.isRevisionType(node, checkServiceRevision);

//STEP-5929
//Reset Revision Audit Instance ID & Audit Message
if (isRevisionObject) {
    node.getParent().getValue("Audit_InstanceID").setSimpleValue("");
    //		node.getParent().getValue("Audit_Message").setSimpleValue("");
    node.getParent().getValue("Audit_Message_Index").setSimpleValue("0");
}

node.getValue("Audit_InstanceID").setSimpleValue("");
node.getValue("Audit_Message_Index").setSimpleValue("0");
//node.getValue("Audit_Message").deleteCurrent();
//Reset Figure Folder Audit Instance ID
if (isRevisionObject) {
    var pubFigFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
    //STEP-6396
    var figFolderRefs = node.queryReferences(pubFigFolderRefType);
    figFolderRefs.forEach(function(figFolderRef) {    
        var figfoldernode = figFolderRef.getTarget();
        figfoldernode.getValue("Audit_InstanceID").setSimpleValue("");
        figfoldernode.getValue("Audit_Message_Index").setSimpleValue("0");
        //	   figfoldernode.getValue("Audit_Message").setSimpleValue("");
        baApprove.execute(figfoldernode);
        return true;
    });
    //STEP-6396

    //Reset Product Folder Audit Instance ID
    var productFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
    //STEP-6396
    var productFolderRefs = node.queryReferences(productFolderRefType);
    productFolderRefs.forEach(function(productFolderRef) {       
        var productfoldernode = productFolderRef.getTarget();
        productfoldernode.getValue("Audit_InstanceID").setSimpleValue("");
        productfoldernode.getValue("Audit_Message_Index").setSimpleValue("0");
        //	   productfoldernode.getValue("Audit_Message").setSimpleValue("");
        baApprove.execute(productfoldernode);
        return true;
    });
    //STEP-6396
}
}