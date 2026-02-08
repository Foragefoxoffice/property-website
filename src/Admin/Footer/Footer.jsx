import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/Language/LanguageContext';
import { getFooter, createSubscription } from '@/Api/action';
import { toast } from 'react-toastify';

const staticTranslations = {
    propertyForSale: {
        en: "Property For Sale",
        vi: "Bất động sản bán"
    },
    propertyForLease: {
        en: "Property For Lease",
        vi: "Bất động sản cho thuê"
    },
    propertyForHomeStay: {
        en: "Property For Home Stay",
        vi: "Homestay"
    },
    aboutUs: {
        en: "About Us",
        vi: "Về chúng tôi"
    },
    contactUs: {
        en: "Contact Us",
        vi: "Liên hệ"
    },
    latestNews: {
        en: "Latest News",
        vi: "Tin tức mới nhất"
    },
    emailPlaceholder: {
        en: "E-mail",
        vi: "Email"
    },
    termsOfService: {
        en: "Terms of Service",
        vi: "Điều khoản dịch vụ"
    },
    privacyPolicy: {
        en: "Privacy Policy",
        vi: "Chính sách bảo mật"
    },
    allRightsReserved: {
        en: "All Rights Reserved.",
        vi: "Đã đăng ký bản quyền."
    }
};

export default function Footer() {
    const { language } = useLanguage();
    const [footerData, setFooterData] = useState(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error(language === 'vi' ? "Vui lòng nhập email" : "Please enter email");
            return;
        }
        try {
            setLoading(true);
            await createSubscription({ email });
            toast.success(language === 'vi' ? "Đăng ký thành công!" : "Subscribed successfully!");
            setEmail("");
        } catch (error) {
            toast.error(error.response?.data?.error || (language === 'vi' ? "Đăng ký thất bại" : "Subscription failed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getFooter();
                if (response.data && response.data.data) {
                    const data = response.data.data;
                    // Ensure footerEmail is an array
                    if (data.footerEmail && typeof data.footerEmail === 'string') {
                        data.footerEmail = [data.footerEmail];
                    } else if (!data.footerEmail) {
                        data.footerEmail = [];
                    }
                    setFooterData(data);
                }
            } catch (error) {
                console.error("Failed to fetch footer data", error);
            }
        };
        fetchData();
    }, []);

    // CMS language mapping: frontend 'vi' -> backend 'vn'
    const cmsLang = language === 'vi' ? 'vn' : 'en';

    const t = (key) => {
        if (!footerData) return '';
        return footerData[`${key}_${cmsLang}`] || footerData[`${key}_en`] || '';
    };

    const st = (key) => {
        return staticTranslations[key][language] || staticTranslations[key]['en'];
    };

    const baseURL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : '';

    return (
        <footer className="bg-[#161616] text-white pt-12 md:pt-16 pb-8 font-['Manrope']">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8 border-b border-gray-800 pb-12">
                    {/* Left Column - Contact Info */}
                    <div className="lg:col-span-4 space-y-8">
                        {footerData?.footerLogo && (
                            <Link href="/" className="block mb-4">
                                <img
                                    src={footerData.footerLogo.startsWith('/') ? `${baseURL}${footerData.footerLogo}` : footerData.footerLogo}
                                    alt="Logo"
                                    className="h-20 md:h-24 w-auto object-contain"
                                />
                            </Link>
                        )}

                        <div className="space-y-6">
                            {/* Address */}
                            <div className="space-y-1 mb-4">
                                <h4 className="text-[#898989] text-[15px] font-medium block">{t('footerAddressLable')}</h4>
                                <p className="text-white text-[15px] leading-relaxed max-w-[280px]">
                                    {t('footerAddress')}
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1 mb-3">
                                <h4 className="text-[#898989] text-[15px] font-medium inline-block mr-2">{t('footerNumberLable')}</h4>
                                <div className="inline-flex flex-wrap gap-2">
                                    {footerData?.footerNumber?.map((num, i) => (
                                        <a key={i} href={`tel:${num}`} className="text-white text-[15px] hover:text-[#7f75d5] transition-colors">
                                            {num}{i < footerData.footerNumber.length - 1 ? ',' : ''}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <h4 className="text-[#898989] text-[15px] font-medium inline-block mr-2">{t('footerEmailLable')}</h4>
                                <div className="inline-flex flex-wrap gap-2">
                                    {footerData?.footerEmail?.map((email, i) => (
                                        <a key={i} href={`mailto:${email}`} className="text-white text-[15px] hover:text-[#7f75d5] transition-colors inline-block">
                                            {email}{i < footerData.footerEmail.length - 1 ? ',' : ''}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column 1 - Our Company */}
                    <div className="lg:col-span-2 lg:col-start-6 pt-2">
                        <h3 className="text-[16px] font-bold text-white mb-6">{t('footerOurCompanyLable')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/listing?type=Sale" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('propertyForSale')}</Link></li>
                            <li><Link href="/listing?type=Lease" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('propertyForLease')}</Link></li>
                            <li><Link href="/listing?type=Home Stay" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('propertyForHomeStay')}</Link></li>
                        </ul>
                    </div>

                    {/* Middle Column 2 - Quick Links */}
                    <div className="lg:col-span-2 pt-2">
                        <h3 className="text-[16px] font-bold text-white mb-6">{t('footerQuickLinksLable')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('aboutUs')}</Link></li>
                            <li><Link href="/contact" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('contactUs')}</Link></li>
                            <li><Link href="/blogs" className="text-[#898989] hover:text-white transition-colors text-[15px]">{st('latestNews')}</Link></li>
                        </ul>
                    </div>

                    {/* Right Column - Newsletter */}
                    <div className="lg:col-span-3 lg:col-start-10 pt-2">
                        <h3 className="text-[16px] font-bold text-white mb-4">{t('footerJoinOurNewsTitle')}</h3>
                        <p className="text-[#898989] text-[15px] mb-6 leading-relaxed">
                            {t('footerJoinOurNewsDescription')}
                        </p>

                        <div className="relative mb-8">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={st('emailPlaceholder')}
                                className="w-full h-11 pl-5 pr-12 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[15px]"
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="absolute right-1 top-1 w-9 h-9 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                <ArrowUpRight size={18} />
                            </button>
                        </div>

                        <div className="flex gap-6">
                            <Link href="/terms-conditions" className="text-[#898989] hover:text-white text-[14px] underline underline-offset-4 decoration-gray-600 hover:decoration-white transition-all">
                                {st('termsOfService')}
                            </Link>
                            <Link href="/privacy-policy" className="text-[#898989] hover:text-white text-[14px] underline underline-offset-4 decoration-gray-600 hover:decoration-white transition-all">
                                {st('privacyPolicy')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[#898989] text-[14px]">
                        &copy; {new Date().getFullYear()} <Link href="/" className="text-white hover:text-[#7f75d5] transition-all">{t('footerCopyRight') || '183 Housing Solutions'}</Link>. {st('allRightsReserved')}
                    </p>

                    <div className="flex items-center gap-4">
                        {footerData?.footerIcons?.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-6 h-6 flex items-center justify-center text-white hover:text-[#7f75d5] hover:opacity-80 transition-all"
                            >
                                <img
                                    src={item.icon.startsWith('/') ? `${baseURL}${item.icon}` : item.icon}
                                    alt="social"
                                    className="w-full h-full object-contain"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
