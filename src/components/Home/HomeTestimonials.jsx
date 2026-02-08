import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisibleTestimonials } from '@/Api/action';
import { useLanguage } from '@/Language/LanguageContext';

export default function HomeTestimonials({ homePageData }) {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await getVisibleTestimonials();
                if (response.data?.success) {
                    setTestimonials(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, [testimonials.length]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, [testimonials.length]);

    if (loading) return null;
    if (testimonials.length === 0) return null;

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    // Helper to get two testimonials starting from currentIndex
    const getVisiblePair = () => {
        const first = testimonials[currentIndex];
        const nextIdx = (currentIndex + 1) % testimonials.length;
        const second = testimonials[nextIdx];

        // If there's only one testimonial, just return that
        if (testimonials.length === 1) return [first];
        return [first, second];
    };

    const visibleTestimonials = getVisiblePair();

    return (
        <section className="py-20 bg-gray-50 overflow-hidden min-h-[600px] flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="text-center mb-12">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3"
                    >
                        {language === 'en'
                            ? (homePageData?.homeTestimonialSubTitle_en || 'OUR HAPPY CUSTOMERS')
                            : (homePageData?.homeTestimonialSubTitle_vn || 'KHÁCH HÀNG HÀI LÒNG')
                        }
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-semibold text-black"
                    >
                        {language === 'en'
                            ? (homePageData?.homeTestimonialTitle_en || 'What They Say About Us')
                            : (homePageData?.homeTestimonialTitle_vn || 'Họ Nói Gì Về Chúng Tôi')
                        }
                    </motion.h2>
                </div>

                <div className="relative w-full mt-10">
                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all duration-300 group"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all duration-300 group"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Testimonial Card Slider */}
                    <div className="relative h-[450px] md:h-[400px]">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                }}
                                className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-8"
                            >
                                {visibleTestimonials.map((item, idx) => (
                                    <div
                                        key={item._id}
                                        className={`bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between ${idx === 1 ? 'hidden lg:flex' : 'flex'}`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-1 mb-6">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={18}
                                                        className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>

                                            <div className="relative">
                                                <Quote className="absolute -top-6 -left-4 text-gray-100 w-14 h-14 -z-10" />
                                                <p className="text-md md:text-lg text-gray-700 italic leading-relaxed relative z-10 line-clamp-4">
                                                    "{language === 'en' ? (item.text_en || item.text) : (item.text_vn || item.text)}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-3 border-t border-gray-50 mt-auto">
                                            {item.profile_photo_url ? (
                                                <img
                                                    src={item.profile_photo_url}
                                                    alt={item.author_name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                                                    {item.author_name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-black uppercase text-sm tracking-wide">
                                                    {item.author_name}
                                                </h4>
                                                {item.relative_time_description && (
                                                    <p className="text-xs text-[#a4aeb5]">
                                                        {item.relative_time_description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-3 mt-12">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`h-2 transition-all duration-300 rounded-full ${currentIndex === index ? 'w-8 bg-black' : 'w-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}