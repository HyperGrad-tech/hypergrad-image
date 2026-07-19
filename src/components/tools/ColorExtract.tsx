import { useState, useRef, useCallback } from 'react';

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
  ratio: number;
}

// 中位切分算法
function medianCut(pixels: Uint8ClampedArray, depth: number): number[][] {
  if (depth === 0 || pixels.length === 0) {
    // 计算平均色
    let r = 0, g = 0, b = 0, c = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; c++;
    }
    return c === 0 ? [] : [[Math.round(r / c), Math.round(g / c), Math.round(b / c), c]];
  }
  // 找出 R/G/B 范围最大的通道
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    rMin = Math.min(rMin, pixels[i]); rMax = Math.max(rMax, pixels[i]);
    gMin = Math.min(gMin, pixels[i + 1]); gMax = Math.max(gMax, pixels[i + 1]);
    bMin = Math.min(bMin, pixels[i + 2]); bMax = Math.max(bMax, pixels[i + 2]);
  }
  const rRange = rMax - rMin, gRange = gMax - gMin, bRange = bMax - bMin;
  let channel = 0;
  if (gRange >= rRange && gRange >= bRange) channel = 1;
  else if (bRange >= rRange && bRange >= gRange) channel = 2;
  // 按该通道排序
  const indices: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) indices.push(i);
  indices.sort((a, b) => pixels[a + channel] - pixels[b + channel]);
  // 重新构造排序后的像素数组
  const sorted = new Uint8ClampedArray(pixels.length);
  indices.forEach((idx, i) => {
    sorted[i * 4] = pixels[idx];
    sorted[i * 4 + 1] = pixels[idx + 1];
    sorted[i * 4 + 2] = pixels[idx + 2];
    sorted[i * 4 + 3] = pixels[idx + 3];
  });
  const mid = Math.floor(sorted.length / 8) * 4;
  const left = sorted.slice(0, mid);
  const right = sorted.slice(mid);
  return [...medianCut(left, depth - 1), ...medianCut(right, depth - 1)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorExtract() {
  const [imgSrc, setImgSrc] = useState('');
  const [colors, setColors] = useState<Color[]>([]);
  const [error, setError] = useState('');
  const [count, setCount] = useState(6);
  const [copied, setCopied] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const extract = useCallback((img: HTMLImageElement) => {
    // 限制采样尺寸，避免大图内存爆炸
    const maxDim = 200;
    const ratio = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
    const w = Math.max(1, Math.round(img.naturalWidth * ratio));
    const h = Math.max(1, Math.round(img.naturalHeight * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    // 过滤完全透明像素
    const opaque: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] >= 125) opaque.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
    }
    const pixels = new Uint8ClampedArray(opaque);
    const depth = Math.ceil(Math.log2(count));
    const buckets = medianCut(pixels, depth);
    const total = buckets.reduce((s, b) => s + b[3], 0) || 1;
    const result: Color[] = buckets
      .filter(b => b[3] > 0)
      .sort((a, b) => b[3] - a[3])
      .slice(0, count)
      .map(b => ({
        hex: rgbToHex(b[0], b[1], b[2]),
        rgb: `rgb(${b[0]}, ${b[1]}, ${b[2]})`,
        hsl: rgbToHsl(b[0], b[1], b[2]),
        count: b[3],
        ratio: b[3] / total,
      }));
    setColors(result);
  }, [count]);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setImgSrc(src);
      const img = new Image();
      img.onload = () => extract(img);
      img.onerror = () => setError('图片加载失败');
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [extract]);

  const reExtract = () => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => extract(img);
    img.src = imgSrc;
  };

  const copyColor = (c: Color) => {
    navigator.clipboard.writeText(c.hex);
    setCopied(c.hex);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {!imgSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>点击选择图片</div>
            <div class="text-sm">提取主色调生成调色板，本地处理不上传</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>更换图片</button>
            <div>
              <label class="text-xs text-muted">提取数量</label>
              <select class="select" value={count} onChange={e => setCount(Number(e.target.value))} style={{ marginLeft: '8px' }}>
                {[3, 4, 5, 6, 8, 10, 12].map(n => <option value={n}>{n} 色</option>)}
              </select>
            </div>
            <button class="btn btn-primary btn-sm" onClick={reExtract}>重新提取</button>
          </div>
        )}
      </div>

      {imgSrc && (
        <div class="tool-grid-2">
          <div class="tool-card">
            <div class="font-bold mb-md">原图</div>
            <img src={imgSrc} alt="原图" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
          </div>
          <div class="tool-card">
            <div class="font-bold mb-md">提取的调色板</div>
            {colors.length === 0 ? (
              <div class="text-muted">提取中...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {colors.map((c, i) => (
                  <div key={i} onClick={() => copyColor(c)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: c.hex, border: '1px solid var(--border)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>{c.hex}</div>
                      <div class="text-xs text-muted">{c.rgb}</div>
                      <div class="text-xs text-muted">{c.hsl}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div class="text-xs font-bold" style={{ color: 'var(--blue-dark)' }}>{(c.ratio * 100).toFixed(1)}%</div>
                      <div class="text-xs text-muted">{copied === c.hex ? '已复制!' : '点击复制'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
