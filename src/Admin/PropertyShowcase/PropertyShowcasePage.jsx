// PropertyShowcasePage.jsx
import React, { useState, useEffect } from "react";
import { getSingleListingByPropertyID } from "@/Api/action";
import { useParams } from "react-router-dom";
import PropertyHome from "./PropertyHome";
import PropertyDetailsSection from "./PropertyDetailSection";

import Loader from "@/components/Loader/Loader";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function PropertyShowcasePage() {
  const { id } = useParams(); // id is the property id in URL
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSingleListingByPropertyID(id);
        const payload = res?.data?.data ?? null;
        if (!payload) {
          const alt = res?.data ?? null;
          if (Array.isArray(alt) && alt.length) {
            if (mounted) setProperty(alt[0]);
          } else {
            if (mounted) setProperty(null);
          }
        } else {
          if (mounted) setProperty(payload);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---------------------------------------------
       ✅ SEO META TAG INJECTION
    --------------------------------------------- */
  useEffect(() => {
    if (!property) return;

    const langKey = language; // 'en' or 'vi'
    const seoInfo = property.seoInformation || {};

    // Helper: Safely get localized string
    const getLoc = (obj) => obj?.[langKey] || obj?.en || "";

    // 1. Data Preparation
    const metaTitle = getLoc(seoInfo.metaTitle) ||
      getLoc(property.listingInformation?.listingInformationPropertyTitle) ||
      "Property Details";

    const metaDesc = getLoc(seoInfo.metaDescription) ||
      getLoc(property.propertyInformation?.informationView) ||
      "Check out this amazing property!";

    const metaKeywords = (seoInfo.metaKeywords?.[langKey] || []).join(", ");

    const canonicalUrl = getLoc(seoInfo.canonicalUrl) || window.location.href;

    // Robots
    // seoInfo.allowIndexing is boolean. If true -> "index, follow", else "noindex, nofollow"
    const allowIndexing = seoInfo.allowIndexing !== false; // Default true
    const robotsContent = allowIndexing ? "index, follow" : "noindex, nofollow";

    // OG Data
    const ogTitle = getLoc(seoInfo.ogTitle) || metaTitle;
    const ogDesc = getLoc(seoInfo.ogDescription) || metaDesc;
    const ogImages = seoInfo.ogImages?.length
      ? seoInfo.ogImages
      : property.imagesVideos?.propertyImages || [];

    // Helper to update head tags
    const updateTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element && value) {
        element = document.createElement(selector.startsWith("link") ? "link" : "meta");
        if (selector.includes("canonical")) {
          element.setAttribute("rel", "canonical");
        } else if (selector.includes("property=")) {
          element.setAttribute("property", selector.split('property="')[1].slice(0, -2));
        } else {
          element.setAttribute("name", selector.split('name="')[1].slice(0, -2));
        }
        document.head.appendChild(element);
      }

      if (element) {
        if (!value) {
          element.remove();
        } else {
          element.setAttribute(attribute, value);
        }
      }
    };

    // --- EXECUTE UPDATES ---

    // Title
    document.title = metaTitle;

    // Meta Description
    updateTag('meta[name="description"]', "content", metaDesc);

    // Keywords
    updateTag('meta[name="keywords"]', "content", metaKeywords);

    // Robots
    updateTag('meta[name="robots"]', "content", robotsContent);

    // Canonical
    updateTag('link[rel="canonical"]', "href", canonicalUrl);

    // OG Tags
    updateTag('meta[property="og:title"]', "content", ogTitle);
    updateTag('meta[property="og:description"]', "content", ogDesc);
    updateTag('meta[property="og:type"]', "content", getLoc(seoInfo.schemaType) || "website");
    updateTag('meta[property="og:url"]', "content", window.location.href);

    // OG Images (Handle multiple)
    // First remove existing og:image tags to prevent duplicates accumulating
    document.querySelectorAll('meta[property="og:image"]').forEach(el => el.remove());

    if (ogImages.length > 0) {
      ogImages.forEach(imgUrl => {
        if (!imgUrl) return;
        // Ensure absolute URL
        const fullUrl = imgUrl.startsWith("http")
          ? imgUrl
          : `${process.env.NEXT_PUBLIC_API_URL || ""}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;

        const imgEl = document.createElement("meta");
        imgEl.setAttribute("property", "og:image");
        imgEl.setAttribute("content", fullUrl);
        document.head.appendChild(imgEl);
      });
    }

    // Twitter Card Tags
    updateTag('meta[name="twitter:card"]', "content", "summary_large_image");
    updateTag('meta[name="twitter:title"]', "content", ogTitle);
    updateTag('meta[name="twitter:description"]', "content", ogDesc);
    updateTag('meta[name="twitter:url"]', "content", window.location.href);

    // Twitter image (use first OG image if available)
    if (ogImages.length > 0 && ogImages[0]) {
      const fullUrl = ogImages[0].startsWith("http")
        ? ogImages[0]
        : `${process.env.NEXT_PUBLIC_API_URL || ""}${ogImages[0].startsWith("/") ? "" : "/"}${ogImages[0]}`;
      updateTag('meta[name="twitter:image"]', "content", fullUrl);
    }

    // Cleanup function? Mostly not needed for meta tags as they are persistent until next update,
    // but good practice to allow next page to overwrite.

  }, [property, language]);

  if (loading) {
    return <Loader />;
  }
  if (!property) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t.propertyNotFound}</h2>
          <p className="text-gray-500">{t.noPropertyData} <strong>{id}</strong></p>
        </div>
      </div>
    );
  }

  // Render page with property data
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
