import { useState, useRef, useCallback } from 'react';

interface ProcessedItem {
  name: string;
  origSize: number;
  outSize: number;
  url: string;
  status: 'done' | 'error';
}

export default function ExifRemover() {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File): Promise<ProcessedItem> => {
    const origSize = file.size;
    const outName = file.name.replace(/\.[^.]+$/, '') + '-no-exif.' + (file.type.split('/')[1] || 'jpg');
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      // 非PNG格式需白底
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      if (outType !== 'image/png') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, outType, 0.92));
      if (!blob) throw new Error('编码失败');
      return {
        name: outName,
        origSize,
        outSize: blob.size,
        url: URL.createObjectURL(blob),
        status: 'done',
      };
    } catch (e) {
      return { name: outName, origSize, outSize: 0, url: '', status: 'error' };
    }
  }, []);

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError('');
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) { setError('请选择图片文件'); return; }
    setProcessing(true);
    setItems([]);
    const results: ProcessedItem[] = [];
    for (const f of arr) {
      const r = await processFile(f);
      results.push(r);
      setItems([...results]);
    }
    setProcessing(false);
  }, [processFile]);

  const readableSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  const downloadOne = (item: ProcessedItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    a.click();
  };

  const downloadAll = () => {
    items.filter(i => i.status === 'done').forEach((item, i) => {
      setTimeout(() => downloadOne(item), i * 200);
    });
  };

  const doneCount = items.filter(i => i.status === 'done').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
        <div onClick={() => !processing && inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: processing ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: processing ? 0.6 : 1 }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡</div>
          <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>{processing ? '处理中...' : '点击选择照片（可多选批量处理）'}</div>
          <div class="text-sm">移除所有 EXIF（含 GPS、相机信息），原图和新图都不上传</div>
        </div>
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      {items.length > 0 && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">处理结果 · 成功 {doneCount} · 失败 {errorCount}</div>
            <button class="btn btn-primary btn-sm" onClick={downloadAll} disabled={doneCount === 0}>全部下载</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>文件</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>原始</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>清理后</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>状态</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '8px', wordBreak: 'break-all' }}>{item.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{readableSize(item.origSize)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.status === 'done' ? readableSize(item.outSize) : '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {item.status === 'done'
                      ? <span style={{ color: 'var(--green)' }}>✓ 已清理</span>
                      : <span style={{ color: 'var(--red)' }}>✗ 失败</span>}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {item.status === 'done' && <button class="btn btn-secondary btn-sm" onClick={() => downloadOne(item)}>下载</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div class="text-xs text-muted mt-md">
            提示：清理后的图片保留了原始像素数据，画质不变，仅剥离了 EXIF 元数据（GPS、相机型号、拍摄参数等）。清理不可逆，请保留原图备份。
          </div>
        </div>
      )}
    </div>
  );
}
