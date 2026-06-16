'use client'

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProjectTOC({ project }: { project: any }) {
    const { language } = useLanguage();
    const [activeSection, setActiveSection] = useState('');
    const [availableSections, setAvailableSections] = useState<string[]>([]);

    const menuItems = [
        { id: 'introduction', label: language === 'vi' ? 'Giới thiệu' : 'Introduction' },
        { id: 'main-description', label: language === 'vi' ? 'Mô tả chi tiết' : 'Description' },
        { id: 'overview', label: language === 'vi' ? 'Tổng quan dự án' : 'Project Overview' },
        { id: 'location', label: language === 'vi' ? 'Vị trí chiến lược' : 'Location' },
        { id: 'photos', label: language === 'vi' ? 'Thư viện hình ảnh' : 'Photo Gallery' },
        { id: 'products', label: language === 'vi' ? 'Các dòng sản phẩm' : 'Products' },
        { id: 'video', label: language === 'vi' ? 'Thư viện Video' : 'Video Gallery' },
    ];

    useEffect(() => {
        // Find which sections actually render on the page
        const existing = menuItems.map(item => item.id).filter(id => document.getElementById(id));
        setAvailableSections(existing);
        if (existing.length > 0) setActiveSection(existing[0]);

        const handleScroll = () => {
            const sections = existing.map(id => document.getElementById(id)).filter(Boolean);
            const scrollPosition = window.scrollY + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Delay the check slightly to allow child components to render
        setTimeout(() => {
             const updatedExisting = menuItems.map(item => item.id).filter(id => document.getElementById(id));
             setAvailableSections(updatedExisting);
        }, 500);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [project, language]);

    const handleClick = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 150,
                behavior: 'smooth'
            });
            setActiveSection(id);
        }
    };

    const displayItems = menuItems.filter(item => availableSections.includes(item.id));

    if (displayItems.length === 0) return null;

    return (
        <div className="bg-black text-white sticky top-[50px] md:top-[60px] z-40 w-full shadow-md">
            <div className="max-w-[1550px] mx-auto px-4 lg:px-6">
                <ul className="flex flex-row items-center justify-center overflow-x-auto no-scrollbar scroll-smooth">
                    {displayItems.map((item, index) => (
                        <li key={item.id} className="flex-shrink-0 flex items-center">
                            <button
                                onClick={() => handleClick(item.id)}
                                className={`whitespace-nowrap px-4 md:px-6 py-4 text-[14px] md:text-[15px] transition-all duration-300 font-semibold ${
                                    activeSection === item.id 
                                        ? 'text-[#f0c059]' 
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                            {index < displayItems.length - 1 && (
                                <span className="text-white/30 px-1 md:px-2">|</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
