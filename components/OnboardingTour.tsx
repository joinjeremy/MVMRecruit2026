
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronRightIcon, XMarkIcon } from './icons';

interface Step {
    targetId: string;
    title: string;
    content: string;
    position: 'right' | 'bottom' | 'left' | 'top';
}

const steps: Step[] = [
    { targetId: 'sidebar', title: 'Navigation Menu', content: 'Use this sidebar to navigate between different views like the Dashboard, Candidates list, and your Diary.', position: 'right' },
    { targetId: 'header-add-candidate', title: 'Quick Actions', content: 'Quickly add new candidates or check your notifications here.', position: 'bottom' },
    { targetId: 'view-container', title: 'Main Workspace', content: 'This is where you will manage your tasks, view candidate details, and see reports.', position: 'bottom' },
];

const OnboardingTour: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 }); // Start hidden
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state.hasSeenOnboarding) return;

        const updateTarget = () => {
            const target = document.getElementById(steps[currentStepIndex].targetId);
            if (target) {
                setTargetRect(target.getBoundingClientRect());
            }
        };

        // Delay slightly to ensure layout is settled
        const timer = setTimeout(updateTarget, 100);
        window.addEventListener('resize', updateTarget);
        
        return () => {
            window.removeEventListener('resize', updateTarget);
            clearTimeout(timer);
        };
    }, [currentStepIndex, state.hasSeenOnboarding]);

    // Calculate position with boundary checks
    useLayoutEffect(() => {
        if (!targetRect || !tooltipRef.current) return;

        const step = steps[currentStepIndex];
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const margin = 20;

        let top = 0;
        let left = 0;

        // 1. Calculate Preferred Position
        switch (step.position) {
            case 'right':
                top = targetRect.top + 20;
                left = targetRect.right + 20;
                break;
            case 'bottom':
                top = targetRect.bottom + 20;
                left = targetRect.left;
                break;
            case 'left':
                top = targetRect.top;
                left = targetRect.left - tooltipRect.width - 20;
                break;
            case 'top':
                top = targetRect.top - tooltipRect.height - 20;
                left = targetRect.left;
                break;
        }

        // 2. Clamp to Viewport Boundaries
        const maxLeft = viewportW - tooltipRect.width - margin;
        const maxTop = viewportH - tooltipRect.height - margin;

        // Prevent left overflow
        left = Math.max(margin, left);
        // Prevent right overflow
        left = Math.min(left, maxLeft);
        
        // Prevent top overflow
        top = Math.max(margin, top);
        // Prevent bottom overflow
        top = Math.min(top, maxTop);

        setTooltipStyle({
            top,
            left,
            opacity: 1, // Show after positioning
            transition: 'opacity 0.2s ease-in-out'
        });

    }, [targetRect, currentStepIndex]);

    if (state.hasSeenOnboarding || !targetRect) return null;

    const currentStep = steps[currentStepIndex];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setTooltipStyle(prev => ({ ...prev, opacity: 0 })); // Hide briefly while moving
            setCurrentStepIndex(prev => prev + 1);
        } else {
            dispatch({ type: 'COMPLETE_ONBOARDING' });
        }
    };

    const handleSkip = () => {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
            {/* Dark Overlay with "hole" */}
            {/* We use a massive border to create the cutout effect or just simple overlay. 
                For simplicity in this layout, we'll keep the overlay purely visual/passive 
                and let the highlight box handle focus. */}
            <div className="absolute inset-0 bg-black/50 mix-blend-multiply" />
            
            {/* Highlight Box */}
            <div 
                className="absolute border-2 border-white rounded transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-[101]"
                style={{
                    top: targetRect.top - 5,
                    left: targetRect.left - 5,
                    width: targetRect.width + 10,
                    height: targetRect.height + 10,
                }}
            />

            {/* Tooltip */}
            <div 
                ref={tooltipRef}
                className="absolute bg-white p-6 rounded-xl shadow-2xl z-[102] w-80 pointer-events-auto"
                style={tooltipStyle}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-charcoal">{currentStep.title}</h3>
                    <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-brand-gray-dark mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Step {currentStepIndex + 1} of {steps.length}</span>
                    <button 
                        onClick={handleNext}
                        className="bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center"
                    >
                        {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
