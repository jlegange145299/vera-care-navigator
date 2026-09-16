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

export function useSpeechOutput(enabled: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  const stop = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !isSupported) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.lang.startsWith("en") && /samantha|aria|jenny|zira|female/i.test(voice.name),
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.02;
      utterance.pitch = 1.02;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [enabled, isSupported],
  );

  useEffect(() => stop, [stop]);

  return { isSpeaking, isSupported, speak, stop };
}
