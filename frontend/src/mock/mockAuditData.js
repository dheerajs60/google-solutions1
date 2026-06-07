export const mockAuditData = {
    id: "mock_12345",
    overall_score: 0.82,
    metrics: {
        demographic_parity: { value: 0.85, status: "WARNING", description: "Difference in positive prediction rates between groups." },
        equal_opportunity: { value: 0.92, status: "PASS", description: "Difference in true positive rates between groups." },
        disparate_impact: { value: 0.76, status: "FAIL", description: "Ratio of positive rates between groups." }
    },
    heatmap: [
        {
            attribute: "Gender",
            demographic_parity: { score: 0.88, status: "WARNING" },
            equal_opportunity: { score: 0.95, status: "PASS" },
            disparate_impact: { score: 0.79, status: "FAIL" }
        },
        {
            attribute: "Age",
            demographic_parity: { score: 0.94, status: "PASS" },
            equal_opportunity: { score: 0.91, status: "PASS" },
            disparate_impact: { score: 0.85, status: "WARNING" }
        }
    ],
    lineage: [
        { stage: "Data Loading", status: "PASS", description: "Successfully loaded dataset" },
        { stage: "Preprocessing", status: "PASS", description: "Handled missing values and encoding" },
        { stage: "Feature Engineering", status: "WARNING", description: "Potential proxy variables detected" },
        { stage: "Model Training", status: "PASS", description: "RandomForest classifier trained" },
        { stage: "Bias Evaluation", status: "PASS", description: "Computed FairLens metrics" }
    ],
    gemini_explanation: "The model indicates a Warning for the Feature Engineering stage. We detected that certain non-sensitive attributes may be acting as proxies for Gender. The Disparate Impact score is 0.76, indicating some disparity in outcomes. Consider applying reweighing mitigation to balance the dataset.",
    group_comparisons: [
        { attribute: "Gender", group: "Male", positive_rate: 0.65 },
        { attribute: "Gender", group: "Female", positive_rate: 0.45 },
        { attribute: "Age", group: "<30", positive_rate: 0.52 },
        { attribute: "Age", group: ">=30", positive_rate: 0.58 }
    ]
};
