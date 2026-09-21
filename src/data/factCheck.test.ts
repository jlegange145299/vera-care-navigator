import { describe, expect, it } from "vitest";
import { getFactCheck } from "./factCheck";

describe("getFactCheck", () => {
  it("rates a true activity guideline claim and cites HHS and AHA", () => {
    const result = getFactCheck("Is it true that 150 minutes of moderate activity each week helps the heart?");

    expect(result?.id).toBe("activity-150");
    expect(result?.verdict).toBe("true");
    expect(result?.sources.some((source) => source.organization.includes("Heart Association"))).toBe(true);
  });

  it("rates vitamin C and colds as partly true with an NIH source", () => {
    const result = getFactCheck("Is it true that vitamin C prevents the common cold?");

    expect(result?.verdict).toBe("partly-true");
    expect(result?.sources[0]?.organization).toContain("NIH");
  });
});
