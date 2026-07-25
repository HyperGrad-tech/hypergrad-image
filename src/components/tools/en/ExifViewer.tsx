import { useState, useRef, useCallback } from 'react';
import exifr from 'exifr';

interface ExifData {
  [key: string]: any;
}

export default function ExifViewer() {
  const [exif, setExif] = useState<ExifData | null | undefined>(undefined);
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '(empty)';
    if (val instanceof Date) return val.toLocaleString('en-US');
    if (typeof val === 'number') {
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
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setFileName(file.name);
    setImgSrc(URL.createObjectURL(file));
    setExif(undefined);
    try {
      const data = await exifr.parse(file, { gps: true, tiff: true, exif: true, ifd0: true, ifd1: true, iptc: true, xmp: true });
      setExif(data ?? null);
    } catch (e) {
      setError('EXIF parsing failed. This image may not contain EXIF data.');
    }
  }, []);

  const gpsStr = exif && exif.latitude && exif.longitude ? formatGps(exif.latitude, exif.longitude) : '';

  // Grouped display
  const groups: { title: string; keys: string[] }[] = [
    { title: 'Camera Settings', keys: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'ExposureMode', 'WhiteBalance', 'Flash'] },
    { title: 'Timestamps', keys: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'] },
    { title: 'Image Info', keys: ['ImageWidth', 'ImageHeight', 'BitsPerSample', 'ColorSpace', 'Orientation'] },
    { title: 'GPS Location', keys: ['latitude', 'longitude', 'GPSAltitude'] },
    { title: 'Software Info', keys: ['Software', 'Artist', 'Copyright'] },
  ];

  return (
    <div>
      <div class="tool-card">
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {!imgSrc ? (
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '60px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>ℹ</div>
            <div class="font-bold" style={{ color: 'var(--text)', marginBottom: '6px' }}>Click to select a photo</div>
            <div class="text-sm">Supports JPG / TIFF / HEIC / PNG etc., parsed locally with no upload</div>
          </div>
        ) : (
          <div class="toolbar">
            <button class="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>Replace photo</button>
            <span class="text-muted text-sm">{fileName}</span>
          </div>
        )}
      </div>

      {imgSrc && (
        <div class="tool-grid-2">
          <div class="tool-card">
            <div class="font-bold mb-md">Photo Preview</div>
            <img src={imgSrc} alt={fileName} style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
          </div>
          <div class="tool-card">
            {error ? (
              <div class="status-msg status-error">{error}</div>
            ) : exif === undefined ? (
              <div class="text-muted">Parsing...</div>
            ) : Object.keys(exif).length === 0 ? (
              <div class="status-msg status-info">This photo contains no EXIF metadata. It may have been compressed by a social platform or had metadata stripped during export.</div>
            ) : (
              <>
                <div class="font-bold mb-md">EXIF Metadata</div>
                {gpsStr && (
                  <div class="status-msg status-success mb-md">
                    📍 GPS Location: {gpsStr}
                    <a href={`https://maps.google.com/?q=${exif.latitude},${exif.longitude}`} target="_blank" rel="noopener" style={{ marginLeft: '8px' }}>View on map →</a>
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
                {/* Other unclassified fields */}
                {Object.keys(exif).filter(k => !groups.flatMap(g => g.keys).includes(k)).length > 0 && (
                  <div>
                    <div class="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Other Fields</div>
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

      {exif && !error && Object.keys(exif).length > 0 && (
        <div class="tool-card">
          <div class="font-bold mb-md">Found Sensitive Information?</div>
          <div class="status-msg status-info">
            <span>This photo contains {Object.keys(exif).length} metadata fields{gpsStr ? ', including GPS location that reveals where you are' : ''}. We recommend removing EXIF before sharing.</span>
            <a href="/en/exif-remover" class="btn btn-primary btn-sm" style={{ marginLeft: '12px' }}>Remove EXIF →</a>
          </div>
        </div>
      )}
    </div>
  );
}
