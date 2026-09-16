import { describe, expect, it } from "vitest";
import { selectPreferredBritishVoice } from "./useBrowserVoice";

function voice(name: string, lang: string, localService = true): SpeechSynthesisVoice {
  return { default: false, lang, localService, name, voiceURI: name };
}

describe("selectPreferredBritishVoice", () => {
  it("prefers a local British female voice over earlier English alternatives", () => {
    const voices = [
      voice("David", "en-GB"),
      voice("Samantha", "en-US"),
      voice("Microsoft Sonia Online", "en-GB", false),
      voice("Microsoft Libby", "en-GB"),
    ];

    expect(selectPreferredBritishVoice(voices)?.name).toBe("Microsoft Libby");
  });

  it("prefers another female English voice before a British male fallback", () => {
    const voices = [voice("George", "en-GB"), voice("Aria", "en-US")];
    expect(selectPreferredBritishVoice(voices)?.name).toBe("Aria");
  });

  it("returns undefined when no English voice exists", () => {
    expect(selectPreferredBritishVoice([voice("Amelie", "fr-FR")])).toBeUndefined();
  });
});
