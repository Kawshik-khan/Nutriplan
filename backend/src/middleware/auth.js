import { prisma } from "../db.js";
import { verifyAuthToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    // Try to get token from cookie first (more secure), then fallback to Authorization header
    let token = req.cookies?.auth_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice("Bearer ".length);
        console.log("[AUTH] Token found in Authorization header");
      }
    } else {
      console.log("[AUTH] Token found in cookies");
    }
    
    if (!token) {
      console.warn("[AUTH] No token found in request");
      return res.status(401).json({ error: "Authentication required." });
    }

    let decoded;
    try {
      decoded = verifyAuthToken(token);
    } catch (err) {
      console.error("[AUTH] JWT verification failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token user." });
    }

    req.user = user;
    return next();
  } catch (error) {
    // Clear invalid cookie if present
    if (req.cookies?.auth_token) {
      res.clearCookie("auth_token");
    }
    return res.status(401).json({ error: "Unauthorized." });
  }
}
