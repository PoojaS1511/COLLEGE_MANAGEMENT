const express = require('express');
const router = express.Router();
const accreditationController = require('../../controllers/quality/accreditation');

// SUB-MODULE 6: ACCREDITATION READINESS REPORTS
router.get('/readiness', accreditationController.getReadinessScore);
router.get('/reports', accreditationController.getAllReports);
router.post('/reports', accreditationController.generateReport);
router.get('/analytics', accreditationController.getAccreditationAnalytics);

module.exports = router;
