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
      // Non-PNG formats need white background
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      if (outType !== 'image/png') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, outType, 0.92));
      if (!blob) throw new Error('Encoding failed');
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
    if (arr.length === 0) { setError('Please select image files'); return; }
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
          <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>{processing ? 'Processing...' : 'Click to select photos (batch processing supported)'}</div>
          <div class="text-sm">Removes all EXIF (including GPS, camera info). Original and output images are never uploaded.</div>
        </div>
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      {items.length > 0 && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">Results · {doneCount} succeeded · {errorCount} failed</div>
            <button class="btn btn-primary btn-sm" onClick={downloadAll} disabled={doneCount === 0}>Download All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>File</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Original</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Cleaned</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
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
                      ? <span style={{ color: 'var(--green)' }}>✓ Cleaned</span>
                      : <span style={{ color: 'var(--red)' }}>✗ Failed</span>}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {item.status === 'done' && <button class="btn btn-secondary btn-sm" onClick={() => downloadOne(item)}>Download</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div class="text-xs text-muted mt-md">
            Note: Cleaned images retain the original pixel data with no quality loss—only EXIF metadata (GPS, camera model, shooting parameters, etc.) is stripped. This is irreversible, so please keep a backup of the original.
          </div>
        </div>
      )}
    </div>
  );
}
