import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const GroupComparisonChart = ({ data }) => {
    // The data comes as: [{ attribute: "Gender", group: "Male", positive_rate: 0.65 }, ...]
    // Need to pivot this to group by attribute or plot as is.
    // For simplicity, let's just plot 'group' on X and 'positive_rate' on Y
    
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                    <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{fill: '#464555'}} />
                    <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#464555'}} />
                    <Tooltip cursor={{fill: '#f3f4f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="positive_rate" name="Positive Outcome Rate" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
