"use client";

import React from 'react';
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import AboutBanner from "@/components/About/AboutBanner";
import AboutOverview from "@/components/About/AboutOverview";
import AboutMissionVission from "@/components/About/AboutMissionVission";
import AboutHistory from "@/components/About/AboutHistory";
import AboutWhyChoose from "@/components/About/AboutWhyChoose";
import AboutFindProperty from "@/components/About/AboutFindProperty";
import AboutBuyProcess from "@/components/About/AboutBuyProcess";
import AboutAgent from "@/components/About/AboutAgent";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader/Loader";

export default function AboutClient({ data, loading }) {
    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <AboutBanner data={data} />
            <AboutOverview data={data} />
            <AboutMissionVission data={data} />
            <AboutHistory data={data} />
            <AboutWhyChoose data={data} />
            <AboutBuyProcess data={data} />
            <AboutFindProperty data={data} />
            <AboutAgent data={data} />
            <Footer />
        </div>
    );
}
