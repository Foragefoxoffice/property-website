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

            const locales = ['en', 'vi']

            const staticPages = [
                '/',
                '/about',
                '/projects',
                '/blogs',
                '/listing',
                '/contact',
                '/privacy-policy',
                '/terms-conditions',
            ]

            for (const page of staticPages) {
                for (const locale of locales) {
                    const path = page === '/' ? `/${locale}` : `/${locale}${page}`
                    paths.push(await config.transform(config, path))
                }
            }

            // Properties
            const propertyRes = await fetch(
                `${API_URL}/create-property/listing`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            )

            const propertyType =
                propertyRes.headers.get('content-type')

            if (
                propertyRes.ok &&
                propertyType?.includes('application/json')
            ) {

                const propertyData = await propertyRes.json()

                const properties =
                    propertyData?.data || []

                for (const property of properties) {

                    const propertyId =
                        property?.listingInformation?.listingInformationPropertyId

                    const slug =
                        property?.seoInformation?.isSlugUrl?.en

                    if (!propertyId || !slug) continue

                    for (const locale of locales) {
                        paths.push(
                            await config.transform(
                                config,
                                `/${locale}/listing/${slug}-${propertyId}`
                            )
                        )
                    }
                }

            } else {

                console.log('Invalid Property API Response')

            }

            // Projects
            const projectRes = await fetch(
                `${API_URL}/projects`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            )

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

                    const slug = project?.slug?.en

                    if (!slug) continue

                    for (const locale of locales) {
                        paths.push(
                            await config.transform(
                                config,
                                `/${locale}/projects/${slug}`
                            )
                        )
                    }
                }

            } else {

                console.log('Invalid Project API Response')

            }

            // Blogs
            const blogRes = await fetch(
                `${API_URL}/blogs`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            )

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

                    const slug = blog?.slug?.en

                    if (!slug) continue

                    for (const locale of locales) {
                        paths.push(
                            await config.transform(
                                config,
                                `/${locale}/blogs/${slug}`
                            )
                        )
                    }
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