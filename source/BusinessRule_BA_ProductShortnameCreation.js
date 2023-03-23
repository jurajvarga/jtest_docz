/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProductShortnameCreation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Product Shortname Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BL_Library) {
// STEP-6066 partly refactored entire BR
function replaceAll(str, map, ignoreCase) {
    for (key in map) {
        if (ignoreCase) {
            str = str.replaceAll("(?i)\\b" + key + "\\b", map[key]);
        } else {
            str = str.replaceAll("\\b" + key + "\\b", map[key]);
        }
    }
    return str.replace('  ', ' ');
}

function replaceWithChar(str, re, replacement) {
    //Ravi --> update this function so that lysis doesn't get replaced with Kis
    while ((index = str.indexOf(re)) != -1) {
        var part = str.substring(0, index);
        part = part + replacement;
        var startIndex = index + re.length;
        part = part + str.substring(startIndex);
        str = part;
    }
    return new java.lang.String(str);
}


var productType = node.getValue("PRODUCTTYPE").getSimpleValue();
var pHostSpecies = node.getValue("Host_Species_Name").getSimpleValue();
var isPolyclonal = productType != null && productType == "Polyclonal Antibody";
var isMonoclonal = productType != null && productType == "Monoclonal Antibody";
var isKit = productType != null && productType.contains("Kit");
var hasHostSpecies = pHostSpecies != null && pHostSpecies.length() > 0;
var productName = node.getValue("PRODUCTNAME").getSimpleValue();
var conjugationType = node.getValue("CONJUGATION_TYPE").getSimpleValue();


//If Host Species is not available or product type is not Polyclonal or Monoclonal, do nothing
if ((isPolyclonal || isMonoclonal) && !hasHostSpecies) {
    if (!hasHostSpecies) {
        log.info(" Skipping shortname creation for isPolyclonal: " + isPolyclonal + " isMonoclonal: " + isMonoclonal + " hasHostSpecies: " + hasHostSpecies);
    }
} else {
    var conjugateFlag = node.getValue("CONJUGATEFLAG_YN").getSimpleValue();
    var shortProductName = productName.replace("F\(ab\'\)", 'Fab');

    if ((isPolyclonal || isMonoclonal) && (productName.contains("Detection") || productName.contains("Capture") || productName.contains("HRP-linked") || productName.contains("Microwells"))) {
        shortProductName = productName;
    } else {
        //Ravi --> the word conjugate isn't being replaced for product type detection system and miscellaneous.
        var map = {
            'Monoclonal Antibody': '',
            //'Conjugate' 			: '',
            'mAb': '',
            'Ab': '',
            'Phospho': 'P',
            'PhosphoPlus': 'PPlus',
            'Ser': 'S',
            'Thr': 'T',
            'Tyr': 'Y',
            'Lys': 'K',
            'Asp': 'D',
            'Fluor': ''
        };

        shortProductName = replaceAll(shortProductName, map, true);

        var fullSpeciesName = null;
        map = {};
        var speciesIter = step.getEntityHome().getEntityByID("Species_Root").getChildren().iterator();
        while (speciesIter.hasNext()) {
            var species = speciesIter.next();
            var speciesName = species.getValue("SPECIES").getSimpleValue();
            var speciesCode = species.getValue("SPECIESCODE").getSimpleValue();
            if (speciesName) {
                map[speciesName] = '';
                if (speciesName == pHostSpecies) {
                    if (productType == 'Growth Factors and Cytokines' && speciesName == 'E. Coli') {
                        fullSpeciesName = null;
                    } else {
                        fullSpeciesName = speciesName;
                    }
                }
            }
        }

        //Blank out species names if producttype not of type "Growth Factors and Cytokines" or "Antibody Sampler Kit"
        if (productType != null && (isKit || productType == 'Growth Factors and Cytokines' || productType == 'Cell Extracts' || productType == 'siRNA')) {
            log.info("Skipping step 6 for Growth Factors and Cytokines and any Kits");
        }
        else {
            if (!(isPolyclonal && conjugateFlag == 'Y')) {
                shortProductName = replaceAll(shortProductName, map, false);
                log.info("After step 6 " + shortProductName + " --- Species: " + fullSpeciesName + " --- productType: " + productType + " conjugateFlag: " + conjugateFlag);
            }
            else {
                log.info("Skipping step 6 for productType: " + productType + " conjugateFlag: " + conjugateFlag);
            }
        }

        if (fullSpeciesName != null && fullSpeciesName.length() > 0) {
            if (!(isMonoclonal || isPolyclonal)) {
                shortProductName = new java.lang.String(shortProductName + " " + fullSpeciesName);
            }
            else if (isMonoclonal && conjugateFlag != null && conjugateFlag.length() > 0) { // Removing condition since this isn't consistent in PDP && conjugateFlag !='N' ) {
                shortProductName = new java.lang.String(shortProductName + " " + fullSpeciesName);
            }
        }

        if (isPolyclonal) {
            shortProductName = shortProductName.replaceAll("(?i)\\bAntibody\\b", "");
            shortProductName = shortProductName.trim() + " Rabbit Ab";
        } else if (isMonoclonal) {
            logger.info("is monoclonal" + shortProductName);
            shortProductName = shortProductName.replaceAll("(?i)\\bMonoclonal Antibody\\b", "");
            shortProductName = shortProductName.trim() + " mAb";
            logger.info("is monoclonal" + shortProductName);
        } else {
            shortProductName = shortProductName.replaceAll("(?i)\\bAntibody\\b", "Ab");
        }

        var shortProductNameTemp = replaceWithChar(shortProductName, "(PE Conjugate)", " ");
        if (shortProductNameTemp != shortProductName) {
            shortProductName = replaceWithChar(shortProductName, "(PE Conjugate)", " ") + " (PE)";
        }

        shortProductNameTemp = replaceWithChar(shortProductName, "PE Conjugate", " ");
        if (shortProductNameTemp != shortProductName) {
            shortProductName = replaceWithChar(shortProductName, "PE Conjugate", " ") + " (PE)";
        }

        shortProductNameTemp = replaceWithChar(shortProductName, "Conjugate", "");
        if (shortProductNameTemp != shortProductName) {
            shortProductName = replaceWithChar(shortProductName, "Conjugate", "");
        }

        // BSA and Azide Free STEP-5883
        shortProductNameTemp = replaceWithChar(shortProductName, "(BSA and Azide Free)", "");
        if (shortProductNameTemp != shortProductName) {
            shortProductName = replaceWithChar(shortProductName, "(BSA and Azide Free)", "") + " (BSA and Azide Free)";
        }

        //STEP-6113
        if(productType != null && productType == "ELISA Kit" && shortProductName.startsWith("PathScan")){
            shortProductName = shortProductName.replaceAll("Sandwich", "");
            shortProductName = shortProductName.trim() + " 4C Reagents";
        }

        log.info("After step 7 " + shortProductName);

        if (conjugationType != null && conjugationType != '' && BL_Library.isItemInArray(["magnetic bead", "magnetic beads", "sepharose", "alexa", "hrp", "terminal antigen", "biotinylated"], conjugationType.toLowerCase()) == false) { //STEP-6182
            var regExp = /\(([^)]+)\)/g;
            var matches = shortProductName.match(regExp);
            if (matches != null) {
                for (var i = 0; i < matches.length; i++) {
                    var str = matches[i];
                    var stringOfBracket = str.substring(1, str.length - 1);
                    var stringOfBracketRep = str.substring(0, str.length);
                    var stringOfBracke2t = stringOfBracket.replace(conjugationType, '');

                    if (stringOfBracket != stringOfBracke2t) {
                        shortProductName = shortProductName.replace(stringOfBracketRep, '');
                        shortProductName = shortProductName + ' ' + stringOfBracket;
                        log.info('--- ' + shortProductName);
                    }
                }
            }
        }

        shortProductName = replaceWithChar(shortProductName, "<lt/>sup<gt/>", "");
        shortProductName = replaceWithChar(shortProductName, "<lt/>/sup<gt/>", "");
        shortProductName = replaceWithChar(shortProductName, "<sup>", "");
        shortProductName = replaceWithChar(shortProductName, "</sup>", "");
        shortProductName = replaceWithChar(shortProductName, "Ser", "S");
        shortProductName = replaceWithChar(shortProductName, "Thr", "T");
        shortProductName = replaceWithChar(shortProductName, "Tyr", "Y");
        shortProductName = replaceWithChar(shortProductName, "Lys", "K");
        shortProductName = replaceWithChar(shortProductName, "Asp", "D");
        shortProductName = replaceWithChar(shortProductName, "α", "-alpha-");
        shortProductName = replaceWithChar(shortProductName, "ά", "-alpha-");
        shortProductName = replaceWithChar(shortProductName, "Α", "-alpha-");
        shortProductName = replaceWithChar(shortProductName, "Ά", "-alpha-");
        shortProductName = replaceWithChar(shortProductName, "β", "-beta-");
        shortProductName = replaceWithChar(shortProductName, "ϐ", "-beta-");
        shortProductName = replaceWithChar(shortProductName, "Β", "-beta-");
        shortProductName = replaceWithChar(shortProductName, "γ", "-gamma-");
        shortProductName = replaceWithChar(shortProductName, "Γ", "-gamma-");
        shortProductName = replaceWithChar(shortProductName, "δ", "-delta-");
        shortProductName = replaceWithChar(shortProductName, "Δ", "-delta-");
        shortProductName = replaceWithChar(shortProductName, "ε", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "έ", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "ϵ", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "϶", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "Ε", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "Έ", "-epsilon-");
        shortProductName = replaceWithChar(shortProductName, "ζ", "-zeta-");
        shortProductName = replaceWithChar(shortProductName, "Ζ", "-zeta-");
        shortProductName = replaceWithChar(shortProductName, "η", "-eta-");
        shortProductName = replaceWithChar(shortProductName, "ή", "-eta-");
        shortProductName = replaceWithChar(shortProductName, "Η", "-eta-");
        shortProductName = replaceWithChar(shortProductName, "Ή", "-eta-");
        shortProductName = replaceWithChar(shortProductName, "θ", "-theta-");
        shortProductName = replaceWithChar(shortProductName, "ϑ", "-theta-");
        shortProductName = replaceWithChar(shortProductName, "Θ", "-theta-");
        shortProductName = replaceWithChar(shortProductName, "ϴ", "-theta-");
        shortProductName = replaceWithChar(shortProductName, "ι", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "ί", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "ϊ", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "ΐ", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "Ι", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "Ϊ", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "Ί", "-iota-");
        shortProductName = replaceWithChar(shortProductName, "κ", "-kappa-");
        shortProductName = replaceWithChar(shortProductName, "Κ", "-kappa-");
        shortProductName = replaceWithChar(shortProductName, "λ", "-lambda-");
        shortProductName = replaceWithChar(shortProductName, "Λ", "-lambda-");
        shortProductName = replaceWithChar(shortProductName, "μ", "-mu-");
        shortProductName = replaceWithChar(shortProductName, "Μ", "-mu-");
        shortProductName = replaceWithChar(shortProductName, "ν", "-nu-");
        shortProductName = replaceWithChar(shortProductName, "Ν", "-nu-");
        shortProductName = replaceWithChar(shortProductName, "ξ", "-xi-");
        shortProductName = replaceWithChar(shortProductName, "Ξ", "-xi-");
        shortProductName = replaceWithChar(shortProductName, "ο", "-omicron-");
        shortProductName = replaceWithChar(shortProductName, "ό", "-omicron-");
        shortProductName = replaceWithChar(shortProductName, "Ο", "-omicron-");
        shortProductName = replaceWithChar(shortProductName, "Ό", "-omicron-");
        shortProductName = replaceWithChar(shortProductName, "π", "-pi-");
        shortProductName = replaceWithChar(shortProductName, "ϖ", "-pi-");
        shortProductName = replaceWithChar(shortProductName, "Π", "-pi-");
        shortProductName = replaceWithChar(shortProductName, "ρ", "-rho-");
        shortProductName = replaceWithChar(shortProductName, "Ρ", "-rho-");
        shortProductName = replaceWithChar(shortProductName, "σ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "ς", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "ϲ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "ͻ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "ͼ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "ͽ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "Σ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "Ϲ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "Ͻ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "Ͼ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "Ͽ", "-sigma-");
        shortProductName = replaceWithChar(shortProductName, "τ", "-tau-");
        shortProductName = replaceWithChar(shortProductName, "Τ", "-tau-");
        shortProductName = replaceWithChar(shortProductName, "υ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "ϋ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "ύ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "ΰ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "ϒ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "Υ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "Ϋ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "Ύ", "-upsilon-");
        shortProductName = replaceWithChar(shortProductName, "φ", "-phi-");
        shortProductName = replaceWithChar(shortProductName, "ϕ", "-phi-");
        shortProductName = replaceWithChar(shortProductName, "Φ", "-phi-");
        shortProductName = replaceWithChar(shortProductName, "χ", "-chi-");
        shortProductName = replaceWithChar(shortProductName, "Χ", "-chi-");
        shortProductName = replaceWithChar(shortProductName, "ψ", "-psi-");
        shortProductName = replaceWithChar(shortProductName, "Ψ", "-psi-");
        shortProductName = replaceWithChar(shortProductName, "ω", "-omega-");
        shortProductName = replaceWithChar(shortProductName, "ώ", "-omega-");
        shortProductName = replaceWithChar(shortProductName, "Ω", "-omega-");
        shortProductName = replaceWithChar(shortProductName, "Ώ", "-omega-");
        shortProductName = replaceWithChar(shortProductName, "©", "(c)");
        shortProductName = replaceWithChar(shortProductName, "™", "(tm)");
        shortProductName = replaceWithChar(shortProductName, "®", "(R)");
        shortProductName = replaceWithChar(shortProductName, "℠", "(sm)");

        log.info("After steps 1,2,3,4,5 " + shortProductName);

        shortProductName = shortProductName.replaceAll("\\<.*?\\>", '');
        shortProductName = shortProductName.replaceAll(" ", " "); //Removing a special invisible character
        shortProductName = shortProductName.replaceAll("\\s+", " "); //Replacing multiple spaces with 1
        shortProductName = shortProductName.replace("--", '-');
        shortProductName = shortProductName.replace("- ", ' ');
        shortProductName = shortProductName.replace(" -", ' ');
        shortProductName = shortProductName.replace(" \)", '\)');
        shortProductName = shortProductName.replace(" \(R\)", '\(R\)');
        shortProductName = shortProductName.replace("-\)", '\)');
        shortProductName = shortProductName.replace("-\(", '\(');
        shortProductName = shortProductName.replace("-/-", '/');
        shortProductName = shortProductName.replace("()", '');
        shortProductName = shortProductName.replace('  ', ' '); //Replacing two spaces with 1
        shortProductName = shortProductName.replace('  ', ' '); //Replacing two spaces with 1

        if (shortProductName != null) {
            if (shortProductName.indexOf('-') == 0) {
                shortProductName = shortProductName.substring(1); //Clear the first character, if it is a - 
            }
        }
        if (shortProductName != null) {
            if (shortProductName.indexOf(' ') == 0) {
                log.info("Found space at " + shortProductName.indexOf(' '));
                shortProductName = shortProductName.substring(1); //Clear the first character, if it is a space
            }
        }

        log.info("After step 9 :" + shortProductName);

        // STEP-5821
        // STEP-6182 regex change and splitted into two separate search/replace regexs
        if (shortProductName != null) {
            var myMatch = shortProductName.match(/\((magnetic beads?|sepharose|alexa|hrp|terminal antigen|biotinylated).*\)/gi);

            if (myMatch) {
                myMatch = myMatch.toString();
                shortProductName = (shortProductName.replace(myMatch, "").trim() + " " + myMatch).trim();
                shortProductName = shortProductName.replace('  ', ' ');
            }

            var myMatch2 = shortProductName.match(/amino|carboxy/gi);

            if (myMatch2) {
            	 myMatch2 = myMatch2.toString()
            	 var abbreviatedPrefix;
                var temp = myMatch2.toString().toLowerCase();

                switch (temp) {
                    case "amino":
                        abbreviatedPrefix = myMatch2.replace(myMatch2, "N");
                        break;
                    case "carboxy":
                        abbreviatedPrefix = myMatch2.replace(myMatch2, "C");
                        break;
                    default:
                        break;
                }

             if (typeof abbreviatedPrefix !== 'undefined'  && abbreviatedPrefix!="undefined"){
                shortProductName = shortProductName.replace(myMatch2, abbreviatedPrefix).trim();
             }
                shortProductName = shortProductName.replace('  ', ' ');
            }
        }
    }

    // STEP-5983
    if (shortProductName && String(shortProductName).length > 150) {
        log.info('too long short name, trim to 150 chars');
        shortProductName = shortProductName.substring(0, 150);
    }

    shortProductName = shortProductName.trim();

    log.info("After step 10 :" + shortProductName);
    node.getValue("PRODUCTSHORTNAME").setSimpleValue(shortProductName);
}
}