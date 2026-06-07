export function getBiasColor(score, isWarningAsAmber = true) {
    if (score >= 0.90) return "text-secondary bg-secondary-container";
    if (score >= 0.80) return isWarningAsAmber ? "text-[#937500] bg-[#FFEA7D]" : "text-tertiary bg-tertiary-container";
    return "text-tertiary bg-tertiary-container";
}

export function getStatusText(score) {
    if (score >= 0.90) return "PASS";
    if (score >= 0.80) return "WARNING";
    return "FAIL";
}
