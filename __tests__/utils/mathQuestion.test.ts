import {
  generateMathQuestion,
  verifyAnswer,
  generateOptions,
} from '../../src/features/parental-gate/utils/mathQuestion';

describe('Math Question Generator', () => {
  describe('generateMathQuestion', () => {
    it('should generate a question with valid structure', () => {
      const question = generateMathQuestion();

      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('answer');
      expect(question).toHaveProperty('display');
      expect(typeof question.answer).toBe('number');
      expect(question.display).toContain('= ?');
    });

    it('should generate questions with positive answers', () => {
      // Run multiple times to test different operations
      for (let i = 0; i < 50; i++) {
        const question = generateMathQuestion();
        expect(question.answer).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate questions with reasonable difficulty', () => {
      for (let i = 0; i < 50; i++) {
        const question = generateMathQuestion();
        // Answer should be in a reasonable range for adults
        expect(question.answer).toBeLessThanOrEqual(36); // max 6 × 6
      }
    });
  });

  describe('verifyAnswer', () => {
    it('should return true for correct answers', () => {
      const question = { question: '5 + 3', answer: 8, display: '5 + 3 = ?' };
      expect(verifyAnswer(question, '8')).toBe(true);
    });

    it('should return false for incorrect answers', () => {
      const question = { question: '5 + 3', answer: 8, display: '5 + 3 = ?' };
      expect(verifyAnswer(question, '7')).toBe(false);
      expect(verifyAnswer(question, '9')).toBe(false);
    });

    it('should handle whitespace in answers', () => {
      const question = { question: '5 + 3', answer: 8, display: '5 + 3 = ?' };
      expect(verifyAnswer(question, ' 8 ')).toBe(true);
      expect(verifyAnswer(question, '  8')).toBe(true);
    });

    it('should return false for non-numeric answers', () => {
      const question = { question: '5 + 3', answer: 8, display: '5 + 3 = ?' };
      expect(verifyAnswer(question, 'eight')).toBe(false);
      expect(verifyAnswer(question, 'abc')).toBe(false);
      expect(verifyAnswer(question, '')).toBe(false);
    });
  });

  describe('generateOptions', () => {
    it('should return the correct number of options', () => {
      const options = generateOptions(10, 4);
      expect(options).toHaveLength(4);
    });

    it('should include the correct answer', () => {
      const correctAnswer = 15;
      const options = generateOptions(correctAnswer, 4);
      expect(options).toContain(correctAnswer);
    });

    it('should have all positive numbers', () => {
      const options = generateOptions(5, 4);
      options.forEach((option) => {
        expect(option).toBeGreaterThan(0);
      });
    });

    it('should have unique values', () => {
      const options = generateOptions(10, 4);
      const uniqueOptions = new Set(options);
      expect(uniqueOptions.size).toBe(options.length);
    });
  });
});

