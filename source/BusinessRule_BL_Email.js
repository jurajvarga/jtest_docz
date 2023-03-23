/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Email",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_Email",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
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
function getEmailsFromGroup(manager, lookupTableHome, lookupTableName, wfInitiatedNo) {
	var grLookupTable = lookupTableHome.getLookupTableValue(lookupTableName, wfInitiatedNo);
	var emailUniquelist = [];

	if (grLookupTable) {
		var recipientGroups = grLookupTable.split(",");

		for (var i = 0 ; i < recipientGroups.length; i++) {
			var groupID = recipientGroups[i];
			var group = manager.getGroupHome().getGroupByID(groupID)
	
			if (group) {
				var groupUsers = group.getUsers().toArray();
				
				for (var j = 0; j < groupUsers.length; j++) {
		            var email = groupUsers[j].getEMail();
						
					if (emailUniquelist.indexOf(email) === -1 && email) {
						emailUniquelist.push(email);
					}	
				}
			}
		}
	}
	
	return emailUniquelist.join(";");
}


/**
 * Generate a html table heading message
 * @param headingArray Array with a heading content
 * @returns tableHeading - a html table heading message
 */
function generateHtmlTableHeading(headingArray) {
    var tableHeading = '<thead style="color:#fff; background-color:#3e7998; border-bottom: 5px solid #235067; border-top: 1px solid #235067">' +
        '<tr>';
    for (var indx = 0; indx < headingArray.length; indx++) {
        tableHeading += '<th style="padding: 5px">' + headingArray[indx] + '</th>';
    }
    tableHeading += '</tr>' + '</thead>';

    return tableHeading;
}


/**
 * Generate a html table row message
 * @param recordArray array or list with a row content
 * @param rowStyle style for a html row <tr> (e.g. 'style="background-color:#eaeaea"')
 * @returns tableRow - a html table row message
 */
function generateHtmlTableRow(recordArray, rowStyle) {
    var tableRow = '<tr ' + rowStyle + '>'
    for (var indx = 0; indx < recordArray.length; indx++) {
        tableRow += '<td style="padding: 5px">' + (recordArray[indx] != null ? recordArray[indx] : "") + '</td>';
    }
    tableRow += '</tr>';

    return tableRow;
}

/**
 * To send an email to users. 
 * @param {*} mailInstance a mail instance, mailHome.mail()
 * @param {*} recipients String, contains recipients emails
 * @param {*} subject String, contains an email subject
 * @param {*} body String, contains an email body
 */
//STEP-6027
function sendEmail(mailInstance, recipients, subject, body) {
	var serverEnv = BL_ServerAPI.getServerEnvironment();
	body += '<br><hr><p style="text-align:center"><sup>© ' + new Date().getFullYear() + '  Cell Signaling Technology, Inc. | Generated from STEP ' + java.net.InetAddress.getLocalHost().getHostName() + '</sup></p>';
	subject = BL_ServerAPI.getMailSubjectServerName() + " " + subject;
	mailInstance.subject(subject);
	mailInstance.from(BL_ServerAPI.getNoReplyEmailId());
	//STEP-6277
    if(serverEnv != "prod") {
        mailInstance.addTo("steptest@cellsignal.com");
        mailInstance.htmlMessage("Would send to: " + recipients + "<br><br><br>" + body);
    }else{
        mailInstance.addTo(recipients);
        mailInstance.htmlMessage(body);
    }
	mailInstance.send();
}
//END STEP-6027


// STEP-6284 SKU not published on web
function notifyEmail(manager, revision) {
    var srv = String(BL_ServerAPI.getServerEnvironment());
    var emailAddress = null;
    switch (srv) {
        case "UNKNOWN":
            break;
        case "prod":
            emailAddress = "stepprod@cellsignal.com";
    }
    if (emailAddress) {
        var mailHome = manager.getHome(com.stibo.mail.home.MailHome);
    } else {
        return;
    }

    var product = revision.getParent();
    if (revision.getValue("PUBLISHED_YN").getSimpleValue() == "Y"
        && product.getValue("DateReleased").getSimpleValue() == "") {
        var emailSubject = "Product " + product.getValue("PRODUCTNO").getSimpleValue() + " not released";
        var emailBody = "On product " + product.getValue("PRODUCTNO").getSimpleValue() + " & revision " + revision.getName() + " was not released.";
        sendEmail(mailHome.mail(), emailAddress, emailSubject, emailBody);
    }

    //STEP-6363 Added Product Status condition for SKUs and Service check for email
    var isServiceRevision = revision.getObjectType().getID().equals("Service_Revision");
    var productStatus = product.getValue("Product_Status").getSimpleValue();
    var isReleased = productStatus == "Released" || productStatus == "Pre-released" || productStatus == "Released - On Hold";
    
    if (revision.getValue("PUBLISHED_YN").getSimpleValue() == "Y" && isReleased && !isServiceRevision) { // End STEP-6363
        var productType = revision.getValue("PRODUCTTYPE").getSimpleValue();

        var skusPublished = false;
        if (productType == "Growth Factors and Cytokines") {
            var mstock = BL_Library.getProductChildren(product, "MasterStock");
            // for all MS
            for (var i = 0; i < mstock.length; i++) {
                var skus = BL_Library.getProductChildren(mstock[i], "SKU");
                // for all SKUs
                var j = 0;
                while (!skusPublished && j < skus.length) {
                    if (skus[j].getValue("PUBLISH_YN").getSimpleValue() == "Y"
                        && skus[j].getValue("ITEMACTIVE_YN").getSimpleValue() == "Y") {
                        skusPublished = true;
                    }
                    j++;
                }
            }
        }
        else {
            var mstock = BL_Library.getMasterStockForRevision(manager, revision);
            var skus = BL_Library.getProductChildren(mstock, "SKU");
            // for all SKUs
            var j = 0;
            while (!skusPublished && j < skus.length) {
                if (skus[j].getValue("PUBLISH_YN").getSimpleValue() == "Y"
                    && skus[j].getValue("ITEMACTIVE_YN").getSimpleValue() == "Y") {
                    skusPublished = true;
                }
                j++;
            }
        }

        if (!skusPublished) {
            var emailSubject = "SKUs not published on web";
            var emailBody = "On product " + product.getValue("PRODUCTNO").getSimpleValue() + " & revision " + revision.getName() + " there was no SKU published on the web";
            sendEmail(mailHome.mail(), emailAddress, emailSubject, emailBody);
        }
    }
    //STEP-6363
    else if (isServiceRevision) {
        var mstockService = BL_Library.getMasterStockForRevision(manager, revision);
        var skusService = BL_Library.getProductChildren(mstockService, "SKU");

        if (skusService.length != 0) {
            var skuArray = [];
            for (var k = 0; k < skusService.length; k++) {
                skuArray.push(skusService[k].getID());
            }
            var emailSubject = "Service SKUs attempted to be sent to web";
            var emailBody = "On product " + product.getValue("PRODUCTNO").getSimpleValue() + " & revision " + revision.getName() + " there was service SKU " + skuArray + " attempted to be sent to web.";
            sendEmail(mailHome.mail(), emailAddress, emailSubject, emailBody);
        }
    }
    //End STEP-6363
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getEmailsFromGroup = getEmailsFromGroup
exports.generateHtmlTableHeading = generateHtmlTableHeading
exports.generateHtmlTableRow = generateHtmlTableRow
exports.sendEmail = sendEmail
exports.notifyEmail = notifyEmail