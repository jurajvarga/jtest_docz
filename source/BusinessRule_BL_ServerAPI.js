/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_ServerAPI",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_ServerAPI",
  "description" : "API related to server details",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
//To get Step Environment
function getServerEnvironment(){
	var environment="";
	var hostName=java.net.InetAddress.getLocalHost().getHostName();
	var hostNameList = hostName.split("-");
	//added indexof '.' to get test environment ,becoz test has additional text after .
	
	//cst-app-dev-005.stibo.local
	//cst-app2-test.stibo.local
	//cst-app-qa-0cb.stibo.local
	//cst-app-prod-xcd.stibo.local
	if (hostNameList.length>=2){
		var envName=hostNameList[2];
	  if (envName.indexOf('.')!=-1){
	 	 environment= envName.substring(0, envName.indexOf('.'));
	  }else{
	    environment= envName;
	  }
	}else{
		environment="UNKNOWN";
	}
	return environment;
}

//To get Server name mail Subject
function getMailSubjectServerName(){
	var mailSubServerName="";
	var serverName=getServerEnvironment().toUpperCase();
	mailSubServerName="**CST-"+serverName+"**";
	return mailSubServerName;
}


//To get no reply email id based on server
function getNoReplyEmailId(){
	var mailfrom="";
	var serverName=getServerEnvironment();
	mailfrom="noreply+"+serverName+"step@cellsignal.com";
	return mailfrom;
}

//To create URL for vial or plate label preview
// function createLabelURL(node,lookupTableHome,label_type){ // STEP-6273
function createLabelURL(node,lookupTableHome, productNo){ // STEP-6273
	var labelName = node.getValue("PRODUCTSHORTNAME").getSimpleValue()+"";
	var serverName=getServerEnvironment();
	var lookupname=serverName+"-labelpreview-url"
	var serverURL=lookupTableHome.getLookupTableValue("ServerLookupURL",lookupname)
	labelName=labelName.replace(/&/gm,"%26");
	// var path="/ws/simple/getPrintPreview?prodshortname="+labelName+"&labelType="+label_type; // STEP-6273
	var path="/ws/simple/getPrintPreview?prodshortname="+labelName+"&productNo=" + productNo; // STEP-6273
	var previewURL=serverURL+path;
	previewURL=previewURL.replace(/#/gm,"%23");
	previewURL=previewURL.replace(/\+/gm,"%2B");
	log.info("#" + productNo + " labels preview BR for " + node + " previewURL "+previewURL);

	return previewURL;	
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getServerEnvironment = getServerEnvironment
exports.getMailSubjectServerName = getMailSubjectServerName
exports.getNoReplyEmailId = getNoReplyEmailId
exports.createLabelURL = createLabelURL