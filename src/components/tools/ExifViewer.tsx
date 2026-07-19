import { useState, useRef, useCallback } from 'react';
import exifr from 'exifr';

interface ExifData {
  [key: string]: any;
}

export default function ExifViewer() {
  const [exif, setExif] = useState<ExifData | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '(空)';
    if (val instanceof Date) return val.toLocaleString('zh-CN');
    if (typeof val === 'number') {
      // 部分参数需要除以分母
      return Number.isFinite(val) ? val.toString() : val.toString();
    }
    if (typeof val === 'object') {
      if (val.numerator !== undefined && val.denominator !== undefined) {
        const num = val.numerator / val.denominator;
        return `${num} (${val.numerator}/${val.denominator})`;
      }
      if (val.value !== undefined) return formatValue(val.value);
      if (val.description !== undefined) return val.description;
      if (Array.isArray(val)) return val.map(formatValue).join(', ');
      return JSON.stringify(val);
    }
    return String(val);
  };

  const formatGps = (latitude: number, longitude: number): string => {
    if (!latitude || !longitude) return '';
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lonDir}`;
  };

  const handleFile = useCallback(async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) { setError('请选择图片文件'); return; }
    setFileName(file.name);
    setImgSrc(URL.createObjectURL(file));
    setExif(null);
    try {
      const data = await exifr.parse(file, { gps: true, tiff: true, exif: true, ifd0: true, ifd1: true, iptc: true, xmp: true });
      setExif(data || null);
    } catch (e) {
      setError('EXIF 解析失败，此图片可能不包含 EXIF 数据');
    }
  }, []);

  const gpsStr = exif && exif.latitude && exif.longitude ? formatGps(exif.latitude, exif.longitude) : '';

  // 分组展示
  const groups: { title: string; keys: string[] }[] = [
    { title: '拍摄参数', keys: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'ExposureMode', 'WhiteBalance', 'Flash'] },
    { title: '时间信息', keys: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'] },
    { title: '图像信息', keys: ['ImageWidth', 'ImageHeight', 'BitsPerSample', 'ColorSpace', 'Orientation'] },
    { title: 'GPS 定位', keys: ['latitude', 'longitude', 'GPSAltitude'] },
    { title: '软件信息', keys: ['Software', 'Artist', 'Copyright'] },
  ];

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {!imgSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>ℹ</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>点击选择照片</div>
            <div class="text-sm">支持 JPG / TIFF / HEIC / PNG 等，本地解析不上传</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>更换照片</button>
            <span class="text-muted text-sm">{fileName}</span>
          </div>
        )}
      </div>

      {imgSrc && (
        <div class="tool-grid-2">
          <div class="tool-card">
            <div class="font-bold mb-md">照片预览</div>
            <img src={imgSrc} alt={fileName} style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
          </div>
          <div class="tool-card">
            {error ? (
              <div class="status-msg status-error">{error}</div>
            ) : exif === null ? (
              <div class="text-muted">解析中...</div>
            ) : Object.keys(exif).length === 0 ? (
              <div class="status-msg status-info">此照片不包含 EXIF 元数据。可能经过社交平台压缩或软件导出时剥离了元数据。</div>
            ) : (
              <>
                <div class="font-bold mb-md">EXIF 元数据</div>
                {gpsStr && (
                  <div class="status-msg status-success mb-md">
                    📍 GPS 定位：{gpsStr}
                    <a href={`https://maps.google.com/?q=${exif.latitude},${exif.longitude}`} target="_blank" rel="noopener" style={{ marginLeft: '8px' }}>在地图查看 →</a>
                  </div>
                )}
                {groups.map(g => {
                  const items = g.keys.filter(k => exif[k] !== undefined && exif[k] !== null && exif[k] !== '');
                  if (items.length === 0) return null;
                  return (
                    <div key={g.title} style={{ marginBottom: '16px' }}>
                      <div class="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{g.title}</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          {items.map(k => (
                            <tr key={k} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '6px 8px', color: 'var(--text-muted)', width: '40%' }}>{k}</td>
                              <td style={{ padding: '6px 8px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{formatValue(exif[k])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
                {/* 其他未分类字段 */}
                {Object.keys(exif).filter(k => !groups.flatMap(g => g.keys).includes(k)).length > 0 && (
                  <div>
                    <div class="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>其他字段</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <tbody>
                        {Object.keys(exif).filter(k => !groups.flatMap(g => g.keys).includes(k)).map(k => (
                          <tr key={k} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '6px 8px', color: 'var(--text-muted)', width: '40%' }}>{k}</td>
                            <td style={{ padding: '6px 8px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{formatValue(exif[k])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {exif && !error && (
        <div class="tool-card">
          <div class="font-bold mb-md">发现敏感信息？</div>
          <div class="status-msg status-info">
            <span>这张照片包含 {Object.keys(exif).length} 项元数据{gpsStr ? '，其中 GPS 定位会泄露你的位置' : ''}。分享前建议用 EXIF 清理工具移除。</span>
            <a href="/exif-remover" class="btn btn-primary btn-sm" style={{ marginLeft: '12px' }}>去清理 EXIF →</a>
          </div>
        </div>
      )}
    </div>
  );
}
