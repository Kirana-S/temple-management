"use client";

export interface PrintableReceiptData {
  type: "donation" | "booking";
  receipt_number: string;
  date: string;
  name: string;
  mobile: string;
  detailsTitle: string;
  detailsValue: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
}

export function printReceipt(data: PrintableReceiptData) {
  const formattedAmount = `₹${Number(data.amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const receiptTitle =
    data.type === "donation" ? "DONATION RECEIPT" : "POOJA BOOKING RECEIPT";

  const printWindow = window.open("", "_blank", "width=600,height=750");
  if (!printWindow) {
    alert("Please allow popups to print the receipt.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${data.receipt_number}</title>
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body {
            margin: 0;
            padding: 30px;
            background: #ffffff;
            color: #222222;
          }
          .receipt-box {
            max-width: 500px;
            margin: 0 auto;
            border: 2px solid #8b0000;
            border-radius: 8px;
            padding: 24px;
            background: #fffefb;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #d4af37;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .om { font-size: 28px; line-height: 1; }
          .temple-title {
            color: #8b0000;
            font-size: 19px;
            font-weight: 800;
            margin: 4px 0 2px 0;
            letter-spacing: 0.5px;
          }
          .temple-sub {
            color: #b01d3c;
            font-size: 13px;
            font-weight: 600;
            margin: 0;
          }
          .temple-addr {
            color: #666666;
            font-size: 11px;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            margin-top: 8px;
            background: #8b0000;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 12px;
            border-radius: 12px;
            letter-spacing: 1px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            background: #fff8f0;
            padding: 8px 12px;
            border: 1px solid #f0e0c0;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          .details-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #f0e8d8;
          }
          .details-table td.label {
            color: #666666;
            width: 40%;
            font-weight: 500;
          }
          .details-table td.val {
            color: #111111;
            font-weight: 600;
          }
          .amount-banner {
            background: #fff5e6;
            border: 2px solid #e67e00;
            border-radius: 6px;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
          }
          .amount-label {
            font-size: 14px;
            font-weight: bold;
            color: #7a3d00;
          }
          .amount-val {
            font-size: 22px;
            font-weight: 800;
            color: #8b0000;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 10px;
          }
          .sign-line {
            width: 140px;
            text-align: center;
            border-top: 1px solid #444444;
            font-size: 11px;
            color: #555555;
            padding-top: 6px;
          }
          .blessing {
            text-align: center;
            margin-top: 24px;
            font-size: 11px;
            color: #888888;
            font-style: italic;
          }
          @media print {
            body { padding: 0; background: none; }
            .receipt-box { box-shadow: none; border: 1px solid #8b0000; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="om">🕉️</div>
            <div class="temple-title">Bhairaveshwara Swami</div>
            <div class="temple-sub">&amp; Vana Durga Parameshwari Hindu Temple</div>
            <div class="temple-addr">Temple Road, Devasthana Complex, Karnataka - 560001</div>
            <div class="badge">${receiptTitle}</div>
          </div>

          <div class="meta-row">
            <div><strong>Receipt No:</strong> ${data.receipt_number}</div>
            <div><strong>Date:</strong> ${data.date}</div>
          </div>

          <table class="details-table">
            <tr>
              <td class="label">${data.type === "donation" ? "Donor Name" : "Devotee Name"}</td>
              <td class="val">${data.name}</td>
            </tr>
            <tr>
              <td class="label">Mobile Number</td>
              <td class="val">${data.mobile}</td>
            </tr>
            <tr>
              <td class="label">${data.detailsTitle}</td>
              <td class="val">${data.detailsValue}</td>
            </tr>
            <tr>
              <td class="label">Payment Method</td>
              <td class="val">${data.payment_method}</td>
            </tr>
            ${
              data.notes
                ? `<tr><td class="label">Notes</td><td class="val">${data.notes}</td></tr>`
                : ""
            }
          </table>

          <div class="amount-banner">
            <div class="amount-label">AMOUNT RECEIVED</div>
            <div class="amount-val">${formattedAmount}</div>
          </div>

          <div class="signatures">
            <div class="sign-line">Authorized Signatory</div>
            <div class="sign-line">Temple Seal</div>
          </div>

          <div class="blessing">
            May Sri Bhairaveshwara Swami &amp; Sri Vana Durga Parameshwari shower divine blessings upon you &amp; your family.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
