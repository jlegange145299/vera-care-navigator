import { describe, expect, it } from "vitest";
import { getDemoReply } from "./demoData";

describe("getDemoReply", () => {
  it("maps a wellness device question to the opt-in action plan", () => {
    const reply = getDemoReply("Can I link my Fitbit and Apple Health for wellness advice?");

    expect(reply.intent).toBe("wellness-connect");
    expect(reply.plan?.devices).toHaveLength(4);
    expect(reply.text).toContain("4,280");
  });

  it("matches a hospital visit to the closest facility and a pre-reg packet", () => {
    const reply = getDemoReply("I need to go to the hospital for an outpatient procedure. Can you pre-register me?");

    expect(reply.intent).toBe("hospital-prereg");
    expect(reply.plan?.facilities).toHaveLength(3);
    expect(reply.plan?.checklist?.length).toBeGreaterThan(3);
    expect(reply.text).toContain("Hartford Hospital");
    expect(reply.text).toContain("5–7 days");
  });

  it("maps a medication affordability question to the Rx action plan", () => {
    const reply = getDemoReply("Can I lower my prescription cost?");

    expect(reply.intent).toBe("rx-savings");
    expect(reply.plan?.id).toBe("rx-savings");
    expect(reply.text).toContain("$312");
  });

  it("routes emergency language without attaching a benefit action", () => {
    const reply = getDemoReply("I have chest pain and cannot breathe");

    expect(reply.intent).toBe("safety");
    expect(reply.plan).toBeUndefined();
    expect(reply.text).toContain("911");
  });

  it("keeps unsupported questions inside an honest PoC boundary", () => {
    const reply = getDemoReply("Can you explain every detail of my dental plan?");

    expect(reply.intent).toBe("general");
    expect(reply.plan).toBeUndefined();
    expect(reply.text).toContain("proof of concept");
  });

  it("rates a catalog health claim false and cites the public-health source", () => {
    const reply = getDemoReply("Is it true that antibiotics treat the common cold?");

    expect(reply.intent).toBe("fact-check");
    expect(reply.factCheck?.verdict).toBe("false");
    expect(reply.factCheck?.sources[0]?.organization).toContain("Centers for Disease Control");
    expect(reply.text).toContain("completely false");
  });

  it("marks unmatched health claims unverified instead of inventing a verdict", () => {
    const reply = getDemoReply("Is it true that copper bracelets cure arthritis?");

    expect(reply.intent).toBe("fact-check");
    expect(reply.factCheck?.verdict).toBe("unverified");
    expect(reply.factCheck?.sources.length).toBeGreaterThan(0);
  });
});
