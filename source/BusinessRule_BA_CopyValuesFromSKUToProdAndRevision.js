/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyValuesFromSKUToProdAndRevision",
  "type" : "BusinessAction",
  "setupGroups" : [ "Migration Business Actions" ],
  "name" : "BA_CopyValuesFromSKUToProdAndRevision",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,bl_library) {
var unNumberCopied = false;
var properShipNameCopied = false;
var hazardousClassDivCopied = false;
var exceptedQtyCodeCopied = false;
var packingGroupCopied = false;
var currentDgFlag = 'N';
var currentGhsFlag = "N";

var copied = false;

//Copy from masterstock
var query = node.queryChildren();
query.forEach(function (child) {
    var childId = child.getObjectType().getID();
    if (childId == "MasterStock") {
        checkAndCopyAttributes(child);
    }
    if (copied)
        return false;
    return true;
});
//copy from skus
if (!copied) {
    copied = copyValuesFromReference(node, "Product_To_SKU");
}
//Rollup from current revision, if there is a current revision
var CurrrefType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision")
//STEP-6396
var Currrefs = node.queryReferences(CurrrefType);
Currrefs.forEach(function(CurrRef) {
    var iCurrRefs = CurrRef.getTarget();
    if (iCurrRefs != null) {
       	log.info("Copying value from revision to product")
		node.getValue("Dangerous_Goods_Flag_YN").setSimpleValue(iCurrRefs.getValue("Dangerous_Goods_Flag_YN").getSimpleValue())
		node.getValue("GHS_Label_Required_CB").setSimpleValue(iCurrRefs.getValue("GHS_Label_Required_CB").getSimpleValue())
    }
    return true;
});
//STEP-6396

function copyValuesFromReference(node, refType) {
    var refType = step.getReferenceTypeHome().getReferenceTypeByID(refType)
    //STEP-6396
    var refs = node.queryReferences(refType);
    refs.forEach(function(ref) {
        var iRefs = ref.getTarget();
        if (iRefs != null) {
            checkAndCopyAttributes(iRefs);
            if (copied) {
                return false;
            }
        }
        return true; 
    }); 
    //STEP-6396
}

function checkAndCopyAttributes(pNode) {
    currentDgFlag = checkAndUpdateFlag(pNode, "Dangerous_Goods_Flag_YN", currentDgFlag);
    if (!unNumberCopied) {
        if (pNode.getValue("UN_Number").getSimpleValue() != null) {
            unNumberCopied = true;
            updateAttribute("UN_Number", pNode.getValue("UN_Number").getSimpleValue())
        }
    }
    if (!properShipNameCopied) {
        if (pNode.getValue("Proper_Shipping_Name").getSimpleValue() != null) {
            properShipNameCopied = true;
            updateAttribute("Proper_Shipping_Name", pNode.getValue("Proper_Shipping_Name").getSimpleValue())
        }
    }
    if (!hazardousClassDivCopied) {
        if (pNode.getValue("Hazardous_Class_Div").getSimpleValue() != null) {
            hazardousClassDivCopied = true;
            updateAttribute("Hazardous_Class_Div", pNode.getValue("Hazardous_Class_Div").getSimpleValue())
        }
    }
    if (!exceptedQtyCodeCopied) {
        if (pNode.getValue("Excepted_Quantity_Code").getSimpleValue() != null) {
            exceptedQtyCodeCopied = true;
            updateAttribute("Excepted_Quantity_Code", pNode.getValue("Excepted_Quantity_Code").getSimpleValue())
        }
    }
    if (!packingGroupCopied) {
        if (pNode.getValue("Packing_Group").getSimpleValue() != null) {
            packingGroupCopied = true;
            updateAttribute("Packing_Group", pNode.getValue("Packing_Group").getSimpleValue())
        }
    }
    currentGhsFlag = checkAndUpdateFlag(pNode, "GHS_Label_Required_CB", currentGhsFlag);
    log.info(currentDgFlag + unNumberCopied + properShipNameCopied + hazardousClassDivCopied + exceptedQtyCodeCopied + packingGroupCopied + currentGhsFlag)

    copied = (currentDgFlag == 'Y') && unNumberCopied && properShipNameCopied && hazardousClassDivCopied && exceptedQtyCodeCopied && packingGroupCopied && (currentGhsFlag == 'Y')
}

function updateAttribute(attribute, value) {
    var p2revRefs = bl_library.getRevisions(node);
    for (var i = 0; i < p2revRefs.size(); i++) {
        p2revRefs.get(i).getValue(attribute).setSimpleValue(value);
    }
}


function checkAndUpdateFlag(pNode, attribute, currentValue) {
    if (currentValue != 'Y') {  //If already Y, no need to update
        flagValue = pNode.getValue(attribute).getSimpleValue();
        if (flagValue != null) {
            currentValue = flagValue;
            updateAttribute(attribute, flagValue)
        }
    }
    return currentValue;

}
}