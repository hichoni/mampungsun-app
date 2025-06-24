
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

    document.documentElement.style.setProperty('--font-headline', headlineFont);
    document.documentElement.style.setProperty('--font-body', bodyFont);
  }, []);

  return null;
}
