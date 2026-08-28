import { useId, useState } from 'react';
import type { ExamQuestionData } from '../data/questions';

type ExamQuestionProps = {
  question: ExamQuestionData;
};

export default function ExamQuestion({ question }: ExamQuestionProps) {
  const [showThought, setShowThought] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const baseId = useId();
  const thoughtId = `${baseId}-thought`;
  const answerId = `${baseId}-answer`;

  return (
    <article className="exam-question">
      <div className="exam-question-top">
        <span>{question.type}</span>
        <span className="exam-question-symbol" aria-hidden="true">↗</span>
      </div>
      <h3>{question.title}</h3>
      <div className="exam-question-actions">
        <button
          type="button"
          className={`exam-toggle ${showThought ? 'is-open' : ''}`}
          onClick={() => setShowThought((open) => !open)}
          aria-expanded={showThought}
          aria-controls={thoughtId}
        >
          <span>{showThought ? '收起思路' : '查看思路'}</span>
          <span aria-hidden="true">{showThought ? '−' : '+'}</span>
        </button>
        <button
          type="button"
          className={`exam-toggle exam-toggle--answer ${showAnswer ? 'is-open' : ''}`}
          onClick={() => setShowAnswer((open) => !open)}
          disabled={!showThought}
          aria-expanded={showAnswer}
          aria-controls={answerId}
        >
          <span>{showAnswer ? '收起答案' : '查看答案'}</span>
          <span aria-hidden="true">{showAnswer ? '−' : '+'}</span>
        </button>
      </div>
      {showThought ? <div className="exam-reveal exam-reveal--thought" id={thoughtId}>{question.thought}</div> : null}
      {showAnswer ? <div className="exam-reveal exam-reveal--answer" id={answerId}><strong>参考答案</strong><p>{question.answer}</p></div> : null}
    </article>
  );
}
