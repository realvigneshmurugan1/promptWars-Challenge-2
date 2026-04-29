import React from 'react';
import InteractiveGuide from '@/components/InteractiveGuide/InteractiveGuide';
import DynamicTimeline from '@/components/DynamicTimeline/DynamicTimeline';
import PollingLocator from '@/components/PollingLocator/PollingLocator';

export default function Home() {
  return (
    <div className="app-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Civic Navigator</h1>
          <p className="hero-subtitle">
            Your neutral, step-by-step guide to understanding the election process, deadlines, and voting procedures.
          </p>
        </div>
      </header>

      <main className="main-content">
        <section aria-labelledby="guide-section" className="section">
          <h2 id="guide-section" className="sr-only">Understanding the Process</h2>
          <InteractiveGuide />
        </section>

        <section aria-labelledby="timeline-section" className="section bg-alt">
          <div className="section-inner">
            <h2 id="timeline-section" className="sr-only">Important Deadlines</h2>
            <DynamicTimeline />
          </div>
        </section>

        <section aria-labelledby="locator-section" className="section">
          <div className="section-inner">
            <h2 id="locator-section" className="sr-only">Where to Vote</h2>
            <PollingLocator />
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Data provided by Google Civic Information and Google Maps APIs. This tool is neutral and does not support any specific candidates or parties.
        </p>
      </footer>
    </div>
  );
}
