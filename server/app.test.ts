// @vitest-environment node

import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const originalEnvironment = {
  DEMO_MODE: process.env.DEMO_MODE,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  LIVEAVATAR_API_KEY: process.env.LIVEAVATAR_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

function restoreEnvironment() {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

beforeEach(() => {
  process.env.DEMO_MODE = "true";
  delete process.env.OPENAI_API_KEY;
  delete process.env.LIVEAVATAR_API_KEY;
  process.env.NODE_ENV = "test";
});

afterEach(restoreEnvironment);

describe("Vera API", () => {
  it("reports healthy demo-mode capabilities without exposing configuration", async () => {
    const response = await request(createApp()).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "vera-api",
      mode: "demo",
      avatar: "demo-avatar",
    });
    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
  });

  it("returns a stable action contract in credential-free mode", async () => {
    const response = await request(createApp())
      .post("/api/chat")
      .send({ message: "Help me lower my asthma medication cost", history: [] })
      .expect(200);

    expect(response.body).toMatchObject({
      mode: "demo",
      intent: "rx-savings",
      planId: "rx-savings",
    });
    expect(response.body.text).toContain("$312");
  });

  it("returns a wellness opt-in contract for device linking", async () => {
    const response = await request(createApp())
      .post("/api/chat")
      .send({ message: "Please link my Fitbit so I can get wellness advice", history: [] })
      .expect(200);

    expect(response.body).toMatchObject({
      mode: "demo",
      intent: "wellness-connect",
      planId: "wellness-connect",
    });
    expect(response.body.text).toContain("4,280");
  });

  it("returns a hospital pre-registration contract from location intent", async () => {
    const response = await request(createApp())
      .post("/api/chat")
      .send({ message: "Which hospital is best from my location so I can pre-register?", history: [] })
      .expect(200);

    expect(response.body).toMatchObject({
      mode: "demo",
      intent: "hospital-prereg",
      planId: "hospital-prereg",
    });
    expect(response.body.text).toContain("Hartford Hospital");
  });

  it("fact-checks a health statement with a sourced verdict", async () => {
    const response = await request(createApp())
      .post("/api/chat")
      .send({ message: "Is it true that antibiotics treat the common cold?", history: [] })
      .expect(200);

    expect(response.body).toMatchObject({
      mode: "demo",
      intent: "fact-check",
    });
    expect(response.body.factCheck.verdict).toBe("false");
    expect(response.body.factCheck.sources[0].organization).toContain("Centers for Disease Control");
    expect(response.body.text).toContain("completely false");
  });

  it("routes safety language deterministically and rejects malformed input", async () => {
    const app = createApp();
    const safetyResponse = await request(app)
      .post("/api/chat")
      .send({ message: "I have chest pain and cannot breathe", history: [] })
      .expect(200);

    expect(safetyResponse.body.intent).toBe("safety");
    expect(safetyResponse.body.text).toContain("911");

    const invalidResponse = await request(app)
      .post("/api/chat")
      .send({ message: "", history: [], unexpected: true })
      .expect(400);
    expect(invalidResponse.body.error).toBe("Invalid chat request.");
  });

  it("keeps LiveAvatar optional when no provider key is configured", async () => {
    const response = await request(createApp()).post("/api/avatar/session").send({}).expect(200);

    expect(response.body).toEqual({ available: false, reason: "not_configured" });
  });

  it("returns a generic response for unknown API paths", async () => {
    const response = await request(createApp()).get("/api/unknown").expect(404);
    expect(response.body).toEqual({ error: "API route not found." });
  });
});
