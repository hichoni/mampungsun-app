'use client'

import { useEffect } from 'react';

const defaultFonts = {
    headline: 'Belleza',
    body: 'Alegreya',
}

export default function FontManager() {
  useEffect(() => {
    const headlineFont = localStorage.getItem('app-font-headline') || defaultFonts.headline;
    const bodyFont = localStorage.getItem('app-font-body') || defaultFonts.body;
    const headlineSize = localStorage.getItem('app-font-headline-size') || '100';
    const bodySize = localStorage.getItem('app-font-body-size') || '100';
    const uiScale = localStorage.getItem('app-ui-scale') || '100';

    const quoteFont = (font: string) => font.includes(' ') ? `'${font}'` : font;

    document.documentElement.style.fontSize = `${parseInt(uiScale, 10)}%`;
    document.documentElement.style.setProperty('--font-headline', quoteFont(headlineFont));
    document.documentElement.style.setProperty('--font-body', quoteFont(bodyFont));
    document.documentElement.style.setProperty('--font-size-headline-scale', String(parseInt(headlineSize, 10) / 100));
    document.documentElement.style.setProperty('--font-size-body-scale', String(parseInt(bodySize, 10) / 100));
  }, []);

  return null;
}
