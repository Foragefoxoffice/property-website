"use client";

import React from 'react';
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import ContactBanner from "@/components/Contact/ContactBanner";
import ContactReachForm from "@/components/Contact/ContactReachForm";
import ContactMap from "@/components/Contact/ContactMap";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader/Loader";

export default function ContactClient({ data, loading }) {
    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <ContactBanner data={data} />
            <ContactReachForm data={data} />
            <ContactMap data={data} />
            <Footer />
        </div>
    );
}
