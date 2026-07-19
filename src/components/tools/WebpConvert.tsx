import { useState, useRef, useCallback } from 'react';

type TargetFmt = 'image/webp' | 'image/jpeg' | 'image/png';

export default function WebpConvert() {
  const [origSrc, setOrigSrc] = useState('');
  const [outSrc, setOutSrc] = useState('');
  const [origType, setOrigType] = useState('');
  const [origSize, setOrigSize] = useState(0);
  const [outSize, setOutSize] = useState(0);
  const [targetFmt, setTargetFmt] = useState<TargetFmt>('image/webp');
  const [quality, setQuality] = useState(0.85);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('converted');
  const inputRef = useRef<HTMLInputElement>(null);

  const readableSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  const convert = useCallback((img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    // 非PNG格式需白底
    if (targetFmt !== 'image/png') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) { setError('当前浏览器不支持该格式编码'); return; }
      setOutSize(blob.size);
      setOutSrc(URL.createObjectURL(blob));
    }, targetFmt, targetFmt === 'image/png' ? undefined : quality);
  }, [targetFmt, quality]);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return; }
    setOrigType(file.type);
    setOrigSize(file.size);
    setFileName(file.name.replace(/\.[^.]+$/, '') || 'converted');
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setOrigSrc(src);
      const img = new Image();
      img.onload = () => convert(img);
      img.onerror = () => setError('图片加载失败');
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [convert]);

  const reConvert = () => {
    if (!origSrc) return;
    const img = new Image();
    img.onload = () => convert(img);
    img.src = origSrc;
  };

  const download = () => {
    if (!outSrc) return;
    const a = document.createElement('a');
    a.href = outSrc;
    a.download = `${fileName}.${targetFmt.split('/')[1]}`;
    a.click();
  };

  const ratio = origSize > 0 && outSize > 0 ? Math.round((1 - outSize / origSize) * 100) : 0;
  const hasTransparency = origType === 'image/png' || origType === 'image/webp';

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {!origSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌐</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>点击选择图片</div>
            <div class="text-sm">支持 PNG / JPEG / WebP，本地处理不上传</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>更换图片</button>
            <span class="text-muted text-sm">{fileName} · {readableSize(origSize)} · {origType.replace('image/', '').toUpperCase()}</span>
          </div>
        )}
      </div>

      {origSrc && (
        <>
          <div class="tool-card">
            <div class="font-bold mb-md">转换参数</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label class="text-xs text-muted">目标格式</label>
                <select class="select w-full mt-md" value={targetFmt} onChange={e => setTargetFmt(e.target.value as TargetFmt)}>
                  <option value="image/webp">WebP（推荐，更小）</option>
                  <option value="image/jpeg">JPEG（有损，无透明）</option>
                  <option value="image/png">PNG（无损，体积大）</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-muted">质量 {targetFmt === 'image/png' ? '（PNG 无效）' : `${Math.round(quality * 100)}%`}</label>
                <input type="range" min="0.1" max="1" step="0.05" value={quality} disabled={targetFmt === 'image/png'}
                  onChange={e => setQuality(Number(e.target.value))} style={{ width: '100%', marginTop: '12px' }} />
              </div>
              <div>
                <button class="btn btn-primary" onClick={reConvert} style={{ width: '100%' }}>重新转换</button>
              </div>
            </div>
            {hasTransparency && targetFmt === 'image/jpeg' && (
              <div class="status-msg status-info mt-md">原图片有透明通道，转 JPEG 透明区域会变白底。如需保留透明请选 WebP 或 PNG。</div>
            )}
          </div>

          <div class="tool-card">
            <div class="font-bold mb-md">转换结果</div>
            {error ? (
              <div class="status-msg status-error">{error}</div>
            ) : (
              <div class="tool-grid-2">
                <div>
                  <div class="text-xs text-muted mb-md">原始 · {readableSize(origSize)}</div>
                  <img src={origSrc} alt="原始" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                </div>
                <div>
                  <div class="text-xs text-muted mb-md">{outSrc ? `转换后 · ${readableSize(outSize)}` : '转换中...'}</div>
                  {outSrc && <img src={outSrc} alt="转换后" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />}
                </div>
              </div>
            )}
            {outSrc && !error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span class={`status-msg ${ratio > 0 ? 'status-success' : 'status-info'}`} style={{ margin: 0 }}>
                  {ratio > 0 ? `体积减小 ${ratio}%` : `体积增加 ${Math.abs(ratio)}%`} · {readableSize(origSize)} → {readableSize(outSize)}
                </span>
                <button class="btn btn-primary" onClick={download}>下载 {targetFmt.split('/')[1].toUpperCase()}</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
