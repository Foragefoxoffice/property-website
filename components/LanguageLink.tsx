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
      // Check if href already has a locale prefix
      const hrefParts = href.split('/');
      const hrefLang = hrefParts[1];
      if (hrefLang !== 'en' && hrefLang !== 'vi') {
        // Prepend current locale
        finalHref = `/${lang}${href}`;
      }
    }
  }

  return <NextLink href={finalHref} {...rest} />;
}
