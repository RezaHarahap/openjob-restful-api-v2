const assert = require('node:assert/strict');
const { createJob, updateJob } = require('../src/validators');

const partialPayload = {
  title: 'Senior Backend Developer Updated',
  description: 'Updated description',
  salary_max: 30000000,
};

assert.ok(createJob.validate(partialPayload).error, 'Create schema must require company_id and category_id');

const partialResult = updateJob.validate(partialPayload);
assert.equal(partialResult.error, undefined, 'Update schema must accept a valid partial payload');
assert.deepEqual(partialResult.value, partialPayload, 'Update schema must not inject defaults into a partial update');

assert.ok(updateJob.validate({}).error, 'Update schema must reject an empty payload');
assert.ok(updateJob.validate({ status: 'invalid' }).error, 'Update schema must reject an invalid status');

console.log('Update job schema checks passed.');
