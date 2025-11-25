const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Not authorized as an admin',
    });
  }
};

module.exports = adminMiddleware;
