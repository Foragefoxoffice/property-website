"use client";

import React from 'react';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import BlogSidebar from '@/components/Blog/BlogSidebar';
import { Twitter, Facebook, Linkedin, Link as LinkIcon, Calendar, Clock, Share2 } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';
import Loader from '@/components/Loader/Loader';

export default function BlogDetailClient({ blog, loading }) {
    const { language } = useLanguage();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "/placeholder.jpg";
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
        const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1').replace('/api/v1', '');
        return `${baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const handleShare = async () => {
        if (typeof window === "undefined") return;
        const shareData = {
            title: blog?.title?.[language] || blog?.title?.en || 'Blog Post',
            text: `Check out this blog: ${blog?.title?.[language] || blog?.title?.en}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert(language === 'vi' ? 'Đã sao chép liên kết!' : 'Link copied to clipboard!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert(language === 'vi' ? 'Đã sao chép liên kết!' : 'Link copied to clipboard!');
                } catch (clipboardError) {
                    console.error('Failed to share:', clipboardError);
                }
            }
        }
    };

    if (loading) return <Loader />;

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
                <p>The article you are looking for does not exist or has been moved.</p>
            </div>
        );
    }

    const getLocalized = (field) => field?.[language] || field?.en || '';

    return (
        <>
            <Header />
            <div className="font-['Manrope'] bg-gray-50 min-h-screen">
                <div className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={getImageUrl(blog.mainImage)}
                            alt={getLocalized(blog.title)}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center -mt-10">
                        <div className="mb-6">
                            <span className="inline-block px-5 py-2 bg-[#41398B] shadow-lg shadow-[#41398B]/30 rounded-full text-sm font-bold tracking-wider uppercase text-white transform hover:scale-105 transition-transform duration-300">
                                {blog.category?.name?.[language] || blog.category?.name?.en || 'Uncategorized'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 max-w-5xl mx-auto leading-tight drop-shadow-lg capitalize tracking-tight">
                            {getLocalized(blog.title)}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-gray-200 font-medium">
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#41398B] to-purple-500 flex items-center justify-center text-[10px] font-bold border border-white/30 shadow-sm">
                                    {blog.author?.charAt(0) || 'A'}
                                </span>
                                {blog.author}
                            </span>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Calendar size={16} className="text-purple-300" />
                                {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Clock size={16} className="text-purple-300" />
                                5 min read
                            </span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16 -mt-32 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 ring-1 ring-black/5">
                                <div className="flex lg:hidden gap-4 mb-8 pb-8 border-b border-gray-100 justify-center">
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#1DA1F2] hover:text-white text-gray-500 transition-all duration-300"><Twitter size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#4267B2] hover:text-white text-gray-500 transition-all duration-300"><Facebook size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#0077b5] hover:text-white text-gray-500 transition-all duration-300"><Linkedin size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-800 hover:text-white text-gray-500 transition-all duration-300"><LinkIcon size={20} /></button>
                                </div>

                                <article style={{ lineHeight: '2.1' }} className="prose prose-lg max-w-none w-full break-words prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h2:text-[#41398B] prose-h3:text-2xl prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#41398B] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-blockquote:border-l-4 prose-blockquote:border-[#41398B] prose-blockquote:bg-purple-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-700 prose-strong:text-gray-900 prose-strong:font-bold prose-li:marker:text-[#41398B]">
                                    <div dangerouslySetInnerHTML={{ __html: getLocalized(blog.content) }} />
                                </article>

                                <div className='flex justify-between mt-12 pt-8 border-t border-gray-100'>
                                    <div>
                                        {blog.tags?.[language]?.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="font-bold text-gray-800">Tags:</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {blog.tags[language].map((tag, index) => (
                                                        <span key={index} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#41398B] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="font-bold text-gray-800">Share This Blog:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 text-gray-700 border border-gray-300 px-4 py-2 rounded-full cursor-pointer w-fit hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all duration-300 shadow-sm hover:shadow-md"
                                            >
                                                <Share2 size={18} />
                                                {language === 'vi' ? 'Chia sẻ' : 'Share'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
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
