import HomeClient from "./HomeClient";
import { getHomePage } from "@/Api/action";

// This is a Server Component
export async function generateMetadata() {
  try {
    const response = await getHomePage();
    console.log("response", response);
    if (response.data?.success && response.data?.data) {
      const data = response.data.data;
      // You can implement custom logic here to determine which language to use for SEO
      // For now, let's use English as default for metadata or common values
      return {
        title: data.homeSeoMetaTitle_en || data.heroTitle_en || "Property Portal",
        description: data.homeSeoMetaDescription_en || data.heroDescription_en || "Advanced Property Management and Listing Platform",
        openGraph: {
          images: data.homeSeoOgImages?.[0] || data.heroImage ? [data.homeSeoOgImages?.[0] || data.heroImage] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Property Portal",
    description: "Advanced Property Management and Listing Platform",
  };
}

export default async function Page() {
  let homePageData = null;

  try {
    const response = await getHomePage();
    if (response.data?.success && response.data?.data) {
      homePageData = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching home page data on server:", error);
  }

  return <HomeClient initialData={homePageData} />;
}
