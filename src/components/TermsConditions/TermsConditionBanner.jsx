import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/Language/LanguageContext';

export default function TermsConditionBanner({ data }) {
    const { language } = useLanguage();

    // Helper to get partial or full URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    const title = language === 'en'
        ? (data?.termsConditionBannerTitle_en || 'Terms & Conditions')
        : (data?.termsConditionBannerTitle_vn || 'Điều Khoản & Điều Kiện');

    const bgImage = data?.termsConditionBannerImage ? getImageUrl(data.termsConditionBannerImage) : null;

    const backgroundStyle = bgImage ? { backgroundImage: `url(${bgImage})` } : { backgroundColor: '#1a1a1a' };

    return (
        <div
            className="relative lg:h-[400px] h-96 w-full flex items-center justify-center bg-cover bg-center"
            style={backgroundStyle}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4 animate-slideUpFade">
                    {title}
                </h1>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-white/80 text-sm md:text-base animate-slideUpFade animation-delay-200">
                    <Link href="/" className="hover:text-white transition-colors">
                        {language === 'en' ? 'Home' : 'Trang Chủ'}
                    </Link>
                    <span>&gt;</span>
                    <span className="text-white">{title}</span>
                </div>
            </div>
        </div>
    );
}
