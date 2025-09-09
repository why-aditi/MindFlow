import { getAuthInstance } from "../config/firebase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No valid authorization token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const auth = getAuthInstance();

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired",
        message: "Please sign in again",
      });
    }

    if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Please sign in again",
      });
    }

    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
    });
  }
};
