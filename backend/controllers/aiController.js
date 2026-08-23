const User = require('../models/User');
const Note = require('../models/Note');
const Service = require('../models/Service');
const { isValidId } = require('../utils/helpers');

const stopWords = new Set([
  'the','and','for','with','that','this','from','your','have','been','will','using','student','students',
  'college','campus','project','projects','notes','design','coding','service','services','learn','study'
]);

const normalizeText = text => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const makeWordSet = text => new Set((normalizeText(text).match(/\b[a-z0-9]{3,}\b/g) || [])
  .filter(word => !stopWords.has(word)));

const computeTrustScore = user => {
  if (!user) return 0;
  const rating = Number(user.rating || 0);
  const reviews = Number(user.totalReviews || 0);
  const activity = Number(user.activity || 0);
  const collaborations = Number(user.collaborations || 0);
  const speed = Number(user.responseSpeed == null ? 48 : user.responseSpeed);
  const reports = Number(user.reports || 0);

  let score = 30;
  score += Math.min(18, rating * 3.6);
  score += Math.min(18, reviews * 0.9);
  score += Math.min(16, activity * 0.6);
  score += Math.min(14, collaborations * 1.2);
  score += Math.max(0, 15 - speed * 0.25);
  score -= reports * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const overlapScore = (setA, setB) => {
  if (!setA.size || !setB.size) return 0;
  const intersection = [...setA].filter(x => setB.has(x)).length;
  return intersection / Math.max(setA.size, setB.size);
};

const getFocusKeywords = role => {
  if (!role) return ['code','developer','programming','design','ux','ui','edit','write','content'];
  const map = {
    coder: ['code','developer','programming','javascript','python','react','backend','frontend'],
    designer: ['design','ux','ui','figma','photoshop','illustrator','prototype','visual'],
    editor: ['edit','writing','proofread','content','blog','copy','document','draft']
  };
  return map[role.toLowerCase()] || map['coder'];
};

const calculateUserMatch = (candidate, currentUser, roleFocus = []) => {
  const candidateSkills = new Set((candidate.skills || []).map(s => String(s).toLowerCase()));
  const currentSkills = new Set((currentUser.skills || []).map(s => String(s).toLowerCase()));
  const currentInterests = new Set((currentUser.interests || []).map(s => String(s).toLowerCase()));
  const candidateInterests = new Set((candidate.interests || []).map(s => String(s).toLowerCase()));

  const skillOverlap = overlapScore(candidateSkills, currentSkills);
  const interestOverlap = overlapScore(candidateInterests, currentInterests);
  const semesterDistance = Math.abs((candidate.semester || 1) - (currentUser.semester || 1));
  const semesterScore = Math.max(0, 1 - semesterDistance / 7);
  const trust = computeTrustScore(candidate) / 100;
  const ratingFactor = Number(candidate.rating || 0) / 5;
  const focusKeywords = new Set(roleFocus.map(s => s.toLowerCase()));
  const focusOverlap = overlapScore(candidateSkills, focusKeywords);
  const activityScore = Math.min(1, Number(candidate.activity || 0) / 30);

  const score = (
    skillOverlap * 40 +
    interestOverlap * 15 +
    semesterScore * 15 +
    trust * 15 +
    ratingFactor * 10 +
    focusOverlap * 5 +
    activityScore * 5
  );

  return Math.max(0, score);
};

const recommendCollaborators = async (req, res) => {
  try {
    const currentUser = req.user;
    const role = req.query.role;
    const focus = getFocusKeywords(role);
    const candidates = await User.find({ _id: { $ne: currentUser._id }, isActive: true }).select('-password');

    const scored = candidates.map(user => {
      const score = calculateUserMatch(user, currentUser, focus);
      return {
        ...user.toObject(),
        trustScore: computeTrustScore(user),
        score: Math.round(score * 100) / 100
      };
    }).filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    res.json({ collaborators: scored, summary: `Recommended collaborators based on skills, trust, semester, and activity. Role focus: ${role || 'general'}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const recommendProjects = async (req, res) => {
  try {
    const currentUser = req.user;
    const interests = new Set((currentUser.interests || []).map(i => i.toLowerCase()));
    const skills = new Set((currentUser.skills || []).map(s => s.toLowerCase()));
    const focus = req.query.focus ? req.query.focus.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

    const notes = await Note.find({ isActive: true }).populate('seller', 'name avatar rating college');
    const services = await Service.find({ isActive: true }).populate('seller', 'name avatar rating college');

    const scoreResource = resource => {
      const titleSet = makeWordSet(resource.title || '');
      const descSet = makeWordSet(resource.description || '');
      const tagSet = new Set([...(resource.tags || []), resource.subject || ''].map(s => String(s).toLowerCase()));
      const commonInterest = overlapScore(tagSet, interests);
      const skillMatch = overlapScore(tagSet, skills);
      const recency = Math.max(0, 1 - ((Date.now() - new Date(resource.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const rating = Number(resource.rating || 0) / 5;
      const focusScore = focus.length ? overlapScore(tagSet, new Set(focus)) : 0;
      return commonInterest * 40 + skillMatch * 25 + rating * 20 + recency * 10 + focusScore * 5;
    };

    const suggestedNotes = notes.map(note => ({
      id: note._id,
      type: 'note',
      title: note.title,
      subject: note.subject,
      seller: note.seller,
      score: Math.round(scoreResource(note) * 100) / 100
    })).sort((a,b) => b.score - a.score).slice(0,6);

    const suggestedServices = services.map(svc => ({
      id: svc._id,
      type: 'service',
      title: svc.title,
      category: svc.category,
      seller: svc.seller,
      score: Math.round(scoreResource(svc) * 100) / 100
    })).sort((a,b) => b.score - a.score).slice(0,6);

    res.json({ suggestedNotes, suggestedServices, summary: 'AI project recommendations based on your skills, interests, and recent campus demand.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rankResources = async (req, res) => {
  try {
    const type = (req.query.type || 'notes').toLowerCase();

    if (type === 'services') {
      const services = await Service.find({ isActive: true }).populate('seller', 'rating totalReviews skills college');
      const ranked = services.map(svc => {
        const sellerTrust = computeTrustScore(svc.seller) / 100;
        const ageDays = Math.max(1, (Date.now() - new Date(svc.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const score = (svc.totalOrders * 0.32) + (svc.rating * 21) + (svc.totalReviews * 1.9) + (sellerTrust * 18) + (1 / ageDays * 12);
        return { ...svc.toObject(), rankScore: Math.round(score * 100) / 100 };
      }).sort((a, b) => b.rankScore - a.rankScore).slice(0, 12);
      return res.json({ type: 'services', ranked });
    }

    const notes = await Note.find({ isActive: true }).populate('seller', 'rating totalReviews skills college');
    const ranked = notes.map(note => {
      const sellerTrust = computeTrustScore(note.seller) / 100;
      const ageDays = Math.max(1, (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const score = (note.downloads * 0.35) + (note.rating * 22) + (note.totalReviews * 2) + (sellerTrust * 18) + (1 / ageDays * 12);
      return { ...note.toObject(), rankScore: Math.round(score * 100) / 100 };
    }).sort((a,b) => b.rankScore - a.rankScore).slice(0, 12);
    res.json({ type: 'notes', ranked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [users, notes, services] = await Promise.all([
      User.find({ isActive: true }).select('skills interests college rating totalReviews trustScore'),
      Note.find({ isActive: true }).select('subject seller downloads rating totalReviews createdAt'),
      Service.find({ isActive: true }).select('category tags totalOrders rating totalReviews createdAt')
    ]);

    const skillCounts = new Map();
    const collegeCounts = new Map();
    const subjectCounts = new Map();
    const categoryCounts = new Map();

    users.forEach(u => {
      (u.skills || []).forEach(skill => skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1));
      (u.interests || []).forEach(interest => skillCounts.set(interest, (skillCounts.get(interest) || 0) + 1));
      const college = u.college || 'Unknown';
      collegeCounts.set(college, (collegeCounts.get(college) || 0) + 1);
    });

    notes.forEach(note => {
      if (note.subject) subjectCounts.set(note.subject, (subjectCounts.get(note.subject) || 0) + 1);
    });

    services.forEach(svc => {
      if (svc.category) categoryCounts.set(svc.category, (categoryCounts.get(svc.category) || 0) + 1);
      (svc.tags || []).forEach(tag => skillCounts.set(tag, (skillCounts.get(tag) || 0) + 1));
    });

    const top = mapToArray(skillCounts).slice(0, 8);
    const collegeTop = mapToArray(collegeCounts).slice(0, 6);
    const subjectTop = mapToArray(subjectCounts).slice(0, 6);
    const categoryTop = mapToArray(categoryCounts).slice(0, 6);
    const averageTrust = users.length ? Math.round(users.reduce((sum,u) => sum + computeTrustScore(u), 0) / users.length) : 0;

    res.json({
      trendingSkills: top,
      activeDepartments: collegeTop,
      popularSubjects: subjectTop,
      mostRequestedCategories: categoryTop,
      averageTrustScore: averageTrust,
      usersCount: users.length,
      notesCount: notes.length,
      servicesCount: services.length,
      topNoteAuthors: await getTopAuthors(notes),
      topServiceCategories: categoryTop
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTopAuthors = async notes => {
  const counts = new Map();
  notes.forEach(note => {
    const key = String(note.seller || 'unknown');
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ authorId: id, noteCount: count }));
};

const mapToArray = map => Array.from(map.entries()).sort((a,b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

const formTeam = async (req, res) => {
  try {
    const { requiredSkills, teamSize = 4, minSemester = 1, maxSemester = 8 } = req.body;
    if (!Array.isArray(requiredSkills) || !requiredSkills.length)
      return res.status(400).json({ message: 'requiredSkills is required' });

    const normalizedSkills = requiredSkills.map(s => String(s).toLowerCase().trim());
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true }).select('-password');

    const scored = users.map(user => {
      const skillSet = new Set((user.skills || []).map(s => String(s).toLowerCase()));
      const matchCount = normalizedSkills.filter(skill => skillSet.has(skill)).length;
      const coverage = matchCount / normalizedSkills.length;
      const semesterOk = (user.semester || 1) >= minSemester && (user.semester || 1) <= maxSemester;
      const trust = computeTrustScore(user) / 100;
      const score = coverage * 60 + trust * 25 + (semesterOk ? 10 : 0) + Math.min(5, Number(user.activity || 0) * 0.15);
      return { ...user.toObject(), score: Math.round(score * 100) / 100, coverage, semesterOk };
    }).filter(u => u.coverage > 0 || u.semesterOk)
      .sort((a,b) => b.score - a.score)
      .slice(0, teamSize);

    res.json({ team: scored, summary: 'Balanced team formed using skills, semester proximity, and trust metrics.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const summarizeNote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const description = String(note.description || '');
    const title = String(note.title || '');
    const subject = String(note.subject || 'general').toLowerCase();
    const words = normalizeText(`${title} ${description}`).split(' ').slice(0, 60).join(' ');
    const keywordSet = makeWordSet(`${title} ${description}`);
    const topics = Array.from(keywordSet).slice(0, 6);
    const summary = `This ${subject} note covers ${words}${description.length > 0 ? '...' : ''}`;
    res.json({ summary, importantTopics: topics, revisionPoints: topics.slice(0, 4).map(t => `Review ${t}`) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const detectNoteDuplicates = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const current = await Note.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Note not found' });
    const currentSet = makeWordSet(`${current.title} ${current.description}`);
    const threshold = Number(req.query.threshold || 0.42);
    const others = await Note.find({ _id: { $ne: current._id }, isActive: true });

    const duplicates = others.map(note => {
      const comparison = makeWordSet(`${note.title} ${note.description}`);
      const shared = overlapScore(currentSet, comparison);
      return { id: note._id, title: note.title, similarity: Math.round(shared * 100) / 100 };
    }).filter(item => item.similarity >= threshold)
      .sort((a,b) => b.similarity - a.similarity);

    res.json({ duplicates, summary: duplicates.length ? 'Potential duplicate notes found.' : 'No duplicates detected.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  recommendCollaborators,
  recommendProjects,
  rankResources,
  getAnalytics,
  formTeam,
  summarizeNote,
  detectNoteDuplicates
};
