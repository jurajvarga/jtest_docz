/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Replace_URL",
  "type" : "BusinessAction",
  "setupGroups" : [ "Production_Post_Refresh_Actions" ],
  "name" : "BA Replace Link URL for SDS and Raw Image",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,lookupTableHome,BL_ServerAPI) {
var nodeObjectType=node.getObjectType().getID();
var destURL = "";
var currentEnvironment = BL_ServerAPI.getServerEnvironment();
var destlookupKey=""
var srclookupKey=""
var key=""
var attributeName=""
var sourceURL = ""
var destURL =""
if (nodeObjectType=="SDS_ASSET_URL_LINK"){
    key="-sdslink-url"
    destlookupKey=currentEnvironment+key
    srclookupKey="prod"+key
    attributeName="SDS_Link_URL"
    sourceURL = lookupTableHome.getLookupTableValue("ServerLookupURL", srclookupKey);
    destURL = lookupTableHome.getLookupTableValue("ServerLookupURL", destlookupKey);
    var curr_sds_link_url = node.getValue(attributeName).getSimpleValue();
    if (curr_sds_link_url!=null){
	    var new_sds_link_url = curr_sds_link_url.replace(sourceURL, destURL);
	    log.info(" new_sds_link_url " + new_sds_link_url);
	    node.getValue(attributeName).setSimpleValue(new_sds_link_url);
    }


}else if (nodeObjectType=="Figure_Folder"){
    key="-labelpreview-url"
    destlookupKey=currentEnvironment+key
    srclookupKey="prod"+key
    attributeName="Figure_Raw_Image_URL"
    sourceURL = lookupTableHome.getLookupTableValue("ServerLookupURL", srclookupKey);
    destURL = lookupTableHome.getLookupTableValue("ServerLookupURL", destlookupKey);

    var figureRawImageURLs=node.getValue(attributeName).getValues();
    for (var vix=0; vix<figureRawImageURLs.size(); vix++) {
        var newFigureRawImageURL=figureRawImageURLs.get(vix).getSimpleValue().replace(sourceURL, destURL);
        figureRawImageURLs.get(vix).setSimpleValue(newFigureRawImageURL)
        
     }

}

log.info(node.getApprovalStatus());
if (node.getApprovalStatus() !="Not in Approved workspace"){
        node.approve();
}


    /*if (currentEnvironment == "dev") {
        destURL = 'https://awsdev-media.cellsignal.com/s3sds/'
    } else if (currentEnvironment == "test") {
        destURL = 'https://awstest-media.cellsignal.com/s3sds/'
    } else if (currentEnvironment == "qa") {
        destURL = 'https://awsqa-media.cellsignal.com/s3sds/'
    } else if (currentEnvironment == "prod") {
        destURL = 'https://media.cellsignal.com/s3sds/'
    }

    var new_sds_link_url = curr_sds_link_url.replace('https://s3.amazonaws.com/aws-mediap.cellsignal.com/Product_SDSs/', destURL)*/

  

    /*var mod_sds_link_url = node.getValue("SDS_Link_URL").getSimpleValue();

    log.info(" mod_sds_link_url " + mod_sds_link_url);*/
}