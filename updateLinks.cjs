const fs = require('fs');
const path = require('path');

const directoryPath = 'c:\\Users\\dell\\Documents\\Property\\property-website';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else {
            if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.jsx') || dirPath.endsWith('.js')) {
                callback(path.join(dir, f));
            }
        }
    });
}

walkDir(directoryPath, function(filePath) {
    if (filePath.includes('LanguageLink.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/import Link from 'next\/link'/g, "import Link from '@/components/LanguageLink'");
    newContent = newContent.replace(/import Link from "next\/link"/g, 'import Link from "@/components/LanguageLink"');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
