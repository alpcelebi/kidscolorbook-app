export interface MathQuestion {
  question: string;
  answer: number;
  display: string;
}

type Operation = '+' | '-' | '×';

/**
 * Generate a random math question suitable for a parental gate
 * Operations include addition and subtraction with small numbers
 */
export function generateMathQuestion(): MathQuestion {
  const operations: Operation[] = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let a: number, b: number, answer: number;

  switch (operation) {
    case '+':
      a = Math.floor(Math.random() * 10) + 1; // 1-10
      b = Math.floor(Math.random() * 10) + 1; // 1-10
      answer = a + b;
      break;
    case '-':
      // Ensure positive result
      a = Math.floor(Math.random() * 10) + 5; // 5-14
      b = Math.floor(Math.random() * Math.min(a, 10)) + 1; // 1 to min(a, 10)
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 5) + 2; // 2-6
      b = Math.floor(Math.random() * 5) + 2; // 2-6
      answer = a * b;
      break;
    default:
      a = 5;
      b = 3;
      answer = 8;
  }

  return {
    question: `${a} ${operation} ${b}`,
    answer,
    display: `${a} ${operation} ${b} = ?`,
  };
}

/**
 * Verify if the provided answer is correct
 */
export function verifyAnswer(question: MathQuestion, userAnswer: string): boolean {
  const parsed = parseInt(userAnswer.trim(), 10);
  return !isNaN(parsed) && parsed === question.answer;
}

/**
 * Generate multiple choice options including the correct answer
 */
export function generateOptions(correctAnswer: number, count: number = 4): number[] {
  const options = new Set<number>([correctAnswer]);

  while (options.size < count) {
    // Generate nearby wrong answers
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrongAnswer = correctAnswer + offset;
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }

  // Shuffle the options
  return Array.from(options).sort(() => Math.random() - 0.5);
}

