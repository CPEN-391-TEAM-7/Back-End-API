const assert = require('assert');
const expect = require('chai').expect;
const de1Helper = require('../routes/helper/de1Helper');

describe('getDomainStatus()', () => {

    it('Should be a safe domain', () => {
        let response = de1Helper.getDomainStatus("google.com0");
        assert.strictEqual(response.listType, "Safe");
        assert.strictEqual(response.domain, "google.com");
    });

    it('Should be a malicious domain', () => {
        let response = de1Helper.getDomainStatus("xcft6.com1");
        assert.strictEqual(response.listType, "Malicious");
        assert.strictEqual(response.domain, "xcft6.com");
    });

    it('Should be a undefined domain', () => {
        let response = de1Helper.getDomainStatus("xcft6.com3");
        assert.strictEqual(response.listType, "Undefined");
        assert.strictEqual(response.domain, "xcft6.com");
    });

    it('Should be a undefined domain', () => {
        let response = de1Helper.getDomainStatus("xcft6.com4");
        assert.strictEqual(response.listType, "Undefined");
        assert.strictEqual(response.domain, "xcft6.com");
    });

    it('Should be an empty list type', () => {
        let response = de1Helper.getDomainStatus("google.com5");
        assert.strictEqual(response.listType, "");
        assert.strictEqual(response.domain, "google.com");
    });

    it('Should be an empty list type', () => {
        let response = de1Helper.getDomainStatus("google.com6");
        assert.strictEqual(response.listType, "");
        assert.strictEqual(response.domain, "google.com");
    });

    it('Should be an empty response', () => {
        let response = de1Helper.getDomainStatus("");
        assert.strictEqual(response.listType, "");
        assert.strictEqual(response.domain, "");
    });

});

describe('createDomain()', () => {

    it('valid domain', () => {
        let response = de1Helper.createDomain("google.com", "Whitelist", "0123456789");
        expect(response).to.be.a('string');
    });

    it('no domain', () => {
        let response = de1Helper.createDomain("Whitelist", "0123456789");
        expect(response).to.equal(null);
    });

    it('no listType', () => {
        let response = de1Helper.createDomain("google.com", "0123456789");
        expect(response).to.equal(null);
    });

    it('no ip address', () => {
        let response = de1Helper.createDomain("google.com", "Whitelist");
        expect(response).to.equal(null);
    });
});