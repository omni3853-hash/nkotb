import mongoose, { Connection } from "mongoose";

// Optional but recommended diagnostics
mongoose.set("strictQuery", true);

// ⚠️ Disable mongoose's silent buffering so you see issues immediately
mongoose.set("bufferCommands", false);
// Or increase if you prefer buffering: mongoose.set("bufferTimeoutMS", 30000);

type GlobalMongooseCache = {
  conn: Connection | null;
  promise: Promise<Connection> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: GlobalMongooseCache | undefined;
}

const globalAny = global as unknown as { __mongoose?: GlobalMongooseCache };

const cached: GlobalMongooseCache = globalAny.__mongoose || { conn: null, promise: null };
if (!globalAny.__mongoose) {
  globalAny.__mongoose = cached;
}

export async function dbConnect(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Keep these sane for serverless
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000, // fail fast if cluster unreachable
        socketTimeoutMS: 20000,
        // retryWrites stays true for Atlas unless you have reasons to change
      })
      .then((m) => {
        // Important: return the *connection*, not the mongoose instance
        return m.connection;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn!;
}

/**
 * Seed only when explicitly allowed.
 * Run in dev OR when SEED_ON_BOOT=true, and never block requests if it fails.
 */
export async function maybeSeed() {
  try {
    const allowSeed =
      process.env.NODE_ENV !== "production" || process.env.SEED_ON_BOOT === "true";
    if (!allowSeed) return;

    // Ensure we are connected first
    await dbConnect();

    // Dynamically import to avoid model execution before connect
    const { default: runSeed } = await import("./seed.utils");
    await runSeed();
  } catch (e) {
    console.error("[SEED] Skipped or failed:", (e as Error).message);
  }
}
