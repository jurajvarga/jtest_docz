/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BulkUpdateRemoveMFMasterStock",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_BulkUpdateRemoveMFMasterStock",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve_Recursively",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve_Recursively",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,BA_Approve_Recursively,node,BL_Library) {
/*
var list = ["p4669606", "p4669617", "p4669631", "p4669645", "p4669683", "p4669621", "p4669635", "p4669673", "p4669687", "p4672844", "p4680711", "p4680728", "p4680806", "p4681168", "p4681198", "p4680810", "p4681259", "p4693485", "p4703822", "p4717075", "p4717094", "p5202149", "p5205061", "p5210491", "p5210511", "p5210532", "p5216076", "p5216101", "p5216123", "p5249722", "p5249748", "p5249770", "p5249812", "p5249788", "p5249850", "p5249847", "p5249877", "p5275105", "p5294278", "p5312702", "p5312726", "p5312741", "p5341142", "p5359553", "p5361098", "p5384130", "p5542026"];
*/
//Removing the regional revisions
var regionalRevArr = {"p5341142": ["rr5370076"], "p5359553": ["rr5393997", "rr5397336"],"p5361098": ["rr5394999"],"p5384130": ["rr5538661"]};
for(var key in regionalRevArr) {
    for (var elem in regionalRevArr[key]) {
        var rr = manager.getProductHome().getProductByID(regionalRevArr[key][elem]);
        if (rr != null) {
        	var product = manager.getProductHome().getProductByID(key);
	     deleteRefsAndChildren(BA_Approve_Recursively, rr, product);
	   	rr.delete().approve();
        }    
    }
}

var product = manager.getProductHome().getProductByID(node.getID());
var productNo = product.getValue("PRODUCTNO").getSimpleValue();
//var allProductRevisions = BL_Library.getRevisions(product).toArray();

var ms = BL_Library.getMasterStockForRevision(manager, node);

if (ms.getValue('MASTERITEMCODE').getSimpleValue() == 'MF'
    && ms.getValue("EBSExportFlag").getSimpleValue() == 'N') {
    var sku = manager.getNodeHome().getObjectByKey("SKUNO", productNo + "BF");

    if (sku) {
        //Removing non lot revision to tech transfer references
        var revToTT = BL_Library.getReferences(node, "ProductRevision_to_Lot").toArray();
        revToTT.forEach(function revToTTLoop(elem) {
            if (elem.getTarget().getObjectType().getID()
                == manager.getObjectTypeHome().getObjectTypeByID("NonLot").getID()) {
                deleteRefsAndChildren(BA_Approve_Recursively, elem.getTarget(), product);
            }
            return;
        });
        //Delete rev, MF, BF SKU
        deleteRefsAndChildren(BA_Approve_Recursively, sku, product);
        sku.delete().approve();               
        deleteRefsAndChildren(BA_Approve_Recursively, ms, product);
        deleteRefsAndChildren(BA_Approve_Recursively, node, product);
        node.delete().approve();
        ms.delete().approve();
        BA_Approve_Recursively.execute(product);
    }
}



function deleteRefsAndChildren(BA_Approve_Recursively, item, approvalNode) {
    BL_Library.deleteRefRecursively(item);
    BL_Library.deleteRefByRecursively(item);
    BA_Approve_Recursively.execute(approvalNode);
    deleteRecursivelyWithApproval(item);
}

//Original function in BL_Library -> child.delete();
//Without approve there is a problem with the sub products (eg sds)
function deleteRecursivelyWithApproval(node) {
    if (node) {
        var children = node.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next();
            deleteRecursivelyWithApproval(child);
            BL_Library.deleteAssets(child)
            child.delete().approve();
        }
    }
}
}