// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import { getProjectPage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ProjectVideo({ projectData }: any) {
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

    const sections = projectData.projectVideoTabs || [];
    const sectionTitle = projectData.projectVideoTitle?.[language] ||
        projectData.projectVideoTitle?.en || "";

    if (sections.length === 0) return null;

    // Helper to format YouTube URLs into Embed URLs
    const getEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("embed/")) return url;

        let videoId = "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            videoId = match[2];
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    return (
        <section id="video" className="py-16 bg-white ">
            <div className="max-w-[1550px] mx-auto px-6 lg:px-24">
                {/* Section Title */}
                <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-12 text-center uppercase tracking-[0.05em]">
                    {sectionTitle}
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap border border-gray-200 mb-10 overflow-hidden rounded-sm">
                    {sections.map((section, idx) => {
                        const title = section.projectVideoTabTitle?.[language] || section.projectVideoTabTitle?.en || `Tab ${idx + 1}`;
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

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500">
                    {sections[activeTab]?.videos?.map((video, idx) => {
                        const embedUrl = getEmbedUrl(video.projectVideoEmbeded);
                        return (
                            <div key={idx} className="relative group overflow-hidden rounded-xl shadow-lg aspect-video bg-gray-100 border border-gray-200">
                                <iframe
                                    className="w-full h-full"
                                    src={embedUrl}
                                    title={`Project Video ${idx + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        );
                    })}
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






