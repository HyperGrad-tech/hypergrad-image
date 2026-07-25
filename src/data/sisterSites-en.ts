// English version of sisterSites data for /en/ pages
// Keep slugs/keys in sync with ../sisterSites.ts

export interface SisterSiteToolEn {
  slug: string;
  name: string;
}

export interface SisterSiteEn {
  key: 'devtools' | 'crypto' | 'text' | 'image' | 'ai';
  name: string;
  shortName: string;
  slogan: string;
  href: string;
  icon: string;
  hot: SisterSiteToolEn[];
}

export const sisterSitesEn: SisterSiteEn[] = [
  {
    key: 'devtools',
    name: 'HyperGrad DevTools',
    shortName: 'Dev Tools',
    slogan: 'JSON / Regex / Timestamp / QR Code',
    href: 'https://devtools.hypergrad.cn',
    icon: '🛠',
    hot: [
      { slug: 'json-formatter', name: 'JSON Formatter' },
      { slug: 'regex-tester',   name: 'Regex Tester' },
      { slug: 'timestamp',      name: 'Timestamp Converter' },
      { slug: 'qrcode',         name: 'QR Code Generator' },
    ],
  },
  {
    key: 'crypto',
    name: 'HyperGrad Crypto',
    shortName: 'Crypto Tools',
    slogan: 'AES / RSA / Hash / SM4',
    href: 'https://crypto.hypergrad.cn',
    icon: '🔐',
    hot: [
      { slug: 'aes',                name: 'AES Encrypt/Decrypt' },
      { slug: 'rsa',                name: 'RSA Encrypt/Decrypt' },
      { slug: 'hash',               name: 'MD5/SHA Hash' },
      { slug: 'sm4',                name: 'SM4 (Chinese Standard)' },
      { slug: 'password-generator', name: 'Password Generator' },
    ],
  },
  {
    key: 'text',
    name: 'HyperGrad Text',
    shortName: 'Text Tools',
    slogan: 'Word Count / Markdown / Diff / Dedup',
    href: 'https://text.hypergrad.cn',
    icon: '📝',
    hot: [
      { slug: 'word-count',      name: 'Word Counter' },
      { slug: 'markdown-editor', name: 'Markdown Editor' },
      { slug: 'text-diff',       name: 'Text Diff' },
      { slug: 'text-dedup',      name: 'Text Dedup' },
    ],
  },
  {
    key: 'image',
    name: 'HyperGrad Image',
    shortName: 'Image Tools',
    slogan: 'SVG / WebP / EXIF · Images Never Leave Browser',
    href: 'https://image.hypergrad.cn',
    icon: '🖼',
    hot: [
      { slug: 'svg-optimize', name: 'SVG Optimizer' },
      { slug: 'webp-convert', name: 'WebP Converter' },
      { slug: 'exif-viewer',  name: 'EXIF Viewer' },
      { slug: 'exif-remover', name: 'EXIF Remover' },
      { slug: 'placeholder',  name: 'Placeholder Generator' },
    ],
  },
  {
    key: 'ai',
    name: 'HyperGrad AI',
    shortName: 'AI Tools',
    slogan: 'Writing / Translation / Summary / Prompt · BYOK',
    href: 'https://ai.hypergrad.cn',
    icon: '🤖',
    hot: [
      { slug: 'ai-writer',        name: 'AI Writer' },
      { slug: 'ai-summary',       name: 'AI Summarizer' },
      { slug: 'ai-translate',     name: 'AI Translator' },
      { slug: 'prompt-optimizer', name: 'Prompt Optimizer' },
      { slug: 'token-counter',    name: 'Token Counter' },
    ],
  },
];

export function getSisterSitesEn(currentSite: SisterSiteEn['key']): SisterSiteEn[] {
  return sisterSitesEn.filter(s => s.key !== currentSite);
}

export function getCurrentSiteEn(currentSite: SisterSiteEn['key']): SisterSiteEn {
  return sisterSitesEn.find(s => s.key === currentSite)!;
}
