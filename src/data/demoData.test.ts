import { describe, expect, it } from "vitest";
import { getDemoReply } from "./demoData";

describe("getDemoReply", () => {
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
});
