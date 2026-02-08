"use client";

import React from 'react';
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import TermsConditionBanner from "@/components/TermsConditions/TermsConditionBanner";
import Loader from "@/components/Loader/Loader";
import { useLanguage } from '@/Language/LanguageContext';

export default function TermsConditionClient({ data, loading }) {
    const { language } = useLanguage();

    if (loading) {
        return <Loader />;
    }

    const contentTitle = language === 'en'
        ? data?.termsConditionContentTitle_en
        : data?.termsConditionContentTitle_vn;

    const contentBody = language === 'en'
        ? data?.termsConditionContent_en
        : data?.termsConditionContent_vn;

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <TermsConditionBanner data={data} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {contentTitle && (
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-200">
                            {contentTitle}
                        </h2>
                    )}

                    {contentBody && (
                        <div
                            className="prose prose-lg max-w-none text-gray-600 font-['Manrope'] prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-[#41398B] prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: contentBody }}
                        />
                    )}

                    {!contentBody && (
                        <div className="text-center py-12 text-gray-500">
                            {language === 'en' ? 'No content available.' : 'Chưa có nội dung.'}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
