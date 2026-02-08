"use client";

import { useState, useEffect } from 'react';
import HomeBanner from "@/components/Home/HomeBanner";
import HomeAbout from "@/components/Home/HomeAbout";
import HomeFeaturedProperties from "@/components/Home/HomeFeaturedProperties";
import HomeFaq from "@/components/Home/HomeFaq";
import HomeFindProperty from "@/components/Home/HomeFindProperty";
import HomeLatestBlogs from "@/components/Home/HomeLatestBlogs";
import HomeTestimonials from "@/components/Home/HomeTestimonials";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader/Loader";
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { useLanguage } from "@/Language/LanguageContext";

export default function HomeClient({ initialData }) {
    const [homePageData, setHomePageData] = useState(initialData);
    const { language } = useLanguage();

    if (!homePageData) {
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <HomeBanner homePageData={homePageData} />
            <HomeAbout homePageData={homePageData} />
            <HomeFeaturedProperties homePageData={homePageData} />
            <HomeFaq homePageData={homePageData} />
            <HomeTestimonials homePageData={homePageData} />
            <HomeFindProperty homePageData={homePageData} />
            <HomeLatestBlogs homePageData={homePageData} />
            <Footer />
        </div>
    );
}
