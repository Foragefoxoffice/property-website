import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/Language/LanguageContext';

export default function AboutOverview({ data }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { language } = useLanguage();

    // CMS Data with Fallbacks
    const title = language === 'en'
        ? (data?.aboutOverviewTitle_en || "Your Reliable Partner In Real Estate Success")
        : (data?.aboutOverviewTitle_vn || "Đối Tác Đáng Tin Cậy Trong Thành Công Bất Động Sản");
    const description = language === 'en'
        ? (data?.aboutOverviewDescription_en || "")
        : (data?.aboutOverviewDescription_vn || ""); // Optional description if needed, though UI shows mainly title

    // Image Handling
    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1932&auto=format&fit=crop";
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    const bgImage = getImageUrl(data?.aboutOverviewBg);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section ref={ref} className="py-24 pb-0 px-6 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

                {/* Header Text */}
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="mb-10 max-w-4xl"
                >
                    <motion.span
                        variants={itemVariants}
                        className="text-gray-400 text-sm font-bold tracking-[0.2em] uppercase mb-4 block font-['Manrope']"
                    >
                        {title}
                    </motion.span>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-4xl lg:text-5xl font-semibold text-[#1a1a1a] font-['Manrope'] leading-tight"
                    >
                        {description}
                    </motion.h2>
                </motion.div>

                {/* Fixed Background Image Container */}
                <motion.div
                    className="w-full h-[400px] md:h-[550px] rounded-3xl overflow-hidden relative"
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 50 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundAttachment: 'fixed',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                </motion.div>

            </div>
        </section>
    );
}