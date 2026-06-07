import { create } from 'zustand';

export const useUploadStore = create((set) => ({
    file: null,
    columns: [],
    previewRows: [],
    sensitiveAttributes: [],
    targetColumn: '',
    positiveLabel: '1',
    modelType: 'Classification',
    
    auditError: null,
    
    setFileFlow: (file, columns, previewRows) => set({
        file, columns, previewRows, sensitiveAttributes: [], targetColumn: '', auditError: null
    }),
    
    setAuditError: (error) => set({ auditError: error }),
    
    isSampleMode: false,
    
    setSampleMode: (val) => set({ isSampleMode: val }),
    
    toggleSensitiveAttribute: (attr) => set((state) => ({
        sensitiveAttributes: state.sensitiveAttributes.includes(attr) 
            ? state.sensitiveAttributes.filter(a => a !== attr)
            : [...state.sensitiveAttributes, attr]
    })),
    
    setTargetColumn: (col) => set({ targetColumn: col }),
    setPositiveLabel: (label) => set({ positiveLabel: label }),
    setModelType: (type) => set({ modelType: type })
}));
