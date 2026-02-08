import ContactClient from "./ContactClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getContactData() {
    try {
        const res = await axios.get(`${API_URL}/contact-page`);
        if (res.data?.success && res.data?.data) {
            return res.data.data;
        }
        return res.data;
    } catch (error) {
        console.error("Error fetching Contact Page data:", error);
        return null;
    }
}

export async function generateMetadata() {
    const data = await getContactData();

    const defaultTitle = "Contact Us | Property Portal";
    const defaultDesc = "Get in touch with us for any inquiries about properties, partnerships, or support.";

    if (!data) {
        return {
            title: defaultTitle,
            description: defaultDesc,
        };
    }

    const title = data.contactSeoMetaTitle_en || data.contactBannerTitle_en || defaultTitle;
    const description = data.contactSeoMetaDescription_en || defaultDesc;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        },
    };
}

export default async function Page() {
    const data = await getContactData();
    return <ContactClient data={data} />;
}
