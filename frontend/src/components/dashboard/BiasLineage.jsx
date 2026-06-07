import React from 'react';
import clsx from 'clsx';

export const BiasLineage = ({ stages }) => {
    // Default stages if none provided
    const defaultStages = [
        { stage: "Raw Data", score: 0.96, status: "PASS" },
        { stage: "Preprocessing", score: 0.92, status: "PASS" },
        { stage: "Feature Engineering", score: 0.68, status: "FAIL" },
        { stage: "Model Training", score: 0.82, status: "WARNING" },
        { stage: "Thresholding", score: 0.85, status: "WARNING" }
    ];

    const displayStages = stages || defaultStages;

    return (
        <div className="card-layer p-6 flex flex-col justify-between h-full">
            <h3 className="headline-small mb-6">Bias Lineage</h3>
            <div className="relative space-y-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-surface-container-highest"></div>
                
                {displayStages.map((item, idx) => (
                    <div key={idx} className={clsx("relative flex items-center space-x-4", idx > 2 && "opacity-50")}>
                        <div className={clsx(
                            "z-10 w-6 h-6 rounded-full flex items-center justify-center border-2",
                            item.status === "PASS" ? "bg-secondary-container border-secondary" :
                            item.status === "WARNING" ? "bg-warning-container border-warning" :
                            "bg-error-container border-error"
                        )}>
                            {item.status === "FAIL" ? (
                                <span className="material-symbols-outlined text-[10px] text-error font-black">warning</span>
                            ) : (
                                <div className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    item.status === "PASS" ? "bg-secondary" : "bg-warning"
                                )}></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-on-surface">{item.stage}</p>
                            <span className={clsx(
                                "text-[10px] font-bold uppercase",
                                item.status === "PASS" ? "text-secondary" :
                                item.status === "WARNING" ? "text-warning" : "text-error"
                            )}>
                                {item.score ? `${item.score.toFixed(2)} Score` : item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
