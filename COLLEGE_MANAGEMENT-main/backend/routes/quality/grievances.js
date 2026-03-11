const express = require('express');
const router = express.Router();
const grievanceController = require('../../controllers/quality/grievances');

// SUB-MODULE 4: GRIEVANCE REPORTS
router.get('/', grievanceController.getAllGrievances);
router.post('/', grievanceController.submitGrievance);
router.put('/:id', grievanceController.updateGrievance);
router.delete('/:id', grievanceController.deleteGrievance);
router.get('/analytics', grievanceController.getGrievanceAnalytics);

module.exports = router;
