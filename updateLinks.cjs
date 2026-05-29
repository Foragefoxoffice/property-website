const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replacer(content);
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. property-website/components/Property/PropertyDetailClient.tsx
// 2. property-website/components/Listing/ListingClientWrapper.tsx
const paths = [
    'c:/Users/dell/Documents/Property/property-website/components/Property/PropertyDetailClient.tsx',
    'c:/Users/dell/Documents/Property/property-website/components/Listing/ListingClientWrapper.tsx',
    'c:/Users/dell/Documents/Property/property-website/components/Home/HomePageClient.tsx',
    'c:/Users/dell/Documents/Property/property-website/app/user-dashboard/favorites/page.tsx'
];

paths.forEach(p => {
    replaceFileContent(p, content => {
        return content
            // Match: `/property-showcase/${id}${slug ? `/${slug}` : ''}`
            .replace(/\/property-showcase\/\$\{([a-zA-Z0-9_]+)\}\$\{([a-zA-Z0-9_]+)\s*\?\s*`\/\$\{\2\}`\s*:\s*''\}/g, 
                     '/listing/${$2 ? $2 + \'-\' : \'\'}${$1}')
            // Specific for propDisplayId
            .replace(/\/property-showcase\/\$\{propDisplayId\}\$\{slug\s*\?\s*`\/\$\{slug\}`\s*:\s*''\}/g, 
                     '/listing/${slug ? slug + \'-\' : \'\'}${propDisplayId}')
    });
});

// Property-frontend
const frontendPaths = [
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/Property/ManageProperty.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/Property/ManageTrashProperty.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/PropertyShowcase/PropertyDetailSection.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/Enquiry/Enquires.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/AddMembers/OwnerView.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/CreateProperty/CreatePropertyPreview.jsx',
    'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/CreateProperty/CreatePropertyListStep4SEO.jsx'
];

frontendPaths.forEach(p => {
    replaceFileContent(p, content => {
        // Just generic replace for CMS Canonical
        content = content.replace(/https:\/\/183housingsolutions\.com\/property-showcase\/\$\{initialData\?._id \|\| 'new-property'\}\/\$\{seo\.slugUrl\?\.\[activeLang\] \|\| ''\}/g, 
                                  'https://183housingsolutions.com/listing/${seo.slugUrl?.[activeLang] ? seo.slugUrl[activeLang] + \'-\' : \'\'}${initialData?._id || \'new-property\'}');
        
        // PropertyDetailSection.jsx
        content = content.replace(/\/property-showcase\/\$\{id\}\$\{slug\s*\?\s*`\/\$\{slug\}`\s*:\s*''\}/g, 
                                  '/listing/${slug ? slug + \'-\' : \'\'}${id}');

        // Enquires, OwnerView, CreatePropertyPreview, ManageProperty
        content = content.replace(/\/property-showcase\/\$\{([^}]+)\}\$\{getLocalizedValue\(([^)]+)\)\s*\?\s*`\/\$\{getLocalizedValue\(\2\)\}`\s*:\s*''\}/g, 
                                  '/listing/${getLocalizedValue($2) ? getLocalizedValue($2) + \'-\' : \'\'}${$1}');
                                  
        content = content.replace(/\/property-showcase\/\$\{([^}]+)\}\$\{([^.}]+)\.seoInformation\?\.slugUrl\s*\?\s*`\/\$\{safeText\(\2\.seoInformation\.slugUrl\)\}`\s*:\s*''\}/g,
                                  '/listing/${$2.seoInformation?.slugUrl ? safeText($2.seoInformation.slugUrl) + \'-\' : \'\'}${$1}');

        return content;
    });
});

