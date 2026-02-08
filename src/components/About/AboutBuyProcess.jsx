import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/Language/LanguageContext';

export default function AboutBuyProcess({ data }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeIndex, setActiveIndex] = useState(0);
    const { language } = useLanguage();

    // CMS Data with Fallbacks
    const subTitle = language === 'en'
        ? (data?.aboutBuyingTitle_en || "OUR PROCESS")
        : (data?.aboutBuyingTitle_vn || "QUY TRÌNH CỦA CHÚNG TÔI");
    const title = language === 'en'
        ? (data?.aboutBuyingDescription_en || "Homebuying Steps")
        : (data?.aboutBuyingDescription_vn || "Các Bước Mua Nhà");

    // Helper to handle image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    const mainProcessImage = data?.aboutProcessImage
        ? getImageUrl(data.aboutProcessImage)
        : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop";

    const defaultSteps = [
        {
            title: "Step 1: Discover Your Dream Home",
            title_vn: "Bước 1: Khám Phá Ngôi Nhà Mơ Ước",
            description: "Browse through a curated selection of properties tailored to your lifestyle and budget.",
            description_vn: "Duyệt qua lựa chọn bất động sản được chọn lọc phù hợp với lối sống và ngân sách của bạn.",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Step 2: Schedule A Viewing",
            title_vn: "Bước 2: Đặt Lịch Xem Nhà",
            description: "Book a tour at your convenience and explore the space in person or virtually.",
            description_vn: "Đặt lịch tham quan theo sự thuận tiện của bạn và khám phá không gian trực tiếp hoặc trực tuyến.",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
        },
        {
            title: "Step 3: Seal The Deal",
            title_vn: "Bước 3: Hoàn Tất Giao Dịch",
            description: "Get expert guidance to finalize paperwork and move into your new home with confidence.",
            description_vn: "Nhận hướng dẫn chuyên nghiệp để hoàn tất giấy tờ và chuyển đến ngôi nhà mới của bạn với sự tự tin.",
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
        }
    ];

    const steps = data?.aboutBuyingSteps?.length > 0 ? data.aboutBuyingSteps : defaultSteps;

    // Get current active image, fallback to step image, then main image
    const activeImage = steps[activeIndex]?.image ? getImageUrl(steps[activeIndex].image) : mainProcessImage;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    };

    return (
        <section ref={ref} className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* Left Column: Text & Steps */}
                <motion.div
                    className="flex flex-col"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mb-10">
                        <span className="text-gray-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                            {subTitle}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a]">
                            {title}
                        </h2>
                    </motion.div>

                    <div className="space-y-8 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`relative pl-8 border-l-2 transition-all duration-300 cursor-pointer 
                                    ${index === activeIndex ? 'border-[#41398B]' : 'border-black/10 hover:border-[#41398B]'}`}
                            >
                                {/* Active Line Indicator */}
                                <div
                                    className={`absolute left-[-2px] top-0 h-full w-[2px] transition-all duration-500 ease-out origin-top
                                        ${index === activeIndex ? 'bg-[#41398B] scale-y-100' : 'bg-transparent scale-y-0'}
                                    `}
                                ></div>

                                <h3 className={`text-2xl font-semibold mb-2 transition-colors duration-300 ${index === activeIndex ? 'text-[#41398B]' : 'text-[#000]'}`}>
                                    {language === 'en' ? (step.title_en || step.title) : (step.title_vn || step.title_en || step.title)}
                                </h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {language === 'en' ? (step.description_en || step.description) : (step.description_vn || step.description_en || step.description)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Column: Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-[500px] w-full rounded-2xl overflow-hidden"
                >
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={activeIndex}
                            src={activeImage}
                            alt="Home Buying Process"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>
                </motion.div>

            </div>
        </section>
    );
}