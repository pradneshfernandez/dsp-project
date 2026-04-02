"use client";
import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const LampContainer = ({
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#080812] z-0",
                className
            )}
        >
            <div className="absolute inset-x-0 top-0 d-flex w-full h-full pointer-events-none items-center justify-center isolate z-0">
                <motion.div
                    initial={{ opacity: 0.5, width: "15rem" }}
                    whileInView={{ opacity: 1, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(from 70deg at center top, var(--tw-gradient-stops))`,
                    }}
                    className="absolute inset-auto right-1/2 h-56 w-[30rem] bg-gradient-conic from-[#4b2741] via-transparent to-transparent text-white"
                >
                    <div className="absolute w-[100%] left-0 bg-[#080812] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.5, width: "15rem" }}
                    whileInView={{ opacity: 1, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(from 290deg at center top, var(--tw-gradient-stops))`,
                    }}
                    className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-[#4b2741] text-white"
                >
                    <div className="absolute w-40 h-[100%] right-0 bg-[#080812] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
                </motion.div>
                <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#080812] blur-2xl"></div>
                <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
                <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-[#4b2741] opacity-30 blur-3xl"></div>

                <motion.div
                    initial={{ width: "15rem" }}
                    whileInView={{ width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-[#c88cae]/50 "
                ></motion.div>
            </div>

            <div className="relative z-50 flex flex-col items-center px-5 w-full">
                {children}
            </div>
        </div>
    );
};
