import React from 'react';
import { getBiasColor, getStatusText } from '../../utils/biasColors';
import clsx from 'clsx';

export const RAGBadge = ({ score, forceStatus, className, isWarningAsAmber = true }) => {
    const statusText = forceStatus || getStatusText(score);
    let colorClass = "";
    
    if (statusText === "PASS") colorClass = "text-secondary bg-secondary-container";
    else if (statusText === "WARNING") colorClass = isWarningAsAmber ? "text-[#937500] bg-[#FFEA7D]" : "text-tertiary bg-tertiary-container";
    else colorClass = "text-tertiary bg-tertiary-container";

    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", colorClass, className)}>
            {statusText}
        </span>
    );
};
