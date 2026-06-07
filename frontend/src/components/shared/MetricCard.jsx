import React from 'react';
import { RAGBadge } from './RAGBadge';
import { HelpCircle } from 'lucide-react';
import clsx from 'clsx';

const TOOLTIPS = {
    "Overall Fairness": "A weighted composite score representing the overall compliance with statistical parity, equal opportunity, and disparate impact metrics.",
    "Demographic Parity": "Audits if the base rate of positive outcomes is distributed equally across all demographic populations regardless of underlying conditions.",
    "Equal Opportunity": "Measures if strictly qualified candidates from different minority groups have an identical True Positive probability of selection.",
    "Disparate Impact": "The 4/5ths Rule ratio. Determines if the positive outcome rate of the minority group is at least 80% that of the majority group."
};

export const MetricCard = ({ title, score, description, className }) => {
    return (
        <div className={clsx("card-layer p-6 space-y-3 relative group", className)}>
            <div className="flex justify-between items-center">
                <p className="headline-small">{title}</p>
                <div className="relative group/tooltip cursor-help z-20">
                    <HelpCircle size={16} className="text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity dark:text-slate-500" />
                    <div className="absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[10px] p-3 rounded-lg w-48 right-0 top-6 shadow-xl font-medium leading-relaxed dark:bg-slate-800">
                        {TOOLTIPS[title] || "Metric definition unavailable."}
                    </div>
                </div>
            </div>
            
            <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold tracking-tighter text-on-surface dark:text-white">
                    {(score !== undefined && score !== null) ? score.toFixed(2) : '-.--'}
                </span>
                <span className="text-lg text-on-surface-variant dark:text-slate-500">/1.00</span>
            </div>
            
            {/* Visual range indicator like in the design */}
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                    className={clsx(
                        "h-full transition-all duration-500",
                        score > 0.9 ? "bg-secondary" : score > 0.8 ? "bg-warning" : "bg-error"
                    )}
                    style={{ width: `${(score || 0) * 100}%` }}
                ></div>
            </div>
            
            <p className="text-xs font-medium text-on-surface-variant leading-tight">
                {description}
            </p>
        </div>
    );
};
