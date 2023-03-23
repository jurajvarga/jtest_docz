/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RemoveSpecialFromFigFolder",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_RemoveSpecialFromFigFolder",
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
    '&lt;gt/&gt':'>'
   
  
    

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
        '<sup>®</sup>'	: '®',
        '<sup>©</sup>'	: '©',
        '<sup>™</sup>'	: '™',
        '<sup>℠</sup>'	: '℠'

};


//Get Product No & Product Name
var nProduct = node.getParent().getName();
log.info(" nProduct " + nProduct)

//Search for Figure Folder for the Product No
var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
var type = com.stibo.core.domain.Classification;
var searchAttribute = step.getAttributeHome().getAttributeByID("Figure_Key");
var searchValue = nProduct;
var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
var lstProdFolderClass = searchHome.querySingleAttribute(query).asList(1).toArray();


//If found,get Figure folder under the product folder
if (lstProdFolderClass != null) {
    var prodFolderObj = lstProdFolderClass[0];
    //log.info(" No Latest Revision  prodFolderObj " + prodFolderObj);
    if (typeof prodFolderObj !== 'undefined') {
        var productChFigFolders = prodFolderObj.getChildren();
        for (var i = 0; i < productChFigFolders.size(); i++) {
            var fig_folder = productChFigFolders.get(i);
            //log.info(" Figure Name " + fig_folder.getName());
            //log.info(" Figure Name " + fig_folder.getID());
            //Get and Modify for figure caption
            var figCaption = fig_folder.getValue("Figure_Caption").getSimpleValue();
            //log.info(" Figure Caption " + figCaption);
            var figCaptionMod = replaceValueAll(figCaption, map);
            figCaptionMod=String(figCaptionMod).replace(/<p[^>]*>/g,'').replace(/<\/?p[^>]*>/g, "");
            //log.info(" Figure Caption Mod " + figCaptionMod);
            fig_folder.getValue("Figure_Caption").setSimpleValue(figCaptionMod);
           // log.info("------------");
        }
    }

}
}