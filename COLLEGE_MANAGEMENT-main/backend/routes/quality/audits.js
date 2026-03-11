const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/quality/audits');

// SUB-MODULE 3: AUDIT RECORDS
router.get('/', auditController.getAllAudits);
router.post('/', auditController.createAudit);
router.put('/:id', auditController.updateAudit);
router.delete('/:id', auditController.deleteAudit);
router.get('/overdue', auditController.getOverdueAudits);
router.get('/analytics', auditController.getAuditAnalytics);

module.exports = router;
