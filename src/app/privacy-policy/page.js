import PrivacyPolicyClient from "./PrivacyPolicyClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getPrivacyPolicyData() {
    try {
        const res = await axios.get(`${API_URL}/privacy-policy-page`);
        return res.data?.data || null;
    } catch (error) {
        console.error("Error fetching Privacy Policy data:", error);
        return null;
    }
}

export async function generateMetadata() {
    const data = await getPrivacyPolicyData();
    const title = data?.privacyPolicySeoMetaTitle_en || "Privacy Policy | Property Portal";

    return {
        title,
        description: data?.privacyPolicySeoMetaDescription_en || "Our privacy policy details how we handle your personal information.",
    };
}

export default async function Page() {
    const data = await getPrivacyPolicyData();
    return <PrivacyPolicyClient data={data} />;
}
