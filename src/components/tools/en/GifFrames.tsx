import { useState, useRef, useCallback } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

interface Frame {
  index: number;
  url: string;
  delay: number;
  width: number;
  height: number;
}

export default function GifFrames() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [imgSrc, setImgSrc] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.gif') && file.type !== 'image/gif') {
      setError('Please select a .gif file');
      return;
    }
    setFileName(file.name);
    setImgSrc(URL.createObjectURL(file));
    setFrames([]);
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const gif = parseGIF(buffer);
      const allFrames = decompressFrames(gif, true);
      const totalW = gif.lsd.width;
      const totalH = gif.lsd.height;
      // Accumulative drawing canvas
      const canvas = document.createElement('canvas');
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d')!;
      // Temporary canvas for single-frame patch
      const tmp = document.createElement('canvas');
      const tmpCtx = tmp.getContext('2d')!;
      const results: Frame[] = [];
      let prevImageData: ImageData | null = null;

      allFrames.forEach((frame, i) => {
        const dims = frame.dims;
        // Disposal handling
        if (frame.disposalType === 3 && prevImageData) {
          ctx.putImageData(prevImageData, 0, 0);
        } else if (frame.disposalType === 2) {
          ctx.clearRect(0, 0, totalW, totalH);
        }
        // Save current state (disposalType 3 needs to restore to before this frame)
        if (frame.disposalType === 3) {
          prevImageData = ctx.getImageData(0, 0, totalW, totalH);
        } else {
          prevImageData = null;
        }
        // Draw patch
        tmp.width = dims.width;
        tmp.height = dims.height;
        const imageData = tmpCtx.createImageData(dims.width, dims.height);
        imageData.data.set(frame.patch);
        tmpCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tmp, dims.left, dims.top);
        // Snapshot current accumulated state as PNG
        const url = canvas.toDataURL('image/png');
        results.push({
          index: i,
          url,
          delay: frame.delay || 0,
          width: totalW,
          height: totalH,
        });
      });
      setFrames(results);
    } catch (e) {
      setError('GIF parsing failed: ' + (e as Error).message);
    } finally {
      setProcessing(false);
    }
  }, []);

  const downloadOne = (f: Frame) => {
    const a = document.createElement('a');
    a.href = f.url;
    a.download = `${fileName.replace(/\.gif$/i, '')}-frame-${String(f.index + 1).padStart(3, '0')}.png`;
    a.click();
  };

  const downloadAll = () => {
    frames.forEach((f, i) => {
      setTimeout(() => downloadOne(f), i * 250);
    });
  };

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept=".gif,image/gif" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {!imgSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>▦</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>Click to select a GIF animation</div>
            <div class="text-sm">Split into individual PNG frames with batch download. Parsed locally, no upload.</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>Replace GIF</button>
            <span class="text-muted text-sm">{fileName}</span>
            {processing && <span class="text-muted text-sm">Parsing...</span>}
          </div>
        )}
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      {imgSrc && (
        <div class="tool-grid-2">
          <div class="tool-card">
            <div class="font-bold mb-md">Original GIF</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)' }}>
              <img src={imgSrc} alt={fileName} style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          </div>
          <div class="tool-card">
            <div class="font-bold mb-md">GIF Info</div>
            {frames.length > 0 ? (
              <table style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  <tr><td style={{ padding: '6px 0', color: 'var(--text-muted)', width: '40%' }}>Total frames</td><td>{frames.length}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Dimensions</td><td>{frames[0].width}×{frames[0].height}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Delay range</td><td>{Math.min(...frames.map(f => f.delay))}ms - {Math.max(...frames.map(f => f.delay))}ms</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Avg frame rate</td><td>{(1000 / (frames.reduce((s, f) => s + (f.delay || 20), 0) / frames.length)).toFixed(1)} fps</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Total duration</td><td>{(frames.reduce((s, f) => s + (f.delay || 20), 0) / 1000).toFixed(2)}s</td></tr>
                </tbody>
              </table>
            ) : (
              <div class="text-muted">{processing ? 'Parsing...' : 'Waiting to parse'}</div>
            )}
          </div>
        </div>
      )}

      {frames.length > 0 && (
        <div class="tool-card">
          <div class="toolbar">
            <div class="font-bold">Frames ({frames.length} total)</div>
            <button class="btn btn-primary btn-sm" onClick={downloadAll}>Download All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '12px' }}>
            {frames.map(f => (
              <div key={f.index} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px', textAlign: 'center' }}>
                <div class="text-xs text-muted" style={{ marginBottom: '4px' }}>#{f.index + 1} · {f.delay}ms</div>
                <img src={f.url} alt={`Frame ${f.index + 1}`} style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                <button class="btn btn-secondary btn-sm mt-md" style={{ display: 'inline-block' }} onClick={() => downloadOne(f)}>Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
