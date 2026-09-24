import cors from "cors";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import express, { type ErrorRequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { createLiveAvatarSession } from "./liveAvatar.js";
import { generateVeraReply } from "./vera.js";

const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    history: z
      .array(
        z.object({
          role: z.enum(["assistant", "user"]),
          content: z.string().trim().min(1).max(1_500),
        }),
      )
      .max(10)
      .default([]),
  })
  .strict();

function createRateLimiter(limit: number) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a moment and try again." },
  });
}

/** Browser must reach LiveAvatar API plus LiveKit signaling (FULL mode WebRTC). */
const liveAvatarConnectSrc = [
  "'self'",
  "https://*.liveavatar.com",
  "wss://*.liveavatar.com",
  "https://api.liveavatar.com",
  "https://*.heygen.com",
  "wss://*.heygen.com",
  "https://*.livekit.cloud",
  "wss://*.livekit.cloud",
  "https://*.turn.livekit.cloud",
  "wss://*.turn.livekit.cloud",
  "https://*.host.livekit.cloud",
  "wss://*.host.livekit.cloud",
] as const;

export function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: [...liveAvatarConnectSrc],
          frameSrc: ["'self'", "https://*.liveavatar.com", "https://*.heygen.com"],
          mediaSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use(express.json({ limit: "32kb", strict: true }));

  const allowedOrigins = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.use(
    "/api",
    cors({
      origin: allowedOrigins?.length ? allowedOrigins : true,
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.use((request, response, next) => {
    const requestId = request.header("x-request-id")?.slice(0, 80) || randomUUID();
    response.setHeader("x-request-id", requestId);
    response.setHeader("cache-control", "no-store");
    next();
  });
  app.use("/api", createRateLimiter(90));

  app.get("/api/health", (_request, response) => {
    const openAiConnected = Boolean(process.env.OPENAI_API_KEY) && process.env.DEMO_MODE?.toLowerCase() !== "true";
    response.json({
      status: "ok",
      service: "vera-api",
      mode: openAiConnected ? "openai" : "demo",
      avatar: process.env.LIVEAVATAR_API_KEY ? "liveavatar-ready" : "demo-avatar",
    });
  });

  app.post("/api/chat", createRateLimiter(25), async (request, response) => {
    const parsedRequest = chatRequestSchema.safeParse(request.body);
    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid chat request.",
        fields: parsedRequest.error.issues.map((issue) => issue.path.join(".")).filter(Boolean),
      });
      return;
    }

    const reply = await generateVeraReply(parsedRequest.data);
    response.json(reply);
  });

  // Sessions are billable, so this endpoint is called only after an explicit user click.
  app.post("/api/avatar/session", createRateLimiter(5), async (_request, response) => {
    const session = await createLiveAvatarSession();
    response.json({
      available: session.available,
      sessionToken: session.session_token,
      reason: session.reason,
    });
  });

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API route not found." });
  });

  if (isProduction) {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const clientDirectory = path.resolve(currentDirectory, "../dist");
    app.use(express.static(clientDirectory));
    app.get(/^(?!\/api).*/, (_request, response) => {
      response.sendFile(path.join(clientDirectory, "index.html"));
    });
  }

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`Unhandled request error (${errorName}).`);
    response.status(500).json({ error: "Something went wrong. Please try again." });
  };
  app.use(errorHandler);

  return app;
}
