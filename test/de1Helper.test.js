const assert = require('assert');
const de1Helper = require('../routes/helper/de1Helper');

describe('Testing getDomainStatus()', () => {
    it('Should be a safe domain', () => {
        let response = de1Helper.getDomainStatus("google.com0");
        console.log(response.listType);
        assert.strictEqual(response.listType, "Safe");
        assert.strictEqual(response.domain, "google.com");
    });
    it('Should be a malicious domain', () => {
        let response = de1Helper.getDomainStatus("xcft6.com1");
        assert.strictEqual(response.listType, "Malicious");
        assert.strictEqual(response.domain, "xcft6.com");
    });
});