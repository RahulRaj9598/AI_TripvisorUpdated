import User from '../models/User.js';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// JWT secret for our own tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate our own JWT token
const generateJWTToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      firebaseUid: user.firebaseUid 
    },
    JWT_SECRET,
    { expiresIn: '7d' } // 7 days instead of 1 hour
  );
};

// Verify our own JWT token
const verifyJWTToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // First try to verify our own JWT token
    const jwtPayload = verifyJWTToken(token);
    if (jwtPayload) {
      // Our JWT token is valid
      const user = await User.findById(jwtPayload.userId);
      if (user) {
        user.lastSeen = new Date();
        await user.save();
        req.user = user;
        return next();
      }
    }

    // If not our JWT, verify Google OAuth token
    let userInfo;
    
    try {
      // For Google OAuth, we use the access token directly
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      
      userInfo = {
        uid: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture
      };
      console.log('Google OAuth verification successful');
    } catch (googleError) {
      console.error('Google OAuth verification failed:', googleError.response?.data || googleError.message);
      
      // Check if it's a token expiration error
      if (googleError.response?.status === 401) {
        return res.status(401).json({ 
          error: 'Token expired or invalid. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: userInfo.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.name || 'Anonymous User',
        photoURL: userInfo.picture || '',
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update last seen
      user.lastSeen = new Date();
      await user.save();
      console.log('User authenticated:', user.email);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    // First try to verify our own JWT token
    const jwtPayload = verifyJWTToken(token);
    if (jwtPayload) {
      const user = await User.findById(jwtPayload.userId);
      if (user) {
        user.lastSeen = new Date();
        await user.save();
        req.user = user;
        return next();
      }
    }

    // If not our JWT, try Google OAuth token
    let userInfo;
    
    try {
      // First try to verify as Firebase ID token
      const decodedToken = await auth.verifyIdToken(token);
      userInfo = {
        uid: decodedToken.uid
      };
    } catch (firebaseError) {
      // If Firebase verification fails, try Google OAuth
      try {
        const response = await axios.get(
          'https://www.googleapis.com/oauth2/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        
        userInfo = {
          uid: response.data.id
        };
      } catch (googleError) {
        console.error('Optional auth - Google OAuth verification failed:', googleError.response?.data || googleError.message);
        req.user = null;
        return next();
      }
    }

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: userInfo.uid });
    
    if (user) {
      user.lastSeen = new Date();
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

// Export the JWT token generation function
export { generateJWTToken }; 