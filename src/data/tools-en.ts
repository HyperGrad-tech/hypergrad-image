// English tool metadata for /en/ subdirectory
// SEO optimized for Google search (keywords ≠ direct translation of Chinese version)
// Shared slug with Chinese version for hreflang pairing

export type Priority = 'P0' | 'P1' | 'P2';
export type Category = 'SVG Tools' | 'Format Conversion' | 'EXIF Privacy' | 'Image Editing' | 'Developer Tools';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  shortName: string;
  desc: string;
  priority: Priority;
  category: Category;
  keywords: string[];
  icon: string;
  volume: number;
  seoNote: string;
  seoTitle: string;
  seoDescription: string;
  faq: FaqItem[];
  related: string[];
}

export const tools: Tool[] = [
  // ============ P0 Core ============
  {
    slug: 'svg-optimize',
    name: 'SVG Optimizer',
    shortName: 'SVG Optimizer',
    desc: 'Compress SVG files by removing comments, editor metadata, redundant attributes and whitespace. Reduce SVG size significantly.',
    priority: 'P0',
    category: 'SVG Tools',
    keywords: ['svg optimizer', 'svg compressor', 'minify svg', 'optimize svg', 'svg minifier', 'reduce svg size', 'clean svg'],
    icon: 'SVG',
    volume: 5400,
    seoNote: 'High-demand for web developers, SVG icon optimization is essential for web performance',
    seoTitle: 'SVG Optimizer Online - Compress & Minify SVG Files Free | HyperGrad',
    seoDescription: 'Free online SVG optimizer and compressor. Remove comments, editor metadata, redundant attributes and whitespace to reduce SVG file size. 100% browser-based, no upload. Minify SVG instantly.',
    faq: [
      { q: 'How much can SVG optimization reduce file size?', a: 'Typically 20%-60% reduction, depending on how much redundant data the original SVG contains. SVGs exported from Illustrator, Figma, or Sketch often carry large amounts of editor metadata, comments, default attributes, and overly precise decimal numbers. Cleaning these up significantly reduces file size with zero visual change.' },
      { q: 'Will optimization change how my SVG looks?', a: 'No. This tool only removes content that does not affect rendering (comments, metadata, whitespace, default attributes) and moderately reduces path numeric precision (default 3 decimal places, virtually indistinguishable to the naked eye). All visual appearance remains identical.' },
      { q: 'Is my SVG uploaded to a server?', a: 'No. This tool is fully client-side. All parsing and optimization happens in your browser. Your SVG content is never transmitted over the network to any server. It works even offline.' },
      { q: 'How does this compare to SVGO?', a: 'SVGO is the most popular Node.js-based SVG optimization engine. This tool implements the core SVGO optimization strategies (remove comments, remove metadata, collapse groups, reduce precision, remove default attributes) as a browser-based version. No installation required—just open and use.' },
    ],
    related: ['svg-editor', 'svg-to-png', 'webp-convert'],
  },
  {
    slug: 'svg-to-png',
    name: 'SVG to PNG Converter',
    shortName: 'SVG to PNG',
    desc: 'Convert SVG vector graphics to PNG raster images. Support custom resolution, 2x/3x retina scale, and batch conversion.',
    priority: 'P0',
    category: 'SVG Tools',
    keywords: ['svg to png', 'convert svg to png', 'svg to png converter', 'svg to image', 'export svg as png', 'svg to png online'],
    icon: '⇄',
    volume: 49000,
    seoNote: 'Very high search volume, design handoff and icon generation essential',
    seoTitle: 'SVG to PNG Converter Online - Free Batch Conversion | HyperGrad',
    seoDescription: 'Free online SVG to PNG converter. Convert SVG vectors to PNG raster images with custom resolution, 2x/3x retina scale, and batch processing. 100% browser-based, no upload, no watermark.',
    faq: [
      { q: 'Will the converted PNG be blurry?', a: 'No. SVG is a vector format that can be scaled without quality loss. This tool renders the SVG at your specified resolution before exporting to PNG. The output clarity is determined by the target size you set. We recommend exporting at 2x or 3x scale for retina displays.' },
      { q: 'Why do some SVGs convert to blank images?', a: 'Common causes: the SVG is missing width/height attributes and has an unusual viewBox; the SVG references external image resources; or the SVG contains browser-unsupported filters. This tool automatically fills in dimensions, but external resource dependencies cannot be resolved—make sure your SVG is self-contained.' },
      { q: 'Does it support batch conversion?', a: 'Yes. You can select multiple SVG files at once, convert them all at the specified scale, and download them together. Batch processing is done entirely in your browser with no quantity limit.' },
      { q: 'What is the fundamental difference between SVG and PNG?', a: 'SVG is a vector format that describes graphics using mathematical paths—it scales without quality loss and has a small file size, making it ideal for icons, logos, and illustrations. PNG is a raster format that describes images using pixel arrays—it loses quality when scaled and is better for photos and screenshots. SVG to PNG conversion is typically done for compatibility with environments that do not support SVG.' },
    ],
    related: ['svg-optimize', 'svg-editor', 'webp-convert'],
  },
  {
    slug: 'webp-convert',
    name: 'WebP Converter',
    shortName: 'WebP',
    desc: 'Convert between JPG/PNG and WebP in both directions. Adjustable quality, preserves transparency (alpha channel).',
    priority: 'P0',
    category: 'Format Conversion',
    keywords: ['webp converter', 'convert to webp', 'png to webp', 'jpg to webp', 'webp to png', 'webp to jpg', 'webp converter online'],
    icon: 'WP',
    volume: 33000,
    seoNote: 'Modern web image format essential, stable monthly search volume',
    seoTitle: 'WebP Converter Online - Convert JPG/PNG to WebP Free | HyperGrad',
    seoDescription: 'Free online WebP converter. Convert JPG/PNG to WebP or WebP back to JPG/PNG. Adjustable quality, preserves transparency. 100% browser-based, images never uploaded. Batch supported.',
    faq: [
      { q: 'How much smaller is WebP compared to JPG/PNG?', a: 'At equivalent quality, WebP is about 25%-35% smaller than JPG and significantly smaller than PNG (especially for images with transparency). WebP is a modern format developed by Google, fully supported by all modern browsers, and is the top choice for website performance optimization.' },
      { q: 'Does conversion preserve the transparency channel?', a: 'Yes. PNG transparency is fully preserved when converting to WebP, as WebP also supports alpha transparency. Converting WebP back to PNG also preserves transparent areas. However, JPG does not support transparency—converting from JPG to any format will not produce transparency.' },
      { q: 'Are my images uploaded to a server?', a: 'No. This tool uses browser-native Canvas API for encoding and decoding. All conversion happens locally on your device. It works offline and is safe for processing images containing sensitive information.' },
      { q: 'Do all browsers support WebP?', a: 'Chrome 32+, Edge 18+, Firefox 65+, and Safari 14+ (starting from macOS Big Sur) fully support WebP. As of 2026, market share exceeds 98%, so it is safe for production use. IE does not support WebP, but IE has been retired.' },
    ],
    related: ['format-convert', 'svg-to-png', 'base64-image'],
  },
  {
    slug: 'exif-viewer',
    name: 'EXIF Data Viewer',
    shortName: 'EXIF Viewer',
    desc: 'Read all EXIF metadata from photos: camera model, lens, aperture, shutter speed, GPS location, and more.',
    priority: 'P0',
    category: 'EXIF Privacy',
    keywords: ['exif viewer', 'view exif data', 'exif reader', 'photo metadata viewer', 'image exif info', 'check exif online'],
    icon: 'ℹ',
    volume: 18100,
    seoNote: 'Essential for photographers, traffic rising with privacy awareness',
    seoTitle: 'EXIF Data Viewer Online - View Photo Metadata Free | HyperGrad',
    seoDescription: 'Free online EXIF viewer. Read all photo metadata including camera model, lens, aperture, shutter speed, ISO, GPS location and more. 100% browser-based parsing, photos never uploaded.',
    faq: [
      { q: 'What information does EXIF include?', a: 'It mainly includes: camera brand and model, lens, aperture, shutter speed, ISO, focal length, white balance, capture date/time, GPS coordinates, software post-processing info, and thumbnails. Phone photos typically also include HDR, portrait mode, and other shooting parameters.' },
      { q: 'Why do some photos have no EXIF data?', a: 'Common reasons: the photo was compressed by social media platforms like WhatsApp, WeChat, or Instagram (these platforms actively strip EXIF to protect privacy and reduce file size); the image editing software had "remove metadata" checked on export; or the photo is a screenshot or composite image that never had EXIF.' },
      { q: 'Are my photos uploaded?', a: 'No. This tool uses the exifr library to parse EXIF entirely in your browser. The photo is never transmitted over the network to any server. It works completely offline.' },
      { q: 'Is the GPS location in EXIF accurate?', a: 'Yes. If location services were enabled when the photo was taken, the EXIF records the GPS coordinates of the shooting location, typically accurate to within a few meters to tens of meters. This is exactly why you should strip EXIF before sharing photos—strangers can pinpoint your home, workplace, and frequented locations on a map.' },
    ],
    related: ['exif-remover', 'webp-convert', 'base64-image'],
  },
  {
    slug: 'exif-remover',
    name: 'EXIF Remover',
    shortName: 'EXIF Remover',
    desc: 'Strip all EXIF metadata from photos in one click—including GPS, camera info—to protect your privacy.',
    priority: 'P0',
    category: 'EXIF Privacy',
    keywords: ['remove exif', 'exif remover', 'strip exif', 'delete exif data', 'remove photo metadata', 'strip metadata', 'privacy protector'],
    icon: '🛡',
    volume: 9900,
    seoNote: 'Aligns with privacy-conscious users, essential before social sharing',
    seoTitle: 'EXIF Remover Online - Strip Photo Metadata & GPS Free | HyperGrad',
    seoDescription: 'Free online EXIF remover. Strip all metadata from photos including camera info, GPS location, and shooting parameters in one click. Protect your privacy. 100% browser-based, batch supported.',
    faq: [
      { q: 'Does removing EXIF affect photo quality?', a: 'Not at all. EXIF is metadata attached to the image file and is independent from the pixel data. This tool re-encodes the image keeping only pixel data, stripping all metadata. Image quality remains the same (with optional lossless or recompressed output).' },
      { q: 'Can EXIF be recovered after removal?', a: 'No. Once EXIF is deleted, it is permanently gone and cannot be recovered from the image itself. We recommend backing up the original photo before stripping EXIF, or using an EXIF viewer to export any information you want to keep first.' },
      { q: 'Why is removing EXIF important?', a: 'Photos carry EXIF data that includes GPS location, camera serial numbers, and capture timestamps. If you share photos on social media or send them to strangers without stripping EXIF, the recipient can pinpoint your home address, infer your device info, and track your daily patterns. Some chat apps and email auto-strip EXIF, but sending original photos via email or direct file transfer does not.' },
      { q: 'Does it support batch processing?', a: 'Yes. You can select multiple photos at once, strip EXIF from all of them, and download as a batch. All batch processing happens locally in your browser—no photo is ever uploaded.' },
    ],
    related: ['exif-viewer', 'webp-convert', 'format-convert'],
  },
  {
    slug: 'base64-image',
    name: 'Image to Base64 Converter',
    shortName: 'Base64 ↔ Image',
    desc: 'Convert images to Base64 Data URL, or decode Base64 back to images. Supports drag & drop and copy.',
    priority: 'P0',
    category: 'Developer Tools',
    keywords: ['image to base64', 'base64 to image', 'convert image to base64', 'base64 image converter', 'data url converter', 'base64 encode image'],
    icon: 'B64',
    volume: 60500,
    seoNote: 'High-frequency developer need, inline images and email embedding',
    seoTitle: 'Image to Base64 Converter Online - Free & No Upload | HyperGrad',
    seoDescription: 'Free online image to Base64 converter. Convert images to Data URL or decode Base64 back to images. Supports drag & drop and copy. 100% browser-based, files never uploaded.',
    faq: [
      { q: 'Does the file size increase after converting to Base64?', a: 'Yes. Base64 encoding produces output approximately 4/3 the size of the original data (about 33% larger). Therefore, large images are not recommended for Base64 inline embedding—it is best suited for small icons, placeholder images, and similar scenarios.' },
      { q: 'What is a Data URL?', a: 'A Data URL is a scheme that embeds resources directly into a URL using Base64 encoding, in the format data:image/png;base64,xxxx. It can be used in HTML img src, CSS background, and email inline images to reduce HTTP requests.' },
      { q: 'Are my images uploaded?', a: 'No. This tool uses the browser-native FileReader API to read files and encode them. All operations happen locally. Neither the image nor the Base64 string ever leaves your device.' },
      { q: 'What are the use cases for Base64 and image conversion?', a: 'Common uses: inlining small icons into HTML/CSS to reduce HTTP requests; embedding images in emails (where image attachments may not be supported, Base64 can be inlined); transmitting image data in JSON APIs; generating CSS sprite placeholders.' },
    ],
    related: ['webp-convert', 'placeholder', 'svg-optimize'],
  },
  // ============ P1 Common ============
  {
    slug: 'svg-editor',
    name: 'Online SVG Editor',
    shortName: 'SVG Editor',
    desc: 'Source code editing with live preview. Adjust paths, fills, strokes and other attributes with WYSIWYG.',
    priority: 'P1',
    category: 'SVG Tools',
    keywords: ['svg editor', 'online svg editor', 'edit svg online', 'svg code editor', 'svg preview', 'svg visual editor'],
    icon: '✎',
    volume: 14800,
    seoNote: 'Frequent need for developers adjusting SVG icons and designers fine-tuning',
    seoTitle: 'Online SVG Editor - Edit SVG with Live Preview Free | HyperGrad',
    seoDescription: 'Free online SVG editor with source code editing and live preview. Adjust paths, fills, strokes and other attributes with WYSIWYG. 100% browser-based, SVG never uploaded.',
    faq: [
      { q: 'Can I directly modify SVG paths?', a: 'Yes. The left panel is a source code editor where you can directly edit the XML code, and the right panel shows a live rendered preview. Fill colors, strokes, corner radius, and other attributes can all be manually edited with WYSIWYG.' },
      { q: 'Can I import external SVG files?', a: 'Yes. Click the "Import SVG" button or drag and drop an SVG file directly into the editor. The source code will automatically load into the editing area for further modification.' },
      { q: 'Is my SVG saved anywhere?', a: 'No. This tool is fully client-side. Edited content exists only in your browser memory and is never saved to a server. Refreshing the page clears everything, so please export your work promptly.' },
      { q: 'What is the SVG editor best suited for?', a: 'It is ideal for: fine-tuning icon colors and sizes, modifying key path points, adjusting text content, inspecting SVG structure, and learning SVG syntax. For complex graphic creation, we recommend professional tools like Figma or Adobe Illustrator.' },
    ],
    related: ['svg-optimize', 'svg-to-png', 'base64-image'],
  },
  {
    slug: 'placeholder',
    name: 'Placeholder Image Generator',
    shortName: 'Placeholder',
    desc: 'Generate placeholder images of any size with custom colors, text, and format (PNG/SVG).',
    priority: 'P1',
    category: 'Developer Tools',
    keywords: ['placeholder image generator', 'placeholder image', 'dummy image', 'placeholder png', 'image placeholder', 'generate placeholder'],
    icon: '▤',
    volume: 27000,
    seoNote: 'Essential for frontend development and prototyping',
    seoTitle: 'Placeholder Image Generator - Free Custom Size & Color | HyperGrad',
    seoDescription: 'Free online placeholder image generator. Create images of any size with custom colors, text, and PNG or SVG format. Essential for frontend development and prototyping. 100% browser-based.',
    faq: [
      { q: 'What is a placeholder image and what is it used for?', a: 'A placeholder image is a temporary image used during page development and prototyping to simulate the position, size, and proportions of the final image. Developers use it to fill layouts and ensure correct typography before real images are available, preventing layout shift.' },
      { q: 'Should I choose PNG or SVG placeholder?', a: 'Choose PNG for bitmap scenarios (such as simulating article covers or photo walls). Choose SVG for vector scenarios that need arbitrary scaling and smaller file sizes (such as logo or icon placeholders). SVG placeholders are typically only a few hundred bytes, far smaller than PNG.' },
      { q: 'Does it support custom text?', a: 'Yes. You can display any text on the placeholder image. The default shows the dimensions (e.g., 800×600). Custom text is often used to annotate image purpose (e.g., "Ad Slot", "User Avatar") to facilitate design and development communication.' },
      { q: 'Are generated placeholders uploaded?', a: 'No. Placeholder images are generated locally in the browser using Canvas or SVG DOM and download directly to your device without passing through any server.' },
    ],
    related: ['base64-image', 'svg-editor', 'color-extract'],
  },
  {
    slug: 'color-extract',
    name: 'Image Color Extractor',
    shortName: 'Color Extract',
    desc: 'Extract dominant colors from images to generate a color palette. Supports HEX/RGB/HSL copy.',
    priority: 'P1',
    category: 'Image Editing',
    keywords: ['image color extractor', 'extract colors from image', 'color palette from image', 'dominant color extractor', 'image palette generator', 'get colors from image'],
    icon: '🎨',
    volume: 18100,
    seoNote: 'Essential for designers picking colors and building theme palettes',
    seoTitle: 'Image Color Extractor - Get Palette from Image Free | HyperGrad',
    seoDescription: 'Free online image color extractor. Extract dominant colors from any image and generate a color palette. Copy as HEX/RGB/HSL. 100% browser-based, images never uploaded.',
    faq: [
      { q: 'Are the extracted colors accurate?', a: 'Yes. This tool uses the median cut algorithm to quantize image pixels, extracting the most prominent color clusters as dominant colors. The algorithm is consistent with Photoshop\'s "Save for Web" palette principle.' },
      { q: 'Why do the extracted colors look different from what I see?', a: 'Possible reasons: when an image has very rich colors, the algorithm can only capture the most dominant color clusters, and subtle colors may be ignored. Images with strong gradients or gloss may produce averaged colors. You can increase the extraction count (e.g., from 5 to 10 colors) for more comprehensive results.' },
      { q: 'How many colors can I extract?', a: 'You can customize extraction of 3 to 12 dominant colors. Fewer colors work well for theme palettes (e.g., 5 colors), while more colors are suited for full palette analysis (e.g., 10-12 colors).' },
      { q: 'Are my images uploaded?', a: 'No. This tool uses the browser Canvas API to read pixel data and the median cut algorithm to extract colors. All processing happens locally, and your image never leaves your device.' },
    ],
    related: ['placeholder', 'svg-editor', 'base64-image'],
  },
  {
    slug: 'format-convert',
    name: 'Image Format Converter',
    shortName: 'Format Convert',
    desc: 'Convert between JPG / PNG / WebP / AVIF. Adjustable quality, batch processing supported.',
    priority: 'P1',
    category: 'Format Conversion',
    keywords: ['image format converter', 'convert image format', 'png to jpg', 'jpg to png', 'avif converter', 'convert to avif', 'image converter online'],
    icon: '⇄',
    volume: 49000,
    seoNote: 'Universal image conversion need, AVIF is a growing segment',
    seoTitle: 'Image Format Converter - JPG/PNG/WebP/AVIF Free | HyperGrad',
    seoDescription: 'Free online image format converter. Convert between JPG, PNG, WebP and AVIF. Adjustable quality, batch processing. 100% browser-based, images never uploaded to server.',
    faq: [
      { q: 'What is AVIF? Is it better than WebP?', a: 'AVIF is an image format based on AV1 video encoding and is the most advanced image format as of 2026. At equivalent quality, it is 20%-30% smaller than WebP and over 50% smaller than JPG. It is supported by Chrome 85+ and Safari 16+. The downside is slower encoding speed and lack of support in older browsers.' },
      { q: 'Does converting PNG to JPG lose transparency?', a: 'Yes. JPG does not support transparency. Transparent areas in a PNG will become white (or another specified background color) when converted to JPG. If you need transparency, convert to WebP or keep PNG—do not use JPG.' },
      { q: 'Does conversion reduce image quality?', a: 'It depends on the target format and quality parameter. JPG/WebP/AVIF are lossy formats—lower quality means smaller file size but worse image quality. Around 80%-90% is the sweet spot. PNG is lossless, preserving quality but with larger file sizes.' },
      { q: 'Are images uploaded?', a: 'No. This tool uses browser-native Canvas and createImageBitmap APIs for decoding and encoding. All conversion happens locally, works offline, and is safe for processing images with sensitive content.' },
    ],
    related: ['webp-convert', 'exif-remover', 'image-stitch'],
  },
  // ============ P2 Extended ============
  {
    slug: 'image-stitch',
    name: 'Image Stitcher',
    shortName: 'Image Stitch',
    desc: 'Stitch multiple images together vertically or horizontally. Adjustable spacing, alignment, and background color.',
    priority: 'P2',
    category: 'Image Editing',
    keywords: ['image stitcher', 'stitch images together', 'combine images', 'merge images online', 'vertical image stitch', 'horizontal image combine', 'long image maker'],
    icon: '⊞',
    volume: 14800,
    seoNote: 'Social media long images and screenshot stitching demand',
    seoTitle: 'Image Stitcher Online - Combine Images Vertically/Horizontally | HyperGrad',
    seoDescription: 'Free online image stitcher. Combine multiple images vertically or horizontally into one. Adjustable spacing, alignment, and background color. 100% browser-based, images never uploaded.',
    faq: [
      { q: 'What is the difference between vertical and horizontal stitching?', a: 'Vertical stitching stacks images from top to bottom, ideal for long images, consecutive screenshots, and chat records. Horizontal stitching arranges images left to right, ideal for comparison images and collages. This tool supports both modes.' },
      { q: 'How are images with different widths handled?', a: 'You can set the alignment: left, center, or right (for vertical stitching), or top, center, or bottom (for horizontal stitching). Empty areas are filled with a custom background color (default white). You can also choose to scale all images to a uniform width before stitching.' },
      { q: 'Will stitching reduce image quality?', a: 'This tool uses Canvas to re-encode the stitched image with high-quality output by default. Quality loss mainly comes from the target format (JPG has slight compression loss, PNG is lossless).' },
      { q: 'Are images uploaded?', a: 'No. Stitching is done locally in the browser using Canvas. None of the images are uploaded to a server, and it works fully offline.' },
    ],
    related: ['format-convert', 'gif-frames', 'color-extract'],
  },
  {
    slug: 'gif-frames',
    name: 'GIF Frame Extractor',
    shortName: 'GIF Frames',
    desc: 'Split GIF animations into individual frame images. Batch download with per-frame delay display.',
    priority: 'P2',
    category: 'Image Editing',
    keywords: ['gif frame extractor', 'extract gif frames', 'split gif into frames', 'gif to png', 'gif frame splitter', 'gif to images', 'decompose gif'],
    icon: '▦',
    volume: 12100,
    seoNote: 'Meme creation and animation analysis, niche but steady demand',
    seoTitle: 'GIF Frame Extractor - Split GIF into PNG Frames Free | HyperGrad',
    seoDescription: 'Free online GIF frame extractor. Split GIF animations into individual PNG frame images. Batch download with per-frame delay display. 100% browser-based, GIF never uploaded.',
    faq: [
      { q: 'What format are the extracted GIF frames?', a: 'Each frame is exported as PNG (lossless, preserving the transparency channel). GIF itself is a lossless indexed-color format, and PNG can fully preserve the pixel information of each frame. If you need JPG, you can convert in the format converter tool.' },
      { q: 'Can I see the delay time of each frame?', a: 'Yes. This tool displays the delay time (in milliseconds) for each frame. The frame delay determines playback speed. Different frames can have different delays, and this tool fully preserves the original GIF delay settings.' },
      { q: 'Why do some GIFs produce very few frames?', a: 'The GIF file itself may only have that many frames. Some "GIFs" are actually converted from MP4 and have very low frame rates. Additionally, the minimum GIF delay is 20ms (browser spec), so frames with original 0ms delay may be merged or adjusted.' },
      { q: 'Is the GIF uploaded?', a: 'No. This tool uses the gifuct-js library to parse the GIF binary stream locally in the browser, decoding frame by frame into images. The entire process requires no internet connection, and the GIF file never leaves your device.' },
    ],
    related: ['image-stitch', 'format-convert', 'webp-convert'],
  },
];

export const priorityMeta: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  P0: { label: 'Core Tools', desc: 'High-frequency image processing essentials', color: '#B83A3A', bg: '#FCEFEF' },
  P1: { label: 'Common Tools', desc: 'Daily development favorites', color: '#C8862E', bg: '#FDF5EA' },
  P2: { label: 'Extended Tools', desc: 'Specialized use cases', color: '#2D7A4F', bg: '#EEF7F1' },
};

export const categoryMeta: Record<Category, { icon: string; color: string }> = {
  'SVG Tools': { icon: '📐', color: '#7A4FB8' },
  'Format Conversion': { icon: '🔄', color: '#2D5F8A' },
  'EXIF Privacy': { icon: '🔐', color: '#B83A3A' },
  'Image Editing': { icon: '✂️', color: '#C8862E' },
  'Developer Tools': { icon: '🛠', color: '#2D7A4F' },
};

export function getTool(slug: string): Tool | undefined {
  return tools.find(t => t.slug === slug);
}

export function toolsByPriority(p: Priority): Tool[] {
  return tools.filter(t => t.priority === p);
}

export function toolsByCategory(c: Category): Tool[] {
  return tools.filter(t => t.category === c);
}
