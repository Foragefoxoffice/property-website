import TermsConditionClient from "./TermsConditionClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getTermsData() {
    try {
        const res = await axios.get(`${API_URL}/terms-conditions-page`);
        return res.data?.data || null;
    } catch (error) {
        console.error("Error fetching Terms data:", error);
        return null;
    }
}

export async function generateMetadata() {
    const data = await getTermsData();
    const title = data?.termsConditionSeoMetaTitle_en || "Terms & Conditions | Property Portal";

    return {
        title,
        description: data?.termsConditionSeoMetaDescription_en || "Read our terms and conditions for using our property portal services.",
    };
}

export default async function Page() {
    const data = await getTermsData();
    return <TermsConditionClient data={data} />;
}
