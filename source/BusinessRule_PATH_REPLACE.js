/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "PATH_REPLACE",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "PATH_REPLACE",
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
exports.operation0 = function (node,step) {
/*
 * This code is to get a list of species names from the species entity structure and replace them with blanks. It does not work in the cases where 
 * the species name contains special characters - e.g. Hamster (Syrian). The while loop (e.g. 2) fails and replaces only the first word i.e 'Hamster'
 * with the replacement string. Strangely though, the while loop (e.g. 1) which uses hard-coded compares using if statements works fine.
 */

  String.prototype.xReplaceAll = function (stringToFind, stringToReplace) {
  	log.info("stringToFind-->" + stringToFind);
  	  	//log.info("stringToReplace" + escapeRegExp(stringToReplace));
  	  	
        if (stringToFind === stringToReplace) return this;
        var temp = this;
      // temp = escapeRegExp(temp);
       log.info("temp "  + temp);
        var index = temp.indexOf(stringToFind);
        while (index != -1) {
            temp = temp.replaceAll(stringToFind, stringToReplace);
            index = temp.indexOf(stringToFind);
        }
        return temp;
    };
/*
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
*/


var pName = node.getValue("PRODUCTNAME").getSimpleValue();
var pShortName = pName;
var entityHome = step.getEntityHome();
var speciesHome = entityHome.getEntityByID("Species_Root");
var speciesIter = speciesHome.getChildren().iterator();
var escSpecName;

//Note: While Loop 1 - this works.
/*while(speciesIter.hasNext()) {
	var species = speciesIter.next();
	var speciesName = species.getValue("SPECIES").getSimpleValue();
	if (speciesName == "Hamster (Armenian)") {
		escSpecName = escapeRegExp(String(speciesName));
		//log.info(escSpecName);
		//pShortName = pShortName.replaceAll("\\b"+escSpecName+"\\b",'XYZ');
		pShortName = pShortName.replaceAll(escSpecName, "ABC");
	} else if (speciesName == "Hamster (Syrian)") {
		escSpecName = escapeRegExp(String(speciesName));
		//log.info(escSpecName);
		pShortName = pShortName.replaceAll(escSpecName, "XYZ");
	} 

} */

//Note: While Loop 2 - this does not work. The only difference is that there is no hard coded comparison as in previous loop.
while(speciesIter.hasNext()) {
	var species = speciesIter.next();
	var speciesName = species.getValue("SPECIES").getSimpleValue();
		//escSpecName = escapeRegExp(String(speciesName));
		//log.info(escSpecName);
	
		log.info(pShortName);
		pShortName = pShortName.xReplaceAll(speciesName, 'ABC');
}

log.info("Result:" + pName);
log.info("Result:" + pShortName);
}