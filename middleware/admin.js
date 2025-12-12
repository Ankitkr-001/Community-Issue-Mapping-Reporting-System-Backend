module.exports = function (req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
