import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'


dotenv.config();

function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    console.error("Missing token in request");
    return res.status(401).json({ message: "Missing Token" });
  }
  try {
    const decoded = jwt.verify(token,process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid Token" });
  }
}

export default verifyToken;
