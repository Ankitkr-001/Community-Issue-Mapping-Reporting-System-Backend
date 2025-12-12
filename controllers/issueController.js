const Issue = require("../models/Issue");
const { uploadToCloudinary } = require('../utils/cloudinary');

// ------------------------------
//  GET ISSUES
// ------------------------------
exports.getIssues = async (req, res) => {
  try {
    let issues;

    if (req.user.role === "admin") {
      // Admin sees all issues
      issues = await Issue.find()
        .populate('reportedBy', 'username email')
        .sort({ createdAt: -1 });
    } else {
      // Normal user sees only their own issues
      issues = await Issue.find({ reportedBy: req.user.id })
        .populate('reportedBy', 'username email')
        .sort({ createdAt: -1 });
    }

    res.json(issues);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ msg: "Server error while fetching issues" });
  }
};

// ------------------------------
//  CREATE ISSUE
// ------------------------------
exports.createIssue = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ msg: "Admin cannot create issues" });
    }

    const { title, description, latitude, longitude } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newIssue = new Issue({
      title,
      description,
      latitude,
      longitude,
      imageUrl,
      reportedBy: req.user.id,
      status: 'open' // must match schema enum
    });

    const issue = await newIssue.save();
    await issue.populate('reportedBy', 'username');

    // Emit via Socket.IO
    const io = req.app.get('io');
    io.emit('newIssue', issue);

    res.json(issue);
  } catch (err) {
    console.error("Error creating issue:", err);
    res.status(500).json({ msg: "Server error while creating issue" });
  }
};

// ------------------------------
//  UPDATE STATUS (ADMIN ONLY)
// ------------------------------
exports.updateStatus = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reportedBy', 'username');

    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    // Toggle status or accept from request body
    issue.status = req.body.status || (issue.status === 'open' ? 'resolved' : 'open');

    await issue.save();

    // Emit update via Socket.IO
    const io = req.app.get('io');
    io.emit('updateIssue', issue);

    res.json(issue);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ msg: "Server error while updating status" });
  }
};
