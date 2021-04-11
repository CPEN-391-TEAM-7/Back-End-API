const { v4: uuidv4 } = require('uuid');

const Activity = require('../../models/activity.model');
const Domain = require('../../models/domain.model');

/* 
 * @desc Get the status of a domain from the DE1
 * @param domainName: the domain to verify
 * @return The formatted reponse message
 */
function getDomainStatus(domainStatus) {
    console.log(`getDomainStatus(${domainStatus})`);

    const domainResponse = {};
    let status = "";

    if (domainStatus) {
        console.log("DE1: ", domainStatus);
        // DE1 response in the format: "domain.com1" needs to be separated
        domainStatus = domainStatus.trim(); // trim white space and new lines
        domainResponse.domain = domainStatus.substr(0, domainStatus.length - 1);
        status = domainStatus.substr(domainStatus.length - 1);

    } else {
        domainResponse.domain = "";
    }

    // Set response to return list type for activity logging and updating/creating domain objects
    if (status === "0") {
        domainResponse.listType = "Safe";

    } else if (status === "1") {
        domainResponse.listType = "Malicious";

    } else if (status === "3" || status === "4") {
        console.log("Domain error status:", status);
        domainResponse.listType = "Undefined";

    } else if (status === "5" || status === "6") {
        console.log("DE1 error status:", status);
        domainResponse.listType = "";

    } else {
        domainResponse.listType = "";
    }

    return domainResponse;
}

/* 
 * @desc Create a new domain object in the DB
 * @param domainName: the domain 
 * @param listType: the list the domain will be put on
 * @param proxy: the proxy's ID
 * @return The ID of the domain object
 */
function createDomain(domainName, listType, proxy) {
    console.log(`createDomain(${domainName}, ${listType}, ${proxy})`);
    const id = uuidv4();

    const newDomain = new Domain({
        domainID: id,
        proxyID: proxy,
        domainName: domainName,
        listType: listType,
        num_of_accesses: 1,
    });

    newDomain
        .save()
        .catch((err) => {
            console.log("Error creating domain:", err);
        });

    return id;
}

/* 
 * @desc Update the domain's list type and increment number of accesses
 * @param domainID: the domain's ID
 * @param domainName: the domain 
 * @param domainListType: the list to update the domain to
 * @param proxy: the proxy's ID
 */
function updateListTypeAndIncrement(domainID, domainName, proxy, domainListType) {
    console.log(`updateListTypeAndIncrement(${domainID}, ${domainName}, ${proxy}, ${domainListType})`);
    const filter = {
        domainID: domainID,
        proxyID: proxy,
        domainName: domainName
    }

    const update = {
        listType: domainListType,
    };

    Domain.findOneAndUpdate(filter, update, function(err, domain) {
            // Increment the number of accesses
            let count = domain.num_of_accesses;
            domain.num_of_accesses = count + 1;

            domain
                .save()
                .catch((err) => {
                    console.log("Error updating domain:", err);
                });
        })
        .catch((err) => {
            console.log("Error updating domain:", err);
        });
}

/* 
 * @desc Create a new activity based on the domain request
 * @param domainID: the domain's ID
 * @param domainName: the domain 
 * @param domainListType: the list to update the domain to
 * @param proxy: the proxy's ID
 */
function createActivityRecord(domainID, domainName, proxy, domainListType, ipAddress) {
    console.log(`createActivityRecord(${domainID}, ${domainName}, ${proxy}, ${domainListType}, ${ipAddress})`);
    const id = uuidv4();
    const now = Date.now();

    const newActivity = new Activity({
        activityID: id,
        domainID: domainID,
        domainName: domainName,
        proxyID: proxy,
        timestamp: now,
        listType: domainListType,
        ipAddress: ipAddress
    });

    newActivity
        .save()
        .catch((err) => {
            console.log("Error creating activity record:", err);
        });
}

module.exports = { getDomainStatus, createDomain, updateListTypeAndIncrement, createActivityRecord }