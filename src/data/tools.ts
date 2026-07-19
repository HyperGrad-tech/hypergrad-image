export type Priority = 'P0' | 'P1' | 'P2';
export type Category = 'SVG 工具' | '格式转换' | 'EXIF 隐私' | '图片编辑' | '开发者工具';

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
  /** 搜索热度（百度日搜索量估算） */
  volume: number;
  /** SEO 长尾说明 */
  seoNote: string;
  /** 优化后的 <title>，主关键词前置 + 长尾修饰词 */
  seoTitle: string;
  /** 优化后的 meta description，140-160 字符 */
  seoDescription: string;
  /** FAQ 问答，用于 FAQPage Schema + 页面自动渲染 */
  faq: FaqItem[];
  /** 相关工具 slug 列表，用于内链卡片 */
  related: string[];
}

/**
 * 12 个图片细分工具元数据，按优先级排序。
 * P0 核心（6）→ P1 常用（4）→ P2 扩展（2）
 * 避开 TinyPNG 主战场，聚焦 SVG / WebP / EXIF 三大品类。
 */
export const tools: Tool[] = [
  // ============ P0 核心 ============
  {
    slug: 'svg-optimize',
    name: 'SVG 优化压缩',
    shortName: 'SVG 优化',
    desc: '清理 SVG 中的注释、编辑器残留、冗余属性与空白字符，显著减小体积。',
    priority: 'P0',
    category: 'SVG 工具',
    keywords: ['svg优化', 'svg压缩', 'svg minimize', 'svg 清理', 'svg 体积减小', 'svg 精简'],
    icon: 'SVG',
    volume: 320,
    seoNote: '前端工程师高频需求，SVG 图标时代刚需',
    seoTitle: 'SVG 优化压缩在线 - 清理冗余减小体积 | HyperGrad',
    seoDescription: '免费在线 SVG 优化压缩工具，清理注释、编辑器残留、冗余属性与空白字符，显著减小 SVG 体积。纯浏览器本地处理，文件不上传。',
    faq: [
      { q: 'SVG 优化能减小多少体积？', a: '通常能减小 20%-60%，具体取决于原始 SVG 的冗余程度。来自 Illustrator、Figma 等设计软件导出的 SVG 往往包含大量编辑器元数据、注释、默认属性和精度过高的小数，清理后体积显著下降。' },
      { q: '优化后 SVG 会变样吗？', a: '不会。本工具只移除不影响渲染的内容（注释、元数据、空白字符、默认属性），并适度降低路径数值精度（默认保留 3 位小数，肉眼几乎无差）。所有视觉表现保持不变。' },
      { q: '我的 SVG 会上传服务器吗？', a: '不会。本工具是纯前端实现，所有解析与优化都在你的浏览器中完成，SVG 内容不会通过网络发送到任何服务器。' },
      { q: '和 SVGO 是什么关系？', a: 'SVGO 是基于 Node.js 的 SVG 优化引擎，业内最流行。本工具实现了 SVGO 的核心优化策略（去注释、去元数据、合并路径、降精度、去默认属性等）的浏览器版本，无需安装即可使用。' },
    ],
    related: ['svg-editor', 'svg-to-png', 'webp-convert'],
  },
  {
    slug: 'svg-to-png',
    name: 'SVG 转 PNG',
    shortName: 'SVG→PNG',
    desc: '将 SVG 矢量图转为 PNG 位图，支持自定义分辨率、2x/3x 倍率、批量转换。',
    priority: 'P0',
    category: 'SVG 工具',
    keywords: ['svg转png', 'svg 转 png', 'svg 转图片', 'svg 导出 png', 'svg to png'],
    icon: '⇄',
    volume: 280,
    seoNote: '设计交付、图标生成高频需求',
    seoTitle: 'SVG 转 PNG 在线 - 自定义分辨率/倍率 | HyperGrad',
    seoDescription: '免费在线 SVG 转 PNG 工具，支持自定义分辨率、2x/3x 倍率、批量转换。矢量图无损转位图，纯浏览器本地处理。',
    faq: [
      { q: '转换后 PNG 会模糊吗？', a: '不会。SVG 是矢量图，可以任意放大不失真。本工具在指定分辨率下渲染 SVG 再导出 PNG，输出清晰度由你设置的目标尺寸决定。建议按使用场景的 2x 或 3x 倍率导出以适配高清屏。' },
      { q: '为什么有的 SVG 转出来是空白的？', a: '常见原因：SVG 缺少 width/height 属性且 viewBox 异常；SVG 引用了外部图片资源；SVG 含浏览器不支持的滤镜。本工具会自动补全尺寸，但外部资源依赖无法解决，请确保 SVG 是自包含的。' },
      { q: '支持批量转换吗？', a: '支持。可一次选择多个 SVG 文件，统一按设定倍率转换并打包下载。批量处理在浏览器本地完成，不限制数量。' },
      { q: 'SVG 和 PNG 有什么本质区别？', a: 'SVG 是矢量格式，用数学路径描述图形，放大不失真，体积小，适合图标、Logo、插画。PNG 是位图格式，用像素阵列描述图像，放大会失真，适合照片、截图。SVG 转 PNG 通常是为了兼容不支持 SVG 的场景。' },
    ],
    related: ['svg-optimize', 'svg-editor', 'webp-convert'],
  },
  {
    slug: 'webp-convert',
    name: 'WebP 转换',
    shortName: 'WebP',
    desc: 'JPG/PNG 与 WebP 双向转换，质量可调，支持透明通道保留。',
    priority: 'P0',
    category: '格式转换',
    keywords: ['webp转换', 'webp转png', 'png转webp', 'jpg转webp', 'webp转jpg', '在线webp'],
    icon: 'WP',
    volume: 410,
    seoNote: '现代 Web 图片格式刚需，百度 webp 转换月搜索稳定',
    seoTitle: 'WebP 转换在线 - JPG/PNG/WebP 双向互转 | HyperGrad',
    seoDescription: '免费在线 WebP 转换工具，JPG/PNG 与 WebP 双向互转，质量可调，保留透明通道。纯浏览器本地处理，图片不上传。',
    faq: [
      { q: 'WebP 比 JPG/PNG 告小多少？', a: '同等质量下 WebP 比 JPG 小约 25%-35%，比 PNG 小更多（尤其是带透明的图）。WebP 是 Google 推出的现代格式，现代浏览器全面支持，是网站性能优化的首选。' },
      { q: '转换会保留透明通道吗？', a: '会。PNG 的透明通道转 WebP 后会完整保留，WebP 同样支持 alpha 透明通道。反过来 WebP 转 PNG 也会保留透明区域。但 JPG 转任何格式都不会有透明通道，JPG 本身不支持透明。' },
      { q: '图片会上传服务器吗？', a: '不会。本工具基于浏览器原生 Canvas API 编解码，所有转换在本地完成，断网也能用，适合处理含隐私信息的图片。' },
      { q: '所有浏览器都能显示 WebP 吗？', a: 'Chrome 32+、Edge 18+、Firefox 65+、Safari 14+（macOS Big Sur 起）全面支持 WebP。2026 年市场占有率已超过 98%，可放心用于生产环境。IE 不支持，但 IE 已退役。' },
    ],
    related: ['format-convert', 'svg-to-png', 'base64-image'],
  },
  {
    slug: 'exif-viewer',
    name: 'EXIF 信息查看',
    shortName: 'EXIF 查看',
    desc: '读取照片的所有 EXIF 元数据：相机型号、镜头、光圈快门、GPS 定位等。',
    priority: 'P0',
    category: 'EXIF 隐私',
    keywords: ['exif查看', 'exif信息', '图片exif', '照片exif', 'exif reader', '查看exif'],
    icon: 'ℹ',
    volume: 260,
    seoNote: '摄影爱好者刚需，隐私意识觉醒后流量上升',
    seoTitle: 'EXIF 信息查看在线 - 读取照片元数据 | HyperGrad',
    seoDescription: '免费在线 EXIF 查看器，读取照片的相机型号、镜头、光圈快门 ISO、GPS 定位等所有元数据。纯浏览器本地解析，照片不上传。',
    faq: [
      { q: 'EXIF 都包含哪些信息？', a: '主要包含：相机品牌型号、镜头、光圈、快门、ISO、焦距、白平衡、拍摄时间、GPS 经纬度定位、软件后期信息、缩略图等。手机照片通常还包含 HDR、人像模式等拍摄参数。' },
      { q: '为什么有的照片没有 EXIF？', a: '常见原因：照片经过微信、微博等社交平台压缩（这些平台会主动剥离 EXIF 以保护隐私和减小体积）；图片处理软件导出时勾选了"移除元数据"；照片本身就是截图或合成图。' },
      { q: '照片会上传吗？', a: '不会。本工具完全在浏览器本地用 exifr 库解析 EXIF，照片不会通过网络发送到任何服务器，断网也能用。' },
      { q: 'EXIF 里的 GPS 定位准确吗？', a: '准。手机拍照时若开启了位置信息，EXIF 会记录拍摄点的 GPS 经纬度，精度通常在几米到几十米。这也是为什么分享照片前要清理 EXIF——陌生人在地图上能精确定位你家、公司、常去地点。' },
    ],
    related: ['exif-remover', 'webp-convert', 'base64-image'],
  },
  {
    slug: 'exif-remover',
    name: 'EXIF 清理',
    shortName: 'EXIF 清理',
    desc: '一键清除照片中的所有 EXIF 元数据（含 GPS、相机信息），保护隐私。',
    priority: 'P0',
    category: 'EXIF 隐私',
    keywords: ['清除exif', '删除exif', 'exif清理', '去除exif', '照片去exif', '隐私保护'],
    icon: '🛡',
    volume: 180,
    seoNote: '与 DeepSeal 隐私心智高度契合，社交分享前必备',
    seoTitle: 'EXIF 清理在线 - 删除照片元数据/GPS | HyperGrad',
    seoDescription: '免费在线 EXIF 清理工具，一键删除照片中的相机信息、GPS 定位、拍摄参数等所有元数据，保护隐私。纯浏览器本地处理，批量支持。',
    faq: [
      { q: '清理 EXIF 会影响照片画质吗？', a: '完全不会。EXIF 是附在图片文件里的元数据，与图像像素数据相互独立。本工具重新编码图片时只保留像素数据，剥离所有元数据，画质保持原样（可选无损或重新压缩）。' },
      { q: '清理后还能恢复 EXIF 吗？', a: '不能。EXIF 一旦被删除就是永久性的，无法从图片本身恢复。建议清理前先备份原始照片，或先用 EXIF 查看工具导出需要保留的信息。' },
      { q: '为什么清理 EXIF 重要？', a: '照片里的 EXIF 包含 GPS 定位、相机序列号、拍摄时间等敏感信息。发到社交平台或传给陌生人前若不清理，对方可以精确定位你家位置、推断你的设备信息和生活轨迹。微信微博会自动清理，但邮件、聊天工具直传原图不会。' },
      { q: '支持批量处理吗？', a: '支持。可一次选择多张照片批量清理 EXIF 并打包下载。批量处理在浏览器本地完成，不会上传任何一张照片。' },
    ],
    related: ['exif-viewer', 'webp-convert', 'format-convert'],
  },
  {
    slug: 'base64-image',
    name: 'Base64 与图片互转',
    shortName: 'Base64↔图',
    desc: '图片转 Base64 Data URL，或 Base64 转回图片，支持拖拽和复制。',
    priority: 'P0',
    category: '开发者工具',
    keywords: ['图片转base64', 'base64转图片', 'image to base64', 'base64 to image', 'data url'],
    icon: 'B64',
    volume: 350,
    seoNote: '前端开发者高频需求，内联图片、邮件嵌入常用',
    seoTitle: '图片转 Base64 在线 - Base64 与图片双向互转 | HyperGrad',
    seoDescription: '免费在线 Base64 与图片互转工具，图片转 Data URL、Base64 转回图片，支持拖拽复制。纯浏览器本地处理，图片不上传。',
    faq: [
      { q: '图片转 Base64 后体积会变大吗？', a: '会。Base64 编码后体积约为原始数据的 4/3（约增大 33%）。因此大图片不建议转 Base64 内联，仅适合小图标、占位图等场景。' },
      { q: 'Data URL 是什么？', a: 'Data URL 是将资源以 Base64 编码直接嵌入 URL 的方案，格式为 data:image/png;base64,xxxx。可用于 HTML img src、CSS background、邮件内嵌图片，减少 HTTP 请求。' },
      { q: '图片会上传吗？', a: '不会。本工具基于浏览器原生 FileReader API 读取文件并编码，所有操作在本地完成，图片和 Base64 都不会离开你的设备。' },
      { q: 'Base64 和图片互转有什么用？', a: '常见用途：把小图标内联进 HTML/CSS 减少 HTTP 请求；在邮件中嵌入图片（邮件不支持的图片附件可用 Base64 内联）；在 JSON API 中传输图片数据；生成 CSS sprite 占位符。' },
    ],
    related: ['webp-convert', 'placeholder', 'svg-optimize'],
  },
  // ============ P1 常用 ============
  {
    slug: 'svg-editor',
    name: 'SVG 在线编辑器',
    shortName: 'SVG 编辑',
    desc: '源码编辑 + 实时预览，支持路径、填充、描边属性调整，所见即所得。',
    priority: 'P1',
    category: 'SVG 工具',
    keywords: ['svg编辑器', 'svg在线编辑', 'svg editor', 'svg代码编辑', 'svg预览'],
    icon: '✎',
    volume: 220,
    seoNote: '前端调整 SVG 图标、设计师微调高频需求',
    seoTitle: 'SVG 在线编辑器 - 源码编辑实时预览 | HyperGrad',
    seoDescription: '免费在线 SVG 编辑器，源码编辑 + 实时预览，调整路径、填充、描边属性，所见即所得。纯浏览器本地处理，SVG 不上传。',
    faq: [
      { q: '可以直接修改 SVG 的路径吗？', a: '可以。左侧是源码编辑器，直接修改 XML 代码，右侧实时渲染预览。填写色、描边、圆角等属性都可手动编辑，所见即所得。' },
      { q: '支持导入外部 SVG 吗？', a: '支持。点击"导入 SVG"按钮或直接拖拽 SVG 文件到编辑器，源码会自动加载到编辑区，可继续修改。' },
      { q: '我的 SVG 会被保存吗？', a: '不会。本工具是纯前端实现，编辑内容只在你的浏览器内存中，不会保存到服务器。刷新页面会清空，请及时导出。' },
      { q: 'SVG 编辑器适合做什么？', a: '适合：微调图标的颜色和尺寸、修改路径关键点、调整文字内容、查看 SVG 结构、学习 SVG 语法。复杂的图形创作建议用 Figma、Illustrator 等专业工具。' },
    ],
    related: ['svg-optimize', 'svg-to-png', 'base64-image'],
  },
  {
    slug: 'placeholder',
    name: '占位图生成',
    shortName: '占位图',
    desc: '生成任意尺寸的占位图片，支持自定义颜色、文字、格式（PNG/SVG）。',
    priority: 'P1',
    category: '开发者工具',
    keywords: ['占位图生成', 'placeholder图片', '占位图', 'placeholder image', '占位图片'],
    icon: '▤',
    volume: 200,
    seoNote: '前端开发、原型设计刚需',
    seoTitle: '占位图生成在线 - 自定义尺寸/颜色/文字 | HyperGrad',
    seoDescription: '免费在线占位图生成工具，任意尺寸、自定义颜色、文字，支持 PNG 和 SVG 格式。前端开发、原型设计必备，纯浏览器本地生成。',
    faq: [
      { q: '占位图是什么？有什么用？', a: '占位图是在页面开发、原型设计中临时占位的图片，用来模拟最终图片的位置、尺寸和比例。开发者用它填充布局，确保排版在真实图片到位前就正确，避免布局抖动。' },
      { q: 'PNG 和 SVG 占位图该选哪个？', a: '需要位图场景（如模拟文章封面、照片墙）选 PNG；需要矢量、可任意缩放、体积更小的场景（如 logo 占位、图标占位）选 SVG。SVG 占位图通常只有几百字节，远小于 PNG。' },
      { q: '支持自定义文字吗？', a: '支持。可在占位图上显示任意文字，默认显示尺寸（如 800×600）。自定义文字常用于标注图片用途（如"广告位"、"用户头像"），便于设计和开发沟通。' },
      { q: '生成的占位图会上传吗？', a: '不会。占位图在浏览器本地用 Canvas 或 SVG DOM 生成，直接下载到本地，不经过任何服务器。' },
    ],
    related: ['base64-image', 'svg-editor', 'color-extract'],
  },
  {
    slug: 'color-extract',
    name: '图片颜色提取',
    shortName: '颜色提取',
    desc: '从图片中提取主色调，生成调色板，支持 HEX/RGB/HSL 复制。',
    priority: 'P1',
    category: '图片编辑',
    keywords: ['颜色提取', '图片取色', '主色调提取', '调色板生成', '图片主色'],
    icon: '🎨',
    volume: 190,
    seoNote: '设计师取色、主题配色刚需',
    seoTitle: '图片颜色提取在线 - 主色调/调色板生成 | HyperGrad',
    seoDescription: '免费在线图片颜色提取工具，从图片中提取主色调，生成调色板，支持 HEX/RGB/HSL 复制。纯浏览器本地处理，图片不上传。',
    faq: [
      { q: '提取出来的颜色准确吗？', a: '准确。本工具用中位切分算法对图片像素做颜色量化，提取最主要的几个色簇作为主色调。算法与 Photoshop 的"存储为 Web 所用格式"调色板原理一致。' },
      { q: '为什么提取的颜色和我看到的差别大？', a: '可能原因：图片颜色过于丰富时，算法只能取最主流的几个色簇，细节颜色会被忽略；图片有强烈的渐变或光泽，提取的是平均色。可调整提取数量（如从 5 色增到 10 色）获得更全面的结果。' },
      { q: '支持提取几种颜色？', a: '可自定义提取 3-12 种主色。较少的颜色适合做主题配色（如 5 色），较多的颜色适合做完整调色板分析（如 10-12 色）。' },
      { q: '图片会上传吗？', a: '不会。本工具用浏览器 Canvas API 读取像素数据，在中位切分算法中提取颜色，所有处理在本地完成，图片不会离开你的设备。' },
    ],
    related: ['placeholder', 'svg-editor', 'base64-image'],
  },
  {
    slug: 'format-convert',
    name: '图片格式转换',
    shortName: '格式转换',
    desc: 'JPG / PNG / WebP / AVIF 互转，质量可调，批量处理。',
    priority: 'P1',
    category: '格式转换',
    keywords: ['图片格式转换', 'png转jpg', 'jpg转png', 'avif转换', '图片转换', '在线图片转换'],
    icon: '⇄',
    volume: 380,
    seoNote: '通用图片转换需求，AVIF 是新兴增长点',
    seoTitle: '图片格式转换在线 - JPG/PNG/WebP/AVIF 互转 | HyperGrad',
    seoDescription: '免费在线图片格式转换工具，JPG/PNG/WebP/AVIF 互转，质量可调，批量处理。纯浏览器本地处理，图片不上传服务器。',
    faq: [
      { q: 'AVIF 是什么？比 WebP 更好吗？', a: 'AVIF 是基于 AV1 视频编码的图片格式，2026 年已成为最先进的图片格式。同质量下比 WebP 再小 20%-30%，比 JPG 小 50% 以上。Chrome 85+、Safari 16+ 支持。缺点是编码速度较慢，老浏览器不支持。' },
      { q: 'PNG 转 JPG 会丢失透明通道吗？', a: '会。JPG 不支持透明通道，PNG 的透明区域转 JPG 后会变成白色（或其他指定底色）。如果图片有透明需求，请转 WebP 或保留 PNG，不要转 JPG。' },
      { q: '转换会降低画质吗？', a: '取决于目标格式和质量参数。JPG/WebP/AVIF 是有损格式，质量参数越低体积越小但画质越差，一般 80%-90% 是平衡点。PNG 是无损格式，画质不变但体积较大。' },
      { q: '图片会上传吗？', a: '不会。本工具基于浏览器原生 Canvas 和 createImageBitmap API 解码编码，所有转换在本地完成，断网可用，适合处理含隐私的图片。' },
    ],
    related: ['webp-convert', 'exif-remover', 'image-stitch'],
  },
  // ============ P2 扩展 ============
  {
    slug: 'image-stitch',
    name: '图片拼接',
    shortName: '图片拼接',
    desc: '多张图片纵向或横向拼接为一张，间距、对齐方式、背景色可调。',
    priority: 'P2',
    category: '图片编辑',
    keywords: ['图片拼接', '图片合成', '多图拼接', '纵向拼接', '横向拼接', '长图拼接'],
    icon: '⊞',
    volume: 210,
    seoNote: '社交媒体长图、截图拼接需求',
    seoTitle: '图片拼接在线 - 纵向/横向多图合成 | HyperGrad',
    seoDescription: '免费在线图片拼接工具，多张图片纵向或横向拼接为一张，间距、对齐方式、背景色可调。纯浏览器本地处理，图片不上传。',
    faq: [
      { q: '纵向和横向拼接的区别？', a: '纵向拼接把图片从上到下依次堆叠，适合做长图、连续截图、聊天记录；横向拼接把图片从左到右排列，适合做对比图、拼贴画。本工具两种模式都支持。' },
      { q: '不同宽度的图片怎么处理？', a: '可设置对齐方式：左对齐、居中、右对齐（纵向拼接时）；或顶部、居中、底部对齐（横向拼接时）。空白区域用自定义背景色填充，默认白色。也可选择将所有图片缩放到统一宽度后再拼接。' },
      { q: '拼接后画质会损失吗？', a: '本工具使用 Canvas 重新编码拼接后的图片，默认高质量输出。画质损失主要来自目标格式（若选 JPG 会有轻微压缩损失，PNG 无损）。' },
      { q: '图片会上传吗？', a: '不会。拼接在浏览器本地用 Canvas 完成，所有图片都不会上传服务器，断网也能用。' },
    ],
    related: ['format-convert', 'gif-frames', 'color-extract'],
  },
  {
    slug: 'gif-frames',
    name: 'GIF 截帧',
    shortName: 'GIF 截帧',
    desc: '将 GIF 动图分解为单帧图片，批量下载，支持查看每帧延迟。',
    priority: 'P2',
    category: '图片编辑',
    keywords: ['gif截帧', 'gif分解', 'gif分帧', 'gif提取帧', 'gif 转图片', 'gif帧提取'],
    icon: '▦',
    volume: 160,
    seoNote: '表情包制作、动图分析小众但稳定需求',
    seoTitle: 'GIF 截帧在线 - GIF 分解为单帧图片 | HyperGrad',
    seoDescription: '免费在线 GIF 截帧工具，将 GIF 动图分解为单帧 PNG 图片，支持批量下载、查看每帧延迟。纯浏览器本地解析，GIF 不上传服务器。',
    faq: [
      { q: 'GIF 截帧后是什么格式？', a: '每帧导出为 PNG（无损，保留透明通道）。GIF 本身是无损索引色格式，PNG 能完整保留每一帧的像素信息。如需 JPG 可在格式转换工具中再转。' },
      { q: '能查看每帧的延迟时间吗？', a: '能。本工具会展示每帧的延迟时间（毫秒），GIF 的帧延迟决定了播放速度。不同帧延迟可以不同，本工具会完整还原原始 GIF 的延迟设置。' },
      { q: '为什么有的 GIF 截出来帧数很少？', a: 'GIF 文件本身帧数就那么多。有些"GIF"实际是 MP4 转的，帧率很低。另外 GIF 最小延迟是 20ms（浏览器规范），原始 0ms 延迟的帧会被合并或调整。' },
      { q: 'GIF 会上传吗？', a: '不会。本工具用 gifuct-js 库在浏览器本地解析 GIF 二进制流，逐帧解码为图片，整个过程不联网，GIF 文件不会离开你的设备。' },
    ],
    related: ['image-stitch', 'format-convert', 'webp-convert'],
  },
];

export const priorityMeta: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  P0: { label: '核心工具', desc: '图片处理高频刚需', color: '#B83A3A', bg: '#FCEFEF' },
  P1: { label: '常用工具', desc: '日常开发常用', color: '#C8862E', bg: '#FDF5EA' },
  P2: { label: '扩展工具', desc: '特定场景补齐', color: '#2D7A4F', bg: '#EEF7F1' },
};

export const categoryMeta: Record<Category, { icon: string; color: string }> = {
  'SVG 工具': { icon: '📐', color: '#7A4FB8' },
  '格式转换': { icon: '🔄', color: '#2D5F8A' },
  'EXIF 隐私': { icon: '🔐', color: '#B83A3A' },
  '图片编辑': { icon: '✂️', color: '#C8862E' },
  '开发者工具': { icon: '🛠', color: '#2D7A4F' },
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
