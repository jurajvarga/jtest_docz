/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "ASHA_createRefToProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "ASHA_createRefToProduct",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "MasterStock", "Product", "Product_Kit", "SKU" ],
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
exports.operation0 = function (currentObject,logger,bl_library) {
/**
script purpose: Create references from Product to MasterStock and SKU.
valid object type: Product
bindings: currentObject, logger
dependencies: BL_Library
business rule key for locating rows in main STEP log file: BA_CreateProductReferenceMasterstockSKU
**/

// variables for logging
var currentObjectID = "Asha Current Object ID: " + currentObject.getID();
var businessRule = "BA_CreateProductReferenceMasterstockSKU";

logger.info( bl_library.logRecord( [ businessRule, currentObjectID ] ) )
// If we have a SKU object the Product Node may be the Parent or the Grandparent
logger.info( bl_library.logRecord( [ "Current Object Type ", currentObject.getObjectType().getID() ] ) )

if (currentObject.getObjectType().getID() == "SKU" )
   {
    parentNode = currentObject.getParent();
    logger.info( bl_library.logRecord( [ "parent node of SKU ", parentNode.getObjectType().getID() ] ) )

    productNode = parentNode.getParent();
    logger.info( bl_library.logRecord( [ "parent node of  ", productNode.getObjectType().getID() ] ) )
    
    if (productNode.getObjectType().getID() == "Product" ||
    productNode.getObjectType().getID() == "Product_Kit")
                   {
   	               productNode = parentNode;
   	               logger.info( bl_library.logRecord( [ businessRule, "1 Associated Product: " + productNode.getName()+ " , " + productNode.getID() ] ) )
   	              // log.info("Associated Product: " + productNode.getName());
                   }
                else 
                    {
                     productNode = parentNode.getParent()
                     logger.info( bl_library.logRecord( [ businessRule, "2 Associated Product: " + productNode.getName() + " , " + productNode.getID()] ) )
                    }
   }
  
// collect child objects of the Product object
//var children = currentObject.getChildren();
//parentNode = currentObject.getParent();
//parentNode = productNode.getParent()
//var children = parentNode.getChildren();
var children = productNode.getChildren();

logger.info( bl_library.logRecord( [ businessRule, "Children: " + children ] ) )

var masterStocks = [];

// Master Stocks
// try to create references from Product to MasterStock, only need to work with MasterStock objects
logger.info( bl_library.logRecord( [ businessRule, "children.size(): " + children.size()  ] ) )
for ( i = 0; i < children.size(); i++ ) {
   // var child = children.get(i); // any child object
    logger.info( bl_library.logRecord( [ businessRule, "childrenID: " + child.getID()  ] ) )
   if ( children.getID() == "MasterStock" ) {
        var masterStock = children;
        logger.info( bl_library.logRecord( [ businessRule, "i " + i +" masterStock: " + masterStock.getObjectType().getID() ] ) )
        masterStocks.push( masterStock ); // collect Master Stock objects for later use
        var masterStockID = masterStock.getID();
        try {
           // currentObject.createReference( masterStock, "Product_To_MasterStock" );
            children.createReference( masterStock, "Product_To_MasterStock" );
            logger.info( bl_library.logRecord( [ businessRule, "Created reference to", masterStockID ] ));
        } catch (e) {
            if ( e.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException ) {
                logger.info( bl_library.logRecord( [ businessRule, "Target already referenced for", masterStockID ] ));
            } else {
                logger.info( bl_library.logRecord( [ "Exception occurred MasterStockRef", businessRule, currentObjectID, masterStockID, e ] ) );
                throw(e);
            }
        }
    }
}

// SKUs
// try to create references from Product to SKU, only need to work with SKU objects
for ( i = 0; i < masterStocks.length; i++ ) {
    var masterStock = masterStocks[i];
    var masterStockChildren = masterStock.getChildren();
    logger.info( bl_library.logRecord( [ businessRule, "masterStockChildren.size(): " + masterStockChildren.size()  ] ) )
    for ( x = 0; x < masterStockChildren.size(); x++ ) {
        var child = masterStockChildren.get(x);
        if ( child.getObjectType().getID() == "SKU" ) {
            var sku = child;
            var skuID = sku.getID();
            try {
                //currentObject.createReference( sku, "Product_To_SKU" );
                productNode.createReference( sku, "Product_To_SKU" );
                logger.info( bl_library.logRecord( [ businessRule, "Created reference to", skuID ] ));
            } catch (e) {
                if ( e.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException ) {
                    logger.info( bl_library.logRecord( [ businessRule, "Target already referenced for", skuID ] ));
                } else {
                    logger.info( bl_library.logRecord( [ "Exception occurred", businessRule, currentObjectID, skuID, e ] ) );
                    throw(e);
                }
            }
        }
    }
}
}