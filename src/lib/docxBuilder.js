import { Document, Paragraph, TextRun, Packer, BorderStyle } from 'docx';
import { CV_THEME, CV_FONT, looksLikeHeading } from './constants';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------- CV (layout ATS-friendly, mengikuti desain referensi) ---------------- */
export async function buildTailoredCvBlob(cv) {
  const children = [];
  const LINE_SPACING = { line: 288 };

  children.push(
    new Paragraph({
      children: [new TextRun({ text: (cv.name || '').toUpperCase(), bold: true, size: 40, color: CV_THEME.navy, font: CV_FONT })],
      spacing: { after: 70 },
    })
  );
  if (cv.tagline) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.tagline, bold: true, size: 21, color: CV_THEME.tagline, font: CV_FONT })],
        spacing: { after: 90 },
      })
    );
  }
  if (cv.contact) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: cv.contact, size: 18, color: CV_THEME.gray, font: CV_FONT })],
        spacing: { after: 220 },
        border: { bottom: { color: 'CCCCCC', space: 8, style: BorderStyle.SINGLE, size: 4 } },
      })
    );
  }

  const sectionHeading = (title) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: CV_THEME.navy, font: CV_FONT })],
        spacing: { before: 300, after: 140 },
        border: { bottom: { color: CV_THEME.navy, space: 4, style: BorderStyle.SINGLE, size: 4 } },
      })
    );
  };
  const bodyPara = (text) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text, size: 20, color: CV_THEME.black, font: CV_FONT })],
        spacing: { after: 160, ...LINE_SPACING },
      })
    );
  };
  const bulletPara = (b) => {
    const isObj = b && typeof b === 'object';
    const highlight = isObj ? b.highlight || '' : String(b || '');
    const detail = isObj ? b.detail || '' : '';
    const runs = [new TextRun({ text: highlight, bold: true, size: 20, color: CV_THEME.black, font: CV_FONT })];
    if (detail) runs.push(new TextRun({ text: `  —  ${detail}`, size: 20, color: CV_THEME.black, font: CV_FONT }));
    children.push(new Paragraph({ children: runs, bullet: { level: 0 }, spacing: { after: 110, ...LINE_SPACING } }));
  };

  if (cv.summary) {
    sectionHeading('Ringkasan Profil');
    bodyPara(cv.summary);
  }
  if (cv.skills?.length) {
    sectionHeading('Keahlian');
    cv.skills.forEach((s) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${s.category}: `, bold: true, size: 20, color: CV_THEME.black, font: CV_FONT }),
            new TextRun({ text: s.items || '', size: 20, color: CV_THEME.black, font: CV_FONT }),
          ],
          spacing: { after: 130, ...LINE_SPACING },
        })
      );
    });
  }
  if (cv.experience?.length) {
    sectionHeading('Pengalaman Kerja');
    cv.experience.forEach((e, idx) => {
      const metaParts = [e.company, e.location].filter(Boolean).join(' — ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: e.title || '', bold: true, size: 21, color: CV_THEME.black, font: CV_FONT }),
            new TextRun({ text: metaParts ? `  —  ${metaParts}` : '', size: 20, color: CV_THEME.black, font: CV_FONT }),
            new TextRun({ text: e.dates ? `   ${e.dates}` : '', italics: true, size: 19, color: CV_THEME.gray, font: CV_FONT }),
          ],
          spacing: { before: idx === 0 ? 20 : 200, after: 90 },
        })
      );
      (e.bullets || []).forEach(bulletPara);
    });
  }
  if (cv.projects?.length) {
    sectionHeading('Proyek Pilihan');
    cv.projects.forEach((p, idx) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.title || '', bold: true, size: 21, color: CV_THEME.black, font: CV_FONT })],
          spacing: { before: idx === 0 ? 20 : 160, after: 90 },
        })
      );
      (p.bullets || []).forEach(bulletPara);
    });
  }
  if (cv.education?.length) {
    sectionHeading('Pendidikan');
    cv.education.forEach((ed) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ed.degree || '', bold: true, size: 20, color: CV_THEME.black, font: CV_FONT }),
            new TextRun({ text: ed.detail ? `  —  ${ed.detail}` : '', size: 20, color: CV_THEME.black, font: CV_FONT }),
          ],
          spacing: { after: 130, ...LINE_SPACING },
        })
      );
    });
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: CV_FONT, size: 20 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } }, children }],
  });
  return await Packer.toBlob(doc);
}

function htmlEscape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildTailoredCvDocFallback(cv) {
  const navy = '#' + CV_THEME.navy, tagline = '#' + CV_THEME.tagline, gray = '#' + CV_THEME.gray;
  const FF = 'font-family:Calibri,Arial,sans-serif;';
  let body = `<h1 style="${FF} color:${navy}; font-size:20pt; margin:0 0 5px 0;">${htmlEscape((cv.name || '').toUpperCase())}</h1>`;
  if (cv.tagline) body += `<p style="${FF} color:${tagline}; font-weight:bold; font-size:10.5pt; margin:0 0 8px 0;">${htmlEscape(cv.tagline)}</p>`;
  if (cv.contact) body += `<p style="${FF} color:${gray}; font-size:9pt; margin:0 0 16px 0; border-bottom:1px solid #ccc; padding-bottom:10px;">${htmlEscape(cv.contact)}</p>`;

  const heading = (t) => `<h2 style="${FF} color:${navy}; font-size:11pt; border-bottom:1px solid ${navy}; padding-bottom:3px; margin:20px 0 10px 0;">${htmlEscape(t.toUpperCase())}</h2>`;
  const para = (t) => `<p style="${FF} font-size:10pt; line-height:1.5; margin:0 0 10px 0;">${htmlEscape(t)}</p>`;
  const bullet = (b) => {
    const isObj = b && typeof b === 'object';
    const highlight = isObj ? b.highlight || '' : String(b || '');
    const detail = isObj ? b.detail || '' : '';
    return `<li style="${FF} font-size:10pt; line-height:1.5; margin-bottom:6px;"><b>${htmlEscape(highlight)}</b>${detail ? '  —  ' + htmlEscape(detail) : ''}</li>`;
  };

  if (cv.summary) body += heading('Ringkasan Profil') + para(cv.summary);
  if (cv.skills?.length) {
    body += heading('Keahlian');
    cv.skills.forEach((s) => {
      body += `<p style="${FF} font-size:10pt; line-height:1.5; margin:0 0 8px 0;"><b>${htmlEscape(s.category)}:</b> ${htmlEscape(s.items || '')}</p>`;
    });
  }
  if (cv.experience?.length) {
    body += heading('Pengalaman Kerja');
    cv.experience.forEach((e) => {
      const meta = [e.company, e.location].filter(Boolean).join(' — ');
      body += `<p style="${FF} font-size:10pt; margin:14px 0 5px 0;"><b>${htmlEscape(e.title || '')}</b>${meta ? '  —  ' + htmlEscape(meta) : ''} <i style="color:${gray};">${e.dates ? '  ' + htmlEscape(e.dates) : ''}</i></p>`;
      if (e.bullets?.length) body += `<ul style="margin:0 0 10px 0; padding-left:20px;">${e.bullets.map(bullet).join('')}</ul>`;
    });
  }
  if (cv.projects?.length) {
    body += heading('Proyek Pilihan');
    cv.projects.forEach((p) => {
      body += `<p style="${FF} font-size:10pt; margin:12px 0 5px 0;"><b>${htmlEscape(p.title || '')}</b></p>`;
      if (p.bullets?.length) body += `<ul style="margin:0 0 10px 0; padding-left:20px;">${p.bullets.map(bullet).join('')}</ul>`;
    });
  }
  if (cv.education?.length) {
    body += heading('Pendidikan');
    cv.education.forEach((ed) => {
      body += `<p style="${FF} font-size:10pt; line-height:1.5; margin:0 0 8px 0;"><b>${htmlEscape(ed.degree || '')}</b>${ed.detail ? '  —  ' + htmlEscape(ed.detail) : ''}</p>`;
    });
  }

  const htmlDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>CV</title><style>body{${FF}}</style></head>
<body>${body}</body></html>`;
  return new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
}

export async function downloadTailoredCvDocx(cv, filename) {
  try {
    const blob = await buildTailoredCvBlob(cv);
    triggerDownload(blob, filename);
  } catch (err) {
    console.warn('Gagal membuat CV .docx via library, memakai fallback HTML→.doc:', err);
    triggerDownload(buildTailoredCvDocFallback(cv), filename.replace(/\.docx$/i, '.doc'));
  }
}

/* ---------------- Cover Letter (paragraf polos, deteksi heading sederhana) ---------------- */
export async function buildCoverLetterBlob(text) {
  const lines = String(text).split('\n');
  const paragraphs = lines.map((raw) => {
    const line = raw.trim();
    if (!line) return new Paragraph({ text: '', spacing: { after: 100 } });
    if (looksLikeHeading(line)) {
      return new Paragraph({
        children: [new TextRun({ text: line, bold: true, size: 24, font: CV_FONT })],
        spacing: { before: 220, after: 120 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: line, size: 22, font: CV_FONT })],
      spacing: { after: 160, line: 288 },
    });
  });
  const doc = new Document({
    styles: { default: { document: { run: { font: CV_FONT, size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } }, children: paragraphs }],
  });
  return await Packer.toBlob(doc);
}

function buildCoverLetterDocFallback(text) {
  const lines = String(text).split('\n');
  const bodyHtml = lines
    .map((raw) => {
      const line = raw.trim();
      if (!line) return `<p style="margin:0 0 10px 0;">&nbsp;</p>`;
      if (looksLikeHeading(line)) {
        return `<p style="margin:18px 0 8px 0; font-weight:bold; font-size:13pt; font-family:Calibri,Arial,sans-serif;">${htmlEscape(line)}</p>`;
      }
      return `<p style="margin:0 0 10px 0; font-size:11pt; line-height:1.5; font-family:Calibri,Arial,sans-serif;">${htmlEscape(line)}</p>`;
    })
    .join('');
  const htmlDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Dokumen</title><style>body{font-family:Calibri,Arial,sans-serif;}</style></head>
<body>${bodyHtml}</body></html>`;
  return new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
}

export async function downloadAsDocx(text, filename) {
  try {
    const blob = await buildCoverLetterBlob(text);
    triggerDownload(blob, filename);
  } catch (err) {
    console.warn('Gagal membuat .docx via library, memakai fallback HTML→.doc:', err);
    triggerDownload(buildCoverLetterDocFallback(text), filename.replace(/\.docx$/i, '.doc'));
  }
}

export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
