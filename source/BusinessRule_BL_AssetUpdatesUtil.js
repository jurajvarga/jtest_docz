/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_AssetUpdatesUtil",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_AssetUpdatesUtil",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
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
//Set values to the Product Folder and Figure Folder attributes (parameter figureFolder is "")
// or only Figure Folder attributes (parameter prodFolder is "")
function setProductandFigureFolderAttr(prodFolder, figureFolder) {

    if (prodFolder != "") {
        //finding attributes from the product
        var prodName = "";
        var prodType = "";
        var prodDevSci = "";
        var prodFastlineFlag = "";
        var prodTeam = "";
        //Changes done for STEP-5612 starts
        var auditInstanceID = prodFolder.getValue("Audit_InstanceID").getSimpleValue();

        //STEP-5929
        var auditMessageIndex = prodFolder.getValue("Audit_Message_Index").getSimpleValue();

        //Changes done for STEP-5612 ends

        var pf2pRefType = prodFolder.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product"); //STEP-6396        
        var byRefs = prodFolder.queryReferencedBy(pf2pRefType); //STEP-6396  
        //STEP-6396
        byRefs.forEach(function(byRef) {
            var bySource = byRef.getSource();
            prodName = bySource.getName();
            prodType = bySource.getValue("PRODUCTTYPE").getSimpleValue();
            prodDevSci = bySource.getValue("DEV_SCI").getSimpleValue();
            prodFastlineFlag = bySource.getValue("Fastlane_YN_Flag").getSimpleValue();
            prodTeam = bySource.getValue("ProdTeam_Planner_Product").getSimpleValue();
            return false;
        });
        //STEP-6396

        //set prodName and prodType to Product Folder attr
        prodFolder.getValue("Figure_Folder_Product_Name").setSimpleValue(prodName);
        prodFolder.getValue("Figure_Folder_Product_Type").setSimpleValue(prodType);
        prodFolder.getValue("Figure_Folder_DevSci").setSimpleValue(prodDevSci);
        prodFolder.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(prodFastlineFlag);
        prodFolder.getValue("Figure_Folder_production_team").setSimpleValue(prodTeam);

        // STEP-6162 copy abbr workflow name from revision to product folder
        var latestRev = getLatestRevisionForProductFolder(prodFolder);
        var abbrWFName = latestRev.getValue("ABBR_WORKFLOW_NAME").getSimpleValue();
        prodFolder.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(abbrWFName);
        // STEP-6162 ends

        //set attr to all its Figure Folders
        var children = prodFolder.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next(); // Figure folder

            child.getValue("Figure_Folder_Product_Name").setSimpleValue(prodName);
            child.getValue("Figure_Folder_Product_Type").setSimpleValue(prodType);
            child.getValue("Figure_Folder_DevSci").setSimpleValue(prodDevSci);
            child.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(prodFastlineFlag);
            child.getValue("Figure_Folder_production_team").setSimpleValue(prodTeam);
            //Changes done for STEP-5612 starts
            child.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
            child.getValue("Audit_Message_Index").setSimpleValue(auditMessageIndex);
            //Changes done for STEP-5612 ends
            child.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(abbrWFName);
        }

    } else if (figureFolder != "") {
        var parent = figureFolder.getParent();
        figureFolder.getValue("Figure_Folder_Product_Name").setSimpleValue(parent.getValue("Figure_Folder_Product_Name").getSimpleValue());
        figureFolder.getValue("Figure_Folder_Product_Type").setSimpleValue(parent.getValue("Figure_Folder_Product_Type").getSimpleValue());
        figureFolder.getValue("Figure_Folder_DevSci").setSimpleValue(parent.getValue("Figure_Folder_DevSci").getSimpleValue());
        figureFolder.getValue("Figure_Folder_Fastlane_YN_Flag").setSimpleValue(parent.getValue("Figure_Folder_Fastlane_YN_Flag").getSimpleValue());
        figureFolder.getValue("Figure_Folder_production_team").setSimpleValue(parent.getValue("Figure_Folder_production_team").getSimpleValue());
        //Changes done for STEP-5612 starts
        figureFolder.getValue("Audit_InstanceID").setSimpleValue(parent.getValue("Audit_InstanceID").getSimpleValue());
        figureFolder.getValue("Audit_Message_Index").setSimpleValue(parent.getValue("Audit_Message_Index").getSimpleValue());
        //Changes done for STEP-5612 ends
        figureFolder.getValue("ABBR_WORKFLOW_NAME").setSimpleValue(parent.getValue("ABBR_WORKFLOW_NAME").getSimpleValue());
    }
}

//Check if exists FF with the status "Change Needed"
function isFFStatusChangeNeeded(productFolder) {

    var changeNeeded = false;
    var children = productFolder.getChildren().iterator();
    while (children.hasNext()) {
        var ff = children.next(); // Figure folder
        if (ff.getValue("Figure_Status").getSimpleValue() == "Change Needed") {
            changeNeeded = true;
            break;
        }
    }
    return changeNeeded;
}

//Check if exists any FF with the status "Pending Review" + blank
function hasFFStatusPendingReview(productFolder) {

    var pendingReview = false;
    var children = productFolder.getChildren().iterator();
    while (children.hasNext()) {
        var ff = children.next(); // Figure folder
        var figureFolderStatus = ff.getValue("Figure_Status").getSimpleValue();  // Figure folder  status
        if (figureFolderStatus == null || figureFolderStatus == "" || figureFolderStatus == "Pending Review"){
            pendingReview = true;
            break;
        }
    }
    return pendingReview;
}

/**
 * Checks if there are only Figure Folders with the status "Inactive" or there are no figure folders in the productFolder
 * @param productFolder Product Folder - parent of figure folders
 * @returns hasInactiveOrNone: true if there are only FF with figure status Inactive or there are no figure folders, otherwise false
 */
function hasOnlyInactiveFFOrEmpty(productFolder) {

    var hasInactiveOrNone = true;
    var children = productFolder.getChildren().iterator();
    while (children.hasNext()) {
        var ff = children.next(); // Figure folder
        if (ff.getValue("Figure_Status").getSimpleValue() != "Inactive") {
            hasInactiveOrNone = false;
            break;
        }
    }
    return hasInactiveOrNone;
}

//START STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration
function updateFigureProtocolName(figFolder, manager) {
    var figProtocolNo = figFolder.getValue("PROTOCOLNO").getSimpleValue();
    // STEP-5808 fix blank value 
    if (figProtocolNo != '' && figProtocolNo != null) {
        var protocolObj = manager.getNodeHome().getObjectByKey("PROTOCOLNO", figProtocolNo);
        if (protocolObj) {
            var protocolName = protocolObj.getValue("PROTOCOLNAME").getSimpleValue();
            figFolder.getValue("Figure_Protocol_Name").setSimpleValue(protocolName);
        }
    } else {
        figFolder.getValue("Figure_Protocol_Name").setSimpleValue('');
    }

}

function updateFigureFolderName(figFolder, prodImage, manager) {
    figFolderName = figFolder.getName();
    if (figFolderName.indexOf("fig") !== -1) {
        updateFigureProtocolName(figFolder, manager)
        newName = generateName(figFolder)
        figFolder.setName(newName);
        if (prodImage != null) {
            var prodImageType = prodImage.getObjectType().getID();
            if (prodImageType.equals("ProductImage") && (newName)) {
                prodImage.setName(newName);
            }
        }
    }
}

function generateName(node) {
    var figAppType = node.getValue("Figure_Application_Type").getSimpleValue();
    var figProtocolNo = node.getValue("PROTOCOLNO").getSimpleValue();

    if (!figAppType) {
        figAppType = "";
    }
    if (!figProtocolNo) {
        figProtocolNo = "";
    }
    curName = node.getName();
    nameFirstPart = curName.substring(0, curName.indexOf("_", curName.indexOf("fig")) + 1);
    newName = new java.lang.StringBuilder(nameFirstPart).append(figAppType).append("_").append(figProtocolNo).toString();

    return newName;
}

function getNumImageStatus(node) {
    var assets = node.getAssets();
    var assetsItr = assets.iterator();
    var cnt = 0;
    var objs = [];

    while (assetsItr.hasNext()) {
        var asset = assetsItr.next();
        var assetObjType = asset.getObjectType().getID();

        if (assetObjType.equals("ProductImage") || assetObjType.equals("Product_DataSheet")) {
            var imageStatus = asset.getValue("Image_Status").getSimpleValue();
            if (imageStatus != null && imageStatus.equals("Active")) {
                cnt++;
                objs.push(asset);
            }
        }
    }

    return {
        cnt: cnt,
        objs: objs
    };
}
//END STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration


// STEP-5991
function getNewFigureFolderName(productFolder, figureFolder, includingApplication, contentType) {
    var newFigFolderName;
    var folderIndex = "01";
    var contentTypeKey = "";
    var index = productFolder.getValue("Figure_Index").getSimpleValue();
    var figureKey = productFolder.getValue("Figure_Key").getSimpleValue();

    if (!figureFolder) { // first figure folder
        contentTypeKey = "fig";
        newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex).append("__").toString();
        return [newFigFolderName, folderIndex, 1];
    }

    var coppiedFigFolderName = figureFolder.getName();

    var actualSumFolders = productFolder.getChildren();
    if (actualSumFolders.size() > parseInt(index)) {
        index = actualSumFolders.size();
    }

    if (!isNaN(index) && index != null) {
        index = parseInt(index) + 1;

        if (index < 10) {
            folderIndex = "0" + index;
        } else {
            folderIndex = index.toString();
        }
    } else {
        index = "1";
        folderIndex = "01";
    }

    if (!figureKey) {
        figureKey = productFolder.getName();
    }

    if (figureFolder.getObjectType().getName() == "Maintenance Documents") {
        contentTypeKey = "fig";
        newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex).append("__").toString();
        return [newFigFolderName, folderIndex, index];
    }

    if (contentType && contentType == "ds") {
        contentTypeKey = "ds";
        newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex).append("__").toString();
        return [newFigFolderName, folderIndex, index];
    }

    if (coppiedFigFolderName.indexOf("fig") !== -1) {
        contentTypeKey = "fig";

        if (includingApplication) {
            var figAppType = figureFolder.getValue("Figure_Application_Type").getSimpleValue();
            var protocol = figureFolder.getValue("PROTOCOLNO").getSimpleValue();

            if (!figAppType) {
                figAppType = "";
            }

            if (!protocol) {
                protocol = "";
            }

            newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex).append("_").append(figAppType).append("_").append(protocol).toString();
        } else {
            newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex).append("__").toString();
        }
    } else if (coppiedFigFolderName.indexOf("ds") !== -1) {
        contentTypeKey = "ds";
        newFigFolderName = new java.lang.StringBuilder(figureKey).append("_").append(contentTypeKey).append(folderIndex);
    }

    return [newFigFolderName, folderIndex, index];
}


function resetFigureIndex(productFolder) {
    var maxFigureKey = productFolder.getValue("Figure_Index").getSimpleValue();
    var figureFolderQuery = productFolder.queryChildren();

    figureFolderQuery.forEach(function (childObj) {
        var ffName = childObj.getName();

        if (ffName.indexOf("fig") !== -1) {
            var regexFigureKey = /[0-9]*_fig([0-9]*).*/gi;
            var usedFolderIndex = regexFigureKey.exec(ffName);

            if (usedFolderIndex && usedFolderIndex[1]) {
                if (maxFigureKey < parseInt(usedFolderIndex[1])) {
                    maxFigureKey = parseInt(usedFolderIndex[1]);
                }
            }
        }

        return true;
    });

    productFolder.getValue("Figure_Index").setSimpleValue(maxFigureKey);
}
// End STEP-5991


/**
 * To retrieve latest revision referencing to the product folder prodFolder
 * @param prodFolder Product Folder STEP classification object
 * @returns latest Product/Kit/Equipment/Service Revision refering to the product folder classification object, returns null if not found
 */
function getLatestRevisionForProductFolder(prodFolder) {

    var pf2prRefType = prodFolder.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision"); //STEP-6396
    var byRefs = prodFolder.queryReferencedBy(pf2prRefType);   //STEP-6396
    var latestRevNo = -1;
    var latestRev = null;
    //STEP-6396
    byRefs.forEach(function(byRef) {
        var rev = byRef.getSource();
        var revNo = rev.getValue("REVISIONNO").getSimpleValue();

        if (revNo > latestRevNo) {
            latestRevNo = revNo;
            latestRev = rev;
        }
        return true;
    });
    //STEP-6396

    return latestRev;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setProductandFigureFolderAttr = setProductandFigureFolderAttr
exports.isFFStatusChangeNeeded = isFFStatusChangeNeeded
exports.hasFFStatusPendingReview = hasFFStatusPendingReview
exports.hasOnlyInactiveFFOrEmpty = hasOnlyInactiveFFOrEmpty
exports.updateFigureProtocolName = updateFigureProtocolName
exports.updateFigureFolderName = updateFigureFolderName
exports.generateName = generateName
exports.getNumImageStatus = getNumImageStatus
exports.getNewFigureFolderName = getNewFigureFolderName
exports.resetFigureIndex = resetFigureIndex
exports.getLatestRevisionForProductFolder = getLatestRevisionForProductFolder