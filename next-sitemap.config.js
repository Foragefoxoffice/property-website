/** @type {import('next-sitemap').IConfig} */

const SITE_URL = process.env.VITE_SITE_URL
const API_URL = process.env.VITE_API_URL

module.exports = {
    siteUrl: SITE_URL,

    generateRobotsTxt: true,
    generateIndexSitemap: false,

    sitemapSize: 7000,

    exclude: [
        '/admin/*',
        '/dashboard/*',
        '/api/*',
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },

    additionalPaths: async (config) => {
        try {

            const paths = []

            // ========================
            // STATIC PAGES
            // ========================

            const staticPages = [
                '/',
                '/about',
                '/properties',
                '/projects',
                '/news',
                '/contact',
            ]

            for (const page of staticPages) {
                paths.push(await config.transform(config, page))
            }

            // ========================
            // PROPERTY PAGES
            // ========================

            const propertyRes = await fetch(
                `${API_URL}/properties`
            )

            const propertyData = await propertyRes.json()

            const properties =
                propertyData?.data || propertyData || []

            for (const property of properties) {

                if (!property?.slug || !property?.propertyId) continue

                paths.push(
                    await config.transform(
                        config,
                        `/property-showcase/${property.propertyId}/${property.slug}`
                    )
                )
            }

            // ========================
            // PROJECT PAGES
            // ========================

            const projectRes = await fetch(
                `${API_URL}/projects`
            )

            const projectData = await projectRes.json()

            const projects =
                projectData?.data || projectData || []

            for (const project of projects) {

                if (!project?.slug) continue

                paths.push(
                    await config.transform(
                        config,
                        `/projects/${project.slug}`
                    )
                )
            }

            // ========================
            // BLOG PAGES
            // ========================

            const blogRes = await fetch(
                `${API_URL}/blogs`
            )

            const blogData = await blogRes.json()

            const blogs =
                blogData?.data || blogData || []

            for (const blog of blogs) {

                if (!blog?.slug) continue

                paths.push(
                    await config.transform(
                        config,
                        `/blogs/${blog.slug}`
                    )
                )
            }

            return paths

        } catch (error) {

            console.log('SITEMAP ERROR:', error)

            return []
        }
    },
}