/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test_mj_idl_fig_folders",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "test_mj_idl_fig_folders",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,bl_library) {
var businessRule = "Business Rule: test_mj_idl_fig_folders";
var currentObjectID ="";
var currentDate ="Date: "+ (new Date()).toLocaleString();

// Get a list with all products, product kits, equipments with Product Status != Commercialization
var prodImFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");

var conditions = com.stibo.query.condition.Conditions;

var isNotCommercialization = conditions.valueOf(manager.getAttributeHome().getAttributeByID("Product_Status")).neq("Commercialization");
var isProduct = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product"));
var isProductKit = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Kit"));
var isEquipment = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment"));

var queryHome = manager.getHome(com.stibo.query.home.QueryHome);

var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where((isNotCommercialization).and((isProduct).or(isProductKit).or(isEquipment)));

var result = querySpecification.execute();
var resultArr = result.asList(10).toArray();
log.info("resultArr.length: " + resultArr.length);


for (var i = 0; i < resultArr.length; i++) {
    var product = resultArr[i];
    var prodNo = product.getValue("PRODUCTNO").getSimpleValue();
    
    log.info(" ## Product status for product no " + prodNo + ": " + product.getValue("Product_Status").getSimpleValue());

    // Get Product Folder
    var prodImFoldRefs = product.getReferences(prodImFolderRefType);

    if (prodImFoldRefs.size() > 0) {
        var prodImFolder = prodImFoldRefs.get(0).getTarget();

        log.info(prodImFolder.getName());

        var figFolders = prodImFolder.getChildren().iterator();

        // Get Figure (Datasheet) Folders
        while (figFolders.hasNext()) {
        	var figFolder = figFolders.next();
        	log.info(figFolder.getName());
            
            log.info("BEFORE")
            log.info("Figure_Assignment: " + figFolder.getValue("Figure_Assignment").getSimpleValue());
            log.info("Content Review Assign: " + figFolder.getValue("Figure_AM_Assign").getSimpleValue());

            // Change Figure Assignment and Content Review Assignment
            figFolder.getValue("Figure_Assignment").setSimpleValue("Production");
            figFolder.getValue("Figure_AM_Assign").setSimpleValue("Production");

            log.info("AFTER")
            log.info("Figure_Assignment: " + figFolder.getValue("Figure_Assignment").getSimpleValue());
            log.info("Content Review Assign: " + figFolder.getValue("Figure_AM_Assign").getSimpleValue());

            // Approve Figure Folder
            var currentObjectID ="Node ID: "+ figFolder.getID()+ " Node Object ID: "+ figFolder.getObjectType().getID();
            try{		
		
                figFolder.approve();
            }
            catch(e){
                
                if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
                    log.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                    
                }else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
                    log.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                    
                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
                    log.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                
                } else {
                    log.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
                    throw(e);
                }
            }
        }

        // Approve Product Folder
        var currentObjectID ="Node ID: "+ prodImFolder.getID()+ " Node Object ID: "+ prodImFolder.getObjectType().getID();
            try{		
		
                prodImFolder.approve();
            }
            catch(e){
                
                if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
                    log.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                    
                }else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
                    log.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                    
                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
                    log.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );
                
                } else {
                    log.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
                    throw(e);
                }
            }
    }
}

}