import { Suspense } from "react";
import BlogPageClient from "./BlogPageClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getBlogPageData() {
    try {
        const res = await axios.get(`${API_URL}/blog-page`);
        return res.data?.data || null;
    } catch (error) {
        console.error("Error fetching Blog page data:", error);
        return null;
    }
}

async function getBlogsData() {
    try {
        const res = await axios.get(`${API_URL}/blogs`);
        return res.data?.data || [];
    } catch (error) {
        console.error("Error fetching Blogs:", error);
        return [];
    }
}

export async function generateMetadata() {
    const data = await getBlogPageData();
    const title = data?.blogTitle?.en || "Blog | Property Portal";
    const description = "Stay updated with the latest news and articles from our property portal.";

    return {
        title,
        description,
    };
}

export default async function Page() {
    const [blogs, blogPageData] = await Promise.all([
        getBlogsData(),
        getBlogPageData(),
    ]);

    return (
        <Suspense fallback={null}>
            <BlogPageClient initialBlogs={blogs} blogPageData={blogPageData} />
        </Suspense>
    );
}
