import { useState, useMemo, useCallback } from 'react';

// SVG Optimizer: browser-side implementation of SVGO core strategies
function optimizeSvg(input: string, opts: {
  removeComments: boolean;
  removeMetadata: boolean;
  removeEditors: boolean;
  removeDefaultAttrs: boolean;
  collapseWhitespace: boolean;
  precision: number;
}): { result: string; savings: number } {
  let svg = input;
  const origLen = svg.length;

  // 1. Remove comments <!-- -->
  if (opts.removeComments) {
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 2. Remove <metadata>...</metadata>
  if (opts.removeMetadata) {
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }

  // 3. Remove editor residual namespaces and attributes
  if (opts.removeEditors) {
    svg = svg.replace(/\s(?:sodipodi|inkscape|sketch|figma):[a-zA-Z0-9_-]+="[^"]*"/g, '');
    svg = svg.replace(/<(?:sodipodi|inkscape):[\s\S]*?<\/(?:sodipodi|inkscape):[^>]+>/g, '');
    svg = svg.replace(/\sid="Layer_\d+"/g, '');
  }

  // 4. Reduce numeric precision
  if (opts.precision < 5) {
    const p = opts.precision;
    svg = svg.replace(/(\d+\.\d{6,})/g, (_, num) => {
      return parseFloat(num).toFixed(p).replace(/\.?0+$/, '');
    });
  }

  // 5. Remove default attributes
  if (opts.removeDefaultAttrs) {
    svg = svg.replace(/\sstroke-width="(?:1|1\.0|0\.?0?)"/g, '');
    svg = svg.replace(/\sstroke-linecap="butt"/g, '');
    svg = svg.replace(/\sstroke-linejoin="miter"/g, '');
    svg = svg.replace(/\sfill="(?:black|#000|#000000|none)"/g, (m) => {
      if (m.includes('none')) return m;
      return '';
    });
    svg = svg.replace(/\sstroke="(?:none|0)"/g, '');
    svg = svg.replace(/\sfont-style="normal"/g, '');
    svg = svg.replace(/\sfont-weight="(?:normal|400)"/g, '');
    svg = svg.replace(/\sfont-family="sans-serif"/g, '');
    svg = svg.replace(/\sclip-rule="nonzero"/g, '');
    svg = svg.replace(/\sfill-rule="nonzero"/g, '');
    svg = svg.replace(/\soverflow="visible"/g, '');
  }

  // 6. Collapse whitespace
  if (opts.collapseWhitespace) {
    svg = svg.replace(/>\s+</g, '><');
    svg = svg.replace(/\s{2,}/g, ' ');
    svg = svg.trim();
  }

  return { result: svg, savings: origLen > 0 ? Math.round((1 - svg.length / origLen) * 100) : 0 };
}

export default function SvgOptimize() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState({
    removeComments: true,
    removeMetadata: true,
    removeEditors: true,
    removeDefaultAttrs: true,
    collapseWhitespace: true,
    precision: 3,
  });

  const { result, savings } = useMemo(() => {
    if (!input.trim()) return { result: '', savings: 0 };
    try {
      return optimizeSvg(input, opts);
    } catch (e) {
      return { result: `// Optimization failed: ${(e as Error).message}`, savings: 0 };
    }
  }, [input, opts]);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  }, []);

  const inputSize = new Blob([input]).size;
  const outSize = new Blob([result]).size;

  const download = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  return (
    <div>
      <div class="tool-card">
        <div class="font-bold mb-md">Optimization Options</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeComments} onChange={e => setOpts({ ...opts, removeComments: e.target.checked })} /> Remove comments
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeMetadata} onChange={e => setOpts({ ...opts, removeMetadata: e.target.checked })} /> Remove metadata
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeEditors} onChange={e => setOpts({ ...opts, removeEditors: e.target.checked })} /> Remove editor residue
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeDefaultAttrs} onChange={e => setOpts({ ...opts, removeDefaultAttrs: e.target.checked })} /> Remove default attributes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.collapseWhitespace} onChange={e => setOpts({ ...opts, collapseWhitespace: e.target.checked })} /> Collapse whitespace
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            Numeric precision
            <select class="select" style={{ width: '80px' }} value={opts.precision} onChange={e => setOpts({ ...opts, precision: Number(e.target.value) })}>
              <option value={1}>1 digit</option>
              <option value={2}>2 digits</option>
              <option value={3}>3 digits</option>
              <option value={4}>4 digits</option>
              <option value={5}>No trim</option>
            </select>
          </label>
        </div>
      </div>

      <div class="tool-card">
        <div class="toolbar">
          <input type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }} id="svg-file" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button class="btn btn-secondary btn-sm" onClick={() => document.getElementById('svg-file')?.click()}>Import SVG File</button>
          {input && (
            <>
              <button class="btn btn-secondary btn-sm" onClick={copy}>Copy Result</button>
              <button class="btn btn-primary btn-sm" onClick={download}>Download Optimized</button>
            </>
          )}
        </div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">Original SVG · {(inputSize / 1024).toFixed(2)} KB</div>
            <textarea
              class="text-area"
              placeholder="Paste SVG code, or click the button above to import a .svg file..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            />
          </div>
          <div>
            <div class="text-xs text-muted mb-md">Optimized · {(outSize / 1024).toFixed(2)} KB{savings > 0 && ` · ${savings}% smaller`}</div>
            <textarea
              class="text-area"
              readOnly
              value={result}
              placeholder="Optimization result will appear here..."
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>

      {input && result && (
        <div class="tool-card">
          <div class="font-bold mb-md">Preview Comparison</div>
          <div class="tool-grid-2">
            <div>
              <div class="text-xs text-muted mb-md">Original Preview</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)' }}
                dangerouslySetInnerHTML={{ __html: input }} />
            </div>
            <div>
              <div class="text-xs text-muted mb-md">Optimized Preview</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)' }}
                dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
