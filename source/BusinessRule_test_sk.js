/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test_sk",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "test_sk",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
exports.operation0 = function (manager,BL_Library,BL_MaintenanceWorkflows) {


function replaceValueAll(str, map) {
	if (str!=null){
	    for (key in map) {
	    	//log.info(key);
	        str = str.replaceAll(key, map[key]);
	    }
	}

    return str;
}


var map = {
    '&lt;lt/&gt;': '<lt/>',
    '&lt;gt/&gt;': '<gt/>',
    '&amp;': '&',
    '<p>': '',
    '</p>': '',
    '<lt/>': '<',
    '<gt/>': '>',
    '&lt;gt/&gt':'>',
    '&lt;lt/&gt':'<',
    '&lt;br/&gt;':'\n',
    '<br/>':'\n',
    '&amp;quot;':'"'
  
    

};

var strObj=new java.lang.String("This product is the carrier free version of product #" + "3040" + ". All data were generated using the same antibody clone in the standard formulation which contains BSA and glycerol.\\n\\n" +
            "This formulation is ideal for use with technologies requiring specialized or custom antibody labeling, including fluorophores, metals, lanthanides, and oligonucleotides. It is not recommended " +
            "for ChIP, ChIP-seq, CUT&RUN or CUT&Tag assays. If you require a carrier free formulation for chromatin profiling, please <lt/>a href=\"https://www.cellsignal.com/services/carrier-free-and-customized-formulations/custom-formulations-request\" target=\"_blank\" <gt/> contact us<lt/>/a<gt/>. Optimal dilutions/concentrations should be determined by the end user.");


    
var nDirectionforUseMod = replaceValueAll(strObj, map);
log.info(" nDirectionforUseMod "+nDirectionforUseMod);
}