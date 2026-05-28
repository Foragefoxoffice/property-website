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
            const propertyRes = await fetch(`${API_URL}/property`)

            const propertyType =
                propertyRes.headers.get('content-type')

            if (
                propertyRes.ok &&
                propertyType?.includes('application/json')
            ) {

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

            } else {

                console.log('Invalid Property API Response')

            }

            // Projects
            const projectRes = await fetch(`${API_URL}/project`)

            const projectType =
                projectRes.headers.get('content-type')

            if (
                projectRes.ok &&
                projectType?.includes('application/json')
            ) {

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

            } else {

                console.log('Invalid Project API Response')

            }

            // Blogs
            const blogRes = await fetch(`${API_URL}/blog`)

            const blogType =
                blogRes.headers.get('content-type')

            if (
                blogRes.ok &&
                blogType?.includes('application/json')
            ) {

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

            } else {

                console.log('Invalid Blog API Response')

            }

            return paths

        } catch (error) {

            console.log('SITEMAP ERROR:', error)

            return []
        }
    },
}