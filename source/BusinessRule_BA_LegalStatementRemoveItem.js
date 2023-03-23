/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_LegalStatementRemoveItem",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_LegalStatementRemoveItem",
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
exports.operation0 = function (node,manager,bl_library) {
/*
 * STEP-6720
 * 
 * If there is in the node among the product revision attributes Legal Statement item with value "Alexa License (K-00436) (Secondary Abs)"
 * we have to remove it 
 * 
 */

var productno = node.getValue("PRODUCTNO").getValue();
//var toBeRemoved = "Alexa License (K-00436) (Secondary Abs)"; // LOV ID to search for
var toBeRemoved = "Alexa License Secondary";//Alexa License Secondary
//var toBeRemoved = "Alexa License (K-00436) (Sourced Conj)"; // LOV ID to search for
//var toBeRemoved = "AL(SC)Test"; // LOV ID to search for
var AttrID = "LEGALSTATEMENT";  // Attribute to search for
var legalStatement = node.getValue(AttrID); 

if(legalStatement)
	legalStatement.getValues().forEach(function (statement) {
		log.info(productno + ', ' +statement.getID() + ', ' + statement.getValue());
		if (statement.getID() == toBeRemoved) {
			statement.deleteCurrent();	
			log.info('Now removed ---> ' + statement.getValue());
		}
	})
}