/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Figure_Display_Index",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Set_Figure_Display_Index",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "assetLib"
  }, {
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,assetLib,bl_library) {
var businessRule = "Business Rule: BA_Set_Figure_Display_Index";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

var prodRev=node; 
 
var pubFigFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
var figFolderRefs = prodRev.queryReferences(pubFigFolderRefType);  //STEP-6396

figFolderRefs.forEach(function(figFolderRef) {     //STEP-6396

   var figfoldernode = figFolderRef.getTarget();  //STEP-6396
   var figFolderDispIndex=figfoldernode.getValue("Figure_Display_Index").getSimpleValue();
   log.info(" figFolderDispIndex "+figFolderDispIndex);
   	try{
           figfoldernode.approve();
       }
       catch(e){
           if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
               logger.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

           }else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
               logger.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

           } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
               logger.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

           } else {
               logger.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
               throw(e);
           }
       }
          
	var assets = figfoldernode.getAssets();
	var assetsItr = assets.iterator();
	//STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration
	if (assets.isEmpty()) {      
        assetLib.updateFigureFolderName(figfoldernode, null, manager)
    }
    //End //STEP-5662

	while (assetsItr.hasNext()) {
		var assetImg = assetsItr.next();
		var assetImgFigDispIndex=assetImg.getValue("Figure_Display_Index").getSimpleValue();
		//log.info("Fig Display Index asset before "+assetImgFigDispIndex);
		
			assetImg.getValue("Figure_Display_Index").setSimpleValue(figFolderDispIndex);
			assetImgFigDispIndex=assetImg.getValue("Figure_Display_Index").getSimpleValue();
			//log.info("Fig Display Index asset "+assetImgFigDispIndex);
			//STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration
        		assetLib.updateFigureFolderName(figfoldernode, assetImg, manager)
      
		try{
                assetImg.approve();
            }
            catch(e){
                if (e.javaException instanceof com.stibo.core.domain.DependencyException ) {
                    logger.info( bl_library.logRecord( ["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

                }else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException ) {
                    logger.info( bl_library.logRecord( ["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException ) {
                    logger.info( bl_library.logRecord( ["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage() ] ) );

                } else {
                    logger.info( bl_library.logRecord( ["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()] ) );
                    throw(e);
                }
            }
			
	
		
		

	}
    
return true;  //STEP-6396
});           //STEP-6396
}