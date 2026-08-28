type SectionTitleProps = {
  number: string;
  title: string;
  id: string;
  eyebrow?: string;
};

export default function SectionTitle({ number, title, id, eyebrow = 'REGIONAL GEOGRAPHY' }: SectionTitleProps) {
  return (
    <div className="section-title-wrap">
      <span className="section-number" aria-hidden="true">{number}</span>
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title" id={id}>{title}</h2>
      </div>
    </div>
  );
}
