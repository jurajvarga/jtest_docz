/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "GenerateRemainingItemCodeList",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Generate Remaining Item Code List",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_lib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,revisionMasterStock,bl_lib) {
function buildItemCodesLists(masterStock, holder, sourcedorcustom) {
    var sProductType = masterStock.getValue("PRODUCTTYPE").getSimpleValue();
    var sMasterItemCode = masterStock.getValue("MASTERITEMCODE").getSimpleValue();
    log.info(" sMasterItemCode : " + sMasterItemCode);
    //Search for Entities with matching product type
    var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.entity.Entity;
    var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);

    var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
    query.root = belowNode;

    var itemCodesList = searchHome.querySingleAttribute(query).asList(100).toArray();
    log.info("Matched Item Codes: " + itemCodesList.length);
    for (var i = 0; i < itemCodesList.length; i++) {
        var eSkuDefault = itemCodesList[i];
        var sDefaultItemCode = eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
        var sDefaultMasterItemCode = eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
        var sDefaultItemStockFormat = eSkuDefault.getValue("ITEMSTOCKFORMAT_DFLT").getSimpleValue();
        log.info(" sDefaultMasterItemCode : " + sDefaultMasterItemCode);
        log.info(" sDefaultItemCode : " + sDefaultItemCode);
        log.info(" sDefaultItemStockFormat : " + sDefaultItemStockFormat)

        var productType = node.getValue("PRODUCTTYPE").getSimpleValue();

        // 07/12/2021 all SKUs should be avaible for creation if the product type is Miscellaneous, STEP-5630
        if (productType == "Miscellaneous" && sDefaultItemStockFormat != "MASTER") {
            holder.all.push(sDefaultItemCode);
        } else if (!sourcedorcustom) {
            if ((sDefaultMasterItemCode == sMasterItemCode) || (sDefaultMasterItemCode == null && sDefaultItemStockFormat != "MASTER")) {
                holder.all.push(sDefaultItemCode);
            }
        } else {
            if (sDefaultMasterItemCode != null) {
                holder.all.push(sDefaultItemCode);
            }
        }
    }

    /*var msChild = masterStock.queryChildren();
    log.info (" msChild size "+msChild.size());
    if (msChild!=null &&  msChild.size()>0){
        msChild.forEach(function(sku) {
            var sItemCode =  sku.getValue("ItemCode").getSimpleValue();
            holder.available.push(sItemCode);
            return true;
        });
    }*/

    var msChildList = masterStock.queryChildren().asList(100).toArray();
    for (var j = 0; j < msChildList.length; j++) {
        var skuObj = msChildList[j];
        var sItemCode = skuObj.getValue("ItemCode").getSimpleValue();
        log.info("sItemCode = " + sItemCode);
        holder.available.push(sItemCode);
    }

    /* childrenQuery.forEach(function(child) {
         log.info("childID = "+child.getID());
         var sItemCode =  child.getValue("ItemCode").getSimpleValue();
        
           log.info("sItemCode = "+sItemCode);
         holder.available.push(sItemCode);
         return true; // break the "forEach" on the query
     });*/



    holder.all.forEach(function (obj) {
        var found = false;
        holder.available.forEach(function (avail) {
            //log.info(obj + "  " + avail + " " + (obj == avail));
            if (avail == obj) {
                found = true;
            }
        });
        if (!found) {
            holder.missing.push(obj);
        }
        return true;
    });
    log.info("Already Created " + holder.available);
    log.info("Missing Codes: " + holder.missing);
}

var ItemCode = {
    all: [],
    available: [],
    missing: []
};


var sourcedorcustom = bl_lib.checkSourcedOrCustomLot(step, node, log);

log.info(" sourcedorcustom " + sourcedorcustom);

//STEP-6396
var masterStockReferences = node.queryReferences(revisionMasterStock);
masterStockReferences.forEach(function(ref) {
    var masterStock = ref.getTarget();
    buildItemCodesLists(masterStock, ItemCode, sourcedorcustom);

    //Sort Itemcodes and set to the attribute  
    var sb = new java.lang.StringBuilder();
    ItemCode.missing.sort().forEach(function (obj) {
        if (sb.length() > 0) {
            sb.append(",");
        }
        sb.append(new java.lang.String(obj));
    });
    //log.info("Value " + sb.toString());
    node.getValue("SKU_Creation_Available").setSimpleValue(sb.toString());
    return false;
});
//STEP-6396
}