const checkDevEnv = (req, res, next) => {
  /**
   * Check if the user is a dev
   * If the user is a dev, the user will be able to access the protected routes
   * If the user is not a dev, 403 Forbidden will be returned
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  // Check user type
  if (!process.env.DETA_RUNTIME) {
    next();
  } else {
    res.status(403).send({
      message: "Unauthorized",
    });
  }
};
module.exports = { checkDevEnv };
