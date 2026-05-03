// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProjectPage, getAllProjectsAdmin } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getImageUrl } from '@/utils/baseURL';
import ProjectSkeleton from './ProjectSkeleton';

export default function RelatedProjects({ currentCategoryId, currentProjectId, currentProjectData = null }: any) {
    const { language } = useLanguage();
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [sectionTitle, setSectionTitle] = useState('');
    const [loading, setLoading] = useState(true);

    const stripHtml = (html) => {
        if (!html) return "";
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            let text = doc.body.textContent || "";
            return text.replace(/\s+/g, ' ').trim();
        } catch (e) {
            return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        }
    };

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                setLoading(true);
                const [projRes, pageRes] = await Promise.all([
                    getAllProjectsAdmin(),
                    getProjectPage()
                ]);

                const allProjects = projRes.data?.data || [];
                const pageData = pageRes.data?.data || null;

                // Set Title Logic
                let title = currentProjectData?.relatedProjectTitle?.[language] ||
                    currentProjectData?.relatedProjectTitle?.vi ||
                    currentProjectData?.relatedProjectTitle?.en;

                if (!title) {
                    title = pageData?.relatedProjectTitle?.[language] ||
                        pageData?.relatedProjectTitle?.vi ||
                        pageData?.relatedProjectTitle?.en;
                }

                if (!title) {
                    title = (language === 'vi' ? 'Dự án liên quan' : 'Related Projects');
                }

                setSectionTitle(title);

                // Filter projects
                const filtered = allProjects.filter(p => {
                    const isPublished = p.published;
                    const isNotCurrent = (p._id || p.id) !== currentProjectId;
                    const hasSameCat = (p.category?._id || p.category) === currentCategoryId;
                    return isPublished && isNotCurrent && hasSameCat;
                });

                // Limit to 3
                setRelatedProjects(filtered.slice(0, 3));
            } catch (error) {
                console.error("Error fetching related projects:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentCategoryId) {
            fetchRelated();
        }
    }, [currentCategoryId, currentProjectId, language, currentProjectData]);

    if (!loading && relatedProjects.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50/50 ">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-extrabold text-[#111827] mb-12 text-center uppercase tracking-tight">
                    {sectionTitle}
                </h2>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${relatedProjects.length < 3 ? 'justify-center' : ''}`}>
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <ProjectSkeleton key={i} />
                        ))
                    ) : (
                        relatedProjects.map(project => {
                            const descSource = project.projectMainDescription?.[language] ||
                                project.projectMainDescription?.vi ||
                                project.projectMainDescription?.en ||
                                project.projectIntroContent?.[language] ||
                                project.projectIntroContent?.vi ||
                                project.projectIntroContent?.en || "";

                            const plainText = stripHtml(descSource);
                            const plainTextIntro = plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;

                            const slugVal = typeof project.slug === 'string' 
                                ? project.slug 
                                : (project.slug?.[language] || project.slug?.en || project.slug?.vi || project._id);

                            return (
                                <Link
                                    href={`/projects/${slugVal}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={project._id}
                                    className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
                                >
                                    {/* Image Wrapper */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img
                                            src={getImageUrl(project.mainImage)}
                                            alt={project.title?.[language]}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {project.category?.name?.[language] || project.category?.name?.en}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-[#41398B] transition-colors line-clamp-2 leading-snug">
                                            {project.title?.[language] || project.title?.en}
                                        </h3>

                                        <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-3 mb-6 font-medium">
                                            {plainTextIntro}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-[#41398B] font-bold text-[14px] flex items-center gap-2 group/btn">
                                                {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                                                <span className="transform transition-transform group-hover/btn:translate-x-1">→</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}

