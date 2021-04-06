const assert = require('assert');
const de1Helper = require('../routes/helper/de1Helper');

describe('Testing getDomainStatus()', () => {
    it('Safe Domain', () => {
        let response = de1Helper.getDomainStatus("google.com0");
        assert(response.listType, "Safe");
        assert(response.domain, "google.com");
    });
    it('Malicious Domain', () => {
        let response = de1Helper.getDomainStatus("xcft6.com1");
        assert(response.listType, "Malicious");
        assert(response.domain, "xcft6.com");
    });
});