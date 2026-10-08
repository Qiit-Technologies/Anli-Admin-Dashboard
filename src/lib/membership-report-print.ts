import type { ChartDatum } from '@/lib/membership-report-types';
import type { PdfTableSection } from '@/lib/membership-report-pdf';

function escapeHtml(value: unknown) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function legendHtml(data: ChartDatum[]) {
    return data
        .map(
            (d) =>
                `<span class="legend-item"><span class="legend-dot" style="background:${d.fill || '#2563eb'}"></span>${escapeHtml(d.name)} <strong>${escapeHtml(d.value)}</strong></span>`,
        )
        .join('');
}

function barChartHtml(
    title: string,
    description: string,
    data: ChartDatum[],
) {
    if (!data.length) return '';
    const max = Math.max(...data.map((d) => d.value), 1);
    const bars = data
        .map((d) => {
            const pct = Math.round((d.value / max) * 100);
            const color = d.fill || '#2563eb';
            return `
        <div class="bar-row">
          <span class="bar-label">${escapeHtml(d.name)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
          <span class="bar-value">${d.value}</span>
        </div>`;
        })
        .join('');
    return `<div class="chart-block">
      <h3>${escapeHtml(title)}</h3>
      <p class="chart-desc">${escapeHtml(description)}</p>
      <div class="legend">${legendHtml(data)}</div>
      ${bars}
    </div>`;
}

function tableHtml(section: PdfTableSection) {
    if (!section.rows.length) {
        return `<p class="empty">${escapeHtml(section.title)}: no records for selected filters.</p>`;
    }
    const cols = Object.keys(section.rows[0]);
    const head = cols.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    const body = section.rows
        .map(
            (row) =>
                `<tr>${cols.map((c) => `<td>${escapeHtml(row[c])}</td>`).join('')}</tr>`,
        )
        .join('');
    return `
    <section class="report-section">
      <h2>${escapeHtml(section.title)}</h2>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    </section>`;
}

const PRINT_STYLES = `
  body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #111; max-width: 1100px; margin: 0 auto; }
  h1 { margin: 0 0 6px; font-size: 22px; }
  .meta { color: #555; font-size: 12px; margin-bottom: 20px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
  .kpi .label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
  .kpi .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .chart-block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .chart-block h3 { margin: 0 0 6px; font-size: 13px; }
  .chart-desc { margin: 0 0 8px; font-size: 11px; color: #4b5563; line-height: 1.4; }
  .legend { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: 10px; }
  .legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; color: #374151; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .insight { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #0c4a6e; margin-bottom: 16px; }
  .bar-row { display: grid; grid-template-columns: 120px 1fr 36px; gap: 8px; align-items: center; margin-bottom: 8px; font-size: 11px; }
  .bar-track { height: 10px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }
  .bar-value { text-align: right; font-weight: 600; }
  .report-section { margin-top: 24px; break-inside: avoid; }
  .report-section h2 { font-size: 15px; margin: 0 0 8px; border-bottom: 2px solid #111; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
  th { background: #f9fafb; font-size: 9px; text-transform: uppercase; }
  .empty { color: #6b7280; font-size: 12px; }
  @media print { body { padding: 0; } @page { margin: 12mm; } }
`;

export function openMembershipReportPrintWindow(options: {
    title: string;
    businessName: string;
    period: string;
    subtitle: string;
    kpis: { label: string; value: string }[];
    charts: { title: string; description: string; data: ChartDatum[] }[];
    sections: PdfTableSection[];
    insight?: string;
}) {
    const win = window.open('', '_blank');
    if (!win) return;

    const kpiHtml = options.kpis
        .map(
            (k) =>
                `<div class="kpi"><div class="label">${escapeHtml(k.label)}</div><div class="value">${escapeHtml(k.value)}</div></div>`,
        )
        .join('');

    const chartsHtml = options.charts
        .map((c) => barChartHtml(c.title, c.description, c.data))
        .join('');

    const sectionsHtml = options.sections.map(tableHtml).join('');

    win.document.write(`<!doctype html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(options.title)}</title>
<style>${PRINT_STYLES}</style></head><body>
  <h1>${escapeHtml(options.title)}</h1>
  <p class="meta">${escapeHtml(options.businessName)} · ${escapeHtml(options.period)} · Printed ${escapeHtml(new Date().toLocaleString())}</p>
  <p class="meta">${escapeHtml(options.subtitle)}</p>
  ${options.insight ? `<p class="insight"><strong>How to use this report:</strong> ${escapeHtml(options.insight)}</p>` : ''}
  <div class="kpis">${kpiHtml}</div>
  ${chartsHtml ? `<div class="charts">${chartsHtml}</div>` : ''}
  ${sectionsHtml}
  <script>window.onload = function() { window.print(); };</script>
</body></html>`);
    win.document.close();
}
