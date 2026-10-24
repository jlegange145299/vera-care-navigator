import { describe, expect, it } from "vitest";
import { selectPreferredBritishVoice, selectPreferredVoice } from "./useBrowserVoice";

function voice(name: string, lang: string, localService = true): SpeechSynthesisVoice {
  return { default: false, lang, localService, name, voiceURI: name };
}

describe("selectPreferredBritishVoice", () => {
  it("prefers a higher-quality British female voice over local defaults", () => {
    const voices = [
      voice("David", "en-GB"),
      voice("Samantha", "en-US"),
      voice("Microsoft Sonia Online", "en-GB", false),
      voice("Microsoft Libby", "en-GB"),
    ];

    expect(selectPreferredBritishVoice(voices)?.name).toBe("Microsoft Sonia Online");
  });

  it("prefers another female English voice before a British male fallback", () => {
    const voices = [voice("George", "en-GB"), voice("Aria", "en-US")];
    expect(selectPreferredBritishVoice(voices)?.name).toBe("Aria");
  });

  it("matches a male member voice without mistaking female voices for male", () => {
    const voices = [voice("Female", "en-GB"), voice("Microsoft Daniel Online", "en-GB", false)];
    expect(selectPreferredVoice(voices, "Man")?.name).toBe("Microsoft Daniel Online");
  });

  it("prefers natural or neural voices when available", () => {
    const voices = [
      voice("Microsoft Aria", "en-US"),
      voice("Microsoft Jenny Online (Natural)", "en-US", false),
    ];
    expect(selectPreferredVoice(voices, "Woman")?.name).toBe("Microsoft Jenny Online (Natural)");
  });

  it("returns undefined when no English voice exists", () => {
    expect(selectPreferredBritishVoice([voice("Amelie", "fr-FR")])).toBeUndefined();
  });
});
