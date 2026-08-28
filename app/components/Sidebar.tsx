import type { NavigationItem } from '../data/sichuan';

type SidebarProps = {
  activeSection: string;
  items: NavigationItem[];
  isMobileOpen: boolean;
  onNavigate: (id: string) => void;
};

export default function Sidebar({ activeSection, items, isMobileOpen, onNavigate }: SidebarProps) {
  return (
    <aside id="mobile-directory" className={`site-sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`} aria-label="学习目录">
      <div className="sidebar-inner">
        <button className="brand-lockup" type="button" onClick={() => onNavigate('top')} aria-label="回到 GeoNote 顶部">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span className="brand-copy">
            <strong>GeoNote</strong>
            <small>HIGH SCHOOL GEOGRAPHY</small>
          </span>
        </button>

        <div className="sidebar-rule" />
        <p className="sidebar-label">本页目录</p>
        <nav className="study-nav" aria-label="四川盆地章节导航">
          {items.map((item) => (
            <button
              className={`study-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={activeSection === item.id ? 'location' : undefined}
            >
              <span className="study-nav-number">{item.number}</span>
              <span>{item.label}</span>
              {activeSection === item.id ? <span className="study-nav-dot" aria-hidden="true" /> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom-note">
          <p>READ / RECALL</p>
          <span>把“条件”写成<br />完整的因果链。</span>
        </div>
      </div>
    </aside>
  );
}
