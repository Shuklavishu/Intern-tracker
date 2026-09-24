import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// Middleware to verify JWT token from Cookie or Authorization header
export const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Authentication token missing." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};

// Middleware to restrict access to Admins only
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
};

// Middleware to restrict access to Admin or Mentor
export const isAdminOrMentor = (req, res, next) => {
    if (req.user?.role !== "admin" && req.user?.role !== "mentor") {
        return res.status(403).json({ message: "Access denied. Admin or Mentor role required." });
    }
    next();
};
