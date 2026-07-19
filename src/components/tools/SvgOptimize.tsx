import { useState, useMemo, useCallback } from 'react';

// SVG 优化器：浏览器端实现 SVGO 核心策略
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

  // 1. 移除注释 <!-- -->
  if (opts.removeComments) {
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 2. 移除 <metadata>...</metadata>
  if (opts.removeMetadata) {
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }

  // 3. 移除编辑器残留命名与属性
  if (opts.removeEditors) {
    // sodipodi/inkscape 命名空间属性
    svg = svg.replace(/\s(?:sodipodi|inkscape|sketch|figma):[a-zA-Z0-9_-]+="[^"]*"/g, '');
    // 编辑器元数据元素
    svg = svg.replace(/<(?:sodipodi|inkscape):[\s\S]*?<\/(?:sodipodi|inkscape):[^>]+>/g, '');
    // id="Layer_1" 等设计软件层名（保留功能性 id）
    svg = svg.replace(/\sid="Layer_\d+"/g, '');
  }

  // 4. 降低数值精度：处理 d 属性、points、坐标等
  if (opts.precision < 5) {
    const p = opts.precision;
    svg = svg.replace(/(\d+\.\d{6,})/g, (_, num) => {
      return parseFloat(num).toFixed(p).replace(/\.?0+$/, '');
    });
  }

  // 5. 移除默认属性
  if (opts.removeDefaultAttrs) {
    // 常见默认值
    svg = svg.replace(/\sstroke-width="(?:1|1\.0|0\.?0?)"/g, '');
    svg = svg.replace(/\sstroke-linecap="butt"/g, '');
    svg = svg.replace(/\sstroke-linejoin="miter"/g, '');
    svg = svg.replace(/\sfill="(?:black|#000|#000000|none)"/g, (m, g1) => {
      // fill="none" 不能移除，会影响渲染
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

  // 6. 折叠空白
  if (opts.collapseWhitespace) {
    // 标签之间的空白
    svg = svg.replace(/>\s+</g, '><');
    // 属性间多余空格
    svg = svg.replace(/\s{2,}/g, ' ');
    // 首尾空白
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
      return { result: `// 优化失败：${(e as Error).message}`, savings: 0 };
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
        <div class="font-bold mb-md">优化选项</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeComments} onChange={e => setOpts({ ...opts, removeComments: e.target.checked })} /> 移除注释
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeMetadata} onChange={e => setOpts({ ...opts, removeMetadata: e.target.checked })} /> 移除 metadata
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeEditors} onChange={e => setOpts({ ...opts, removeEditors: e.target.checked })} /> 移除编辑器残留
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.removeDefaultAttrs} onChange={e => setOpts({ ...opts, removeDefaultAttrs: e.target.checked })} /> 移除默认属性
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={opts.collapseWhitespace} onChange={e => setOpts({ ...opts, collapseWhitespace: e.target.checked })} /> 折叠空白
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            数值精度
            <select class="select" style={{ width: '80px' }} value={opts.precision} onChange={e => setOpts({ ...opts, precision: Number(e.target.value) })}>
              <option value={1}>1 位</option>
              <option value={2}>2 位</option>
              <option value={3}>3 位</option>
              <option value={4}>4 位</option>
              <option value={5}>不裁剪</option>
            </select>
          </label>
        </div>
      </div>

      <div class="tool-card">
        <div class="toolbar">
          <input type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }} id="svg-file" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button class="btn btn-secondary btn-sm" onClick={() => document.getElementById('svg-file')?.click()}>导入 SVG 文件</button>
          {input && (
            <>
              <button class="btn btn-secondary btn-sm" onClick={copy}>复制结果</button>
              <button class="btn btn-primary btn-sm" onClick={download}>下载优化版</button>
            </>
          )}
        </div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">原始 SVG · {(inputSize / 1024).toFixed(2)} KB</div>
            <textarea
              class="text-area"
              placeholder="粘贴 SVG 代码，或点击上方按钮导入 .svg 文件..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            />
          </div>
          <div>
            <div class="text-xs text-muted mb-md">优化后 · {(outSize / 1024).toFixed(2)} KB{savings > 0 && ` · 减小 ${savings}%`}</div>
            <textarea
              class="text-area"
              readOnly
              value={result}
              placeholder="优化结果将在此显示..."
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>

      {input && result && (
        <div class="tool-card">
          <div class="font-bold mb-md">预览对比</div>
          <div class="tool-grid-2">
            <div>
              <div class="text-xs text-muted mb-md">原始预览</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)' }}
                dangerouslySetInnerHTML={{ __html: input }} />
            </div>
            <div>
              <div class="text-xs text-muted mb-md">优化后预览</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', background: 'var(--bg-soft)' }}
                dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
