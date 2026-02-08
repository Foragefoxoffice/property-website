import React, { useState, useEffect, useRef } from 'react';
import { Crown, Target } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';

export default function AboutMissionVission({ data }) {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const { language } = useLanguage();

    // CMS Data with Fallbacks
    const missionTitle = language === 'en'
        ? (data?.aboutMissionTitle_en || "To simplify the real estate journey by connecting people with the right properties through trust, transparency, and technology.")
        : (data?.aboutMissionTitle_vn || "Đơn giản hóa hành trình bất động sản bằng cách kết nối mọi người với các bất động sản phù hợp thông qua sự tin cậy, minh bạch và công nghệ.");
    const missionDesc = language === 'en'
        ? (data?.aboutMissionDescription_en || "We are committed to delivering personalized experiences, whether you're buying, selling, or renting. We embrace new technologies and market trends to deliver smarter, faster, and more efficient property solutions.")
        : (data?.aboutMissionDescription_vn || "Chúng tôi cam kết mang đến trải nghiệm cá nhân hóa, cho dù bạn đang mua, bán hay cho thuê. Chúng tôi áp dụng công nghệ mới và xu hướng thị trường để cung cấp các giải pháp bất động sản thông minh hơn, nhanh hơn và hiệu quả hơn.");

    const visionTitle = language === 'en'
        ? (data?.aboutVisionTitle_en || "To become the most trusted real estate partner by redefining how people discover, evaluate, and engage with properties.")
        : (data?.aboutVisionTitle_vn || "Trở thành đối tác bất động sản đáng tin cậy nhất bằng cách định nghĩa lại cách mọi người khám phá, đánh giá và tương tác với bất động sản.");
    const visionDesc = language === 'en'
        ? (data?.aboutVisionDescription_en || "We envision a future where every individual can find their ideal home or investment with confidence, supported by innovation, integrity, and a deep understanding of market needs.")
        : (data?.aboutVisionDescription_vn || "Chúng tôi hình dung một tương lai nơi mọi cá nhân có thể tìm thấy ngôi nhà hoặc khoản đầu tư lý tưởng của họ với sự tự tin, được hỗ trợ bởi sự đổi mới, chính trực và hiểu biết sâu sắc về nhu cầu thị trường.");

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-14 px-6 bg-[#fff] overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                {/* Our Vision */}
                <div
                    className={`flex flex-col items-start p-8 rounded-3xl transition-all duration-700 ease-out transform group shadow-sm hover:-translate-y-2 hover:bg-gray-50/50
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                >
                    <div className="flex flex-col gap-4 mb-4 w-full">
                        <div className="w-16 h-16 rounded-2xl bg-[#41398B]/10 flex items-center justify-center group-hover:bg-[#41398B] transition-colors duration-500">
                            <Crown className="w-8 h-8 text-[#41398B] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] leading-tight group-hover:text-[#41398B] transition-colors duration-300">
                            {visionTitle}
                        </h2>
                    </div>

                    <p className="text-gray-500 text-lg leading-relaxed">
                        {visionDesc}
                    </p>
                </div>

                {/* Our Mission */}
                <div
                    className={`flex flex-col items-start p-8 rounded-3xl transition-all duration-700 ease-out delay-200 transform group shadow-sm hover:-translate-y-2 hover:bg-gray-50/50
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                >
                    <div className="flex flex-col gap-4 mb-4 w-full">
                        <div className="w-16 h-16 rounded-2xl bg-[#41398B]/10 flex items-center justify-center group-hover:bg-[#41398B] transition-colors duration-500">
                            <Target className="w-8 h-8 text-[#41398B] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] leading-tight group-hover:text-[#41398B] transition-colors duration-300">
                            {missionTitle}
                        </h2>
                    </div>

                    <p className="text-gray-500 text-lg leading-relaxed">
                        {missionDesc}
                    </p>
                </div>

            </div>
        </section>
    );
}