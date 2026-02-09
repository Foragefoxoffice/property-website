import AboutClient from "./AboutClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getAboutData() {
    try {
        const res = await axios.get(`${API_URL}/about-page`);
        if (res.data?.success && res.data?.data) {
            return res.data.data;
        }
        return res.data;
    } catch (error) {
        console.error("Error fetching About Page data:", error);
        return null;
    }
}

export async function generateMetadata() {
    const data = await getAboutData();

    // Default values
    const defaultTitle = "About Us | Property Portal";
    const defaultDesc = "Learn more about our mission, vision, and the team behind Property Portal.";

    if (!data) {
        return {
            title: defaultTitle,
            description: defaultDesc,
        };
    }

    // Use CMS data if available (defaulting to English)
    const title = data.aboutSeoMetaTitle_en || data.aboutBannerTitle_en || defaultTitle;
    const description = data.aboutSeoMetaDescription_en || defaultDesc;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: Array.isArray(data.aboutSeoOgImages) ? data.aboutSeoOgImages : (data.aboutSeoOgImages ? [data.aboutSeoOgImages] : []),
        },
    };
}

export default async function Page() {
    const data = await getAboutData();
    return <AboutClient data={data} />;
}
