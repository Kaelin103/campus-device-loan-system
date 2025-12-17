module.exports = function requireStaff(req, res, next) {
  const roles = req.auth?.["https://cdls-api/roles"] || [];

  if (!roles.includes("staff")) {
    return res.status(403).json({
      message: "Forbidden: staff role required",
    });
  }

  next();
};
