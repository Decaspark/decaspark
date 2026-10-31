import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';

export const App: React.FC = () => {
  useEffect(() => {
    const rootEl = document.getElementById('root');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      rootEl?.classList.add('is-ready');
      return;
    }
    const timer = window.setTimeout(() => {
      rootEl?.classList.add('is-ready');
    }, 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="cmp-page__skiptomaincontent">
        <a className="cmp-page__skiptomaincontent-link" href="#main">
          Skip to main content
        </a>
      </div>
      <Navbar />
      <main id="main" className="ds-empty-page" tabIndex={-1} />
    </>
  );
};

export default App;
