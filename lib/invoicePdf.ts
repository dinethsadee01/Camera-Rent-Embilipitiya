import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency, formatDate, getRentalDays } from './utils';
import type { BookingWithRelations } from './types';

async function getLogoBase64(): Promise<string> {
  try {
    const [asset] = await Asset.loadAsync(require('@/assets/Logo-black.png'));
    if (!asset.localUri) return '';
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  } catch {
    return '';
  }
}

function buildHtml(b: BookingWithRelations, logoSrc: string): string {
  const days = getRentalDays(b.start_date, b.end_date);
  const primaryItems = (b.booking_items ?? []).filter((bi) => !bi.is_free);
  const freeItems = (b.booking_items ?? []).filter((bi) => bi.is_free);

  const issuedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // ── Item rows ──────────────────────────────────────────────
  const itemRows = primaryItems.map((bi) => {
    const name = bi.item?.name ?? bi.custom_name ?? 'Item';
    const qty = bi.quantity;
    const rate = Number(bi.daily_rate);
    const amount = rate * qty * days;
    return `
      <tr>
        <td class="bold">${name}</td>
        <td class="center">${qty}</td>
        <td class="right">${formatCurrency(rate)}</td>
        <td class="center">${days}</td>
        <td class="right bold">${formatCurrency(amount)}</td>
      </tr>`;
  }).join('');

  // ── Free items ─────────────────────────────────────────────
  const freeHtml = freeItems.length > 0 ? `
    <div class="free-box">
      <span class="free-badge">Complimentary</span>
      <span class="free-text">${freeItems.map((bi) => bi.custom_name ?? bi.item?.name ?? 'Item').join(' · ')}</span>
    </div>` : '';

  // ── Summary ────────────────────────────────────────────────
  const subtotal = primaryItems.reduce((s, bi) => s + Number(bi.daily_rate) * bi.quantity * days, 0);
  const discountAmount = Number(b.discount_amount ?? 0);
  const total = Number(b.total_price);

  const subtotalRow = discountAmount > 0
    ? `<div class="sum-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>` : '';

  const discountLabel = b.discount_type === 'percentage' && b.discount_value
    ? `Discount (${b.discount_value}%)`
    : 'Discount';
  const discountRow = discountAmount > 0
    ? `<div class="sum-row disc"><span>${discountLabel}</span><span>− ${formatCurrency(discountAmount)}</span></div>` : '';

  // ── Payment ────────────────────────────────────────────────
  const statusColors: Record<string, string> = {
    paid: '#16a34a', partial: '#d97706', pending: '#d61e30',
  };
  const statusLabels: Record<string, string> = {
    paid: 'Paid in Full', partial: 'Partial Payment', pending: 'Payment Pending',
  };
  const statusColor = statusColors[b.payment_status] ?? '#555';
  const statusLabel = statusLabels[b.payment_status] ?? b.payment_status;

  const methodRow = b.payment_method
    ? `<div class="pay-row"><span class="k">Method</span><span class="v">${b.payment_method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span></div>`
    : '';

  const advanceRow = Number(b.advance_amount) > 0
    ? `<div class="pay-row"><span class="k">Advance Paid</span><span class="v">${formatCurrency(Number(b.advance_amount))}</span></div>`
    : '';

  const outstanding = b.payment_status === 'partial' ? total - Number(b.advance_amount) : 0;
  const balanceHtml = outstanding > 0 ? `
    <div class="balance">
      <span class="bk">Balance Due on Return</span>
      <span class="bv">${formatCurrency(outstanding)}</span>
    </div>` : '';

  // ── Notes ──────────────────────────────────────────────────
  const notesHtml = b.notes ? `
    <div class="notes">
      <div class="notes-label">Notes</div>
      <p>${b.notes}</p>
    </div>` : '';

  // ── Customer ───────────────────────────────────────────────
  const customerLines = [
    b.customer?.customer_code,
    b.customer?.phone,
    b.customer?.address,
  ].filter(Boolean).join('<br>');

  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" class="logo" alt="Camera Rent">`
    : `<div class="logo-text">Camera Rent</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff}
  .page{width:100%;padding:14mm 15mm 12mm;min-height:297mm}

  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;
          border-bottom:3px solid #d61e30;padding-bottom:14px;margin-bottom:20px}
  .logo{height:58px;object-fit:contain}
  .logo-text{font-size:22px;font-weight:700;color:#d61e30}
  .inv-meta{text-align:right}
  .inv-meta h1{font-size:28px;font-weight:700;color:#d61e30;letter-spacing:3px}
  .inv-meta .code{font-family:monospace;font-size:13px;color:#555;margin-top:4px}
  .inv-meta .issued{font-size:10px;color:#aaa;margin-top:2px}

  /* Info grid */
  .info-grid{display:flex;justify-content:space-between;margin-bottom:18px;gap:16px}
  .info-box{max-width:48%}
  .info-box.right{text-align:right}
  .info-box .lbl{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                  letter-spacing:1px;display:block;margin-bottom:5px}
  .info-box .name{font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:3px}
  .info-box p{font-size:11px;color:#555;line-height:1.8}

  /* Period */
  .period{background:#fff5f5;border:1.5px solid #fca5a5;border-radius:8px;
           padding:12px 16px;margin-bottom:20px;display:flex;align-items:center}
  .period-item{flex:1}
  .period-item .lbl{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                     letter-spacing:1px;display:block;margin-bottom:3px}
  .period-item .val{font-size:13px;font-weight:600;color:#1a1a1a}
  .arrow{font-size:20px;color:#d61e30;padding:0 18px;font-weight:300}
  .days-box{text-align:right}
  .days-box .big{font-size:30px;font-weight:700;color:#d61e30;line-height:1}
  .days-box .sm{font-size:10px;color:#888;margin-top:1px}

  /* Section label */
  .sec{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
        letter-spacing:1px;margin-bottom:8px}

  /* Table */
  table{width:100%;border-collapse:collapse;margin-bottom:12px}
  thead tr{background:#d61e30}
  thead th{color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;
            letter-spacing:.5px;padding:8px 10px;text-align:left}
  tbody tr:nth-child(even){background:#fafafa}
  tbody tr{border-bottom:1px solid #f0f0f0}
  tbody td{padding:9px 10px;font-size:11px;color:#444}
  td.center{text-align:center}
  td.right{text-align:right}
  td.bold{font-weight:600;color:#1a1a1a}

  /* Free items */
  .free-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;
             padding:9px 13px;margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .free-badge{background:#16a34a;color:#fff;font-size:8px;font-weight:700;
               text-transform:uppercase;letter-spacing:.5px;padding:3px 8px;
               border-radius:3px;white-space:nowrap}
  .free-text{font-size:11px;color:#166534}

  /* Summary */
  .sum-wrap{display:flex;justify-content:flex-end;margin-bottom:20px}
  .sum{width:230px}
  .sum-row{display:flex;justify-content:space-between;padding:5px 0;
            border-bottom:1px solid #f0f0f0;font-size:11px;color:#555}
  .sum-row.disc{color:#16a34a}
  .sum-row.total{border-top:2.5px solid #d61e30;border-bottom:none;
                  padding-top:10px;margin-top:4px}
  .sum-row.total .tl{font-size:14px;font-weight:700;color:#1a1a1a}
  .sum-row.total .ta{font-size:20px;font-weight:700;color:#d61e30}

  /* Payment */
  .pay-box{border:1px solid #e5e7eb;border-radius:8px;padding:13px 15px;margin-bottom:18px}
  .pay-box .lbl{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                 letter-spacing:1px;display:block;margin-bottom:10px}
  .pay-row{display:flex;justify-content:space-between;font-size:11px;padding:3px 0}
  .pay-row .k{color:#888}
  .pay-row .v{font-weight:600;color:#1a1a1a}
  .balance{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;
             padding:9px 13px;margin-top:10px;display:flex;
             justify-content:space-between;align-items:center}
  .balance .bk{font-size:11px;font-weight:600;color:#92400e}
  .balance .bv{font-size:14px;font-weight:700;color:#92400e}

  /* Notes */
  .notes{background:#f9fafb;border-left:3px solid #d61e30;padding:9px 13px;
          margin-bottom:18px;border-radius:0 6px 6px 0}
  .notes-label{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                letter-spacing:1px;margin-bottom:4px}
  .notes p{font-size:11px;color:#555;line-height:1.6}

  /* Footer */
  .footer{border-top:1px solid #e5e7eb;padding-top:14px;text-align:center;margin-top:auto}
  .footer .ty{font-size:13px;font-weight:600;color:#d61e30;margin-bottom:4px}
  .footer p{font-size:10px;color:#bbb;line-height:1.7}
</style>
</head>
<body>
<div class="page">

  <div class="header">
    ${logoHtml}
    <div class="inv-meta">
      <h1>INVOICE</h1>
      <div class="code">${b.booking_code}</div>
      <div class="issued">Issued: ${issuedDate}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <span class="lbl">Bill To</span>
      <div class="name">${b.customer?.full_name ?? ''}</div>
      <p>${customerLines}</p>
    </div>
    <div class="info-box right">
      <span class="lbl">From</span>
      <div class="name">Camera Rent Embilipitiya</div>
      <p>Embilipitiya, Sri Lanka</p>
    </div>
  </div>

  <div class="period">
    <div class="period-item">
      <span class="lbl">Pickup Date</span>
      <span class="val">${formatDate(b.start_date)}</span>
    </div>
    <span class="arrow">→</span>
    <div class="period-item">
      <span class="lbl">Return Date</span>
      <span class="val">${formatDate(b.end_date)}</span>
    </div>
    <div class="days-box">
      <div class="big">${days}</div>
      <div class="sm">day${days !== 1 ? 's' : ''}</div>
    </div>
  </div>

  <p class="sec">Rental Items</p>
  <table>
    <thead>
      <tr>
        <th style="width:40%">Item</th>
        <th style="width:9%;text-align:center">Qty</th>
        <th style="width:19%;text-align:right">Rate / Day</th>
        <th style="width:9%;text-align:center">Days</th>
        <th style="width:23%;text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  ${freeHtml}

  <div class="sum-wrap">
    <div class="sum">
      ${subtotalRow}
      ${discountRow}
      <div class="sum-row total">
        <span class="tl">Total</span>
        <span class="ta">${formatCurrency(total)}</span>
      </div>
    </div>
  </div>

  <div class="pay-box">
    <span class="lbl">Payment Details</span>
    <div class="pay-row">
      <span class="k">Status</span>
      <span class="v" style="color:${statusColor}">${statusLabel}</span>
    </div>
    ${methodRow}
    ${advanceRow}
    ${balanceHtml}
  </div>

  ${notesHtml}

  <div class="footer">
    <div class="ty">Thank you for choosing Camera Rent Embilipitiya!</div>
    <p>Please return all equipment in good condition by the return date.<br>
    For enquiries please quote booking reference: <strong>${b.booking_code}</strong></p>
  </div>

</div>
</body>
</html>`;
}

export async function shareBookingInvoice(booking: BookingWithRelations): Promise<void> {
  const logoSrc = await getLogoBase64();
  const html = buildHtml(booking, logoSrc);

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Invoice – ${booking.booking_code}`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ uri });
  }
}
