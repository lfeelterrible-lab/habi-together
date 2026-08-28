'use client';

import { useEffect, useState } from 'react';
import CauseChain from './components/CauseChain';
import ComparisonTable from './components/ComparisonTable';
import ExamQuestion from './components/ExamQuestion';
import KnowledgeCard from './components/KnowledgeCard';
import MistakeCard from './components/MistakeCard';
import Quiz from './components/Quiz';
import SectionTitle from './components/SectionTitle';
import Sidebar from './components/Sidebar';
import {
  agriculturalAdvantages,
  agriculturalLimits,
  climateRows,
  commonMistakes,
  comparisonSides,
  heatLightRows,
  lightCauseLayers,
  navigationItems,
  quickFacts,
} from './data/sichuan';
import { examQuestions, quizQuestions } from './data/questions';

const causeChain = [
  '盆地地形',
  '空气流通和水汽扩散受到一定影响',
  '空气湿度较大',
  '云、雾天气较多',
  '大气对太阳辐射的削弱作用较强',
  '到达地面的太阳辐射较少',
  '日照时间相对较短，光照条件相对较差',
];

const sectionIds = navigationItems.map((item) => item.id);

export default function GeoNote() {
  const [activeSection, setActiveSection] = useState('position');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.1, 0.3] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    setIsMobileOpen(false);
  };

  return (
    <div className="geonote-shell" id="top">
      <Sidebar activeSection={activeSection} items={navigationItems} isMobileOpen={isMobileOpen} onNavigate={navigateTo} />

      <div className="site-main">
        <div className="mobile-toolbar">
          <button type="button" className="mobile-directory-button" onClick={() => setIsMobileOpen((open) => !open)} aria-expanded={isMobileOpen} aria-controls="mobile-directory">
            <span className="mobile-menu-icon" aria-hidden="true"><i /><i /></span>
            目录
          </button>
          <button type="button" className="mobile-top-link" onClick={() => navigateTo('top')}>GeoNote</button>
        </div>

        <main className="reading-content">
          <header className="reading-header">
            <div className="reading-header-meta">
              <span>HIGH SCHOOL GEOGRAPHY</span>
              <span className="reading-header-line" aria-hidden="true" />
              <span>READ / RECALL · 01</span>
            </div>
            <div className="hero-grid">
              <div>
                <p className="hero-kicker">REGIONAL NOTE / SICHUAN BASIN</p>
                <h1>四川盆地</h1>
                <p className="hero-english">Sichuan Basin</p>
                <p className="hero-subtitle">从地形、气候、农业到高考答题，<br />一次弄懂四川盆地。</p>
              </div>
              <aside className="hero-index" aria-label="本页重点">
                <span className="hero-index-number">04</span>
                <span className="hero-index-label">本页重点</span>
                <strong>为什么光照<br />相对不足？</strong>
                <span className="hero-index-note">把条件写成完整的因果链。</span>
              </aside>
            </div>
            <div className="hero-rule" />
            <p className="hero-lead"><strong>先记住：</strong>四川盆地总体温暖湿润，热量条件较好，但受盆地地形、水汽和云雾影响，光照条件相对不足。</p>
          </header>

          <section id="position" className="note-section">
            <SectionTitle number="01" title="四川盆地在哪里？" id="position-title" />
            <div className="section-copy intro-copy">
              <p>四川盆地位于中国西南地区，主要位于四川省东部和重庆市一带。</p>
              <p>四川盆地四周多山地和高原，内部地势相对较低，形成比较明显的盆地地形。</p>
            </div>
            <div className="quick-recognition">
              <div className="subsection-heading"><span className="mini-rule" aria-hidden="true" /><h3>快速认识</h3></div>
              <div className="quick-facts">
                {quickFacts.map((fact) => <div className="fact-item" key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}
              </div>
            </div>
          </section>

          <section id="terrain" className="note-section">
            <SectionTitle number="02" title="四川盆地的地形有什么特点？" id="terrain-title" />
            <div className="core-statement"><span className="core-statement-mark" aria-hidden="true">“</span><p>四周较高，<em>中部较低。</em></p></div>
            <div className="two-column">
              <KnowledgeCard label="地形特点" title="一个相对封闭的低地"><p>四川盆地四周多山地和高原，盆地内部地势相对较低。</p><p>整体具有较强的封闭性。</p></KnowledgeCard>
              <KnowledgeCard label="产生的影响" title="地形会改变局地条件"><p>盆地地形会影响空气流动、水汽扩散、云雾形成、气温、农业和交通。</p></KnowledgeCard>
            </div>
            <div className="keyword-box"><div><span className="callout-label">高考关键词</span><strong>先写地形，再写它带来的大气过程。</strong></div><p>盆地地形 · 四周高 · 中部低 · 相对封闭 · 空气流通较弱</p></div>
          </section>

          <section id="climate" className="note-section">
            <SectionTitle number="03" title="四川盆地是什么气候？" id="climate-title" />
            <div className="section-intro-row">
              <div className="section-copy"><p className="highlight-line">亚热带季风气候。</p><p>四川盆地纬度并不高，热量条件总体较好。但由于空气湿度较大、云雾天气较多，光照条件相对较弱。</p></div>
              <div className="climate-stamp" aria-hidden="true"><span>温暖</span><span>湿润</span></div>
            </div>
            <div className="table-wrap">
              <table className="comparison-table climate-table">
                <caption>四川盆地气候要素</caption>
                <thead><tr><th scope="col">项目</th><th scope="col">四川盆地特点</th></tr></thead>
                <tbody>{climateRows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="warning-box"><span className="warning-icon" aria-hidden="true">!</span><div><strong>注意</strong><p>热量丰富 ≠ 光照充足<br />温度较高 ≠ 太阳辐射一定强</p><small>这是高中地理非常常见的易错点。</small></div></div>
          </section>

          <section id="light" className="note-section note-section--focus">
            <SectionTitle number="04" title="为什么四川盆地光照不足？" id="light-title" eyebrow="CORE LOGIC" />
            <div className="section-copy focus-copy"><p className="focus-lead">不是因为四川盆地“离太阳远”。</p><p>真正原因主要与 <strong>地形 + 水汽 + 云雾 + 大气削弱作用</strong> 有关。</p></div>
            <CauseChain items={causeChain} />
            <div className="layer-grid">
              {lightCauseLayers.map((layer) => <KnowledgeCard key={layer.number} label={layer.number} title={layer.title} tone={layer.tone}>{layer.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{layer.number === '04' ? <p className="inline-keywords"><b>吸收</b><b>反射</b><b>散射</b></p> : null}</KnowledgeCard>)}
            </div>
            <div className="exam-standard">
              <div className="exam-standard-heading"><span>高考怎么写？</span><span className="exam-standard-tag">标准表达</span></div>
              <p className="exam-prompt">题目：分析四川盆地太阳辐射较弱的原因。</p>
              <div className="thinking-path"><span>思考框架</span><b>地形</b><i>→</i><b>水汽</b><i>→</i><b>云雾</b><i>→</i><b>太阳辐射</b></div>
              <blockquote>“四川盆地四周多山地，地形相对封闭，空气流通和水汽扩散受到一定影响；该地区水汽较丰富，空气湿度较大，云雾天气较多；云层和水汽对太阳辐射的削弱作用较强，因此到达地面的太阳辐射较少，日照时间相对较短。”</blockquote>
              <div className="keyword-row"><span>关键词</span>{['盆地地形', '水汽丰富', '空气湿度大', '云雾多', '大气削弱作用', '日照时间短', '太阳辐射较弱'].map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
            </div>
            <div className="logic-note">
              <div className="logic-note-title"><span aria-hidden="true">↳</span><strong>不要死记答案</strong></div>
              <p><b>为什么不能只写：因为降水多？</b></p>
              <p>“降水多”只是现象之一。高考地理更加看重完整的因果逻辑。</p>
              <div className="logic-compare"><div><span>不完整</span><strong>降水多</strong><i>→</i><strong>太阳辐射少</strong></div><div><span>更完整</span><strong>水汽丰富</strong><i>→</i><strong>云量较多</strong><i>→</i><strong>大气削弱作用增强</strong><i>→</i><strong>太阳辐射减少</strong></div></div>
              <p>回答地理综合题时，不要只写结论，要写出中间过程。</p>
            </div>
          </section>

          <section id="agriculture" className="note-section">
            <SectionTitle number="05" title="四川盆地的农业条件" id="agriculture-title" />
            <div className="section-copy"><p>四川盆地温暖湿润，农业基础较好，主要农作物有水稻、油菜、蔬菜、柑橘等。</p></div>
            <div className="two-column agriculture-columns">
              <KnowledgeCard label="有利条件" title="自然基础较好" tone="green"><ul className="check-list">{agriculturalAdvantages.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></KnowledgeCard>
              <KnowledgeCard label="限制因素" title="条件也有边界" tone="orange"><ul className="check-list check-list--limit">{agriculturalLimits.map((item) => <li key={item}><span>!</span>{item}</li>)}</ul></KnowledgeCard>
            </div>
            <div className="note-box"><strong>判断要完整：</strong>“光照不足”只是四川盆地农业自然条件中的一个限制因素，不能把四川盆地说成“农业条件差”。</div>
            <div className="heat-light-block">
              <div className="subsection-heading"><span className="mini-rule" aria-hidden="true" /><h3>热量 ≠ 光照</h3></div>
              <ComparisonTable headers={['概念解释', '四川盆地']} rows={heatLightRows.map((row) => ({ label: row.label, values: [row.value, row.label === '热量' ? '较充足' : '相对较弱'] }))} />
              <p className="one-line-takeaway">一个地方可以比较暖，但不一定阳光很多。</p>
            </div>
          </section>

          <section id="comparison" className="note-section">
            <SectionTitle number="06" title="为什么青藏高原太阳辐射反而很强？" id="comparison-title" />
            <div className="section-copy"><p>决定太阳辐射强弱不能只看纬度，还要比较海拔、天气、云量、大气透明度和水汽条件。</p></div>
            <div className="region-compare">{comparisonSides.map((side) => <article className={'region-card region-card--' + side.tone} key={side.key}><div className="region-card-top"><span className="region-card-index">{side.key === 'basin' ? 'A' : 'B'}</span><h3>{side.label}</h3></div><ul>{side.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
            <div className="compare-conclusion"><span>关键判断</span><strong>大气削弱作用：四川盆地较强 <i>→</i> 青藏高原较弱</strong></div>
          </section>

          <section id="mistakes" className="note-section">
            <SectionTitle number="07" title="这部分最容易错在哪里？" id="mistakes-title" eyebrow="CHECK YOUR LOGIC" />
            <div className="mistake-list">{commonMistakes.map((mistake) => <MistakeCard key={mistake.number} {...mistake} />)}</div>
          </section>

          <section id="exam" className="note-section">
            <SectionTitle number="08" title="高考可能怎么考？" id="exam-title" />
            <div className="section-copy"><p>先自己判断题目考查的自然条件，再展开“条件 → 过程 → 结果”。答案默认收起，适合先思考后核对。</p></div>
            <div className="exam-list">{examQuestions.map((question) => <ExamQuestion key={question.id} question={question} />)}</div>
          </section>

          <section id="quiz" className="note-section">
            <SectionTitle number="09" title="自测" id="quiz-title" eyebrow="RECALL CHECK" />
            <div className="section-copy"><p>选择以后立即获得反馈。不做积分，只检查你是否抓住了核心关系。</p></div>
            <Quiz questions={quizQuestions} />
          </section>

          <section id="summary" className="note-section summary-section">
            <SectionTitle number="10" title="一分钟记住四川盆地" id="summary-title" eyebrow="ONE-PAGE SUMMARY" />
            <div className="summary-card">
              <div className="summary-card-heading"><span>四川盆地</span><small>ONE MINUTE REVIEW</small></div>
              <div className="summary-grid"><div><span>位置</span><strong>中国西南</strong></div><div><span>地形</span><strong>盆地，四周较高、中部较低</strong></div><div><span>气候</span><strong>亚热带季风气候</strong></div><div><span>特点</span><strong>温暖湿润</strong></div><div><span>农业</span><strong>水稻、油菜等</strong></div><div><span>光照</span><strong>相对不足</strong></div></div>
              <div className="summary-chain"><span>核心原因</span><CauseChain items={['盆地地形', '水汽丰富', '云雾较多', '大气削弱增强', '太阳辐射减少']} compact /></div>
              <div className="summary-bottom"><span>最重要易错点</span><strong>热量 ≠ 光照</strong></div>
            </div>
          </section>

          <footer className="reading-footer"><span>GEONOTE / REGIONAL GEOGRAPHY</span><span>把“条件”写成完整的因果链。</span></footer>
        </main>
      </div>
    </div>
  );
}
