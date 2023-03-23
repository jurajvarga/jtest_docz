/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateDamObjects",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_CreateDamObjects",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
exports.operation0 = function (node,manager,BL_Library) {
function revisionContainsDamForActiveAsset(manager, revision, activeAsset) {

    var bDamFound = false;

    var damObjects = BL_Library.getRevDAMObjects(revision);
    for (var i = 0; i < damObjects.length; i++) {
        var dam = damObjects[i];

        var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_DAM_Object");
        var refs = dam.queryReferences(refType);

        refs.forEach(function (ref) {
            var target = ref.getTarget()
            //log.info("target: " + target.getID());
            //log.info("activeAsset: " + activeAsset.getID());
            //log.info("target == activeAsset : " + (target.getID() == activeAsset.getID()));
            if (target.getID() == activeAsset.getID()) {
                //log.info("Setting bDamFound to true.");
                bDamFound = true;
                return false;
            }
            return true;
        });
    }

    return bDamFound;
}

function getActiveAsset(figFolder) {
    var assets = figFolder.getAssets().iterator();

    while (assets.hasNext()) {
        var asset = assets.next();
        //STEP-6587
        if (asset.getApprovalStatus() == "Completely Approved"
        		&& asset.getValue("Image_Status").getSimpleValue() == "Active") {
            return asset;
        }
    }
    return null;
}


function retrievePreviousDamObject(figFolder) {

    var assets = figFolder.getAssets().iterator();
    while (assets.hasNext()) {
        var asset = assets.next();


        var damSource;

        var damToAssetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_DAM_Object");
        var damToAssetRefs = asset.queryReferencedBy(damToAssetRefType);

        damToAssetRefs.forEach(function (damToAssetRef) {
            damSource = damToAssetRef.getSource()
            if (damSource) {
                return false;
            }
            return true;
        });

        if (damSource) {
            return damSource;
        }
    }
    return null;
}

function createDamObjects(manager, revision) {

    // webCategory
    var webCategory = revision.getValue("Web_Category").getSimpleValue();
    var productType = revision.getValue("PRODUCTTYPE").getSimpleValue();

    // Uni Prod IDs
    var uniprodIDs = null;
    var modificationTypeList = [];
    var pNameList = [];
    var gNameList = [];
    var targetRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_to_Target");
    var targetRefs = revision.getParent().queryReferences(targetRefType);

    targetRefs.forEach(function (targetRef) {

        var target = targetRef.getTarget();

        //Temporarily commented out due to MVP1 requirements
        /*
        var targetUniprodID = target.getValue("UNIPROT").getSimpleValue();

        if (uniprodIDs && uniprodIDs != "") {
            uniprodIDs += ','
        }
        if (targetUniprodID && targetUniprodID != "") {
            if (!uniprodIDs || uniprodIDs == "") {
                uniprodIDs = targetUniprodID;
            } else {
                uniprodIDs += targetUniprodID;
            }
        }
        */

        var modificationType = target.getValue("MODIFICATION").getSimpleValue();
        modificationType = modificationType != null ? modificationType + "" : "";

        //log.info("modificationTypeList.indexOf(modificationType): " + modificationTypeList.indexOf(modificationType))
        if (modificationType && modificationType != "" && modificationTypeList.indexOf(modificationType) == -1) {
            modificationTypeList.push(modificationType + "");
        }

        var pName = target.getValue("PNAME").getSimpleValue();
        pName = pName != null ? pName + "" : "";

        if (pName && pName != "" && pNameList.indexOf(pName) == -1) {
            pNameList.push(pName + "");
        }

        var gName = target.getValue("GNAMES").getSimpleValue();
        gName = gName != null ? gName + "" : "";

        if (gName && gName != "" && gNameList.indexOf(gName) == -1) {
            gNameList.push(gName + "");
        }

        return true;
    });

    var modificationTypes = modificationTypeList.length != 0 ? modificationTypeList.join(',') : null;
    var pNames = pNameList.length != 0 ? pNameList.join(',') : null;
    var gNames = gNameList.length != 0 ? gNameList.join(',') : null;

    //log.info("uniprodIDs: " + uniprodIDs);
    //log.info("modificationTypes: " + modificationTypes);


    // App tested species
    var appTestedSpecies = {};
    var appGroups = {};

    var revAppProtocolLinkType = revision.getManager().getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    if (!revAppProtocolLinkType) {
        throw "Revision_to_ApplicationProtocol link type not found";
    }
    var revToProtocolLinks = revision.getClassificationProductLinks(revAppProtocolLinkType);
    //log.info("revToProtocolLinks.size(): " + revToProtocolLinks.size())

    for (var i = 0; i < revToProtocolLinks.size(); i++) {
        var link = revToProtocolLinks.get(i);
        var appSpeciesTested = link.getValue("Appl_Species_Tested").getSimpleValue();
        appSpeciesTested = appSpeciesTested != null ? appSpeciesTested + "" : null;
        //log.info("appSpeciesTested: " + appSpeciesTested);

        var app = link.getClassification();
        //log.info("app: " + app.getID());
        var abbrAttr = app.getObjectType().getID() == "Application" ? "APPLICATIONABBR" : "PROTOCOLAPPLICATIONABBR";
        //log.info("abbrAttr: " + abbrAttr);
        var abbr = app.getValue(abbrAttr).getSimpleValue();
        abbr = abbr != null ? abbr + "" : null;
        //log.info("abbr: " + abbr);
        if (abbr) {
            appTestedSpecies[abbr] = appSpeciesTested;
        }

        var appGroup = app.getObjectType().getID() == "Application" ? app.getValue("APPLICATIONGROUP").getSimpleValue() : app.getParent().getValue("APPLICATIONGROUP").getSimpleValue();
        if (appGroup) {
            appGroups[abbr] = appGroup;
        }
    }

    //log.info("appTestedSpecies:");
    //log.info(JSON.stringify(appTestedSpecies));


    // Going through figure folders
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
    var productFolderRefs = revision.queryReferences(refType);

    productFolderRefs.forEach(function (productFolderRef) {
        var productFolder = productFolderRef.getTarget();

        //log.info("productFolder: " + productFolder.getName());

        if (productFolder != null) {
            var figFolders = productFolder.getChildren();

            // every figure folder has it's dam object
            for (var i = 0; i < figFolders.size(); i++) {
                var figFolder = figFolders.get(i);

                //log.info("figFolder: " + figFolder.getName());
                if (figFolder.getValue("Figure_Status").getSimpleValue() == "Inactive"
                    || figFolder.getValue("Figure_Key").getSimpleValue().indexOf("_ds") > 0
                    || !(getActiveAsset(figFolder) && getActiveAsset(figFolder).getObjectType().getID() == "ProductImage")
                    ) continue;

                var activeAsset = getActiveAsset(figFolder);
                //log.info("activeAsset retrieved: " + activeAsset.getID());
                var assetToDamRefType = "Published_DAM_Object";

                //log.info("!revisionContainsDamForActiveAsset(manager, revision, activeAsset): " + !revisionContainsDamForActiveAsset(manager, revision, activeAsset));

                //if (!BL_Library.hasReferencedByLink(manager, activeAsset, assetToDamRefType)) {
                if (!revisionContainsDamForActiveAsset(manager, revision, activeAsset)) {

                    var damObject = revision.createProduct(null, "Digital_Asset_Metadata");
                    log.info("Creating dam object with step id: " + damObject.getID());

                    var damID = null;
                    var previousDam = retrievePreviousDamObject(figFolder);
                    //log.info("previousDam: " + previousDam);

                    if (previousDam) {
                        //var damID = previousDam.getValue("DAM_Media_ID").getSimpleValue();
                        //damObject.getValue("DAM_Media_ID").setSimpleValue(damID);
                        BL_Library.copyAttributes(manager, previousDam, damObject, "DAM_Attributes", null);
                        //log.info("dam media id: " + damObject.getValue("DAM_Media_ID").getSimpleValue());
                    }

                    damObject.createReference(activeAsset, assetToDamRefType);

                    var assetFigKey = activeAsset.getValue("Figure_Key").getSimpleValue();
                    var assetModifiedDate = activeAsset.getValue("Modified_Date").getSimpleValue();
                    var assetApprFigName = activeAsset.getValue("Approved_Figure_Name").getSimpleValue();

                    var figFigCaption = figFolder.getValue("Figure_Caption").getSimpleValue();
                    var figAppType = figFolder.getValue("Figure_Application_Type").getSimpleValue();
                    figAppType = figAppType != null ? figAppType + "" : null;
                    var figGName = figFolder.getValue("GNAMES").getSimpleValue();

                    var applSpeciesTested = null;
                    if (figAppType && Object.keys(appTestedSpecies).indexOf(figAppType) != -1) {
                        applSpeciesTested = appTestedSpecies[figAppType];
                    }

                    var appGroup = null;
                    //log.info("figAppType: " + figAppType);
                    //log.info("Object.keys(appGroups): " + Object.keys(appGroups));

                    if (figAppType && Object.keys(appGroups).indexOf(figAppType) != -1) {
                        appGroup = appGroups[figAppType];
                    }

                    //log.info("appGroup: " + appGroup);

                    //filling DAM attributes
                    damObject.setName(assetFigKey + '_' + assetModifiedDate);
                    damObject.getValue("Web_Category").setSimpleValue(webCategory);
                    damObject.getValue("PRODUCTTYPE").setSimpleValue(productType);
                    //damObject.getValue("UNIPROT").setSimpleValue(uniprodIDs);
                    damObject.getValue("MODIFICATION").setSimpleValue(modificationTypes);
                    damObject.getValue("PNAME").setSimpleValue(pNames);
                    damObject.getValue("GNAMES").setSimpleValue(gNames);

                    damObject.getValue("Figure_Application_Type").setSimpleValue(figAppType);
                    damObject.getValue("Figure_Key").setSimpleValue(assetFigKey);
                    damObject.getValue("Approved_Figure_Name").setSimpleValue(assetApprFigName);

                    damObject.getValue("Figure_Caption").setSimpleValue(figFigCaption);

                    damObject.getValue("APPLICATIONGROUP").setSimpleValue(appGroup);
                   
                    applSpeciesTested =  applSpeciesTested != null ? applSpeciesTested.split("<multisep/>").join(",") : null;
                    applSpeciesTested =  applSpeciesTested != null ? applSpeciesTested.split(";").join(",") : null;
                    damObject.getValue("Appl_Species_Tested").setSimpleValue(applSpeciesTested);

                    //log.info("PNAME: " + damObject.getValue("PNAME").getSimpleValue());
                    //log.info("GANEMS: " + damObject.getValue("GNAMES").getSimpleValue());


                    /*
                    log.info("----*dam");
                    log.info("name: " + damObject.getName());
                    log.info("Web_Category: " + damObject.getValue("Web_Category").getSimpleValue());
                    log.info("PRODUCTTYPE: " + damObject.getValue("PRODUCTTYPE").getSimpleValue());
                    log.info("UNIPROT: " + damObject.getValue("UNIPROT").getSimpleValue());
                    log.info("MODIFICATION: " + damObject.getValue("MODIFICATION").getSimpleValue());

                    log.info("Figure_Application_Type: " + damObject.getValue("Figure_Application_Type").getSimpleValue());
                    log.info("Figure_Key: " + damObject.getValue("Figure_Key").getSimpleValue());
                    log.info("Approved_Figure_Name: " + damObject.getValue("Approved_Figure_Name").getSimpleValue());

                    log.info("Figure_Caption: " + damObject.getValue("Figure_Caption").getSimpleValue());
                    log.info("APPLICATIONGROUP: " + damObject.getValue("APPLICATIONGROUP").getSimpleValue());

                    log.info("Appl_Species_Tested: " + damObject.getValue("Appl_Species_Tested").getSimpleValue());
                    log.info("-----");
                    */
                }

            }
        }
        return true;
    })
}

createDamObjects(manager, node);
}