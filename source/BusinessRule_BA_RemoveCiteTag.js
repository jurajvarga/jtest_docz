/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RemoveCiteTag",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_RemoveCiteTag",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BL_CopyRevision,BL_MaintenanceWorkflows,libWF) {
//Dymecki, S.M. et al. (1990) <lt/>cite<gt/>Science<lt/>/cite<gt/> 247, 332-336.
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
         '<lt/>cite<gt/>': '<cite>',
	    '<lt/>/cite<gt/>': '</cite>',
	    '&lt;cite&gt;':'<cite>',
	    '&lt;/cite&gt;':'</cite>',
	       '& lt;cite& gt;':'<cite>',
	    '& lt;/cite& gt;':'</cite>',
	    '<lt/>cite&gt;':'<cite>',
	    '<lt/>/cite&gt;':'</cite>',
	    '<lt/>cite&gt;':'<cite>',
	    '<lt/>/cite&gt;':'</cite>'

};

var pubFormatStr=node.getValue("PUBLICATION_FORMATTEDSTR").getSimpleValue();
//log.info(" pubFormatStr " + pubFormatStr);
var pubFormatStrnMod = replaceValueAll(pubFormatStr, map);
//log.info(" pubFormatStrnMod Mod " + pubFormatStrnMod);
node.getValue("PUBLICATION_FORMATTEDSTR").setSimpleValue(pubFormatStrnMod);

var pubCitationStr=node.getValue("PUBLICATION_CITATION").getSimpleValue();
//log.info(" pubCitationStr " + pubCitationStr);
var pubCitationStrnMod = replaceValueAll(pubCitationStr, map);
//log.info(" pubCitationStrnMod Mod " + pubCitationStrnMod);
node.getValue("PUBLICATION_CITATION").setSimpleValue(pubCitationStrnMod);

var pubTitleStr=node.getValue("PUBLICATION_TITLE").getSimpleValue();
//log.info(" pubTitleStr " + pubTitleStr);
var pubTitleStrnMod = replaceValueAll(pubTitleStr, map);
//log.info(" pubTitleStrnMod Mod " + pubTitleStrnMod);
node.getValue("PUBLICATION_TITLE").setSimpleValue(pubTitleStrnMod);

var pubNameStr=node.getName();
//log.info(" pubNameStr " + pubNameStr);
var pubNameStrnMod = replaceValueAll(pubNameStr, map);
//log.info(" pubNameStrnMod Mod " + pubNameStrnMod);
node.setName(pubNameStrnMod);

// log.info("------------");
}