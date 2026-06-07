import apiClient from './api';
import { auth } from '../config/firebase';

class AuditService {
    async runAudit(file, sensitiveAttributes, targetColumn, positiveLabel, userId = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sensitive_attributes', sensitiveAttributes);
        formData.append('target_column', targetColumn);
        formData.append('positive_label', positiveLabel);
        if (userId) formData.append('user_id', userId);
        
        const response = await apiClient.post('/audit/run', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    
    async getAudit(auditId) {
        const response = await apiClient.get(`/audit/${auditId}`);
        return response.data;
    }
    
    async runMitigation(auditId, reweighingStrength, thresholdAdjust, applyPostProcessing) {
        const response = await apiClient.post('/audit/mitigate', {
            audit_id: auditId,
            reweighing_strength: reweighingStrength,
            threshold_adjust: thresholdAdjust,
            apply_postprocessing: applyPostProcessing
        });
        return response.data;
    }
    
    async getAnalysis(auditId) {
        const response = await apiClient.get(`/audit/${auditId}/analysis`);
        return response.data;
    }
    
    async getAnalysisStream(auditId, onChunk) {
        const baseURL = apiClient.defaults.baseURL || '';
        const url = `${baseURL}/audit/${auditId}/analysis/stream`;
        const token = await auth.currentUser.getIdToken();
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    }
    
    async getHistory(userId = null) {
        const params = userId ? { user_id: userId } : {};
        const response = await apiClient.get('/audit/history', { params });
        return response.data;
    }

    async downloadAuditCSV(auditId) {
        const baseURL = apiClient.defaults.baseURL || '';
        const url = `${baseURL}/audit/${auditId}/export/csv`;
        window.open(url, '_blank');
    }

    async getSettings(userId) {
        const response = await apiClient.get(`/audit/settings/${userId}`);
        return response.data;
    }

    async updateSettings(userId, settings) {
        const response = await apiClient.post(`/audit/settings/${userId}`, settings);
        return response.data;
    }
    
    getUserId() {
        return auth.currentUser?.uid;
    }
}

export const auditService = new AuditService();
