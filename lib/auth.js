import jwt from "jsonwebtoken";

export function getAuthUser(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) throw new Error("NO_TOKEN");

  return jwt.verify(token, process.env.JWT_SECRET   );
}
