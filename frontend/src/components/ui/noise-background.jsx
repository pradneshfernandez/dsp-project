import React from 'react';

export const NoiseBackground = ({
    children,
    containerClassName = "",
    gradientColors = ["rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"]
}) => {
    return (
        <div className={`relative group ${containerClassName}`} style={{
            background: `linear-gradient(to right, ${gradientColors.join(', ')})`,
            padding: '2px', // Border-like padding
        }}>
            {/* Noise Overlay Filter */}
            <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none rounded-[inherit] overflow-hidden">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full rounded-[inherit]">
                {children}
            </div>
        </div>
    );
};
