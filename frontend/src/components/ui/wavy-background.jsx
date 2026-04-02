"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const WavyBackground = ({
    children,
    className,
    containerClassName,
    colors,
    waveWidth,
    backgroundFill,
    blur = 10,
    speed = "fast",
    waveOpacity = 0.5,
    ...props
}) => {
    const noise3D = createNoise3D();
    let canvasRef = useRef(null);
    const getSpeed = () => {
        switch (speed) {
            case "slow": return 0.001;
            case "fast": return 0.002;
            default: return 0.001;
        }
    };

    const init = () => {
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");
        let w = (ctx.canvas.width = window.innerWidth);
        let h = (ctx.canvas.height = window.innerHeight);
        ctx.filter = `blur(${blur}px)`;
        let nt = 0;

        const waveColors = colors ?? [
            "#080812",
            "#13182a",
            "#4b2741",
            "#c88cae",
            "#f7edf4",
        ];

        const drawWave = (n) => {
            nt += getSpeed();
            for (let i = 0; i < n; i++) {
                ctx.beginPath();
                ctx.lineWidth = waveWidth || 50;
                ctx.strokeStyle = waveColors[i % waveColors.length];
                for (let x = 0; x < w; x += 5) {
                    var y = noise3D(x / 800, i * 0.3, nt) * 100;
                    ctx.lineTo(x, y + h * 0.5); // center vertically
                }
                ctx.stroke();
                ctx.closePath();
            }
        };

        let animationId;
        const render = () => {
            ctx.fillStyle = backgroundFill || "#080812";
            ctx.globalAlpha = waveOpacity || 0.5;
            ctx.fillRect(0, 0, w, h);
            drawWave(5);
            animationId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(animationId);
    };

    useEffect(() => {
        const cleanup = init();
        return cleanup;
    }, []);

    const [isSafari, setIsSafari] = useState(false);
    useEffect(() => {
        setIsSafari(
            typeof window !== "undefined" &&
            navigator.userAgent.includes("Safari") &&
            !navigator.userAgent.includes("Chrome")
        );
    }, []);

    return (
        <div
            className={cn(
                "h-screen flex flex-col items-center justify-center",
                containerClassName
            )}
        >
            <canvas
                className="absolute inset-0 z-0"
                ref={canvasRef}
                id="canvas"
                style={{
                    ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
                }}
            ></canvas>
            <div className={cn("relative z-10", className)} {...props}>
                {children}
            </div>
        </div>
    );
};
