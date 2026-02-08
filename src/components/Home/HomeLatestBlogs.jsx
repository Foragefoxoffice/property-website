import React, { useEffect, useState, useRef } from 'react';
import { getBlogs } from '@/Api/action';
import { useLanguage } from '@/Language/LanguageContext';
import { getImageUrl } from '@/utils/imageHelper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'antd';

export default function HomeLatestBlogs({ homePageData }) {
    const { language } = useLanguage();
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                const res = await getBlogs();
                if (res.data?.success) {
                    // Sort by newest and take top 3
                    const sortedBlogs = (res.data.data || [])
                        .filter(blog => blog.published)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 3);
                    setBlogs(sortedBlogs);
                }
            } catch (error) {
                console.error("Failed to fetch latest blogs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestBlogs();
    }, []);

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

    const title = language === 'en'
        ? (homePageData?.homeBlogTitle_en || 'Latest News & Insights')
        : (homePageData?.homeBlogTitle_vn || 'Tin Tức & Thông Tin Mới Nhất');

    const description = language === 'en'
        ? (homePageData?.homeBlogDescription_en || 'Stay updated with the latest property trends, market insights, and expert advice')
        : (homePageData?.homeBlogDescription_vn || 'Cập nhật xu hướng bất động sản mới nhất, thông tin thị trường và lời khuyên từ chuyên gia');

    return (
        <section ref={sectionRef} className="py-10 md:py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <p
                        className={`text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3 transition-all duration-1000 ease-out opacity-100 translate-y-0'}`}
                    >
                        {title}
                    </p>
                    {description && (
                        <h2
                            className={`text-3xl md:text-4xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight transition-all duration-1000 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                        >
                            {description}
                        </h2>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <Skeleton.Image active className="!w-full !h-56" />
                                <div className="p-6">
                                    <Skeleton active paragraph={{ rows: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <Link
                                href={`/blogs/${blog.slug?.[language] || blog.slug?.en}`}
                                key={blog._id}
                                className={`group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                style={{ transitionDelay: `${200 + index * 100}ms` }}
                            >
                                {blog.mainImage && (
                                    <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                                        <img
                                            src={getImageUrl(blog.mainImage)}
                                            alt={blog.title?.[language] || blog.title?.en}
                                            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                        <span className="bg-purple-50 text-[#41398B] px-3 py-1 rounded-full font-semibold text-xs">
                                            {blog.category?.name?.[language] || blog.category?.name?.en || 'News'}
                                        </span>
                                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#41398B] transition-colors">
                                        {blog.title?.[language] || blog.title?.en}
                                    </h3>

                                    <p className="text-gray-600 mb-4 text-sm flex-1 line-clamp-3">
                                        {(() => {
                                            const content = blog.content?.[language] || blog.content?.en || '';
                                            const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                            return plainText.length > 150
                                                ? plainText.substring(0, 150) + '...'
                                                : plainText;
                                        })()}
                                    </p>

                                    <div className="text-[#41398B] font-bold text-sm flex items-center gap-2 mt-auto group/btn">
                                        {language === 'vi' ? 'Đọc thêm' : 'Read More'}
                                        <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
