'use client';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type LinkProps = NextLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode;
};

export default function LanguageLink({ href, ...rest }: LinkProps) {
  const pathname = usePathname() || '';
  const lang = pathname.split('/')[1] || 'vi'; // default to vi if undefined
  
  // Only process if the current lang is an expected locale
  const isLocale = lang === 'en' || lang === 'vi';
  
  let finalHref = href;
  if (typeof href === 'string') {
    // If it's a root-relative link and we have a locale
    if (href.startsWith('/') && isLocale) {
      // Map internal base paths to translated slugs for SEO
      let basePath = href;
      const hrefParts = href.split('/');
      const hrefLang = hrefParts[1];
      
      let hasLocalePrefix = false;
      if (hrefLang === 'en' || hrefLang === 'vi') {
        hasLocalePrefix = true;
        basePath = '/' + hrefParts.slice(2).join('/');
      }
      
      if (!basePath) basePath = '/';
      
      const slugMap: Record<string, Record<string, string>> = {
        vi: {
          '/about': '/ve-chung-toi',
          '/contact': '/lien-he',
          '/terms-conditions': '/dieu-khoan-dieu-kien',
          '/privacy-policy': '/chinh-sach-bao-mat',
          '/blogs': '/tin-tuc',
        },
        en: {
          '/about': '/about-us',
          '/contact': '/contact',
          '/terms-conditions': '/terms-and-conditions',
          '/privacy-policy': '/privacy-policy',
          '/blogs': '/blog',
        }
      };
      
      // Attempt to map the base path, fallback to original
      const translatedPath = slugMap[lang][basePath] || basePath;
      
      finalHref = `/${lang}${translatedPath === '/' ? '' : translatedPath}`;
    }
  }

  return <NextLink href={finalHref} {...rest} />;
}
