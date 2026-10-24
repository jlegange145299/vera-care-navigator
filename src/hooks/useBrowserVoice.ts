import { useCallback, useEffect, useRef, useState } from "react";

interface RecognitionEventLike extends Event {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface RecognitionErrorEventLike extends Event {
  error: string;
}

interface RecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => RecognitionLike;

type VoiceWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

export function useVoiceInput(onFinalTranscript: (transcript: string) => void) {
  const callbackRef = useRef(onFinalTranscript);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const voiceWindow = window as VoiceWindow;
  const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
  const isSupported = Boolean(Recognition);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    if (!Recognition || isListening) {
      return;
    }

    setError(null);
    setInterimTranscript("");
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      setError(
        event.error === "not-allowed"
          ? "Microphone access is blocked. Allow it in your browser settings."
          : "I couldn’t hear that clearly. Please try again.",
      );
    };
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }

      setInterimTranscript(interim);
      if (final.trim()) {
        setInterimTranscript("");
        callbackRef.current(final.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [Recognition, isListening]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
    },
    [],
  );

  return { error, interimTranscript, isListening, isSupported, start, stop, toggle };
}

const likelyFemaleVoiceName = /female|sonia|libby|hazel|serena|kate|susan|abbi|maisie|martha|fiona|samantha|aria|jenny|zira|victoria|karen|moira|tessa|emma|olivia|alice|sophie|ava|joanna|natasha|sara/i;
const likelyMaleVoiceName = /(^|[\s_-])male($|[\s_-])|david|daniel|mark|james|george|adam|jack|john|paul|oliver|liam|charles|ben|michael|robert|henry|jason|harry|ryan|guy|thomas|stephen/i;
const higherQualityVoice = /natural|neural|online|premium|enhanced|wavenet/i;

function prefersMaleVoice(gender?: string) {
  const normalizedGender = gender?.toLowerCase() ?? "";
  return /(^|\W)(man|male)(\W|$)/.test(normalizedGender);
}

function normalizedLanguage(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().replace("_", "-");
}

export function selectPreferredVoice(voices: SpeechSynthesisVoice[], preferredGender?: string) {
  const targetGender = preferredGender?.toLowerCase();
  const wantsFemale = targetGender?.includes("wom") || targetGender?.includes("fem");
  const wantsMale = prefersMaleVoice(targetGender);
  const englishVoices = voices.filter((voice) => normalizedLanguage(voice).startsWith("en"));
  if (englishVoices.length === 0) return undefined;

  return englishVoices.reduce((best, voice) => {
    const language = normalizedLanguage(voice);
    const name = `${voice.name} ${voice.voiceURI}`;
    const isFemale = likelyFemaleVoiceName.test(name);
    const isMale = likelyMaleVoiceName.test(name);
    const genderScore = wantsFemale
      ? isFemale
        ? 12
        : isMale
          ? -12
          : 0
      : wantsMale
        ? isMale
          ? 12
          : isFemale
            ? -12
            : 0
        : 0;
    const score =
      genderScore +
      (language.startsWith("en-gb") ? 5 : language.startsWith("en-us") ? 2 : 0) +
      (higherQualityVoice.test(name) ? 8 : 0) +
      (voice.default ? 1 : 0);
    return score > best.score ? { voice, score } : best;
  }, { voice: englishVoices[0]!, score: Number.NEGATIVE_INFINITY }).voice;
}

export function selectPreferredBritishVoice(voices: SpeechSynthesisVoice[]) {
  return selectPreferredVoice(voices, "female");
}

export function useSpeechOutput(enabled: boolean, preferredGender?: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMouthOpen, setSpeechMouthOpen] = useState<number | null>(0);
  const isSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    const synthesis = window.speechSynthesis;
    const refreshVoices = () => {
      const voices = synthesis.getVoices();
      if (voices.length > 0) voicesRef.current = voices;
    };

    refreshVoices();
    synthesis.addEventListener?.("voiceschanged", refreshVoices);
    return () => synthesis.removeEventListener?.("voiceschanged", refreshVoices);
  }, [isSupported]);

  const stop = useCallback(() => {
    utteranceRef.current = null;
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechMouthOpen(0);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !isSupported) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices.length > 0) voicesRef.current = currentVoices;
      const preferredVoice = selectPreferredVoice(
        currentVoices.length > 0 ? currentVoices : voicesRef.current,
        preferredGender,
      );

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.lang = preferredVoice?.lang || "en-GB";
      utterance.rate = 0.94;
      utterance.pitch = prefersMaleVoice(preferredGender) ? 0.98 : 1.02;
      utteranceRef.current = utterance;
      utterance.onstart = () => {
        if (utteranceRef.current === utterance) {
          setIsSpeaking(true);
          setSpeechMouthOpen(null);
        }
      };
      utterance.onboundary = (event) => {
        if (utteranceRef.current !== utterance || event.name !== "word") return;
        const word = text.slice(event.charIndex, event.charIndex + event.charLength).toLowerCase();
        const vowelOpening: Record<string, number> = { a: 0.78, o: 0.64, e: 0.48, u: 0.38, i: 0.28 };
        const openings = [...word].map((character) => vowelOpening[character] ?? 0);
        setSpeechMouthOpen(Math.max(0.18, ...openings));
      };
      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
          setSpeechMouthOpen(0);
        }
      };
      utterance.onerror = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
          setSpeechMouthOpen(0);
        }
      };
      window.speechSynthesis.speak(utterance);
    },
    [enabled, isSupported, preferredGender],
  );

  useEffect(() => stop, [stop]);

  return { isSpeaking, isSupported, speechMouthOpen, speak, stop };
}
