import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedNavLink = ({ text, onClick, hasDropdown = false, isDropdownOpen = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Split text into characters
    const characters = text.split('');

    return (
        <div
            className="relative overflow-hidden h-6 flex items-center cursor-pointer group"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* First layer (slides up) */}
            <div className="flex">
                {characters.map((char, index) => (
                    <motion.span
                        key={`top-${index}`}
                        className="inline-block"
                        animate={{ y: isHovered ? '-100%' : 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.025,
                            ease: [0.5, 0, 0, 1]
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </div>

            {/* Second layer (slides in from bottom) - positioned absolutely */}
            <div className="absolute inset-0 flex text-[#41398B]">
                {characters.map((char, index) => (
                    <motion.span
                        key={`bottom-${index}`}
                        className="inline-block"
                        animate={{ y: isHovered ? 0 : '100%' }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.025,
                            ease: [0.5, 0, 0, 1]
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </div>
        </div>
    );
};

export default AnimatedNavLink;
