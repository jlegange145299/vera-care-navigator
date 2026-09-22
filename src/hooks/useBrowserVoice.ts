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

const likelyFemaleVoiceName = /female|sonia|libby|hazel|serena|kate|susan|abbi|maisie|martha|fiona|samantha|aria|jenny|zira|victoria|karen|moira|tessa|emma|olivia|alice|sophie/i;
const likelyMaleVoiceName = /male|david|daniel|mark|james|george|adam|jack|john|paul|oliver|liam|charles|ben|michael|robert|henry|jason|harry/i;

function normalizedLanguage(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().replace("_", "-");
}

function selectPreferredVoiceByGender(voices: SpeechSynthesisVoice[], preferredGender?: string) {
  const targetGender = preferredGender?.toLowerCase();
  const isEnglish = (voice: SpeechSynthesisVoice) => normalizedLanguage(voice).startsWith("en");
  const isBritish = (voice: SpeechSynthesisVoice) => normalizedLanguage(voice).startsWith("en-gb");
  const isLikelyFemale = (voice: SpeechSynthesisVoice) => likelyFemaleVoiceName.test(voice.name);
  const isLikelyMale = (voice: SpeechSynthesisVoice) => likelyMaleVoiceName.test(voice.name);
  const isTargetGender = (voice: SpeechSynthesisVoice) => {
    if (!targetGender) return true;
    if (targetGender.includes("wom") || targetGender.includes("fem")) return isLikelyFemale(voice);
    if (targetGender.includes("man") || targetGender.includes("male")) return isLikelyMale(voice);
    return true;
  };
  const firstMatch = (predicate: (voice: SpeechSynthesisVoice) => boolean) => voices.find(predicate);

  return (
    firstMatch((voice) => isBritish(voice) && isTargetGender(voice) && voice.localService) ??
    firstMatch((voice) => isBritish(voice) && isTargetGender(voice)) ??
    firstMatch((voice) => isEnglish(voice) && isTargetGender(voice) && voice.localService) ??
    firstMatch((voice) => isEnglish(voice) && isTargetGender(voice)) ??
    firstMatch((voice) => isBritish(voice) && voice.localService) ??
    firstMatch(isBritish) ??
    firstMatch((voice) => isEnglish(voice) && voice.localService) ??
    firstMatch(isEnglish)
  );
}

export function selectPreferredBritishVoice(voices: SpeechSynthesisVoice[]) {
  return selectPreferredVoiceByGender(voices, "female");
}

export function useSpeechOutput(enabled: boolean, preferredGender?: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !isSupported) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices.length > 0) voicesRef.current = currentVoices;
      const preferredVoice = selectPreferredVoiceByGender(
        currentVoices.length > 0 ? currentVoices : voicesRef.current,
        preferredGender,
      );

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.lang = preferredVoice?.lang || "en-GB";
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utteranceRef.current = utterance;
      utterance.onstart = () => {
        if (utteranceRef.current === utterance) setIsSpeaking(true);
      };
      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
        }
      };
      utterance.onerror = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
        }
      };
      window.speechSynthesis.speak(utterance);
    },
    [enabled, isSupported, preferredGender],
  );

  useEffect(() => stop, [stop]);

  return { isSpeaking, isSupported, speak, stop };
}
