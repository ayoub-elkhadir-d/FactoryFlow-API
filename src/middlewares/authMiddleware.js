const AppError = require("../utils/AppError");
const userRepository = require("../repositories/userRepository");
const { verifyToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  let payload;
  try {
    payload = verifyToken(authorization.slice(7));
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }

  if (!payload || !payload.sub) {
    return next(new AppError("Invalid or expired token", 401));
  }

  try {
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new AppError("Invalid or expired token", 401));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;