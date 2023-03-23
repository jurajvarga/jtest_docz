/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "path_test",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "path_test",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentObject) {
// Asha 
// Approves Product and its childern (MasterStock, SKU)
function approveObj(obj){
	log.info("STARTING OBJECT: " + obj.getName() + " | " + obj.getID());
	var date2 = new Date();
	if(date2 - date >= 15000){
		throw "error, ran too long";
	}	
		
		if(obj.getObjectType().getID() == "Product")
		{
			obj.approve();
			log.info(" in parent loop approved object: " + obj.getName() + " Object Type: "|| obj.getObjectType().getID());
               // SKUs
              // try to Approve Children objects 
              //var currentObjectID = "Current Object ID: " + currentObject.getID();
 
              var currentObjectID = "Current Object ID: " + currentObject.getID();
              log.info(currentObjectID);
              //node.getID();
              var childrenObj = currentObject.getChildren();
              //logger.info("ChildrenSIZE: " + childrenObj.size());
              for ( i = 0; i < childrenObj.size(); i++ ) {
                masterStock = childrenObj.get(i);
                masterStockID = masterStock.getID();
                log.info(masterStockID + " Approval Status "+masterStock.getApprovalStatus().name());
                try {if(masterStock.getApprovalStatus().name() != "CompletelyApproved"){
				    masterStock.approve();
				   }
                	}
                	catch (e) {
        	               ////  logger.info(" On Approving - Exception occurred:", currentObjectID, skuID, e );
                      throw(e);
                      }
			var masterStockChildren = masterStock.getChildren();
                       for ( x = 0; x < masterStockChildren.size(); x++ ) {
                   sku = masterStockChildren.get(x);
                   skuID = sku.getID();
                   log.info(skuID + " -->"+sku.getApprovalStatus().name());
                   try {
                      if(sku.getApprovalStatus().name() != "CompletelyApproved"){
				    sku.approve();
                       log.info(sku.getID() + " Approval Status "+sku.getApprovalStatus().name());

				    

				   }
			       
                      } 
                      catch (e) {
        	               ////  logger.info(" On Approving - Exception occurred:", currentObjectID, skuID, e );
                      throw(e);
                                }
                    }
                 }
                }
               
	//logger.info("ENDING OBJECT: " + obj.getName() + " | " + obj.getID());
     }
var date = new Date();
approveObj(currentObject);
}