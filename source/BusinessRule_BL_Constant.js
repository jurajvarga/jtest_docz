/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Constant",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_Constant",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
//STEP-6396
//returns all references types allowed for object based on objecttype", hardcoded
function getObjRefTypes(object) {
    var objType = object.getObjectType().getID()
    var refers = [];
    var referTypes = [];
    var manager = object.getManager()


    if (objType == "Equipment") {
        refers = ["ALTERNATE_PRODUCT", "Product_To_Current_Revision", "Product_To_MasterStock", "Product_To_Parent_Product",
                "Product_To_Revision", "Product_To_SKU", "Product_To_Tech_Transfer", "Product_To_WIP_Revision", "Companion_Product", "DataSheet",
                "MSDS", "Product_Maintenance_Documents", "Product_Status_Change_Documents", "Published_Product_Images", "Working_Product_Images",
                "Product_Folder_To_Product", "Product_to_Target", "Derivative_Products", "Product_To_RevRelease_WF", "Product_To_Kit"];
    } else if (objType == "Product" || objType == "Product_Kit") {
        refers = ["ALTERNATE_PRODUCT", "Product_To_Current_Revision", "Product_To_MasterStock", "Product_To_Parent_Product",
                "Product_To_Revision", "Product_To_SKU", "Product_To_Tech_Transfer", "Product_To_WIP_Revision", "Companion_Product", "DataSheet",
                "MSDS", "Product_Maintenance_Documents", "Product_Status_Change_Documents", "Published_Product_Images", "Working_Product_Images",
                "Product_Folder_To_Product", "Product_To_Species", "Product_to_Target", "Derivative_Products", "Product_To_RevRelease_WF", "Product_To_Kit"];
    } else if (objType == "Equipment_Revision") {
        refers =["ALTERNATE_PRODUCT", "Equipment_Revision_To_SKU", "ProductRevision_To_MasterStock", "Revision_To_SKU",
                "ProductRevision_to_Lot", "DataSheet", "Equipment_Revision_Images", "MSDS", "Product_Maintenance_Documents", "Product_Status_Change_Documents",
                "Published_Product_Images", "Working_Product_Images", "Product_Folder_To_Product_Revision", "Product_Rev_To_Figure_Folder"];
    } else if (objType == "Kit_Revision") {
        refers =["ALTERNATE_PRODUCT", "KitRevision_to_SKU", "ProductRevision_To_MasterStock", 
                "Revision_To_SKU", "ProductRevision_to_Lot", "DataSheet", "KitRevisionImages", "MSDS",
                "Product_Maintenance_Documents", "Product_Status_Change_Documents", "Published_Product_Images", "Working_Product_Images",
                "Product_Folder_To_Product_Revision", "Product_Rev_To_Figure_Folder", "Product_Revision_To_Species"];
    } else if (objType == "Product_Revision") {
        refers =["ALTERNATE_PRODUCT", "ProductRevision_To_MasterStock", "Revision_To_SKU", "ProductRevision_to_Lot",
                "DataSheet", "MSDS", "Product_Maintenance_Documents", "Product_Status_Change_Documents", "Published_Product_Images",
                "Working_Product_Images", "Product_Folder_To_Product_Revision", "Product_Rev_To_Figure_Folder", "Product_Revision_To_Species"];
    } else if (objType == "Service_Conjugates") {
        refers =["ALTERNATE_PRODUCT", "Product_To_Current_Revision", "Product_To_MasterStock", "Product_To_Parent_Product",
                "Product_To_Revision", "Product_To_SKU", "Product_To_WIP_Revision", "Companion_Product", "DataSheet", "MSDS", "Product_Maintenance_Documents",
                "Product_Status_Change_Documents", "Working_Product_Images", "Product_Folder_To_Product",
                "Product_to_Target", "Derivative_Products", "Product_To_RevRelease_WF"];
    } else if (objType == "Protocol") {
        refers =["ApplicationProtocol_To_SKU", "Protocol_To_Species"];
    } else if (objType == "SKU") {
        refers =["SKUImages", "SKUToCatalogProduct"];
    } else if (objType == "Regional_Revision") {
        refers =["Regional_KitRevision_to_SKU", "RegionalRevision_To_MasterStock", "RegionalRevision_to_Lot",
                "DataSheet", "Product_Status_Change_Documents", "Published_Product_Images", "Product_Rev_To_Figure_Folder"];
    } else if (objType == "Service_Revision") {
        refers =["ProductRevision_To_MasterStock"];
    } else if (objType == "Figure_Folder") {
        refers =["DataSheet", "ProductImage"];
    } else if (objType == "Lot_Application") {
        refers =["LotApplicationImages","LotApplication_To_ApplicationProtocol","LotApplication_To_Species"];
    } else if (objType == "Product_Rev_Folder") {
        refers =["ProductImage", "Product_Maintenance_Documents"];
    } else if (objType == "Service_Revision") {
        refers =["Product_Maintenance_Documents"];
    } else if (objType == "Digital_Asset_Metadata") {
        refers =["Published_DAM_Object"];
    } else if (objType == "Lot") {
        refers =["TechTransferImages", "Tech_Transfer_To_Source_Figure_Folder", "Lot_To_Species"];
    } else if (objType == "NonLot") {
        refers =["Tech_Transfer_To_Source_Figure_Folder"];
    }

    for (var i=0; i<refers.length; i++){    
        referTypes.push(manager.getReferenceTypeHome().getReferenceTypeByID(refers[i]))
    }


return referTypes;
}

//STEP-6729
//return value from lookup table for environment
function getEnvironmentConfiguration(manager, lookupTableName, lookupInputValue) {
    var currentEnvironment = BL_ServerAPI.getServerEnvironment();
    var lookupName=lookupTableName+currentEnvironment;  //"EnvironmentConfiguration_"+
    return manager.getHome(com.stibo.lookuptable.domain.LookupTableHome).getLookupTableValue(lookupName, lookupInputValue);
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getObjRefTypes = getObjRefTypes
exports.getEnvironmentConfiguration = getEnvironmentConfiguration