/** @type {import('next-sitemap').IConfig} */

const SITE_URL = 'https://183housingsolutions.com'
const API_URL = 'https://api.183housingsolutions.com/api/v1'

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

            const staticPages = [
                '/',
                '/about',
                '/projects',
                '/blogs',
                '/listing',
                '/contact',
            ]

            for (const page of staticPages) {
                paths.push(await config.transform(config, page))
            }

            // Properties
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

            // Projects
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

            // Blogs
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