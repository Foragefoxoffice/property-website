// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react';
import { getProjectPage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getImageUrl } from '@/utils/baseURL';
import Image from 'next/image';
const cleanHTML = (html: string) => html ? html.replace(/&nbsp;/g, ' ') : '';

export default function ProjectProduct({ projectData }: any) {
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

    const sectionTitle = projectData.projectProductTitle?.[language] ||
        projectData.projectProductTitle?.en || "";

    const sectionDes = projectData.projectProductDes?.[language] || projectData.projectProductDes?.en || "";
    const products = projectData.projectProducts || [];

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 ">
            <div className="max-w-[1550px] mx-auto px-6 lg:px-24">
                {/* Section Title & Intro */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-6 uppercase tracking-[0.05em]">
                        {sectionTitle}
                    </h2>
                    {sectionDes && (
                        <div
                            suppressHydrationWarning
                            className="text-[#4b5563] text-[15px] md:text-[16px] leading-[1.8] project-product-rich-text"
                            style={{ 
                                wordBreak: 'initial', 
                                overflowWrap: 'break-word', 
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                display: 'block',
                                width: '100%'
                            }}
                            dangerouslySetInnerHTML={{ __html: cleanHTML(sectionDes) }}
                        />
                    )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {products.map((product, idx) => {
                        const productTitle = product.projectProductProductTitle?.[language] || product.projectProductProductTitle?.en || "";
                        const productDes = product.projectProductProducDes?.[language] || product.projectProductProducDes?.en || "";
                        const productImage = product.projectProductProductImage;

                        return (
                            <div key={idx} className="flex flex-col">
                                {/* Product Image/Floorplan */}
                                {productImage ? (
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden group relative min-h-[300px]">
                                        <Image
                                            src={getImageUrl(productImage)}
                                            alt={productTitle}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 mb-8">
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Product Image</span>
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="px-2">
                                    <h3 className="text-xl md:text-2xl font-extrabold text-[#111827] mb-6 text-center md:text-left">
                                        {productTitle}
                                    </h3>
                                    <div
                                        suppressHydrationWarning
                                        className="project-product-item-rich-text text-[#374151] text-[14.5px] md:text-[15.5px] leading-[1.7]"
                                        style={{ 
                                            wordBreak: 'initial', 
                                            overflowWrap: 'break-word', 
                                            whiteSpace: 'normal',
                                            textAlign: 'left',
                                            display: 'block',
                                            width: '100%'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: cleanHTML(productDes) }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .project-product-rich-text p {
                    margin-bottom: 1rem;
                }
                .project-product-rich-text strong {
                    color: #111827;
                    font-weight: 800;
                }
                
                .project-product-item-rich-text ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .project-product-item-rich-text ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                    list-style-position: outside !important;
                }
                .project-product-item-rich-text li {
                    margin-bottom: 0.5rem !important;
                    display: list-item !important;
                }
                .project-product-item-rich-text strong {
                    color: #111827;
                    font-weight: 700;
                    margin-right: 0.25rem;
                }
                /* Emphasize price or highlight text if it contains specific colors from your design */
                .project-product-item-rich-text em, 
                .project-product-item-rich-text span[style*="color: rgb(225, 29, 72)"],
                .project-product-item-rich-text span[style*="color: #e11d48"] {
                    color: #e11d48 !important;
                    font-weight: bold;
                    font-style: normal;
                }
            `}</style>
        </section>
    );
}






