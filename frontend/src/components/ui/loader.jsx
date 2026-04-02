import React from "react";
import { motion } from "framer-motion";

export const LoaderOne = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="h-3 w-3 rounded-full bg-[#c88cae]"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};
