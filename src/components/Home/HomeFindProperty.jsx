import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/Language/LanguageContext';

export default function HomeFindProperty({ homePageData }) {
    const { language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    // Helper to get partial or full URL (reused consistent logic)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    // CMS Content with Fallbacks
    const title = language === 'en'
        ? (homePageData?.homeFindTitle_en || 'Find Your Property,\nStart Your Homeownership Journey Today')
        : (homePageData?.homeFindTitle_vn || 'Tìm Bất Động Sản Của Bạn,\nBắt Đầu Hành Trình Sở Hữu Nhà Ngay Hôm Nay');
    const description = language === 'en'
        ? (homePageData?.homeFindDescription_en || 'Connect with your Designer in minutes')
        : (homePageData?.homeFindDescription_vn || 'Kết nối với Nhà thiết kế của bạn trong vài phút');
    const bgImage = homePageData?.homeFindBg
        ? getImageUrl(homePageData.homeFindBg)
        : '/images/property/home-banner.jpg'; // Verify if this image exists, defaulting to one we saw earlier

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
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
        <section
            ref={sectionRef}
            className="relative w-full h-[400px] md:h-[350px] bg-cover bg-center overflow-hidden flex items-center"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-4xl">
                    <h2
                        className={`text-3xl md:text-5xl lg:text-5xl font-semibold text-white leading-tight mb-4 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                            }`}
                    >
                        {title}
                    </h2>

                    <p
                        className={`text-lg md:text-xl text-white/90 transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                            }`}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
}