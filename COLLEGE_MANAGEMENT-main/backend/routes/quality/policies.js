const express = require('express');
const router = express.Router();
const policyController = require('../../controllers/quality/policies');

// SUB-MODULE 5: POLICY COMPLIANCE STATUS
router.get('/', policyController.getAllPolicies);
router.post('/', policyController.addPolicy);
router.put('/:id', policyController.updatePolicy);
router.delete('/:id', policyController.deletePolicy);
router.get('/non-compliant', policyController.getNonCompliantPolicies);
router.get('/due-for-review', policyController.getPoliciesDueForReview);
router.get('/analytics', policyController.getPolicyAnalytics);

module.exports = router;
