"use client";

import React from "react";
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";
import PropertyHome from "@/components/PropertyShowcase/PropertyHome";
import PropertyDetailsSection from "@/components/PropertyShowcase/PropertyDetailsSection";
import Loader from "@/components/Loader/Loader";
import { useLanguage } from "@/Language/LanguageContext";
import { translations } from "@/Language/translations";

export default function PropertyShowcaseClient({ property, loading, id }) {
    const { language } = useLanguage();
    const t = translations[language];

    if (loading) {
        return <Loader />;
    }

    if (!property) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">{t.propertyNotFound || "Property Not Found"}</h2>
                    <p className="text-gray-500">{t.noPropertyData || "No property data for"} <strong>{id}</strong></p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="fade-in bg-[#F8F7FC]">
                <PropertyHome property={property} />
                <PropertyDetailsSection property={property} />
            </div>
            <Footer />
        </>
    );
}
