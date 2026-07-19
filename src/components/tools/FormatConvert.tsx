import { useState, useRef, useCallback } from 'react';

type Fmt = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

const FMT_NAME: Record<Fmt, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
};

interface Item {
  name: string;
  origSize: number;
  outSize: number;
  url: string;
  w: number;
  h: number;
  status: 'done' | 'error';
  msg?: string;
}

const isAvifSupported = async (): Promise<boolean> => {
  try {
    const res = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2yWp1cmRpbmRwYXJjAABhnQAAuJ5wYmRpYXiwYmNwAAAAAAQAAAY/').then(r => r.blob());
    return res.type === 'image/avif';
  } catch {
    return false;
  }
};

export default function FormatConvert() {
  const [items, setItems] = useState<Item[]>([]);
  const [targetFmt, setTargetFmt] = useState<Fmt>('image/webp');
  const [quality, setQuality] = useState(0.85);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [avifOk, setAvifOk] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 探测 AVIF 支持
  useCallback(() => { isAvifSupported().then(setAvifOk); }, []);

  const convertFile = async (file: File): Promise<Item> => {
    const origSize = file.size;
    const outName = file.name.replace(/\.[^.]+$/, '') + '.' + targetFmt.split('/')[1];
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      if (targetFmt !== 'image/png') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, targetFmt, targetFmt === 'image/png' ? undefined : quality));
      if (!blob || blob.size === 0) throw new Error('当前浏览器不支持 ' + FMT_NAME[targetFmt] + ' 编码');
      return {
        name: outName, origSize, outSize: blob.size,
        url: URL.createObjectURL(blob), w: canvas.width, h: canvas.height, status: 'done'
      };
    } catch (e) {
      return { name: outName, origSize, outSize: 0, url: '', w: 0, h: 0, status: 'error', msg: (e as Error).message };
    }
  };

  const handleFiles = async (fileList: FileList) => {
    setError('');
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) { setError('请选择图片文件'); return; }
    if (targetFmt === 'image/avif' && avifOk === false) {
      setError('当前浏览器不支持 AVIF 编码，请换用 Chrome 85+ 或 Safari 16+');
      return;
    }
    setProcessing(true);
    setItems([]);
    const results: Item[] = [];
    for (const f of arr) {
      const r = await convertFile(f);
      results.push(r);
      setItems([...results]);
    }
    setProcessing(false);
  };

  const readableSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  const downloadAll = () => {
    items.filter(i => i.status === 'done').forEach((item, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.url; a.download = item.name; a.click();
      }, i * 200);
    });
  };

  const doneCount = items.filter(i => i.status === 'done').length;

  return (
    <div>
      <div class="tool-card">
        <div class="font-bold mb-md">输出格式与质量</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label class="text-xs text-muted">目标格式</label>
            <select class="select w-full mt-md" value={targetFmt} onChange={e => setTargetFmt(e.target.value as Fmt)}>
              <option value="image/webp">WebP（推荐）</option>
              <option value="image/avif">AVIF（最小，需新浏览器）{avifOk === false ? ' ✗' : avifOk === true ? ' ✓' : ''}</option>
              <option value="image/jpeg">JPEG（兼容性最好）</option>
              <option value="image/png">PNG（无损）</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">质量 {targetFmt === 'image/png' ? '（PNG 无效）' : `${Math.round(quality * 100)}%`}</label>
            <input type="range" min="0.1" max="1" step="0.05" value={quality} disabled={targetFmt === 'image/png'}
              onChange={e => setQuality(Number(e.target.value))} style={{ width: '100%', marginTop: '12px' }} />
          </div>
        </div>
      </div>

      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
        <div onClick={() => !processing && inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '50px', textAlign: 'center', cursor: processing ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: processing ? 0.6 : 1 }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>⇄</div>
          <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>{processing ? '处理中...' : '点击选择图片（可多选批量转换）'}</div>
          <div class="text-sm">转 {FMT_NAME[targetFmt]} · 本地处理不上传</div>
        </div>
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      {items.length > 0 && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">结果 · 成功 {doneCount}</div>
            <button class="btn btn-primary btn-sm" onClick={downloadAll} disabled={doneCount === 0}>全部下载</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', textAlign: 'center' }}>
                {item.status === 'done' ? (
                  <>
                    <img src={item.url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                    <div class="text-xs mt-md" style={{ wordBreak: 'break-all' }}>{item.name}</div>
                    <div class="text-xs text-muted">{readableSize(item.origSize)} → {readableSize(item.outSize)} ({item.w}×{item.h})</div>
                    <div class="text-xs" style={{ color: 'var(--green)' }}>
                      减小 {Math.max(0, Math.round((1 - item.outSize / item.origSize) * 100))}%
                    </div>
                    <button class="btn btn-secondary btn-sm mt-md" onClick={() => { const a = document.createElement('a'); a.href = item.url; a.download = item.name; a.click(); }}>下载</button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '32px', color: 'var(--red)' }}>✗</div>
                    <div class="text-xs mt-md" style={{ wordBreak: 'break-all' }}>{item.name}</div>
                    <div class="text-xs" style={{ color: 'var(--red)' }}>{item.msg}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
