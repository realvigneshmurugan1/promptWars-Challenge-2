"use client";

import React, { useState } from 'react';
import styles from './InteractiveGuide.module.css';

const STEPS = [
  {
    id: 'registration',
    title: 'Voter Registration',
    content: 'The first step is ensuring you are registered to vote. You can check your status online. If you are not registered, you must do so before your state’s deadline.',
  },
  {
    id: 'methods',
    title: 'Ways to Vote',
    content: 'Depending on your state, you can vote in person on Election Day, vote early in person, or vote by mail (absentee voting).',
  },
  {
    id: 'mail',
    title: 'Voting by Mail',
    content: 'If voting by mail, carefully follow the instructions on your ballot. Sign the envelope where required and return it via mail or official drop box by the deadline.',
  },
  {
    id: 'inperson',
    title: 'Voting In Person',
    content: 'If voting in person, find your polling location and check if you need to bring a valid ID. Polls have specific opening and closing times.',
  }
];

export default function InteractiveGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={styles.guideContainer} aria-labelledby="guide-heading">
      <h2 id="guide-heading" className={styles.heading}>Interactive Election Guide</h2>
      
      <div className={styles.progressContainer} aria-hidden="true">
        {STEPS.map((step, index) => (
          <div 
            key={step.id} 
            className={`${styles.progressDot} ${index <= currentStep ? styles.activeDot : ''}`}
          />
        ))}
      </div>

      <div 
        className={styles.contentCard} 
        aria-live="polite" 
        role="region"
      >
        <h3 className={styles.stepTitle}>{STEPS[currentStep].title}</h3>
        <p className={styles.stepContent}>{STEPS[currentStep].content}</p>
      </div>

      <div className={styles.controls}>
        <button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className={styles.button}
          aria-label="Previous step"
        >
          Previous
        </button>
        <div className={styles.stepIndicator}>
          Step {currentStep + 1} of {STEPS.length}
        </div>
        <button 
          onClick={nextStep} 
          disabled={currentStep === STEPS.length - 1}
          className={styles.button}
          aria-label="Next step"
        >
          Next
        </button>
      </div>
    </div>
  );
}
