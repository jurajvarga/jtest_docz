/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateSkuToJNCatalogReference",
  "type" : "BusinessAction",
  "setupGroups" : [ "Migration Business Actions" ],
  "name" : "BA_CreateSkuToJNCatalogReference",
  "description" : "Create SKU to catalog classification for Japan  catalogs.",
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "currentObject",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,currentObject,logger,bl_library) {
/**
script ID: BA_CreateSkuToJNCatalogReference
description: Create SKU to catalog reference for Japan catalogs.

valid object types: SKU
bindings: stepManager, currentObject, logger
dependecies: BL_Library
**/

// variable for tracing business rule in STEP main log file
var businessRule = "Business Rule: BA_CreateSkuToJNCatalogReference"
var currentObjectID = "Current Object ID: " + currentObject.getID();

// China Catalogs (object type: Catalog Customer)
var class_home_id = "CR338405";
var classificationID = "Classification ID: " + class_home_id;
var classification_home =  stepManager.getClassificationHome().getClassificationByID( class_home_id );
var class_link_type_id = "SKU_To_Catalog";
var classification_link_type = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID( class_link_type_id );

//logger.info( bl_library.logRecord( [ businessRule, class_link_type_id, currentObjectID, classificationID ] ) );

function classifySKUtoCatalog( class_home, sku, class_link_type ) {
    var children = class_home.getChildren();
    var skuID = sku.getID();
    for ( var i=0; i<children.size(); i++ ){
        var child = children.get(i);
        var childID = child.getID();
        var childObjectTypeID = child.getObjectType().getID();
        if ( childObjectTypeID == "CatalogProducts" ){
            try {
                sku.createClassificationProductLink( child, class_link_type );
                //logger.info( bl_library.logRecord( [ "Classified", skuID, childID, businessRule ] ));
            } catch (err) {
                if ( err.javaException instanceof com.stibo.core.domain.UniqueConstraintException ) {
                    logger.info( bl_library.logRecord( ["Found existing object with same target", skuID, childID, businessRule ] ) );
                } else {
                    logger.info( bl_library.logRecord( ["Exception occurred", businessRule, skuID, err ] ) );
                    throw (err);
                }
            }
        } else if ( childObjectTypeID == "CatalogCustomer" || childObjectTypeID == "CatalogDistributorHub" ) {
            classifySKUtoCatalog( child, sku, class_link_type );
        }
    }
}

classifySKUtoCatalog( classification_home, currentObject, classification_link_type );
}