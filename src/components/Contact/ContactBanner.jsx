import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/Language/LanguageContext";

export default function ContactBanner({ data }) {
    const { language } = useLanguage();

    // Improved URL handling matching AboutBanner logic which seems more robust
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', ''); // Remove /api/v1 suffix if present for static files
        // ensuring slash
        return `${serverURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const displayBgImage = data?.contactBannerBg ? getImageUrl(data.contactBannerBg) : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop";

    const title = language === 'en'
        ? (data?.contactBannerTitle_en || "Contact Us")
        : (data?.contactBannerTitle_vn || "Liên Hệ");

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2, // Stagger effect for children
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
            {/* Background Image with Parallax-like feel or just cover */}
            <div className="absolute inset-0">
                <img
                    src={displayBgImage}
                    alt="Contact Banner"
                    className="w-full h-full object-cover"
                />
                {/* Dark Overlay for text readability */}
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
                        {language === 'en' ? "Home" : "Trang Chủ"}
                    </Link>
                    <span>&gt;</span>
                    <span className="text-white font-medium">{title}</span>
                </motion.div>
            </motion.div>
        </div>
    );
}