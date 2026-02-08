import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website'
}) => {
    const siteTitle = '183 Housing Solutions';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    // Clean up image URL if needed
    let fullImage = image || '/images/favicon.png';
    if (fullImage && !fullImage.startsWith('http') && !fullImage.startsWith('/')) {
        // Handle cases where we just get a filename
        // We can't know the folder easily here without more context, so we might need to rely on the passed prop being correct
        // or default to a generic path if known. 
        // For now, assume the parent component passes the correct path or we fallback to basic logic
    }

    // Ensure absolute URL for social sharing
    if (fullImage.startsWith('/')) {
        fullImage = `${window.location.protocol}//${window.location.host}${fullImage}`;
    }

    const currentUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{title || siteTitle}</title>
            <meta name="title" content={title || siteTitle} />
            <meta name="description" content={description || ''} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || ''} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={title || siteTitle} />
            <meta property="twitter:description" content={description || ''} />
            <meta property="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SEO;
