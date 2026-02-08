import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBlogs, getCategories } from '@/Api/action';
import { useLanguage } from '@/Language/LanguageContext';
import { getImageUrl } from '@/utils/imageHelper';

export default function BlogSidebar() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language } = useLanguage();

    useEffect(() => {
        const search = searchParams.get('search');
        if (search) {
            setSearchTerm(search);
        } else {
            setSearchTerm('');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [blogsRes, catsRes] = await Promise.all([
                    getBlogs(),
                    getCategories()
                ]);

                // Get last 5 posts
                const publishedBlogs = blogsRes.data.data.filter(blog => blog.published);
                setRecentPosts(publishedBlogs.slice(0, 5));

                // Get categories
                setCategories(catsRes.data.data);
            } catch (error) {
                console.error("Failed to fetch sidebar data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Search Widget */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 relative inline-block">
                    {language === 'vi' ? 'Tìm kiếm' : 'Search'}
                    <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full"></span>
                </h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                router.push(`/blogs?search=${searchTerm}`);
                            }
                        }}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 relative inline-block">
                    {language === 'vi' ? 'Bài viết mới' : 'Recent Posts'}
                    <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full"></span>
                </h3>
                <div className="space-y-6">
                    {recentPosts.map((post) => (
                        <Link href={`/blogs/${post.slug?.[language] || post.slug?.en}`} key={post._id} className="flex gap-4 group">
                            <img
                                src={getImageUrl(post.mainImage)}
                                alt={post.title?.[language] || post.title?.en}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity"
                            />
                            <div>
                                <h4 className="font-bold text-gray-800 leading-snug mb-1 line-clamp-2 group-hover:text-[#41398B] transition-colors">
                                    {post.title?.[language] || post.title?.en}
                                </h4>
                                <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 relative inline-block">
                    {language === 'vi' ? 'Danh mục' : 'Categories'}
                    <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full"></span>
                </h3>
                <ul className="space-y-2">
                    {categories.map((cat) => (
                        <li key={cat._id}>
                            <Link
                                href={`/blogs?category=${cat.slug?.[language] || cat.slug?.en}`}
                                className="flex items-center justify-between text-gray-600 hover:text-[#41398B] transition-colors py-2 border-b border-gray-50 last:border-0"
                            >
                                <span>{cat.name?.[language] || cat.name?.en}</span>
                                <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full">
                                    •
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
