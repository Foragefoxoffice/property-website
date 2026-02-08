"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BlogBanner from '@/components/Blog/BlogBanner';
import BlogSidebar from '@/components/Blog/BlogSidebar';
import { useLanguage } from '@/Language/LanguageContext';
import Loader from '@/components/Loader/Loader';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';

export default function BlogPageClient({ initialBlogs, blogPageData }) {
    const [blogs, setBlogs] = useState(initialBlogs || []);
    const [filteredBlogs, setFilteredBlogs] = useState(initialBlogs || []);
    const searchParams = useSearchParams();
    const { language } = useLanguage();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "/placeholder.jpg";
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
        const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1').replace('/api/v1', '');
        return `${baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    useEffect(() => {
        const categorySlug = searchParams.get('category');
        const searchTerm = searchParams.get('search');

        let filtered = blogs.filter(blog => blog.published);

        if (categorySlug && filtered.length > 0) {
            filtered = filtered.filter(blog =>
                blog.category?.slug?.[language] === categorySlug ||
                blog.category?.slug?.en === categorySlug ||
                blog.category?.slug?.vi === categorySlug
            );
        }

        if (searchTerm && filtered.length > 0) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(blog => {
                const titleEn = blog.title?.en?.toLowerCase() || '';
                const titleVi = blog.title?.vi?.toLowerCase() || '';
                return titleEn.includes(term) || titleVi.includes(term);
            });
        }

        setFilteredBlogs(filtered);
    }, [searchParams, blogs, language]);

    const bannerTitle = blogPageData?.blogTitle?.[language] || blogPageData?.blogTitle?.en || (language === 'vi' ? 'Tin tức & Bài viết' : 'News & Articles');
    const bannerBg = blogPageData?.blogBannerbg;

    return (
        <>
            <Header />
            <div className="font-['Manrope'] bg-gray-50 min-h-screen">
                <BlogBanner
                    title={bannerTitle}
                    breadcrumbs={[{ label: language === 'vi' ? 'Blog' : 'Blog' }]}
                    backgroundImage={bannerBg}
                />

                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            {filteredBlogs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {filteredBlogs.map((blog) => (
                                        <Link href={`/blogs/${blog.slug?.[language] || blog.slug?.en}`} key={blog._id} className="group">
                                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
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
                                                    <div className="text-[#41398B] font-semibold flex items-center gap-2 mt-auto">
                                                        {language === 'vi' ? 'Đọc thêm' : 'Read More'}
                                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        {language === 'vi' ? 'Chưa có bài viết nào' : 'No posts found'}
                                    </h3>
                                    <p className="text-gray-500">
                                        {language === 'vi' ? 'Vui lòng quay lại sau.' : 'Please participation later.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <BlogSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
