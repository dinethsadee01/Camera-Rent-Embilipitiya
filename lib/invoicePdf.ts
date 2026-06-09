import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Image } from 'react-native';
import { formatCurrency, formatDate, getRentalDays } from './utils';
import type { BookingWithRelations } from './types';

async function getLogoBase64(): Promise<string> {
  try {
    const source = Image.resolveAssetSource(require('@/assets/Logo-black.png'));
    if (!source?.uri) return '';

    const cached = new File(Paths.cache, 'invoice_logo.png');
    if (!cached.exists) {
      await File.downloadFileAsync(source.uri, cached, { idempotent: true });
    }

    const buf = await cached.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return `data:image/png;base64,${btoa(binary)}`;
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
  const hasSerial = primaryItems.some((bi) => bi.item?.serial_number);
  const itemRows = primaryItems.map((bi) => {
    const name = bi.item?.name ?? bi.custom_name ?? 'Item';
    const sn = bi.item?.serial_number ?? '';
    const qty = bi.quantity;
    const rate = Number(bi.daily_rate);
    const amount = rate * qty * days;
    const snCell = hasSerial ? `<td class="center sn">${sn || '—'}</td>` : '';
    return `
      <tr>
        <td class="bold">${name}</td>
        ${snCell}
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
  .page{width:100%;padding:14mm 15mm 10mm}
  .page-break{page-break-before:always}

  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;
          border-bottom:3px solid #d61e30;padding-bottom:14px;margin-bottom:20px}
  .logo-block{display:flex;flex-direction:column;gap:5px}
  .logo{height:52px;object-fit:contain}
  .logo-text{font-size:22px;font-weight:700;color:#d61e30}
  .subsidiary{font-size:8.5px;color:#777;font-style:italic;max-width:220px;line-height:1.4}
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
  .period-item .val{font-size:13px;font-weight:600;color:#1a1a1a;display:block}
  .period-item .time{font-size:11px;color:#888;margin-top:1px;display:block}
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
  td.sn{font-family:monospace;font-size:10px;color:#666}

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
          margin-bottom:10px;border-radius:0 6px 6px 0}
  .notes-label{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                letter-spacing:1px;margin-bottom:4px}
  .notes p{font-size:11px;color:#555;line-height:1.6}

  /* Footer */
  .footer{border-top:2px solid #d61e30;padding-top:12px;margin-top:14px;
          page-break-inside:avoid}
  .footer-inner{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .footer-col{display:flex;flex-direction:column;gap:3px}
  .footer-col span{font-size:9.5px;color:#555;line-height:1.5}
  .footer-col .ft-label{font-size:8px;font-weight:700;color:#d61e30;text-transform:uppercase;
                         letter-spacing:.8px;margin-bottom:3px}
  .footer-ref{text-align:center;margin-top:8px;font-size:9px;color:#bbb}

  /* ── Terms & Conditions page ─────────────────────────────── */
  .tc-page{width:100%;padding:14mm 15mm 14mm}
  .tc-header{border-bottom:3px solid #d61e30;padding-bottom:10px;margin-bottom:18px;
              display:flex;justify-content:space-between;align-items:flex-end}
  .tc-header .tc-brand{font-size:11px;color:#888;font-style:italic}
  .tc-title{font-size:18px;font-weight:700;color:#d61e30;letter-spacing:2px}
  .tc-ref{font-size:10px;font-family:monospace;color:#555;margin-top:3px}
  .tc-clause{margin-bottom:11px}
  .tc-clause-title{font-size:10px;font-weight:700;color:#1a1a1a;margin-bottom:3px}
  .tc-clause p{font-size:9.5px;color:#444;line-height:1.6}
  .tc-accept{background:#fff5f5;border:1px solid #fca5a5;border-radius:6px;
              padding:10px 13px;margin:18px 0 22px;font-size:10px;
              color:#7f1d1d;line-height:1.6;font-style:italic}
  .sig-row{display:flex;gap:40px;margin-top:10px}
  .sig-block{flex:1}
  .sig-label{font-size:9px;font-weight:700;color:#555;text-transform:uppercase;
              letter-spacing:.8px;margin-bottom:28px}
  .sig-line{border-bottom:1.5px solid #333;margin-bottom:5px}
  .sig-name{font-size:9px;color:#888}
</style>
</head>
<body>

<!-- ══ PAGE 1 — INVOICE ══════════════════════════════════════ -->
<div class="page">

  <div class="header">
    <div class="logo-block">
      ${logoHtml}
      <span class="subsidiary">Subsidiary of Dilanka Media Solutions<br>(R/EMB/08081-A)</span>
    </div>
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
      <p>No.203/137, 5th Lane<br>New Town, Embilipitiya<br>Sri Lanka</p>
    </div>
  </div>

  <div class="period">
    <div class="period-item">
      <span class="lbl">Pickup Date</span>
      <span class="val">${formatDate(b.start_date)}</span>
      ${b.pickup_time ? `<span class="time">${b.pickup_time}</span>` : ''}
    </div>
    <span class="arrow">→</span>
    <div class="period-item">
      <span class="lbl">Return Date</span>
      <span class="val">${formatDate(b.end_date)}</span>
      ${b.return_time ? `<span class="time">${b.return_time}</span>` : ''}
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
        <th style="width:${hasSerial ? '32' : '40'}%">Item</th>
        ${hasSerial ? '<th style="width:14%;text-align:center">S/N</th>' : ''}
        <th style="width:9%;text-align:center">Qty</th>
        <th style="width:${hasSerial ? '17' : '19'}%;text-align:right">Rate / Day</th>
        <th style="width:9%;text-align:center">Days</th>
        <th style="width:${hasSerial ? '19' : '23'}%;text-align:right">Amount</th>
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
    <div class="footer-inner">
      <div class="footer-col">
        <span class="ft-label">Contact</span>
        <span>📞 076 80 60 667</span>
        <span>✉ dilankamediasolutions@gmail.com</span>
      </div>
      <div class="footer-col">
        <span class="ft-label">Website</span>
        <span>🌐 www.camerarentembilipitiya.lk</span>
      </div>
      <div class="footer-col" style="text-align:right">
        <span class="ft-label">Address</span>
        <span>No.203/137, 5th Lane</span>
        <span>New Town, Embilipitiya</span>
      </div>
    </div>
    <div class="footer-ref">Booking reference: <strong>${b.booking_code}</strong> · Camera Rent Embilipitiya</div>
  </div>

</div>

<!-- ══ PAGE 2 — TERMS & CONDITIONS ══════════════════════════ -->
<div class="tc-page page-break">

  <div class="tc-header">
    <div>
      <div class="tc-title">TERMS &amp; CONDITIONS</div>
      <div class="tc-ref">Rental Agreement · ${b.booking_code} · ${b.customer?.full_name ?? ''}</div>
    </div>
    <div class="tc-brand">Camera Rent Embilipitiya</div>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">1. Return of Equipment</div>
    <p>All rented equipment must be returned on or before the agreed date and time mentioned in this agreement. Late returns may affect future rentals and availability for other customers.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">2. Late Return Charges</div>
    <p>If equipment is returned late, the customer will be charged additional fees calculated on an hourly or daily basis depending on the rental agreement.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">3. Responsibility for Equipment</div>
    <p>The customer is fully responsible for the safety and security of all rented items during the rental period. This includes any damage, loss, or theft, whether accidental or intentional.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">4. Damage Responsibility</div>
    <p>If any equipment is damaged during the rental period, the customer agrees to pay the full repair cost as assessed by the owner or authorized service center.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">5. Loss or Total Damage</div>
    <p>In the event of total loss, irreparable damage, or theft of any equipment, the customer must pay the full replacement value of the item at current market price.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">6. Security Deposit Refund</div>
    <p>Any security deposit taken will only be refunded after a full inspection of the returned equipment. The equipment must be in proper working condition with all accessories included.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">7. Condition of Return</div>
    <p>All equipment must be returned in the same condition as it was issued, except for normal wear and tear resulting from proper usage.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">8. Care Instructions</div>
    <p>Equipment must be protected from water, dust, sand, impact, and extreme environmental conditions. Improper handling that leads to damage will be the customer's responsibility.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">9. No Unauthorized Repair</div>
    <p>The customer must not attempt to open, repair, or modify any rented equipment. Any unauthorized repair attempt will be considered damage and charged accordingly.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">10. Emergency Contact Usage</div>
    <p>If the customer cannot be reached, the provided household or emergency contact may be used for communication regarding the rental agreement or recovery of equipment.</p>
  </div>

  <div class="tc-clause">
    <div class="tc-clause-title">11. Legal &amp; Recovery Costs</div>
    <p>The renter agrees that if any legal action is required to recover unpaid amounts, damages, or rented equipment, the renter will be responsible for all reasonable attorney fees, collection costs, and any other expenses incurred by the owner in enforcing this rental agreement or protecting its rights.</p>
  </div>

  <div class="tc-accept">
    By signing below, I, <strong>${b.customer?.full_name ?? 'the customer'}</strong>, confirm that I have read, understood, and agree to abide by all the terms and conditions stated above. I accept full responsibility for the rented equipment for the duration of this agreement.
  </div>

  <div class="sig-row">
    <div class="sig-block">
      <div class="sig-label">Staff / Sales Representative</div>
      <div class="sig-line"></div>
      <div class="sig-name">Authorized — Camera Rent Embilipitiya</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Renter / Customer Signature</div>
      <div class="sig-line"></div>
      <div class="sig-name">${b.customer?.full_name ?? ''} · NIC: ${b.customer?.nic ?? '—'} · ${issuedDate}</div>
    </div>
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
