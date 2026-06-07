import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getBiasColor } from '../../utils/biasColors';

export const BiasBarChart = ({ data }) => {
    // Transform heatmap data to suitable form if necessary, or just use it.
    // Data expects format like: [{ name: 'Gender', dp: 0.88, eo: 0.95, di: 0.79 }]
    const chartData = data.map(item => ({
        name: item.attribute,
        'Demographic Parity': item.demographic_parity.score,
        'Equal Opportunity': item.equal_opportunity.score,
        'Disparate Impact': item.disparate_impact.score
    }));

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#464555'}} />
                    <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#464555'}} />
                    <Tooltip cursor={{fill: '#f3f4f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Demographic Parity" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-dp-${index}`} fill={entry['Demographic Parity'] >= 0.9 ? '#6cf8bb' : entry['Demographic Parity'] >= 0.8 ? '#FFEA7D' : '#ffd0cc'} />
                        ))}
                    </Bar>
                    <Bar dataKey="Equal Opportunity" radius={[4, 4, 0, 0]}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-eo-${index}`} fill={entry['Equal Opportunity'] >= 0.9 ? '#6cf8bb' : entry['Equal Opportunity'] >= 0.8 ? '#FFEA7D' : '#ffd0cc'} />
                        ))}
                    </Bar>
                    <Bar dataKey="Disparate Impact" radius={[4, 4, 0, 0]}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-di-${index}`} fill={entry['Disparate Impact'] >= 0.9 ? '#6cf8bb' : entry['Disparate Impact'] >= 0.8 ? '#FFEA7D' : '#ffd0cc'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
