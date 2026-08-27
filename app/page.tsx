'use client';

import { useState } from 'react';
import CharacterViewer from './components/CharacterViewer';

export default function Home() {
  const [viewerKey, setViewerKey] = useState(0);

  return (
    <main className="study-page">
      <header className="topbar">
        <a className="wordmark" href="#top">
          <span className="wordmark-dot" />IMG2THREEJS <em>/</em> CHARACTER STUDY
        </a>
        <div className="topbar-meta"><span>单张视角重建</span><span className="status-dot" />LIVE PREVIEW</div>
      </header>

      <section className="hero-study" id="top">
        <div className="hero-study-copy">
          <p className="kicker">CASE 08 · INTERACTIVE GLB CHARACTER</p>
          <h1>雨幕下的<br /><i>小人</i></h1>
          <p className="lede">将手绘角色做成可探索的 3D 模型。拖动查看不同角度，滚轮拉近或退远，仍保留原页面的克制色彩与纸上构图感。</p>
          <div className="hero-actions">
            <a className="primary-button" href="#breakdown">查看拆解 <span>↘</span></a>
            <button className="text-button" type="button" onClick={() => setViewerKey((value) => value + 1)}>
              重置角色视角
            </button>
          </div>
          <div className="hero-note"><span className="note-rule" />PUBLIC / MODELS / MY-CHARACTER.GLB · R3F VIEWER</div>
        </div>

        <div className="scene-frame">
          <div className="scene-label scene-label-top"><span>VIEWPORT / 02</span><span>R3F · GLB MODEL</span></div>
          <div className="scene-canvas" key={viewerKey}>
            <CharacterViewer />
          </div>
          <div className="scene-label scene-label-bottom"><span>PUBLIC / MODELS / MY-CHARACTER.GLB</span><span>DRAG TO ROTATE · SCROLL TO ZOOM</span></div>
          <div className="scene-crosshair" aria-hidden="true" />
        </div>
      </section>

      <section className="breakdown" id="breakdown">
        <div className="section-intro"><p className="kicker">SCULPT NOTES</p><h2>从轮廓开始，<br />再让细节长出来。</h2></div>
        <div className="breakdown-grid">
          <article><span className="index">01</span><h3>轮廓</h3><p>GLB 直接加载到 React Three Fiber 场景里，保留角色圆润、手绘感的分面轮廓。</p></article>
          <article><span className="index">02</span><h3>探索</h3><p>鼠标拖动控制轨道旋转，滚轮控制距离，让模型的体积和层次自然展开。</p></article>
          <article><span className="index">03</span><h3>反馈</h3><p>暖色主光、冷色补光和柔和接触阴影延续原场景的深绿与纸面质感，不引入新的页面语言。</p></article>
        </div>
      </section>

      <footer className="site-footer"><span>IMG2THREEJS / CHARACTER STUDY</span><span>GLB MODEL · R3F INTERACTION</span></footer>
    </main>
  );
}
