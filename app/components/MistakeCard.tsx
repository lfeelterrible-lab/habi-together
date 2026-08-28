type MistakeCardProps = {
  number: string;
  error: string;
  why: string;
  correct: string;
};

export default function MistakeCard({ number, error, why, correct }: MistakeCardProps) {
  return (
    <article className="mistake-card">
      <div className="mistake-card-head">
        <span className="mistake-number">错误 {number}</span>
        <span className="mistake-mark" aria-hidden="true">×</span>
      </div>
      <p className="mistake-error">“{error}”</p>
      <div className="mistake-block">
        <p className="mistake-label">为什么错</p>
        <p>{why}</p>
      </div>
      <div className="mistake-block mistake-block--correct">
        <p className="mistake-label">正确理解</p>
        <p>{correct}</p>
      </div>
    </article>
  );
}
