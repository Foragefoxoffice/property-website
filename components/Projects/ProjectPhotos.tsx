// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import { getProjectPage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getImageUrl } from '@/utils/baseURL';

export default function ProjectPhotos({ projectData }: any) {
    const { language } = useLanguage();
    const [pageData, setPageData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const res = await getProjectPage();
                setPageData(res.data?.data || null);
            } catch (error) {
                console.error("Error fetching project page data:", error);
            }
        };
        fetchPageData();
    }, []);

    if (!projectData) return null;

    const sections = projectData.projectPhotoTabs || [];
    if (sections.length === 0) return null;

    const sectionTitle = projectData.projectPhotoTitle?.[language] ||
        projectData.projectPhotoTitle?.en || "";

    return (
        <section className="py-16 bg-white ">
            <div className="max-w-[1550px] mx-auto px-6 lg:px-24">
                {/* Section Title */}
                <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-12 text-center uppercase tracking-[0.05em]">
                    {sectionTitle}
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap border border-gray-200 mb-10 overflow-hidden rounded-sm">
                    {sections.map((section, idx) => {
                        const title = section.tabTitle?.[language] || section.tabTitle?.en || `Tab ${idx + 1}`;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex-1 min-w-fit px-6 py-4 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 border-r border-gray-200 last:border-r-0 ${activeTab === idx
                                        ? 'bg-[#111827] text-white'
                                        : 'bg-white text-gray-500 hover:text-[#111827] hover:bg-gray-50'
                                    }`}
                            >
                                {title}
                            </button>
                        );
                    })}
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500">
                    {sections[activeTab]?.images?.map((img, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-lg shadow-sm aspect-[16/10]">
                            <img
                                src={getImageUrl(img.url)}
                                alt={img.description?.[language] || ""}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {img.description?.[language] && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-sm md:text-[15px] font-medium leading-relaxed opacity-90">
                                        {img.description[language]}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                /* Hide scrollbar for tabs on mobile if they overflow */
                .flex-wrap::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}







