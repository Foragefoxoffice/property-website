// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import { getProjectPage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getImageUrl } from '@/utils/baseURL';
const cleanHTML = (html: string) => html ? html.replace(/&nbsp;/g, ' ') : '';

export default function ProjectLocation({ projectData }: any) {
    const { language } = useLanguage();
    const [pageData, setPageData] = useState(null);

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

    const projectTitle = projectData.title?.[language] || projectData.title?.en || "";

    const sectionTitle = projectData.projectLocationTitle?.[language] ||
        projectData.projectLocationTitle?.en || "";

    const locationDes = projectData.projectLocationDes?.[language] || projectData.projectLocationDes?.en || "";
    const locationImages = projectData.projectLocationImages || [];

    // Hide section if no description and no images
    if (!locationDes && locationImages.length === 0) return null;

    const mainLocationImage = locationImages[0];
    const subLocationImages = locationImages.slice(1);

    return (
        <section className="py-20 bg-[#F5F5F5] ">
            <div className="max-w-[1550px] mx-auto px-6 lg:px-24">
                {/* Section Title */}
                <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-16 text-center uppercase tracking-[0.05em]">
                    {sectionTitle}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center">
                    {/* Left Column: Description Content */}
                    <div className="text-[#374151] text-[15px] md:text-[16px] leading-[1.8] project-location-rich-text pr-0 lg:pr-10 min-w-0">
                        <div
                            className="w-full max-w-full"
                            style={{ 
                                wordBreak: 'initial', 
                                overflowWrap: 'break-word', 
                                whiteSpace: 'normal',
                                textAlign: 'left',
                                display: 'block',
                                width: '100%'
                            }}
                            dangerouslySetInnerHTML={{ __html: cleanHTML(locationDes) }}
                        />
                    </div>

                    {/* Right Column: Images */}
                    <div className="flex flex-col gap-10">
                        {/* Main Image */}
                        {mainLocationImage ? (
                            <div className="relative overflow-hidden shadow-sm">
                                <img
                                    src={getImageUrl(mainLocationImage)}
                                    alt={`${projectTitle} - Location Map`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[16/10] bg-gray-200 flex items-center justify-center text-gray-400">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Map Image Available</span>
                            </div>
                        )}

                        {/* Secondary Gallery inside the right column */}
                        {subLocationImages.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {subLocationImages.map((img, idx) => (
                                    <div key={idx} className="relative overflow-hidden shadow-sm">
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${projectTitle} - Location Detail ${idx + 2}`}
                                            className="w-full h-auto object-cover aspect-[4/3]"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .project-location-rich-text ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .project-location-rich-text ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .project-location-rich-text li {
                    margin-bottom: 0.5rem !important;
                    display: list-item !important;
                }
                .project-location-rich-text p {
                    margin-bottom: 1.5rem;
                }
                .project-location-rich-text strong {
                    color: #111827;
                    font-weight: 800;
                }
            `}</style>
        </section>
    );
}










