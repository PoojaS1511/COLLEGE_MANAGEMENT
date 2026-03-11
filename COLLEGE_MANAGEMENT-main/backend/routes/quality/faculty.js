const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/quality/faculty');

// SUB-MODULE 2: FACULTY PERFORMANCE DATA
router.get('/', facultyController.getAllFaculty);
router.post('/', facultyController.addFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);
router.get('/analytics', facultyController.getFacultyAnalytics);

module.exports = router;
