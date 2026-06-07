class GeminiService {
    typewriteText(text, onNextChar, onComplete, speed = 30) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                onNextChar(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);
        
        return () => clearInterval(interval);
    }
}

export const geminiService = new GeminiService();
