/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://183housingsolutions.com',
    generateRobotsTxt: true,

    sitemapSize: 7000,

    exclude: [
        '/admin/*',
        '/dashboard/*',
        '/api/*'
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
};