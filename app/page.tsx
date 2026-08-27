'use client';

import TemporalArchive from './components/TemporalArchive';

export default function Home() {
  return (
    <main className="temporal-page">
      <div className="temporal-stage" aria-label="Interactive temporal slice archive">
        <TemporalArchive />
      </div>

      <div className="archive-loading" role="status">
        <span className="loading-rule" />
        <span>LOADING TEMPORAL MEMORY...</span>
      </div>

      <header className="archive-header" aria-label="Archive information">
        <div className="archive-mark">
          <span className="archive-mark-glyph" aria-hidden="true">◌</span>
          <span>TEMPORAL ARCHIVE</span>
        </div>
        <div className="archive-header-meta">
          <span>SCENE / 01</span>
          <span className="live-indicator"><i aria-hidden="true" />LIVE</span>
        </div>
      </header>

      <div className="archive-hint" aria-hidden="true">
        <span className="hint-line" />
        <span>MOVE TO SEPARATE TIME</span>
        <span className="hint-line hint-line-right" />
      </div>

      <div className="archive-readout" aria-live="polite">
        <div><span>FRAME</span><strong id="frame-readout">01 / 60</strong></div>
        <div><span>DEPTH</span><strong id="depth-readout">00.00 M</strong></div>
        <div><span>STATE</span><strong id="state-readout">DRIFTING</strong></div>
      </div>

      <div className="archive-footer">
        <span>© TEMPORAL MEMORY UNIT</span>
        <span>CLICK / TIME BURST</span>
      </div>
    </main>
  );
}
