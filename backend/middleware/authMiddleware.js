import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

export const providerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'provider' || req.user.role === 'admin' || req.user.role === 'seller')) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as a provider" });
  }
};
