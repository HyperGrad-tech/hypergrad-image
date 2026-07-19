---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'f1cdff48-d0ad-452c-8daf-bff9aad36543'
  PropagateID: 'f1cdff48-d0ad-452c-8daf-bff9aad36543'
  ReservedCode1: '19c02cfc-49af-4bd1-aa14-22b507e8e1f8'
  ReservedCode2: '19c02cfc-49af-4bd1-aa14-22b507e8e1f8'
---

# HyperGrad Image

纯前端图片工具站，SVG / WebP / EXIF / 占位图 / 颜色提取 / GIF 截帧 / 格式转换等 12 个细分工具。

所有处理在浏览器本地完成，图片不上传服务器。与 [hypergrad-devtools](https://devtools.hypergrad.cn)、DeepSeal 加密笔记应用同属 HyperGrad 生态。

## 技术栈

- Astro 7 + React 19
- 浏览器原生 Canvas / createImageBitmap / OffscreenCanvas
- exifr（EXIF 解析）、gifuct-js（GIF 解帧）
- Cloudflare Pages 部署

## 开发

```sh
pnpm install
pnpm dev
```