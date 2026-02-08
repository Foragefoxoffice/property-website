import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';

export default function AboutAgent({ data }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { language } = useLanguage();

    // CMS Data with Fallbacks
    const subTitle = language === 'en'
        ? (data?.aboutAgentTitle_en || "TOP AGENT")
        : (data?.aboutAgentTitle_vn || "ĐẠI LÝ HÀNG ĐẦU");
    const title = language === 'en'
        ? (data?.aboutAgentSubTitle_en || "Jessica Lane")
        : (data?.aboutAgentSubTitle_vn || "Jessica Lane");
    const stats = language === 'en'
        ? (data?.aboutAgentDescription_en || "Total Sales Volume: $48M+ in Closed Sales")
        : (data?.aboutAgentDescription_vn || "Tổng Doanh Số Bán Hàng: $48M+ Trong Doanh Số Đóng");
    const description = language === 'en'
        ? (data?.aboutAgentContent_en || "With over a decade of real estate experience in luxury coastal properties, Jessica is known for her integrity, deep market knowledge and commitment to her clients.")
        : (data?.aboutAgentContent_vn || "Với hơn một thập kỷ kinh nghiệm bất động sản trong bất động sản ven biển cao cấp, Jessica được biết đến với sự chính trực, kiến thức thị trường sâu sắc và cam kết với khách hàng của cô ấy.");
    const buttonText = language === 'en'
        ? (data?.aboutAgentButtonText_en || "View Agent")
        : (data?.aboutAgentButtonText_vn || "Xem Đại Lý");
    const buttonLink = data?.aboutAgentButtonLink || "#";

    // Image Handling
    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop";
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    const agentImage = getImageUrl(data?.aboutAgentImage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, duration: 0.6 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 50, scale: 0.95 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section ref={ref} className="py-24 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: Text Content */}
                    <motion.div
                        className="lg:col-span-5 flex flex-col justify-center"
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={containerVariants}
                    >
                        <motion.span
                            variants={itemVariants}
                            className="text-gray-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block"
                        >
                            {subTitle}
                        </motion.span>

                        <motion.h2
                            variants={itemVariants}
                            className="text-4xl md:text-5xl lg:text-5xl font-bold text-[#1a1a1a] mb-9 font-['Manrope']"
                        >
                            {title}
                        </motion.h2>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl font-bold text-[#1a1a1a] mb-4 font-['Manrope']"
                        >
                            {stats}
                        </motion.p>

                        <motion.p
                            variants={itemVariants}
                            className="text-gray-500 text-lg leading-relaxed mb-10 font-['Manrope']"
                        >
                            {description}
                        </motion.p>

                        <motion.div variants={itemVariants}>
                            <a
                                href={buttonLink}
                                className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#41398B] transition-colors duration-300 group"
                            >
                                {buttonText}
                                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Image */}
                    <motion.div
                        className="lg:col-span-7 relative flex items-center justify-center"
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={imageVariants}
                    >
                        <div className="relative rounded-3xl overflow-hidden">
                            <img
                                src={agentImage}
                                alt={title}
                                className="w-[550px] h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}