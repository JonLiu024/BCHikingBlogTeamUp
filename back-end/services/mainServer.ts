import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import seedTrails from "../data/seedTrails";
import User from "../models/UserModel";
import { attachMediaServer } from "./media/mediaServer";
import { s3ObjectStore } from "./media/s3Store";
import { createApp } from "./app";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = createApp();
const PORT = process.env.PORT || 5055;

const uri = process.env.DB_CONNECTION_STR;
if (!uri) {
  console.error("database connection fails: DB_CONNECTION_STR is missing");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(async () => {
    await seedTrails();
    const server = app.listen(PORT, () => {
      console.log(`server is running at port ${PORT}`);
    });
    let store;
    try {
      store = s3ObjectStore();
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error("media socket is not available:", message);
      return;
    }
    attachMediaServer(server, {
      store,
      authenticate: async (token) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;
        try {
          const decoded = jwt.verify(token, secret) as { id: string };
          const user = await User.findById(decoded.id).select("_id");
          return user ? { id: String(user._id) } : null;
        } catch {
          return null;
        }
      },
    });
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("database connection fails:", message);
    process.exit(1);
  });
