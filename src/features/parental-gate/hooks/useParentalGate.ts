import { useState, useCallback, useRef } from 'react';
import {
  generateMathQuestion,
  verifyAnswer,
  type MathQuestion,
} from '../utils/mathQuestion';

const HOLD_DURATION_MS = 3000;

interface UseParentalGateOptions {
  onSuccess: () => void;
  onCancel?: () => void;
}

interface UseParentalGateReturn {
  // State
  isVisible: boolean;
  question: MathQuestion;
  userAnswer: string;
  isWrong: boolean;
  holdProgress: number;
  isHolding: boolean;

  // Actions
  show: () => void;
  hide: () => void;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  startHold: () => void;
  endHold: () => void;
  regenerateQuestion: () => void;
}

export function useParentalGate({
  onSuccess,
  onCancel,
}: UseParentalGateOptions): UseParentalGateReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [question, setQuestion] = useState<MathQuestion>(() => generateMathQuestion());
  const [userAnswer, setUserAnswer] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const holdStartTimeRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successCallbackRef = useRef(onSuccess);

  // Keep callback ref updated
  successCallbackRef.current = onSuccess;

  const clearHoldInterval = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    holdStartTimeRef.current = null;
  }, []);

  const show = useCallback(() => {
    setQuestion(generateMathQuestion());
    setUserAnswer('');
    setIsWrong(false);
    setHoldProgress(0);
    setIsHolding(false);
    clearHoldInterval();
    setIsVisible(true);
  }, [clearHoldInterval]);

  const hide = useCallback(() => {
    setIsVisible(false);
    clearHoldInterval();
    onCancel?.();
  }, [clearHoldInterval, onCancel]);

  const setAnswer = useCallback((answer: string) => {
    setUserAnswer(answer);
    setIsWrong(false);
  }, []);

  const submitAnswer = useCallback(() => {
    if (verifyAnswer(question, userAnswer)) {
      setIsVisible(false);
      clearHoldInterval();
      successCallbackRef.current();
    } else {
      setIsWrong(true);
      setUserAnswer('');
    }
  }, [question, userAnswer, clearHoldInterval]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    holdStartTimeRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      if (holdStartTimeRef.current === null) return;

      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        clearHoldInterval();
        setIsHolding(false);
        setHoldProgress(0);
        setIsVisible(false);
        successCallbackRef.current();
      }
    }, 50);
  }, [clearHoldInterval]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    clearHoldInterval();
  }, [clearHoldInterval]);

  const regenerateQuestion = useCallback(() => {
    setQuestion(generateMathQuestion());
    setUserAnswer('');
    setIsWrong(false);
  }, []);

  return {
    isVisible,
    question,
    userAnswer,
    isWrong,
    holdProgress,
    isHolding,
    show,
    hide,
    setAnswer,
    submitAnswer,
    startHold,
    endHold,
    regenerateQuestion,
  };
}

