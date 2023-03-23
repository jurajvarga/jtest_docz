/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveProductRecursively",
  "type" : "BusinessAction",
  "setupGroups" : [ "Pricing Workflow Actions" ],
  "name" : "BA Approve Product Recursively",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "MasterStock", "Product", "Product_Kit", "SKU", "Service_Conjugates" ],
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
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCatalogReadyFlag",
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
exports.operation0 = function (node,busAction,logger,bl_library) {
// This Business Rules was based on the BA_ApproveAll Workflow
//function approveHierarchy(obj){
//	var parent = obj.getParent();
//	if(parent){
//		approveHierarchy(parent);
//		parent.approve();
//		log.info("approving parent: " + parent.getName());
//	}
//}

var businessRule = "Business Rule: BA_ApproveProductRecursively";
var currentObjectID ="Node ID: "+ node.getID()+ " Node Object ID: "+node.getObjectType().getID();
var currentDate ="Date: "+ (new Date()).toLocaleString();

function approveObj(obj){
	//log.info("STARTING OBJECT: " + obj.getName() + " | " + obj.getID());
	var date2 = new Date();
	if(date2 - date >= 15000){
		throw "error, ran too long";
	}

	logger.info( bl_library.logRecord( ["BA_ApproveProductRecursively: Approving:", businessRule, currentObjectID, currentDate, obj.getName() ] ) );
		try{		
		
			obj.approve();
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
		
		
		
		var children = obj.getChildren().iterator();
		while(children.hasNext()){
			var child = children.next();
			// If an object is completely approved it's children will not be approved
			if(child.getApprovalStatus().name() != "CompletelyApproved"){
				
				logger.info( bl_library.logRecord( ["BA_ApproveProductRecursively: Child:", businessRule, currentObjectID, currentDate, child.getName() + " Not Approved" ] ) );
				approveObj(child);
			}
			else
			{
				var nodetype = child.getObjectType().getID();
				if (nodetype = "SKU") {
					busAction.execute(child);
					approveObj(child);
				}
			}
		}
}

var checkServiceRevision = false;
var checkServiceConjugates = true;

// If we have a Product object we have the node we want
if (bl_library.isProductType(node, checkServiceConjugates)) {
    productNode = node;
   }
else
   {
   // If we have a Master Stock object the Product Node will be the Parent
   if (node.getObjectType().getID() == "MasterStock"||
	 node.getObjectType().getID() == "SKU"||
	 bl_library.isRevisionType(node, checkServiceRevision))
      {
           parentNode = node.getParent();
           if (parentNode.getObjectType().getID() == "Product" ||
			    node.getObjectType().getID() == "Product_Kit" ||
			    node.getObjectType().getID() == "Equipment" ||
			    node.getObjectType().getID() == "Service")
              {
	               productNode = parentNode;
              }
           else 
               {
                productNode = parentNode.getParent()
               }
      }
   }

// log.info("Associated Product: " + productNode.getName());

var date = new Date();

//If the associated Product is in one of the following workflows bypass this business rule
if(productNode.getWorkflowInstanceByID("ProductPricingWorkflow") ||
   productNode.getWorkflowInstanceByID("Product_Creation_For_Pricing")) {
   logger.info( bl_library.logRecord( ["BA_ApproveProductRecursively: Business Rules Bypassed:", businessRule, currentObjectID, currentDate, productNode.getName() + " Is In Workflow"] ) );
   
}
else {
	approveObj(node);
}
}