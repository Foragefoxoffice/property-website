import React from "react";
import { motion } from "framer-motion";
import Link from 'next/link';

export default function BlogBanner({ title, breadcrumbs = [], backgroundImage }) {

    // Helper to ensure valid image URLs, similar to ContactBanner
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const displayBgImage = backgroundImage
        ? getImageUrl(backgroundImage)
        : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"; // Corporate building default

    // Animation variants from ContactBanner
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
                duration: 0.8
            }
        },
    };

    return (
        <div className="relative lg:h-[400px] h-96 w-full flex items-center justify-center bg-cover bg-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={displayBgImage}
                    alt="Blog Banner"
                    className="w-full h-full object-cover"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 text-center text-white px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
                    variants={itemVariants}
                >
                    {title}
                </motion.h1>

                <motion.div
                    className="flex items-center justify-center space-x-2 text-sm md:text-base text-gray-200"
                    variants={itemVariants}
                >
                    <Link href="/" className="hover:text-white transition-colors duration-200">
                        Home
                    </Link>

                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <span>&gt;</span>
                            {crumb.path ? (
                                <Link href={crumb.path} className="hover:text-white transition-colors duration-200">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-white font-medium">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
