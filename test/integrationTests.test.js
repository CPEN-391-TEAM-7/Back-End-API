const mongoose = require("mongoose");
const request = require('supertest');
const expect = require('chai').expect;
const server = require('../server');
const mongooseConnect = require('../mongooseConnect');


beforeAll(async(done) => {
    mongooseConnect.connect("SecurifyTest")
        .once('open', () => done())
        .on('error', (error) => done(error))
});

afterAll(async(done) => {
    mongooseConnect.close()
        .then(() => done())
        .catch((err) => done(err))
});

describe('POST: /log/:proxyID ', () => {

    test("valid log, new domain", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("valid log, domain exists", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(202, done);
    });

    test("invalid list type", async(done) => {
        let data = { data: { listType: 'witelist', domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no list type", async(done) => {
        let data = { data: { domainName: 'google.ca', ipAddress: '123.45.32.188' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no domain", async(done) => {
        let data = { data: { listType: 'Whitelist', ipAddress: '123.45.32.188' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });

    test("no ip address", async(done) => {
        let data = { data: { listType: 'Whitelist', domainName: 'google.ca' } };
        request(server).post("/activity/log/123456789").set({ Accept: "application/json", "Content-Type": "application/json" })
            .send(JSON.stringify(data)).expect(400, done);
    });
})