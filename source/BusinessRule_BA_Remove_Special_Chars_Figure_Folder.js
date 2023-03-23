/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Remove_Special_Chars_Figure_Folder",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA Remove Special Chars Figure Folder",
  "description" : "Remove Special Chars from Product  and Figure Objects",
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
    '<br/>':'\n'
  
    

};

//To Remove Superscript
var mapremovesup = {
         '&lt;lt/&gt;': '<lt/>',
	    '&lt;gt/&gt;': '<gt/>',
	    '&amp;': '&',
	    '<p>': '',
	    '</p>': '',
	    '<lt/>': '<',
	    '<gt/>': '>',
	    '&lt;gt/&gt':'>',
	    '&lt;lt/&gt':'<',
        '<sup>®</sup>'	: '®',
        '<sup>©</sup>'	: '©',
        '<sup>™</sup>'	: '™',
        '<sup>℠</sup>'	: '℠'

};


var fig_folder = node;
var figCaption = fig_folder.getValue("Figure_Caption").getSimpleValue();
var figCaptionMod = replaceValueAll(figCaption, map);
log.info(" Figure Caption " + figCaptionMod);
figCaptionMod=String(figCaptionMod).replace(/<p[^>]*>/g,'').replace(/<\/?p[^>]*>/g, "");
//fig_folder.getValue("Figure_Caption").setSimpleValue(figCaptionMod);
fig_folder.getValue("Figure_Caption").setSimpleValue("My String-123 <div> abc </div>");

}