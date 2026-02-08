import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../Language/LanguageContext';

export default function HomeAbout({ homePageData }) {
    const { language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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
                rootMargin: '0px 0px -100px 0px'
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
        <section ref={sectionRef} className="py-10 md:py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side - About Us Content */}
                    <div
                        className={`space-y-6 transition-all duration-1000 ease-out ${isVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-12'
                            }`}
                    >
                        <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider">
                            {language === 'en'
                                ? (homePageData?.homeAboutSubTitle_en || 'ABOUT US')
                                : (homePageData?.homeAboutSubTitle_vn || 'VỀ CHÚNG TÔI')
                            }
                        </p>

                        <h2
                            className={`text-4xl md:text-5xl font-semibold text-black leading-tight transition-all duration-1000 delay-100 ease-out ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-12'
                                }`}
                        >
                            {language === 'en'
                                ? (homePageData?.homeAboutTitle_en || 'Building Dreams, One Home At A Time')
                                : (homePageData?.homeAboutTitle_vn || 'Xây Dựng Ước Mơ, Từng Ngôi Nhà')
                            }
                        </h2>

                        <p
                            className={`text-lg text-gray-600 leading-relaxed transition-all duration-1000 delay-200 ease-out ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-12'
                                }`}
                        >
                            {language === 'en'
                                ? (homePageData?.homeAboutDescription_en || 'Our mission goes beyond real estate — it\'s about guiding you through one of life\'s biggest milestones with heart, expertise, and unwavering commitment.')
                                : (homePageData?.homeAboutDescription_vn || 'Sứ mệnh của chúng tôi vượt xa bất động sản — đó là hướng dẫn bạn vượt qua một trong những cột mốc lớn nhất của cuộc đời với trái tim, chuyên môn và cam kết không ngừng.')
                            }
                        </p>

                        <button
                            className={`mt-4 px-8 py-3.5 bg-black cursor-pointer text-white font-semibold rounded-md hover:bg-gray-800 transition-all duration-300 delay-300 hover:delay-0 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-12'
                                }`}
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    window.location.href = homePageData?.homeAboutButtonLink || '/about';
                                }
                            }}
                        >
                            {language === 'en'
                                ? (homePageData?.homeAboutButtonText_en || 'View Properties')
                                : (homePageData?.homeAboutButtonText_vn || 'Xem Bất Động Sản')
                            }
                        </button>
                    </div>

                    {/* Right Side - Steps */}
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div
                            className={`flex gap-6 transition-all duration-1000 delay-150 hover:delay-0 hover:duration-300 ease-out hover:translate-x-2 ${isVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-12'
                                }`}
                        >
                            <div className="flex-shrink-0">
                                <span className="text-3xl font-semibold text-black transition-colors duration-300 hover:text-gray-600">
                                    01.
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-[#2a2a2a]">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep1Title_en || 'Buy A New Home')
                                        : (homePageData?.homeAboutStep1Title_vn || 'Mua Nhà Mới')
                                    }
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep1Des_en || 'Discover your dream home effortlessly. Explore diverse properties and expert guidance for a seamless buying experience.')
                                        : (homePageData?.homeAboutStep1Des_vn || 'Khám phá ngôi nhà mơ ước của bạn một cách dễ dàng. Khám phá các bất động sản đa dạng và hướng dẫn chuyên nghiệp cho trải nghiệm mua hàng liền mạch.')
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div
                            className={`flex gap-6 transition-all duration-1000 delay-300 hover:delay-0 hover:duration-300 ease-out hover:translate-x-2 ${isVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-12'
                                }`}
                        >
                            <div className="flex-shrink-0">
                                <span className="text-3xl font-semibold text-black transition-colors duration-300 hover:text-gray-600">
                                    02.
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-[#2a2a2a]">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep2Title_en || 'Rent A Home')
                                        : (homePageData?.homeAboutStep2Title_vn || 'Thuê Nhà')
                                    }
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep2Des_en || 'Discover your perfect rental effortlessly. Explore a diverse variety of listings tailored precisely to suit your unique lifestyle needs.')
                                        : (homePageData?.homeAboutStep2Des_vn || 'Khám phá nơi thuê hoàn hảo của bạn một cách dễ dàng. Khám phá nhiều danh sách đa dạng được điều chỉnh chính xác để phù hợp với nhu cầu lối sống độc đáo của bạn.')
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div
                            className={`flex gap-6 transition-all duration-1000 delay-[450ms] hover:delay-0 hover:duration-300 ease-out hover:translate-x-2 ${isVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-12'
                                }`}
                        >
                            <div className="flex-shrink-0">
                                <span className="text-3xl font-semibold text-black transition-colors duration-300 hover:text-gray-600">
                                    03.
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-[#2a2a2a]">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep3Title_en || 'Sell A Home')
                                        : (homePageData?.homeAboutStep3Title_vn || 'Bán Nhà')
                                    }
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {language === 'en'
                                        ? (homePageData?.homeAboutStep3Des_en || 'Sell confidently with expert guidance and effective strategies, showcasing your property\'s best features for a successful sale.')
                                        : (homePageData?.homeAboutStep3Des_vn || 'Bán một cách tự tin với hướng dẫn chuyên nghiệp và chiến lược hiệu quả, trưng bày các tính năng tốt nhất của bất động sản của bạn để bán thành công.')
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}