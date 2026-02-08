import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/Language/LanguageContext';

export default function AboutHistory({ data }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { language } = useLanguage();

    // CMS Data with Fallbacks
    const sectionTitle = language === 'en'
        ? (data?.aboutHistoryTitle_en || "Milestones That Define Us")
        : (data?.aboutHistoryTitle_vn || "Những Cột Mốc Định Hình Chúng Tôi");
    const sectionDescription = language === 'en'
        ? (data?.aboutHistoryDescription_en || "OUR HISTORY")
        : (data?.aboutHistoryDescription_vn || "LỊCH SỬ CỦA CHÚNG TÔI"); // Using the description field for the small caption "OUR HISTORY" or generic text if not provided

    const timelineData = data?.aboutHistoryTimeline?.length > 0 ? data.aboutHistoryTimeline : [
        {
            date_en: "2009",
            date_vn: "Năm 2009",
            title_en: "HUMBLE BEGINNINGS",
            title_vn: "KHỞI ĐẦU KHIÊM TỐN",
            description_en: "We started as a small, local agency with a clear mission: helping people find homes with honesty and care.",
            description_vn: "Chúng tôi bắt đầu như một đại lý nhỏ, địa phương với sứ mệnh rõ ràng: giúp mọi người tìm nhà với sự trung thực và quan tâm."
        },
        {
            date_en: "2015",
            date_vn: "Năm 2015",
            title_en: "A TRUSTED NAME",
            title_vn: "TÊN ĐÁNG TIN CẬY",
            description_en: "Gained recognition for reliable service and built long-term relationships with clients and partners.",
            description_vn: "Được công nhận về dịch vụ đáng tin cậy và xây dựng mối quan hệ lâu dài với khách hàng và đối tác."
        },
        {
            date_en: "2018",
            date_vn: "Năm 2018",
            title_en: "EMBRACING INNOVATION",
            title_vn: "ÁP DỤNG ĐỔI MỚI",
            description_en: "Adopted new technologies to streamline the property search and improve customer experience.",
            description_vn: "Áp dụng công nghệ mới để đơn giản hóa tìm kiếm bất động sản và cải thiện trải nghiệm khách hàng."
        },
        {
            date_en: "2021",
            date_vn: "Năm 2021",
            title_en: "OVER 1,000 HOMES SOLD",
            title_vn: "HƠN 1.000 NGÔI NHÀ ĐÃ BÁN",
            description_en: "Reached a major milestone with over a thousand successful property transactions completed.",
            description_vn: "Đạt được cột mốc quan trọng với hơn một nghìn giao dịch bất động sản thành công được hoàn thành."
        },
        {
            date_en: "2024",
            date_vn: "Năm 2024",
            title_en: "MOVING FORWARD TOGETHER",
            title_vn: "TIẾN LÊN CÙNG NHAU",
            description_en: "Continuing to grow with a dedicated team, modern tools, and a renewed vision for the future.",
            description_vn: "Tiếp tục phát triển với đội ngũ tận tâm, công cụ hiện đại và tầm nhìn mới cho tương lai."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section ref={ref} className="py-14 pb-24 px-4 bg-[#F9FAFB] overflow-hidden">
            <div className="max-w-8xl mx-auto flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-20"
                >
                    <span className="text-gray-400 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
                        {sectionTitle}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a]">
                        {sectionDescription}
                    </h2>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    className="w-full relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {/* Background Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[128px] left-0 w-full h-[4px] bg-gray-200" />

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-4 relative z-10">
                        {timelineData.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="flex flex-col items-start lg:items-center text-left lg:text-center group"
                            >
                                {/* Date */}
                                <h3 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#41398B] transition-colors duration-300">
                                    {language === 'en' ? (item.date_en || item.date) : (item.date_vn || item.date_en || item.date)}
                                </h3>

                                {/* Title */}
                                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8 h-8 flex items-end justify-center">
                                    {language === 'en' ? (item.title_en || item.title) : (item.title_vn || item.title_en || item.title)}
                                </h4>

                                {/* Circle Indicator */}
                                <div className="relative flex items-center justify-center w-full mb-8 h-4">

                                    {/* The Dot */}
                                    <div className="w-5 h-5 rounded-full bg-[#41398B] border-[4px] border-white ring-1 ring-[#41398B] group-hover:bg-[#41398B] group-hover:ring-[#41398B] transition-all duration-300 z-10 lg:mx-auto shadow-sm scale-100 group-hover:scale-125" />
                                </div>

                                {/* Description */}
                                <p className="text-gray-500 text-md leading-relaxed max-w-xs mx-auto">
                                    {language === 'en' ? (item.description_en || item.description) : (item.description_vn || item.description_en || item.description)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}