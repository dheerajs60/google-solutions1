import React from 'react';
import { getBiasColor, getStatusText } from '../../utils/biasColors';
import clsx from 'clsx';

export const HeatmapCell = ({ score, status }) => {
    // Determine exact color class
    let colorClass = "";
    const activeStatus = status || getStatusText(score);
    
    // Specifically styling for heatmap to be subtle
    if (activeStatus === "PASS") colorClass = "bg-secondary-container/50 text-secondary";
    else if (activeStatus === "WARNING") colorClass = "bg-[#FFEA7D]/50 text-[#937500]";
    else colorClass = "bg-tertiary-container/50 text-tertiary";

    return (
        <div className="flex items-center justify-center p-2">
            <span className={clsx("px-3 py-1 rounded w-full text-center text-sm font-medium", colorClass)}>
                {score?.toFixed(2)}
            </span>
        </div>
    );
};
