const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/quality/dashboard');

// Dashboard Overview - SUB-MODULE 1
router.get('/kpis', dashboardController.getKPIs);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
