import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../store/useUploadStore';
import Papa from 'papaparse';

export const Upload = () => {
    const navigate = useNavigate();
    const { setFileFlow } = useUploadStore();
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        
        Papa.parse(file, {
            header: true,
            preview: 5,
            skipEmptyLines: true,
            complete: (results) => {
                const cols = results.meta.fields || [];
                const rows = results.data;
                setPreview({ file, cols, rows });
                setFileFlow(file, cols, rows);
            }
        });
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const loadSampleData = async () => {
        try {
            const response = await fetch('/sample.csv');
            const csvText = await response.text();
            
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cols = results.meta.fields || [];
                    const rows = results.data;
                    
                    // Create a dummy file object for consistency in the store
                    const blob = new Blob([csvText], { type: 'text/csv' });
                    const file = new File([blob], 'uci_sample.csv', { type: 'text/csv' });
                    
                    setPreview({ file, cols, rows: rows.slice(0, 5) });
                    setFileFlow(file, cols, rows.slice(0, 5));
                    useUploadStore.getState().setSampleMode(true);
                }
            });
        } catch (error) {
            console.error("Failed to load sample dataset", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-12 animate-in fade-in duration-700 relative">
            
            {/* Top Left Go Back Arrow */}
            <button 
                onClick={() => navigate('/dashboard')}
                className="absolute top-12 left-0 flex items-center justify-center p-3 text-on-surface-variant hover:bg-slate-100 hover:text-primary rounded-full transition-all group"
                title="Go back to Dashboard"
            >
                <span className="material-symbols-outlined text-[24px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            </button>

            {/* Step Indicators */}
            <div className="flex justify-center items-center gap-3 mb-10">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-primary"></div>
                    <span className="text-[11px] font-black tracking-widest uppercase text-primary">Data</span>
                </div>
                <div className="h-[1px] w-4 bg-outline-variant opacity-30"></div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-12 rounded-full bg-surface-container-highest"></div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">Variables</span>
                </div>
                <div className="h-[1px] w-4 bg-outline-variant opacity-30"></div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-12 rounded-full bg-surface-container-highest"></div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">Model</span>
                </div>
            </div>

            {/* Onboarding Card */}
            <div className="bg-white rounded-2xl p-10 ring-1 ring-outline-variant/10 shadow-xl w-full">
                <div className="mb-10">
                    <h1 className="text-2xl font-black tracking-tight text-on-surface mb-2">Step 1: Upload Dataset</h1>
                    <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                        Prepare your clinical or operational data for bias analysis. We support structured formats for high-precision auditing.
                    </p>
                </div>

                {/* Drag and Drop Zone */}
                <div 
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer mb-6 ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low/30 hover:bg-surface-container-low'}`}
                >
                    <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-on-surface mb-1">{preview ? preview.file.name : "Drop dataset or browse"}</p>
                        <p className="text-xs text-on-surface-variant mb-6">Drag and drop CSV or Excel files from your local drive</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] font-black text-on-surface-variant uppercase tracking-wider">.CSV</span>
                            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] font-black text-on-surface-variant uppercase tracking-wider">.XLSX</span>
                        </div>
                    </div>
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={(e) => handleFile(e.target.files[0])} />
                </div>

                {preview && (
                     <div className="mb-10 rounded-xl overflow-hidden ring-1 ring-outline-variant/10 text-[11px]">
                         <table className="w-full text-left border-collapse">
                             <thead className="bg-surface-container-low">
                                 <tr>
                                     {preview.cols.slice(0, 4).map(c => <th key={c} className="px-3 py-2 font-black uppercase text-on-surface-variant">{c}</th>)}
                                 </tr>
                             </thead>
                             <tbody>
                                 {preview.rows.slice(0, 3).map((r, i) => (
                                     <tr key={i} className="border-t border-outline-variant/5">
                                         {preview.cols.slice(0, 4).map(c => <td key={c} className="px-3 py-2 text-on-surface-variant truncate max-w-[80px]">{r[c]}</td>)}
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                )}

                {/* Security Note */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl mb-10">
                    <span className="material-symbols-outlined text-primary text-[20px]">encrypted</span>
                    <p className="text-[11px] leading-normal text-on-surface-variant">
                        <strong>Security Protocol:</strong> Your data is encrypted in transit and processed within an isolated sandbox. Files are automatically purged after the audit completion.
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-outline-variant/10">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-xs font-black text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors"
                    >
                        Go Back
                    </button>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={loadSampleData}
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                            Use Sample Dataset
                        </button>
                        <button 
                            disabled={!preview}
                            onClick={() => navigate('/attribute-selection')}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 dark:bg-primary"
                        >
                            Next: Define Attributes
                        </button>
                    </div>
                </div>
            </div>

            {/* Contextual Help */}
            <div className="mt-8 flex justify-center gap-8 text-on-surface-variant">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    <span>Docs</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    <span>Compliance</span>
                </div>
            </div>
        </div>
    );
};
