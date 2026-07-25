import { useState, useMemo, useRef } from 'react';

type Fmt = 'png' | 'svg';

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

export default function Placeholder() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState('#6366F1');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [text, setText] = useState('');
  const [format, setFormat] = useState<Fmt>('png');
  const [pngUrl, setPngUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = text || `${width}×${height}`;

  const generatePng = () => {
    const canvas = canvasRef.current!;
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    // Text
    ctx.fillStyle = textColor;
    const fontSize = Math.max(12, Math.min(width, height) / 8);
    ctx.font = `${fontSize}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);
    canvas.toBlob(blob => {
      if (!blob) return;
      if (pngUrl) URL.revokeObjectURL(pngUrl);
      setPngUrl(URL.createObjectURL(blob));
    }, 'image/png');
  };

  const svgContent = useMemo(() => {
    const fontSize = Math.max(12, Math.min(width, height) / 8);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="${width / 2}" y="${height / 2}" font-family="-apple-system, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${escapeXml(displayText)}</text>
</svg>`;
  }, [width, height, bgColor, textColor, displayText]);

  const downloadSvg = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placeholder-${width}x${height}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `placeholder-${width}x${height}.png`;
    a.click();
  };

  const previewStyle = { width: '100%', maxWidth: `${Math.min(600, width)}px`, height: 'auto', aspectRatio: `${width} / ${height}` } as const;

  return (
    <div>
      <div class="tool-card">
        <div class="font-bold mb-md">Settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div>
            <label class="text-xs text-muted">Width (px)</label>
            <input class="input w-full mt-md" type="number" min="1" max="4096" value={width} onChange={e => setWidth(Math.max(1, Number(e.target.value)))} />
          </div>
          <div>
            <label class="text-xs text-muted">Height (px)</label>
            <input class="input w-full mt-md" type="number" min="1" max="4096" value={height} onChange={e => setHeight(Math.max(1, Number(e.target.value)))} />
          </div>
          <div>
            <label class="text-xs text-muted">Background color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
              <input class="input" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
          <div>
            <label class="text-xs text-muted">Text color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
              <input class="input" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label class="text-xs text-muted">Display text (leave empty to show dimensions)</label>
            <input class="input w-full mt-md" type="text" value={text} placeholder={`${width}×${height}`} onChange={e => setText(e.target.value)} />
          </div>
          <div>
            <label class="text-xs text-muted">Output format</label>
            <select class="select w-full mt-md" value={format} onChange={e => setFormat(e.target.value as Fmt)}>
              <option value="png">PNG (bitmap)</option>
              <option value="svg">SVG (vector, smaller)</option>
            </select>
          </div>
        </div>

        <div class="toolbar mt-md">
          {format === 'png' && <button class="btn btn-primary" onClick={generatePng}>Generate & Preview</button>}
          <button class="btn btn-secondary btn-sm" onClick={() => { setWidth(800); setHeight(600); setBgColor('#6366F1'); setTextColor('#FFFFFF'); setText(''); }}>Reset</button>
          {format === 'png' && pngUrl && <button class="btn btn-primary btn-sm" onClick={downloadPng}>Download PNG</button>}
          {format === 'svg' && <button class="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(svgContent)}>Copy SVG Code</button>}
          {format === 'svg' && <button class="btn btn-primary btn-sm" onClick={downloadSvg}>Download SVG</button>}
        </div>
      </div>

      <div class="tool-card">
        <div class="font-bold mb-md">Preview</div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', background: 'var(--bg-soft)' }}>
          {format === 'svg' ? (
            <div style={previewStyle} dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            pngUrl
              ? <img src={pngUrl} alt="Placeholder" style={previewStyle} />
              : <div style={{ ...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor, color: textColor, fontSize: '14px', margin: '0 auto' }}>{displayText}</div>
          )}
        </div>
        {format === 'svg' && (
          <div class="mt-md">
            <div class="text-xs text-muted mb-md">SVG Source</div>
            <textarea class="text-area" value={svgContent} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', minHeight: '140px' }} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
