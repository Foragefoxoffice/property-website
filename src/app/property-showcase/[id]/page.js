import PropertyShowcaseClient from "./PropertyShowcaseClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getPropertyData(id) {
    try {
        const res = await axios.get(`${API_URL}/create-property/pid/${id}`);
        const payload = res.data?.data ?? null;
        if (!payload) {
            const alt = res.data ?? null;
            if (Array.isArray(alt) && alt.length) {
                return alt[0];
            }
            return null;
        }
        return payload;
    } catch (err) {
        console.error("Error fetching property:", err);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const property = await getPropertyData(id);

    if (!property) {
        return {
            title: "Property Not Found | Property Portal",
        };
    }

    // Basic SEO info extraction (defaulting to English for metadata)
    const seoInfo = property.seoInformation || {};
    const listingInfo = property.listingInformation || {};

    const title = seoInfo.metaTitle?.en || listingInfo.listingInformationPropertyTitle?.en || "Property Details";
    const description = seoInfo.metaDescription?.en || listingInfo.informationView?.en || "Check out this amazing property!";

    const ogImages = seoInfo.ogImages?.length ? seoInfo.ogImages : (property.imagesVideos?.propertyImages || []);

    return {
        title,
        description,
        alternates: {
            canonical: `/property-showcase/${id}`,
        },
        openGraph: {
            title,
            description,
            images: ogImages,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImages.length > 0 ? [ogImages[0]] : [],
        },
    };
}

export default async function Page({ params }) {
    const { id } = await params;
    const property = await getPropertyData(id);

    return <PropertyShowcaseClient property={property} id={id} />;
}
