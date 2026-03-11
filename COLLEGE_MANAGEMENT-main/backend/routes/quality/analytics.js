const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/quality/analytics');

// SUB-MODULE 7: REAL-TIME ANALYTICS
router.get('/comprehensive', analyticsController.getComprehensiveAnalytics);
router.get('/insights', analyticsController.getAIInsights);

module.exports = router;
