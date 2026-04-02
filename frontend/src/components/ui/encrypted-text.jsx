import React, { useState, useEffect } from 'react';

export const EncryptedText = ({
    text,
    revealDelayMs = 50,
    encryptedClassName = "",
    revealedClassName = ""
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(prev => {
                return text.split('').map((char, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
            });

            if (iteration >= text.length) {
                clearInterval(interval);
                setIsRevealed(true);
            }

            iteration += 1 / 3;
        }, revealDelayMs);

        return () => clearInterval(interval);
    }, [text, revealDelayMs]);

    return (
        <span className={isRevealed ? revealedClassName : encryptedClassName}>
            {displayText}
        </span>
    );
};
