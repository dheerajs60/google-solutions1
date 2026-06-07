import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isCurrent = payload.type === "Current";
    const color = isCurrent ? '#4F46E5' : '#10B981'; // Indigo for current, Emerald for after

    return (
        <g>
            <circle 
                cx={cx} 
                cy={cy} 
                r={isCurrent ? 8 : 10} 
                fill={color} 
                fillOpacity={0.2} 
            />
            <circle 
                cx={cx} 
                cy={cy} 
                r={isCurrent ? 4 : 5} 
                fill={color} 
                stroke="#ffffff" 
                strokeWidth={2}
                className="transition-all duration-300 transform hover:scale-150 cursor-pointer" 
            />
        </g>
    );
};

export const ParetoChart = ({ points, isLoading }) => {
    const displayPoints = points.length > 0 ? points : [
        { accuracy: 0.82, fairness: 0.65, type: 'Current' },
        { accuracy: 0.78, fairness: 0.85, type: 'Optimized' }
    ];

    return (
        <div className="h-[300px] w-full relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">data_usage</span>
                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Optimizing Constraints...</span>
                    </div>
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f5" vertical={false} />
                    <XAxis 
                        type="number" 
                        dataKey="accuracy" 
                        name="Accuracy" 
                        domain={[0.5, 1.0]} 
                        tick={{fill: '#464555', fontSize: 10, fontWeight: 600}} 
                        axisLine={false} 
                        tickLine={false} 
                    >
                        <Label value="Model Accuracy (Hold-out Test Set)" offset={-25} position="insideBottom" className="text-[10px] font-bold fill-on-surface-variant uppercase tracking-widest" />
                    </XAxis>
                    <YAxis 
                        type="number" 
                        dataKey="fairness" 
                        name="Fairness" 
                        domain={[0, 1.0]} 
                        tick={{fill: '#464555', fontSize: 10, fontWeight: 600}} 
                        axisLine={false} 
                        tickLine={false} 
                    >
                        <Label value="Fairness Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} className="text-[10px] font-bold fill-on-surface-variant uppercase tracking-widest" />
                    </YAxis>
                    <Tooltip 
                        cursor={{strokeDasharray: '3 3', stroke: '#c7c4d8'}} 
                        contentStyle={{
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '12px'
                        }} 
                    />
                    
                    {displayPoints.length >= 2 && (
                        <ReferenceLine 
                            segment={[
                                { x: displayPoints[0].accuracy, y: displayPoints[0].fairness }, 
                                { x: displayPoints[1].accuracy, y: displayPoints[1].fairness }
                            ]} 
                            stroke="#4F46E5" 
                            strokeDasharray="5 5" 
                            strokeOpacity={0.4}
                        />
                    )}
                    
                    <Scatter name="AI Models" data={displayPoints} shape={<CustomDot />} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
