// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import { getProjectPage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getImageUrl } from '@/utils/baseURL';
import { Carousel, ConfigProvider } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectOverview({ projectData }: any) {
    const { language } = useLanguage();
    const [pageData, setPageData] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const CustomArrow = ({ direction, onClick }) => (
        <button
            onClick={onClick}
            className={`absolute z-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white text-[#111827] rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 ${direction === 'left' ? 'left-6' : 'right-6'}`}
            style={{ pointerEvents: 'auto' }}
        >
            {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
    );

    const cleanHTML = (html) => {
        if (!html) return '';

        return html
            .replace(/&nbsp;/g, ' ')              // fix non-breaking spaces
            .replace(/\u00A0/g, ' ')              // unicode nbsp
            .replace(/<p>\s*<\/p>/g, '')          // remove empty paragraphs

            // Fix broken words like "phù hợ p", "fre sh", "fami lies" 
            .replace(/(\p{L}{2,})\s+([\p{L}]{1,2})(?!\p{L})/gu, (match, a, b) => {
                return a + b;
            })

            .replace(/\s{2,}/g, ' ')              // remove extra spaces (safe)
            .trim();
    };


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

    // If no project data is passed, we can't show specific specs
    if (!projectData) return null;

    const projectTitle = projectData.title?.[language] || projectData.title?.en || "";

    const displayTitle = (language === 'vi'
        ? `TỔNG QUAN DỰ ÁN ${projectTitle}`
        : `OVERVIEW OF THE ${projectTitle} ${projectTitle.toLowerCase().includes('project') ? '' : 'PROJECT'}`).toUpperCase();

    const overviewImages = projectData.projectOverviewImages || [];
    const overviewTable = projectData.projectOverviewTable || [];

    // Hide section if no images and no table data
    if (overviewImages.length === 0 && overviewTable.length === 0) return null;

    const activeImage = overviewImages[activeImageIndex];

    return (
        <section className="py-10 bg-white ">
            <div className="max-w-[1500px] mx-auto px-6">
                <div className="flex flex-col gap-12 lg:gap-6 items-center">
                    {/* Left: Featured Image Slider */}
                    <div className="w-full lg:w-[85%] flex flex-col group">
                        {/* Section Title */}
                        <h2 className="text-2xl md:text-2xl font-bold text-[#111827] mb-7 text-center lg:text-center uppercase tracking-tight leading-tight">
                            {displayTitle}
                        </h2>

                        {overviewImages.length > 0 ? (
                            <div className="relative flex-grow rounded-2xl overflow-hidden shadow-lg bg-gray-50 aspect-[16/8]">
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#41398B',
                                        },
                                        components: {
                                            Carousel: {
                                                dotActiveWidth: 24,
                                                dotHeight: 6,
                                                dotWidth: 8
                                            }
                                        }
                                    }}
                                >
                                    <Carousel
                                        autoplay
                                        autoplaySpeed={5000}
                                        effect="fade"
                                        arrows
                                        prevArrow={<CustomArrow direction="left" />}
                                        nextArrow={<CustomArrow direction="right" />}
                                        afterChange={(current) => setActiveImageIndex(current)}
                                        className="h-full"
                                    >
                                        {overviewImages.map((image, idx) => (
                                            <div key={idx} className="h-full overflow-hidden">
                                                <img
                                                    src={getImageUrl(image.url)}
                                                    alt={`${projectTitle} - ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-105"
                                                    style={{ aspectRatio: '16/8' }}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </ConfigProvider>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                            </div>
                        ) : (
                            <div className="w-full aspect-[16/10] bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                <span className="text-sm font-bold uppercase tracking-widest opacity-40">No Project Images Available</span>
                            </div>
                        )}

                        {activeImage?.description?.[language] && (
                            <p className="mt-5 text-center lg:text-center text-[#41398B] font-bold text-base md:text-lg tracking-wide">
                                {activeImage.description[language]}
                            </p>
                        )}
                    </div>

                    {/* Right: Overview Table/Specs */}
                    <div className="w-full lg:w-[85%] flex flex-col pt-10 lg:pt-[30px]">
                        <div className="divide-y divide-gray-100 border-t border-gray-100 flex-grow">
                            {overviewTable.length > 0 ? (
                                overviewTable.map((row, index) => {
                                    const head = row.head?.[language] || row.head?.en;
                                    const des = row.des?.[language] || row.des?.en;
                                    if (!head && !des) return null;

                                    // Special styling for price or emphasized fields
                                    const isEmphasized = head?.toLowerCase().includes('price') ||
                                        (head?.toLowerCase().includes('giá') && !head?.toLowerCase().includes('giá trị')) ||
                                        head?.toLowerCase().includes('booking');

                                    return (
                                        <div key={index} className="py-4 flex items-start transition-colors hover:bg-gray-50/50 px-3 -mx-3 rounded-lg group/row border-b border-gray-100 last:border-0">
                                            <div className="w-[30%] md:w-[25%] flex-shrink-0 pr-4">
                                                <span className="text-[13px] md:text-[14px] font-extrabold text-[#111827] uppercase tracking-wide opacity-80 group-hover/row:opacity-100 transition-opacity whitespace-normal">
                                                    {head}:
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className={`text-[14px] md:text-[15.5px] leading-[1.6] font-semibold project-overview-rich-text overflow-hidden ${isEmphasized ? 'text-rose-500 underline decoration-rose-200 decoration-2 underline-offset-4' : 'text-slate-600'}`}
                                                    dangerouslySetInnerHTML={{ __html: cleanHTML(des) }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                    No Project Specifications Found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`



.project-overview-rich-text {
    word-break: normal !important;
    overflow-wrap: normal !important;
    white-space: normal !important;
}
                .project-overview-rich-text ul {
                    list-style-type: disc;
                    padding-left: 1.25rem;
                    margin-top: 0.25rem;
                }
                .project-overview-rich-text li {
                    margin-bottom: 0.5rem;
                }
                .project-overview-rich-text li::marker {
                    color: #41398B;
                }
                .project-overview-rich-text p {
                    margin: 0;
                    line-height: 1.6;
                    white-space: normal;
                }
                .project-overview-rich-text p:last-child {
                    margin-bottom: 0;
                }
                .ant-carousel .slick-prev,
                .ant-carousel .slick-next {
                    display: none !important;
                }
            `}</style>
        </section>
    );
}






