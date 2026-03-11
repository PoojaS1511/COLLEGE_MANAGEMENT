const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Get admission analytics
router.get('/admission', authenticate, authorize(['admin', 'admission_officer']), analyticsController.getAdmissionAnalytics);

// Get performance analytics
router.get('/performance', authenticate, authorize(['admin', 'faculty']), analyticsController.getPerformanceAnalytics);

// Get marks analytics
router.get('/marks', authenticate, authorize(['admin', 'faculty']), analyticsController.getMarksAnalytics);

// Get resource utilization analytics
router.get('/utilization', authenticate, authorize(['admin', 'facility_manager']), analyticsController.getUtilizationAnalytics);

// Get placement reports
router.get('/reports/placements', authenticate, authorize(['admin', 'placement_officer']), analyticsController.getPlacementReports);

// Get exam reports
router.get('/reports/exams', authenticate, authorize(['admin', 'faculty', 'exam_controller']), analyticsController.getExamReports);

// Get fee reports
router.get('/reports/fees', authenticate, authorize(['admin', 'accountant', 'finance_officer']), analyticsController.getFeeReports);

module.exports = router;
