import React, { useState } from "react";
import { motion } from "framer-motion";
import { Select } from "antd";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube, HelpCircle } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import axios from "axios";
import { toast } from "react-toastify";
import { useLanguage } from '@/Language/LanguageContext';

export default function ContactReachForm({ data }) {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contact-enquiry`, formData);
            toast.success(language === 'en' ? "Message sent successfully!" : "Gửi tin nhắn thành công!");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                subject: "General Inquiry",
                message: ""
            });
        } catch (error) {
            console.error(error);
            toast.error(language === 'en' ? "Failed to send message." : "Gửi tin nhắn thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // CMS Data extraction with fallbacks
    const reachOutTitle = language === 'en'
        ? (data?.contactReachOutTitle_en || "Reach Out To Us")
        : (data?.contactReachOutTitle_vn || "Liên Hệ Với Chúng Tôi");
    const reachOutDescription = language === 'en'
        ? (data?.contactReachOutDescription_en || "We're here to assist with any questions, concerns, or inquiries—contact us today!")
        : (data?.contactReachOutDescription_vn || "Chúng tôi ở đây để hỗ trợ với bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào—liên hệ với chúng tôi ngay hôm nay!");

    const addressTitle = language === 'en'
        ? (data?.contactReachOutAddressHead_en || "101 E 129th St, East Chicago, 2nd Floor, NY")
        : (data?.contactReachOutAddressHead_vn || "101 E 129th St, East Chicago, Tầng 2, NY");
    const address = language === 'en'
        ? (data?.contactReachOutAddressContent_en || "101 E 129th St, East Chicago, 2nd Floor, NY")
        : (data?.contactReachOutAddressContent_vn || "101 E 129th St, East Chicago, Tầng 2, NY");

    const phoneTitle = language === 'en'
        ? (data?.contactReachOutNumberHead_en || "1-555-678-8888")
        : (data?.contactReachOutNumberHead_vn || "1-555-678-8888");

    const phones = Array.isArray(data?.contactReachOutNumberContent)
        ? data.contactReachOutNumberContent
        : [data?.contactReachOutNumberContent || "1-555-678-8888"];

    const emailTitle = language === 'en'
        ? (data?.contactReachOutEmailHead_en || "themesflat@gmail.com")
        : (data?.contactReachOutEmailHead_vn || "themesflat@gmail.com");

    const emails = Array.isArray(data?.contactReachOutEmailContent)
        ? data.contactReachOutEmailContent
        : [data?.contactReachOutEmailContent || "themesflat@gmail.com"];

    const formTitle = language === 'en'
        ? (data?.contactReachOutGetinTitle_en || "Get In Touch")
        : (data?.contactReachOutGetinTitle_vn || "Liên Hệ Ngay");
    const formDescription = language === 'en'
        ? (data?.contactReachOutGetinDescription_en || "We'd love to hear from you! If you have any questions")
        : (data?.contactReachOutGetinDescription_vn || "Chúng tôi rất muốn nghe từ bạn! Nếu bạn có bất kỳ câu hỏi nào");
    const formButtonText = language === 'en'
        ? (data?.contactReachOutGetinButtonText_en || "Send Message")
        : (data?.contactReachOutGetinButtonText_vn || "Gửi Tin Nhắn");

    const followUsTitle = language === 'en'
        ? (data?.contactReachOutFollowTitle_en || "Follow Us")
        : (data?.contactReachOutFollowTitle_vn || "Theo Dõi Chúng Tôi");

    // Social Links from CMS
    const socialLinks = data?.contactReachOutSocialIcons?.map(item => {
        const isUrl = item.icon?.includes('/') || item.icon?.includes('http');
        if (isUrl) {
            return {
                type: 'image',
                value: item.icon,
                href: item.link || "#"
            };
        }
        const IconComponent = LucideIcons[item.icon];
        return {
            type: 'icon',
            value: IconComponent || LucideIcons.HelpCircle, // Fallback icon
            href: item.link || "#"
        };
    }) || [];

    // For "X" (Twitter) specifically if we want the new logo
    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
        </svg>
    );

    return (
        <section className="py-16 md:py-18 bg-white relative overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-start gap-12 justify-between">

                    {/* Left Column: Contact Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="w-full"
                    >
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e4e4] h-full">
                            <h2 className="text-3xl font-semibold text-gray-900 mb-4">{reachOutTitle}</h2>
                            <p className="text-gray-500 mb-10 leading-relaxed text-lg font-light">
                                {reachOutDescription}
                            </p>

                            <div className="space-y-8">
                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all duration-300">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xl text-gray-900 mb-1">{addressTitle}</h4>
                                        <p className="text-gray-500 font-light text-sm md:text-base">{address}</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all duration-300">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xl text-gray-900 mb-1">{phoneTitle}</h4>
                                        <div className="flex flex-col gap-1">
                                            {phones.map((phone, index) => (
                                                <p key={index} className="text-gray-500 font-light text-sm md:text-base">
                                                    {phone}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all duration-300">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xl text-gray-900 mb-1">{emailTitle}</h4>
                                        <div className="flex flex-col gap-1">
                                            {emails.map((email, index) => (
                                                <p key={index} className="text-gray-500 font-light text-sm md:text-base break-all">
                                                    {email}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Follow Us */}
                            <div className="mt-12">
                                <h4 className="font-semibold text-gray-900 mb-6 text-xl">{followUsTitle}</h4>
                                <div className="flex flex-wrap gap-3">
                                    {socialLinks.map((item, index) => (
                                        <a
                                            key={index}
                                            href={item.href}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-[#41398B] hover:bg-[#41398B] hover:text-white hover:border-[#41398B] hover:scale-110 transition-all duration-300"
                                        >
                                            {item.type === 'image' ? (
                                                <img
                                                    src={item.value.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.value}` : item.value}
                                                    alt="Social"
                                                    className="w-5 h-5 object-contain"
                                                />
                                            ) : (
                                                <item.value className="w-5 h-5" />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 w-full lg:pl-8 pt-4"
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-semibold text-gray-900 mb-3">{formTitle}</h2>
                            <p className="text-gray-500 font-light text-lg">{formDescription}</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="text-lg font-semibold text-black" htmlFor="firstName">
                                        {language === 'en' ? "First Name" : "Tên"}
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        placeholder={language === 'en' ? "First Name" : "Tên"}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light"
                                    />
                                </div>
                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="text-lg font-semibold text-black" htmlFor="lastName">
                                        {language === 'en' ? "Last Name" : "Họ"}
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        placeholder={language === 'en' ? "Last Name" : "Họ"}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-lg font-semibold text-black" htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder={language === 'en' ? "Enter your email address" : "Nhập địa chỉ email của bạn"}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light"
                                    />
                                </div>
                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="text-lg font-semibold text-black" htmlFor="phone">
                                        {language === 'en' ? "Phone Number" : "Số Điện Thoại"}
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder={language === 'en' ? "Enter your phone number" : "Nhập số điện thoại của bạn"}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light"
                                    />
                                </div>
                            </div>

                            {/* Subject Select Field */}
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-black" htmlFor="subject">
                                    {language === 'en' ? "Subject" : "Chủ đề"}
                                </label>
                                <div className="relative">
                                    <Select
                                        id="subject"
                                        placeholder={language === 'en' ? "Select a Subject" : "Chọn chủ đề"}
                                        className="custom-select w-full mt-2"
                                        popupClassName="custom-dropdown"
                                        value={formData.subject || undefined}
                                        onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                                        size="large"
                                    >
                                        <Select.Option value="General Inquiry">{language === 'en' ? "General Inquiry" : "Yêu cầu chung"}</Select.Option>
                                        <Select.Option value="Property Viewing">{language === 'en' ? "Property Viewing" : "Xem bất động sản"}</Select.Option>
                                        <Select.Option value="Partnership">{language === 'en' ? "Partnership" : "Hợp tác"}</Select.Option>
                                        <Select.Option value="Support">{language === 'en' ? "Support" : "Hỗ trợ"}</Select.Option>
                                        <Select.Option value="Other">{language === 'en' ? "Other" : "Khác"}</Select.Option>
                                    </Select>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-black" htmlFor="message">
                                    {language === 'en' ? "Message" : "Tin Nhắn"}
                                </label>
                                <textarea
                                    id="message"
                                    rows="5"
                                    placeholder={language === 'en' ? "Your Message" : "Tin nhắn của bạn"}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light resize-none"
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-black text-white cursor-pointer hover:bg-[#333] font-medium py-3 rounded-lg transition-colors duration-300 mt-4"
                                disabled={loading}
                            >
                                {loading ? (language === 'en' ? "Sending..." : "Đang gửi...") : formButtonText}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}