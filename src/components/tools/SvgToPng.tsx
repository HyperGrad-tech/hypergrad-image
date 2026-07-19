import { useState, useRef, useCallback } from 'react';

interface SvgFile {
  name: string;
  content: string;
  url: string;
}

export default function SvgToPng() {
  const [files, setFiles] = useState<SvgFile[]>([]);
  const [scale, setScale] = useState(2);
  const [pngs, setPngs] = useState<{ name: string; url: string; w: number; h: number }[]>([]);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    setError('');
    const arr = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml');
    if (arr.length === 0) {
      setError('请选择 .svg 文件');
      return;
    }
    Promise.all(arr.map(f => new Promise<SvgFile>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, content: reader.result as string, url: URL.createObjectURL(f) });
      reader.readAsText(f);
    }))).then(setFiles);
  }, []);

  const convertOne = (svgContent: string, name: string): Promise<{ name: string; url: string; w: number; h: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        // 找 viewBox 或宽高
        const vbMatch = svgContent.match(/viewBox="([^"]+)"/);
        let vbW = img.naturalWidth, vbH = img.naturalHeight;
        if (vbMatch) {
          const parts = vbMatch[1].split(/[\s,]+/).map(Number);
          if (parts.length === 4) { vbW = parts[2]; vbH = parts[3]; }
        }
        const targetW = Math.max(1, Math.round(vbW * scale));
        const targetH = Math.max(1, Math.round(vbH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        URL.revokeObjectURL(url);
        canvas.toBlob(b => {
          if (!b) { reject(new Error('转换失败')); return; }
          resolve({ name: name.replace(/\.svg$/i, '') + '.png', url: URL.createObjectURL(b), w: targetW, h: targetH });
        }, 'image/png');
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG 加载失败，可能含外部资源')); };
      img.src = url;
    });
  };

  const convert = async () => {
    if (files.length === 0) return;
    setConverting(true);
    setError('');
    try {
      const results = [];
      for (const f of files) {
        results.push(await convertOne(f.content, f.name));
      }
      setPngs(results);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = () => {
    pngs.forEach((p, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = p.url;
        a.download = p.name;
        a.click();
      }, i * 200);
    });
  };

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept=".svg,image/svg+xml" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
        {!files.length ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📐</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>点击选择 SVG 文件（可多选）</div>
            <div class="text-sm">支持批量转换，本地处理不上传</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>更换文件</button>
            <span class="text-muted text-sm">已选 {files.length} 个 SVG</span>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div class="tool-card">
          <div class="font-bold mb-md">转换参数</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label class="text-xs text-muted">输出倍率</label>
              <select class="select mt-md" value={scale} onChange={e => setScale(Number(e.target.value))}>
                <option value={1}>1x（普通屏）</option>
                <option value={2}>2x（Retina 屏，推荐）</option>
                <option value={3}>3x（高清屏）</option>
                <option value={4}>4x（超高清）</option>
              </select>
            </div>
            <button class="btn btn-primary" onClick={convert} disabled={converting}>
              {converting ? '转换中...' : `转换全部 (${files.length})`}
            </button>
          </div>
        </div>
      )}

      {error && <div class="status-msg status-error">{error}</div>}

      {pngs.length > 0 && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">转换结果</div>
            <button class="btn btn-primary btn-sm" onClick={downloadAll}>全部下载</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {pngs.map(p => (
              <div key={p.name} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', textAlign: 'center' }}>
                <img src={p.url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                <div class="text-xs mt-md" style={{ wordBreak: 'break-all' }}>{p.name}</div>
                <div class="text-xs text-muted">{p.w}×{p.h}</div>
                <a href={p.url} download={p.name} class="btn btn-secondary btn-sm mt-md" style={{ display: 'inline-block' }}>下载</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
