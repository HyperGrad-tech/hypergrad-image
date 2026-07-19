import { useState, useMemo, useEffect, useRef } from 'react';

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#2D5F8A" />
  <circle cx="50" cy="50" r="20" fill="#fff" />
</svg>`;

export default function SvgEditor() {
  const [code, setCode] = useState(DEFAULT_SVG);
  const [error, setError] = useState('');
  const [size, setSize] = useState({ w: 200, h: 200 });
  const previewRef = useRef<HTMLDivElement>(null);

  // 解析 viewBox 获取比例
  useEffect(() => {
    const m = code.match(/viewBox="([^"]+)"/);
    if (m) {
      const parts = m[1].split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        const ratio = parts[2] / parts[3];
        setSize({ w: ratio >= 1 ? 300 : 300 * ratio, h: ratio >= 1 ? 300 / ratio : 300 });
      }
    }
    // 验证 SVG
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      setError(parseError ? 'XML 语法错误，请检查标签闭合' : '');
    } catch {
      setError('解析失败');
    }
  }, [code]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCode(reader.result as string);
    reader.readAsText(file);
  };

  const download = () => {
    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCode = () => {
    try {
      // 简单格式化：标签换行 + 缩进
      let formatted = code.replace(/></g, '>\n<');
      const lines = formatted.split('\n');
      let depth = 0;
      const result = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) depth = Math.max(0, depth - 1);
        const out = '  '.repeat(depth) + trimmed;
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
          depth++;
        }
        return out;
      });
      setCode(result.join('\n'));
    } catch (e) {
      setError('格式化失败');
    }
  };

  return (
    <div>
      <div class="tool-card">
        <div class="toolbar">
          <input type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }} id="svg-import" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button class="btn btn-secondary btn-sm" onClick={() => document.getElementById('svg-import')?.click()}>导入 SVG</button>
          <button class="btn btn-secondary btn-sm" onClick={formatCode}>格式化代码</button>
          <button class="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(code)}>复制</button>
          <button class="btn btn-primary btn-sm" onClick={download}>下载 SVG</button>
          <button class="btn btn-ghost btn-sm" onClick={() => setCode(DEFAULT_SVG)}>重置示例</button>
        </div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">SVG 源码（可编辑）</div>
            <textarea
              class="text-area"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellcheck={false}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', minHeight: '400px' }}
            />
            {error && <div class="status-msg status-error mt-md">{error}</div>}
          </div>
          <div>
            <div class="text-xs text-muted mb-md">实时预览</div>
            <div ref={previewRef} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', background: 'var(--bg-soft)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: error ? '<span style="color:var(--text-muted)">修正语法错误后预览</span>' : code }} />
            <div class="text-xs text-muted mt-md">预览尺寸 {Math.round(size.w)}×{Math.round(size.h)} · {(new Blob([code]).size / 1024).toFixed(2)} KB</div>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="font-bold mb-md">SVG 语法速查</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div><code style={{ background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: '4px' }}>&lt;path d="M0,0 L100,100"/&gt;</code><br /><span class="text-muted">路径：M 移动 L 直线</span></div>
          <div><code style={{ background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: '4px' }}>&lt;rect x="0" y="0" width="50" height="50"/&gt;</code><br /><span class="text-muted">矩形</span></div>
          <div><code style={{ background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: '4px' }}>&lt;circle cx="50" cy="50" r="40"/&gt;</code><br /><span class="text-muted">圆形</span></div>
          <div><code style={{ background: 'var(--bg-soft)', padding: '2px 6px', borderRadius: '4px' }}>fill="#2D5F8A" stroke="#fff"</code><br /><span class="text-muted">填充与描边</span></div>
        </div>
      </div>
    </div>
  );
}
