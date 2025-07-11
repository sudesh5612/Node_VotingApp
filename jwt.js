const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'default-dev-secret'; // fallback secret

// Middleware to verify JWT token from Authorization header
const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    console.log('Authorization header:', authorization);  // Debug log

    if (!authorization) {
        return res.status(401).json({ error: 'Token Not Found' });
    }

    // Expect header in format: "Bearer <token>"
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;  // attach decoded payload to req.user
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ error: 'Invalid or Expired Token' });
    }
};

// Function to generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Export both
module.exports = { jwtAuthMiddleware, generateToken };
