/**
 * Branded HTML email templates for Makina Masters notifications.
 */

const baseStyle = `
  body { margin:0; padding:0; background:#0a0a1a; font-family:'Segoe UI',Roboto,sans-serif; }
  .container { max-width:600px; margin:0 auto; background:#12122a; border-radius:16px; overflow:hidden; border:1px solid rgba(124,58,237,0.2); }
  .header { background:linear-gradient(135deg,#7c3aed,#06b6d4); padding:32px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:24px; letter-spacing:1px; }
  .header p { color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px; }
  .body { padding:32px; color:#e2e8f0; }
  .body h2 { color:#c4b5fd; margin:0 0 16px; font-size:20px; }
  .body p { line-height:1.6; margin:8px 0; }
  .badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:13px; font-weight:600; }
  .badge-pending { background:rgba(245,158,11,0.2); color:#fbbf24; }
  .badge-approved { background:rgba(16,185,129,0.2); color:#34d399; }
  .badge-rejected { background:rgba(239,68,68,0.2); color:#f87171; }
  .badge-returned { background:rgba(99,102,241,0.2); color:#a5b4fc; }
  .items-table { width:100%; border-collapse:collapse; margin:16px 0; }
  .items-table th { text-align:left; padding:10px 12px; color:#94a3b8; font-size:13px; border-bottom:1px solid rgba(124,58,237,0.15); }
  .items-table td { padding:10px 12px; color:#e2e8f0; font-size:14px; border-bottom:1px solid rgba(255,255,255,0.05); }
  .footer { padding:24px 32px; text-align:center; color:#64748b; font-size:12px; border-top:1px solid rgba(255,255,255,0.05); }
`;

function wrapTemplate(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyle}</style></head><body><div class="container">${content}</div></body></html>`;
}

function newRequestEmail(request) {
  const itemRows = request.items
    .map((ri) => `<tr><td>${ri.item.name}</td><td style="text-align:center">${ri.quantity}</td></tr>`)
    .join('');

  return wrapTemplate(`
    <div class="header">
      <h1>MAKINA MASTERS</h1>
      <p>New Inventory Request</p>
    </div>
    <div class="body">
      <h2>📦 Request from ${request.user.displayName}</h2>
      <p><strong>Project:</strong> ${request.projectName}</p>
      <p>${request.projectDescription}</p>
      <table class="items-table">
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="margin-top:24px;color:#94a3b8;">Login to the dashboard to approve or reject this request.</p>
    </div>
    <div class="footer">Makina Masters Inventory System &bull; 1337 MED</div>
  `);
}

function statusUpdateEmail(request) {
  const statusClass = `badge-${request.status.toLowerCase()}`;
  const statusLabel = request.status.charAt(0) + request.status.slice(1).toLowerCase();

  const itemRows = request.items
    .map((ri) => `<tr><td>${ri.item.name}</td><td style="text-align:center">${ri.quantity}</td></tr>`)
    .join('');

  return wrapTemplate(`
    <div class="header">
      <h1>MAKINA MASTERS</h1>
      <p>Request Status Update</p>
    </div>
    <div class="body">
      <h2>Your request has been updated</h2>
      <p><strong>Project:</strong> ${request.projectName}</p>
      <p><strong>Status:</strong> <span class="${statusClass} badge">${statusLabel}</span></p>
      ${request.staffNote ? `<p><strong>Staff Note:</strong> ${request.staffNote}</p>` : ''}
      <table class="items-table">
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
    <div class="footer">Makina Masters Inventory System &bull; 1337 MED</div>
  `);
}

module.exports = { newRequestEmail, statusUpdateEmail };
