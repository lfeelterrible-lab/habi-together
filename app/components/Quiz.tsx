import { useState } from 'react';
import type { QuizQuestion } from '../data/questions';

type QuizProps = {
  questions: QuizQuestion[];
};

export default function Quiz({ questions }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <div className="quiz-list">
      {questions.map((question, index) => {
        const selected = answers[question.id];
        const isCorrect = selected === question.answer;
        return (
          <fieldset className="quiz-question" key={question.id}>
            <legend><span>{String(index + 1).padStart(2, '0')}</span>{question.prompt}</legend>
            <div className="quiz-options">
              {question.options.map((option) => {
                const isSelected = selected === option.label;
                const stateClass = isSelected ? (isCorrect ? 'is-correct' : 'is-wrong') : '';
                return (
                  <button
                    className={`quiz-option ${stateClass}`}
                    type="button"
                    key={option.label}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.label }))}
                    aria-pressed={isSelected}
                  >
                    <span className="quiz-option-label">{option.label}</span>
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <div className={`quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
                <strong>{isCorrect ? '正确' : '错误'}</strong>
                <span>{question.explanation}</span>
              </div>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
