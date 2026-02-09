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
      const title = data.homeSeoMetaTitle_en || data.heroTitle_en || "Property Portal";
      const description = data.homeSeoMetaDescription_en || data.heroDescription_en || "Advanced Property Management and Listing Platform";
      const ogTitle = data.homeSeoOgTitle_en || title;
      const ogDescription = data.homeSeoOgDescription_en || description;
      const ogImages = data.homeSeoOgImages?.length ? data.homeSeoOgImages : (data.heroImage ? [data.heroImage] : []);

      return {
        title,
        description,
        openGraph: {
          title: ogTitle,
          description: ogDescription,
          images: ogImages,
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
