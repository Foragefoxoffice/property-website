import BlogDetailClient from "./BlogDetailClient";
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://dev.placetest.in/api/v1").replace(/\/$/, "");

async function getBlogData(slug) {
    try {
        const res = await axios.get(`${API_URL}/blogs/${slug}`);
        return res.data?.data || null;
    } catch (error) {
        console.error("Error fetching Blog detail:", error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await getBlogData(slug);

    if (!blog) {
        return {
            title: "Blog Not Found | Property Portal",
        };
    }

    const title = blog.seoInformation?.metaTitle?.en || blog.title?.en || "Blog Post";
    const description = blog.seoInformation?.metaDescription?.en || "Read more about this blog post on our portal.";

    return {
        title: `${title} | Property Portal`,
        description,
        openGraph: {
            title,
            description,
            images: blog.seoInformation?.ogImages || (blog.mainImage ? [blog.mainImage] : []),
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const blog = await getBlogData(slug);
    return <BlogDetailClient blog={blog} />;
}
