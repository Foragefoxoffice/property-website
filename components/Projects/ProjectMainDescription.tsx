// @ts-nocheck
'use client'
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
const cleanHTML = (html: string) => html ? html.replace(/&nbsp;/g, ' ') : '';

export default function ProjectMainDescription({ projectData }: any) {
    const { language } = useLanguage();

    if (!projectData) return null;

    const mainDescription = projectData.projectMainDescription?.[language] || 
                            projectData.projectMainDescription?.vi || 
                            projectData.projectMainDescription?.en || "";

    if (!mainDescription) return null;

    return (
        <section className="py-12 bg-white ">
            <div className="max-w-4xl mx-auto px-6">
                <div 
                    className="main-description-rich-text text-[#374151] text-[16px] md:text-[17px] leading-[1.8] overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: cleanHTML(mainDescription) }}
                />
            </div>

            <style>{`
                .main-description-rich-text p {
                    margin-bottom: 1.5rem;
                }
                .main-description-rich-text strong {
                    color: #111827;
                    font-weight: 800;
                }
                .main-description-rich-text ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .main-description-rich-text ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .main-description-rich-text li {
                    margin-bottom: 0.5rem !important;
                    display: list-item !important;
                }
            `}</style>
        </section>
    );
}







