const mongoose = require("mongoose");
const request = require('supertest');
const expect = require('chai').expect;
const server = require('../server');
const mongooseConnect = require('../mongooseConnect');
const { v4: uuidv4 } = require("uuid");


beforeAll(async(done) => {
    mongooseConnect.connect()
        .once('open', () => done())
        .on('error', (error) => done(error))
});

afterAll(async(done) => {
    mongooseConnect.close()
        .then(() => done())
        .catch((err) => done(err))
});

let newUserProxyID;
let newUserID;

/*
 * User Tests
 */

// POST: /user/register
describe('POST: /user/register', () => {

    test("Register a new user", async(done) => {
        let id = uuidv4();
        let data = { userID: id, name: 'Test Name' };
        request(server).post("/user/register").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                newUserProxyID = response.body.user.proxyID; // Create a new proxyID to use for later tests with fresh data
                newUserID = id; // Create a new userID to use for later tests with fresh data
                expect(response.body.user.userID).to.equal(id);
                expect(response.body.user.name).to.equal(data.name);
                done();
            });
    });

});

/*
 * Domain Tests
 */

describe('PUT: /domain/update', () => {

    test("Updating a new domain's listType", async(done) => {
        let data = { userID: newUserID, listType: "Whitelist", domainName: "facebook.com" };
        request(server).put("/domain/update").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.status).to.equal("Success")
                expect(response.body.domain.domainName).to.equal("facebook.com")
                done();
            });
    });

    test("Updating a domain's listType", async(done) => {
        let data = { userID: newUserID, listType: "Blacklist", domainName: "facebook.com" };
        request(server).put("/domain/update").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.status).to.equal("Success")
                expect(response.body.domain.domainName).to.equal("facebook.com")
                expect(response.body.msg).to.equal("Successfully added domain to Blacklist")
                done();
            });
    });

    test("Updating a domain's listType to an invalid", async(done) => {
        let data = { userID: newUserID, listType: "invalid", domainName: "facebook.com" };
        request(server).put("/domain/update").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.msg).to.equal("invalid is not a valid listType")
                done();
            });
    });
});

describe('POST: /domain/add', () => {

    let listType = "Whitelist"
    let userID = newUserID

    test("Adding a domain", async(done) => {
        let data = {domainID: "ascrafoaivnasf", proxyID: newUserProxyID, url: "cpen391.com"};
        request(server).post(`/domain/add`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.domainID).to.equal("ascrafoaivnasf")
                expect(response.body.domainName).to.equal("cpen391.com")
                done();
            });
    });

    test("Adding a domain", async(done) => {
        let data = {domainID: "akrhgka", proxyID: newUserProxyID, url: "team7.com"};
        request(server).post(`/domain/add`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.domainID).to.equal("akrhgka")
                expect(response.body.domainName).to.equal("team7.com")
                done();
            });
    });
});


describe('GET: /domain/:listType/:userID', () => {

    let listType = "Whitelist"
    let userID = newUserID

    test("Getting a whitelist", async(done) => {
        let data = {};
        request(server).get(`/domain/${listType}/${userID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.status).to.equal("Failed")
                done();
            });
    });
});

/*
 * Activity Tests
 */

// POST: /activity/log/:proxyID
describe('POST: /activity/log/:proxyID', () => {

    // Many tests for valid logs to create data to be used in later tests
    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Blacklist', domainName: '54321.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Blacklist', domainName: '54321.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Blacklist', domainName: 'sfu.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'ubc.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Malicious', domainName: 'fhdns9456v.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Safe', domainName: 'piazza.com', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Blacklist', domainName: '54321.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'facebook.com', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log", async(done) => {
        let data = { data: { listType: 'Undefined', domainName: 'instagram.com', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("invalid list type", async(done) => {
        let data = { data: { listType: 'white', domainName: 'nvdsbvd7.com', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no list type", async(done) => {
        let data = { data: { domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no domain", async(done) => {
        let data = { data: { listType: 'Whitelist', ipAddress: '123.45.32.188' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no ip address", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca' } };
        request(server).post(`/activity/log/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

});

// POST: /activity/allTimeMostRequested/:userID
describe('POST: /activity/allTimeMostRequested/:userID', () => {

    test("valid request", async(done) => {
        let data = { limit: 10 };
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.domains.length).to.equal(8);
                expect(response.body.domains[0].domainName).to.equal("google.ca");
                expect(response.body.domains[0].listType).to.equal("Whitelist");
                expect(response.body.domains[0].num_of_accesses).to.equal(4);
                expect(response.body.domains[1].domainName).to.equal("54321.ca");
                expect(response.body.domains[1].listType).to.equal("Blacklist");
                expect(response.body.domains[1].num_of_accesses).to.equal(3);
                done();
            });
    });

    test("valid request", async(done) => {
        let data = { limit: 2 };
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.domains.length).to.equal(2);
                expect(response.body.domains[0].domainName).to.equal("google.ca");
                expect(response.body.domains[0].listType).to.equal("Whitelist");
                expect(response.body.domains[0].num_of_accesses).to.equal(4);
                expect(response.body.domains[1].domainName).to.equal("54321.ca");
                expect(response.body.domains[1].listType).to.equal("Blacklist");
                expect(response.body.domains[1].num_of_accesses).to.equal(3);
                done();
            });
    });

    test("invalid limit", async(done) => {
        let data = { limit: 0 };
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("no limit", async(done) => {
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .expect(400, done);
    });

    test("valid request, with listType", async(done) => {
        let data = { listTypes: ["Malicious", "Blacklist"], limit: 10 };
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.domains.length).to.equal(3);
                expect(response.body.domains[0].domainName).to.equal("54321.ca");
                expect(response.body.domains[0].listType).to.equal("Blacklist");
                expect(response.body.domains[0].num_of_accesses).to.equal(3);
                done();
            });
    });

    test("invalid listType", async(done) => {
        let data = { listTypes: ["Malicious", "Black"], limit: 10 };
        request(server).post(`/activity/allTimeMostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("user does not exist", async(done) => {
        let data = { listTypes: ["Malicious", "Blacklist"], limit: 10 };
        request(server).post(`/activity/allTimeMostRequested/0011`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(404, done);
    });

});

// POST: /activity/mostRequested/:userID
describe('POST: /activity/mostRequested/:userID', () => {

    test("valid request", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.mostRequested.length).to.equal(8);
                expect(response.body.mostRequested[0].domainName).to.equal("google.ca");
                expect(response.body.mostRequested[0].listType).to.equal("Whitelist");
                expect(response.body.mostRequested[0].count).to.equal(4);
                expect(response.body.mostRequested[1].domainName).to.equal("54321.ca");
                expect(response.body.mostRequested[1].listType).to.equal("Blacklist");
                expect(response.body.mostRequested[1].count).to.equal(3);
                done();
            });
    });

    test("valid request, limit", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z", limit: 1 };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.mostRequested.length).to.equal(1);
                expect(response.body.mostRequested[0].domainName).to.equal("google.ca");
                expect(response.body.mostRequested[0].listType).to.equal("Whitelist");
                expect(response.body.mostRequested[0].count).to.equal(4);
                done();
            });
    });

    test("valid request, listTypes", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z", listTypes: ["Malicious", "Blacklist"] };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.mostRequested.length).to.equal(3);
                expect(response.body.mostRequested[0].domainName).to.equal("54321.ca");
                expect(response.body.mostRequested[0].listType).to.equal("Blacklist");
                expect(response.body.mostRequested[0].count).to.equal(3);
                done();
            });
    });

    test("invalid listType", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z", listTypes: ["Malicious", "black"] };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("invalid limit", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z", limit: -1 };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("startDate and endDate mismatch", async(done) => {
        let now = Date.now();
        let data = { endDate: now, startDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("no user", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/mostRequested/0011`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(404, done);
    });

    test("no data", async(done) => {
        let data = { endDate: "2021-03-01T10:11:36.251Z", startDate: "2021-04-01T10:11:36.251Z" };
        request(server).post(`/activity/mostRequested/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

});

describe('POST: /activity/recent/:userID', () => {

    test("valid request", async(done) => {
        let now = Date.now();
        let data = { startDate: now };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.activities.length).to.equal(13);
                expect(response.body.activities[0].domainName).to.equal("instagram.com");
                expect(response.body.activities[0].listType).to.equal("Undefined");
                expect(response.body.activities[0].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[1].domainName).to.equal("facebook.com");
                expect(response.body.activities[1].listType).to.equal("Whitelist");
                expect(response.body.activities[1].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[12].timestamp).to.equal(response.body.lastEndDate);
                expect(response.body.count).to.equal(13);
                done();
            });
    });

    test("valid request, endDate", async(done) => {
        let now = Date.now();
        let data = { startDate: now, endDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.activities.length).to.equal(13);
                expect(response.body.activities[0].domainName).to.equal("instagram.com");
                expect(response.body.activities[0].listType).to.equal("Undefined");
                expect(response.body.activities[0].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[1].domainName).to.equal("facebook.com");
                expect(response.body.activities[1].listType).to.equal("Whitelist");
                expect(response.body.activities[1].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[12].timestamp).to.equal(response.body.lastEndDate);
                expect(response.body.count).to.equal(13);
                done();
            });
    });

    test("valid request, limit", async(done) => {
        let now = Date.now();
        let data = { startDate: now, limit: 5 };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.activities.length).to.equal(5);
                expect(response.body.activities[0].domainName).to.equal("instagram.com");
                expect(response.body.activities[0].listType).to.equal("Undefined");
                expect(response.body.activities[0].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[1].domainName).to.equal("facebook.com");
                expect(response.body.activities[1].listType).to.equal("Whitelist");
                expect(response.body.activities[1].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[4].timestamp).to.equal(response.body.lastEndDate);
                expect(response.body.count).to.equal(5);
                done();
            });
    });

    test("valid request, listTypes", async(done) => {
        let now = Date.now();
        let data = { startDate: now, listTypes: ["Malicious", "Blacklist"] };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(200).then((response) => {
                expect(response.body.activities.length).to.equal(5);
                expect(response.body.activities[0].domainName).to.equal("54321.ca");
                expect(response.body.activities[0].listType).to.equal("Blacklist");
                expect(response.body.activities[0].ipAddress).to.equal("123.45.32.188");
                expect(response.body.activities[4].timestamp).to.equal(response.body.lastEndDate);
                expect(response.body.count).to.equal(5);
                done();
            });
    });

    test("invalid listTypes", async(done) => {
        let now = Date.now();
        let data = { startDate: now, listTypes: ["Malicious", "black"] };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("invalid limit", async(done) => {
        let now = Date.now();
        let data = { startDate: now, limit: -1 };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("startDate, endDate mismatch", async(done) => {
        let now = Date.now();
        let data = { endDate: now, startDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(400, done);
    });

    test("no data", async(done) => {
        let now = Date.now();
        let data = { startDate: "2021-03-01T10:11:36.251Z" };
        request(server).post(`/activity/recent/${newUserID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(404, done);
    });

    test("no user", async(done) => {
        let now = Date.now();
        let data = { startDate: now };
        request(server).post(`/activity/recent/0011`).set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data))
            .expect(404, done);
    });

});

/*
 * DE1 Tests
 * Note: these are commented out because they do not work unless the DE1 is turned on
 */

// describe('POST: /activity/recent/:userID', () => {

//     test("valid request, existing domain", async(done) => {
//         let data = { domainName: "google.ca", ipAddress: "123.67.32.144" };
//         request(server).post(`/de1/verify/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
//             .send(JSON.stringify(data))
//             .expect(200).then((response) => {
//                 expect(response.body.domain).to.equal("google.ca");
//                 expect(response.body.listType).to.equal("Whitelist");
//                 done();
//             });
//     });

//     test("valid request, new domain", async(done) => {
//         let data = { domainName: "twitter.com", ipAddress: "123.67.32.144" };
//         request(server).post(`/de1/verify/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
//             .send(JSON.stringify(data))
//             .expect(200).then((response) => {
//                 expect(response.body.domain).to.equal("twitter.com");
//                 expect(response.body.listType).to.equal("Safe");
//                 done();
//             });
//     });

//     test("valid request, repeat domain", async(done) => {
//         let data = { domainName: "twitter.com", ipAddress: "123.67.32.144" };
//         request(server).post(`/de1/verify/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
//             .send(JSON.stringify(data))
//             .expect(200).then((response) => {
//                 expect(response.body.domain).to.equal("twitter.com");
//                 expect(response.body.listType).to.equal("Safe");
//                 done();
//             });
//     });

//     test("no domain", async(done) => {
//         let data = { ipAddress: "123.67.32.144" };
//         request(server).post(`/de1/verify/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
//             .send(JSON.stringify(data))
//             .expect(400, done);
//     });

//     test("no ip address", async(done) => {
//         let data = { domainName: "twitter.com" };
//         request(server).post(`/de1/verify/${newUserProxyID}`).set({ Accept: "application/json", "Content-Type": "application/json" })
//             .send(JSON.stringify(data))
//             .expect(400, done);
//     });

// });