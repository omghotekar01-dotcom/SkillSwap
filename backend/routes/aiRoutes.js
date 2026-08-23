const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  recommendCollaborators,
  recommendProjects,
  rankResources,
  getAnalytics,
  formTeam,
  summarizeNote,
  detectNoteDuplicates
} = require('../controllers/aiController');

router.get('/recommend/collaborators', protect, recommendCollaborators);
router.get('/recommend/projects', protect, recommendProjects);
router.get('/ranking', protect, rankResources);
router.get('/analytics', protect, getAnalytics);
router.post('/team', protect, formTeam);
router.post('/notes/:id/summary', protect, summarizeNote);
router.post('/notes/:id/plagiarism', protect, detectNoteDuplicates);

module.exports = router;
