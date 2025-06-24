'use client'

import { useEffect } from 'react';

const defaultFonts = {
    headline: 'Gaegu',
    body: 'Gowun Dodum',
}

export default function FontManager() {
  useEffect(() => {
    const headlineFont = localStorage.getItem('app-font-headline') || defaultFonts.headline;
    const bodyFont = localStorage.getItem('app-font-body') || defaultFonts.body;
    const headlineSize = localStorage.getItem('app-font-headline-size') || '100';
    const bodySize = localStorage.getItem('app-font-body-size') || '100';

    document.documentElement.style.setProperty('--font-headline', headlineFont);
    document.documentElement.style.setProperty('--font-body', bodyFont);
    document.documentElement.style.setProperty('--font-size-headline-scale', String(parseInt(headlineSize, 10) / 100));
    document.documentElement.style.setProperty('--font-size-body-scale', String(parseInt(bodySize, 10) / 100));
  }, []);

  return null;
}
