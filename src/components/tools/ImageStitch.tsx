import { useState, useRef, useCallback, useEffect } from 'react';

type Direction = 'vertical' | 'horizontal';
type Align = 'start' | 'center' | 'end';
type ResizeMode = 'none' | 'unify';

interface LoadedImg {
  id: number;
  src: string;
  img: HTMLImageElement;
  file: File;
}

export default function ImageStitch() {
  const [imgs, setImgs] = useState<LoadedImg[]>([]);
  const [direction, setDirection] = useState<Direction>('vertical');
  const [gap, setGap] = useState(8);
  const [align, setAlign] = useState<Align>('center');
  const [resizeMode, setResizeMode] = useState<ResizeMode>('none');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [outUrl, setOutUrl] = useState('');
  const [outDim, setOutDim] = useState({ w: 0, h: 0 });
  const [error, setError] = useState('');
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    setError('');
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    Promise.all(arr.map(f => new Promise<LoadedImg>((resolve, reject) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => resolve({ id: idRef.current++, src: url, img, file: f });
      img.onerror = () => reject(new Error(f.name + ' 加载失败'));
      img.src = url;
    }))).then(loaded => setImgs(prev => [...prev, ...loaded])).catch(e => setError(e.message));
  }, []);

  const removeAt = (i: number) => {
    setImgs(prev => {
      URL.revokeObjectURL(prev[i].src);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    setImgs(prev => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const arr = [...prev];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  // 实时拼接预览
  useEffect(() => {
    if (imgs.length === 0) { setOutUrl(''); return; }
    const calc = () => {
      let unify: (img: HTMLImageElement) => { w: number; h: number };
      if (resizeMode === 'unify') {
        if (direction === 'vertical') {
          const w = Math.min(...imgs.map(i => i.img.naturalWidth));
          unify = img => ({ w, h: Math.round(img.naturalHeight * (w / img.naturalWidth)) });
        } else {
          const h = Math.min(...imgs.map(i => i.img.naturalHeight));
          unify = img => ({ w: Math.round(img.naturalWidth * (h / img.naturalHeight)), h });
        }
      } else {
        unify = img => ({ w: img.naturalWidth, h: img.naturalHeight });
      }
      const dims = imgs.map(i => unify(i.img));
      const totalGap = gap * (imgs.length - 1);
      const totalW = direction === 'vertical' ? Math.max(...dims.map(d => d.w)) : dims.reduce((s, d) => s + d.w, 0) + totalGap;
      const totalH = direction === 'vertical' ? dims.reduce((s, d) => s + d.h, 0) + totalGap : Math.max(...dims.map(d => d.h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, totalW);
      canvas.height = Math.max(1, totalH);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let cursor = 0;
      imgs.forEach((item, idx) => {
        const d = dims[idx];
        let x, y;
        if (direction === 'vertical') {
          if (align === 'start') x = 0;
          else if (align === 'center') x = Math.round((totalW - d.w) / 2);
          else x = totalW - d.w;
          y = cursor;
          cursor += d.h + gap;
        } else {
          if (align === 'start') y = 0;
          else if (align === 'center') y = Math.round((totalH - d.h) / 2);
          else y = totalH - d.h;
          x = cursor;
          cursor += d.w + gap;
        }
        ctx.drawImage(item.img, x, y, d.w, d.h);
      });
      if (outUrl) URL.revokeObjectURL(outUrl);
      canvas.toBlob(blob => {
        if (blob) {
          setOutUrl(URL.createObjectURL(blob));
          setOutDim({ w: canvas.width, h: canvas.height });
        }
      }, 'image/png');
    };
    const t = setTimeout(calc, 100);
    return () => clearTimeout(t);
  }, [imgs, direction, gap, align, resizeMode, bgColor]);

  const download = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl;
    a.download = `stitched-${direction}.png`;
    a.click();
  };

  useEffect(() => () => { imgs.forEach(i => URL.revokeObjectURL(i.src)); if (outUrl) URL.revokeObjectURL(outUrl); }, []);

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
        <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '40px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⊞</div>
          <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '4px' }}>点击添加图片（可多选）</div>
          <div class="text-sm">本地拼接不上传</div>
        </div>
      </div>

      {imgs.length > 0 && (
        <>
          <div class="tool-card">
            <div class="font-bold mb-md">拼接参数</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div>
                <label class="text-xs text-muted">方向</label>
                <select class="select w-full mt-md" value={direction} onChange={e => setDirection(e.target.value as Direction)}>
                  <option value="vertical">纵向（从上到下）</option>
                  <option value="horizontal">横向（从左到右）</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-muted">对齐方式</label>
                <select class="select w-full mt-md" value={align} onChange={e => setAlign(e.target.value as Align)}>
                  {direction === 'vertical'
                    ? <><option value="start">左对齐</option><option value="center">居中</option><option value="end">右对齐</option></>
                    : <><option value="start">顶对齐</option><option value="center">居中</option><option value="end">底对齐</option></>}
                </select>
              </div>
              <div>
                <label class="text-xs text-muted">统一尺寸</label>
                <select class="select w-full mt-md" value={resizeMode} onChange={e => setResizeMode(e.target.value as ResizeMode)}>
                  <option value="none">保持原尺寸</option>
                  <option value="unify">缩放到统一尺寸</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-muted">间距 (px)</label>
                <input class="input w-full mt-md" type="number" min="0" max="100" value={gap} onChange={e => setGap(Math.max(0, Number(e.target.value)))} />
              </div>
              <div>
                <label class="text-xs text-muted">背景色</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
                  <input class="input" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          </div>

          <div class="tool-card">
            <div class="toolbar">
              <div class="font-bold">已加载 {imgs.length} 张</div>
              <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>添加更多</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {imgs.map((item, i) => (
                <div key={item.id} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px' }}>
                  <img src={item.src} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', display: 'flex', gap: '2px' }}>
                    <button class="btn btn-secondary btn-sm" style={{ minWidth: '24px', padding: '0', height: '22px' }} onClick={() => move(i, -1)} disabled={i === 0} title="前移">↑</button>
                    <button class="btn btn-secondary btn-sm" style={{ minWidth: '24px', padding: '0', height: '22px' }} onClick={() => move(i, 1)} disabled={i === imgs.length - 1} title="后移">↓</button>
                    <button class="btn btn-danger btn-sm" style={{ minWidth: '24px', padding: '0', height: '22px' }} onClick={() => removeAt(i)} title="删除">×</button>
                  </div>
                </div>
              ))}
            </div>
            {error && <div class="status-msg status-error mt-md">{error}</div>}
          </div>

          {outUrl && (
            <div class="tool-card">
              <div class="toolbar">
                <div class="font-bold">拼接结果 · {outDim.w}×{outDim.h}</div>
                <button class="btn btn-primary btn-sm" onClick={download}>下载 PNG</button>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)', marginTop: '12px' }}>
                <img src={outUrl} alt="拼接结果" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
