import { useState, useRef, useCallback } from 'react';

type Mode = 'toBase64' | 'toImage';

export default function Base64Image() {
  const [mode, setMode] = useState<Mode>('toBase64');
  const [base64, setBase64] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result);
      setImgSrc(result);
    };
    reader.onerror = () => setError('文件读取失败');
    reader.readAsDataURL(file);
  }, []);

  const convertBase64ToImage = (input: string) => {
    setError('');
    const trimmed = input.trim();
    if (!trimmed) { setImgSrc(''); return; }
    // 校验是否为合法 data URL 或纯 base64
    const dataUrl = trimmed.startsWith('data:')
      ? trimmed
      : `data:image/png;base64,${trimmed.replace(/^,+/, '')}`;
    const img = new Image();
    img.onload = () => setImgSrc(dataUrl);
    img.onerror = () => { setError('Base64 字符串无效或图片损坏'); setImgSrc(''); };
    img.src = dataUrl;
  };

  const copy = () => base64 && navigator.clipboard.writeText(base64);
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBase64(text);
      convertBase64ToImage(text);
    } catch {
      setError('无法读取剪贴板，请手动粘贴');
    }
  };

  const download = () => {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = fileName || 'image.png';
    a.click();
  };

  const base64Size = base64 ? Math.round((base64.length - base64.indexOf(',') - 1) * 3 / 4) : 0;

  const readableSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div>
      <div class="tool-card">
        <div class="tabs">
          <div class={`tab ${mode === 'toBase64' ? 'active' : ''}`} onClick={() => { setMode('toBase64'); setError(''); }}>图片 → Base64</div>
          <div class={`tab ${mode === 'toImage' ? 'active' : ''}`} onClick={() => { setMode('toImage'); setError(''); }}>Base64 → 图片</div>
        </div>

        {mode === 'toBase64' && (
          <>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {!base64 ? (
              <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>B64</div>
                <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>点击选择图片</div>
                <div class="text-sm">支持 PNG / JPEG / WebP / GIF，本地编码不上传</div>
              </div>
            ) : (
              <div class="toolbar">
                <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>更换图片</button>
                <span class="text-muted text-sm">{fileName} · 解码后约 {readableSize(base64Size)}</span>
              </div>
            )}
            {base64 && (
              <div style={{ marginTop: '12px' }}>
                <div class="text-xs text-muted mb-md">Base64 Data URL（点击下方按钮复制）</div>
                <textarea class="text-area" value={base64} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all' }} />
                <div class="toolbar mt-md">
                  <button class="btn btn-primary btn-sm" onClick={copy}>复制 Base64</button>
                  <button class="btn btn-secondary btn-sm" onClick={() => { setBase64(''); setImgSrc(''); setFileName(''); }}>清空</button>
                </div>
              </div>
            )}
          </>
        )}

        {mode === 'toImage' && (
          <div>
            <div class="toolbar mb-md">
              <button class="btn btn-secondary btn-sm" onClick={paste}>从剪贴板粘贴</button>
              <button class="btn btn-secondary btn-sm" onClick={() => { setBase64(''); setImgSrc(''); setError(''); }}>清空</button>
            </div>
            <div class="text-xs text-muted mb-md">粘贴 Base64 字符串（带或不带 data: 前缀均可）</div>
            <textarea
              class="text-area"
              placeholder="例如：data:image/png;base64,iVBORw0KGgoAAAA..."
              value={base64}
              onChange={e => { setBase64(e.target.value); convertBase64ToImage(e.target.value); }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all' }}
            />
          </div>
        )}
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      {imgSrc && !error && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">图片预览</div>
            <button class="btn btn-primary btn-sm" onClick={download}>下载图片</button>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', background: 'var(--bg-soft)', marginTop: '12px' }}>
            <img src={imgSrc} alt="预览" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
}
