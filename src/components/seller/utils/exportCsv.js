export default function exportCsv(rows, isTicket) {
  const getBadgeColor = (val) => {
    const map = {
      Processing: "#fff7ed",
      ProcessingText: "#f97316",
      Finished: "#ecfdf5",
      FinishedText: "#059669",
      Pending: "#eff6ff",
      PendingText: "#2563eb",
      Cancelled: "#fff1f2",
      CancelledText: "#e11d48",
      High: "#fef2f2",
      HighText: "#ef4444",
      Urgent: "#fef2f2",
      UrgentText: "#ef4444",
      Low: "#f1f5f9",
      LowText: "#64748b",
      Normal: "#eff6ff",
      NormalText: "#2563eb",
    };
    const bg = map[val] || "#ffffff";
    const text = map[`${val}Text`] || "#000000";
    return `background-color:${bg};color:${text};font-weight:bold;px:8px;py:4px;border-radius:12px;`;
  };

  const headers = isTicket
    ? ["ID", "Customer", "Email", "Phone", "Ticket Type", "Description", "Status", "Priority", "Date"]
    : ["ID", "Customer", "Email", "Phone", "Service Type", "Description", "Location", "Status", "Priority", "Date"];

  let html =
    "<html xmlns:x='urn:schemas-microsoft-com:office:excel'>";
  html +=
    "<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>";
  html +=
    "<x:Name>Export</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>";
  html +=
    "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body><table>";

  html += "<tr>";
  headers.forEach(
    (h) =>
      (html += `<th style="background-color:#f8fafc;font-weight:bold;padding:10px;">${h}</th>`)
  );
  html += "</tr>";

  rows.forEach((row) => {
    html += "<tr>";
    html += `<td>${row.id}</td>`;
    html += `<td>${row.customer_name || ""}</td>`;
    html += `<td>${row.customer_email || ""}</td>`;
    html += `<td>${row.phone || ""}</td>`;
    html += `<td>${isTicket ? row.ticket_type : row.service_type}</td>`;
    html += `<td>${row.description || ""}</td>`;
    if (!isTicket) html += `<td>${row.location || ""}</td>`;
    html += `<td style="${getBadgeColor(row.status)}">${row.status}</td>`;
    html += `<td style="${getBadgeColor(row.priority)}">${row.priority}</td>`;
    html += `<td>${row.created_at}</td>`;
    html += "</tr>";
  });

  html += "</table></body></html>";

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = isTicket ? "seller-tickets.xls" : "seller-orders.xls";
  anchor.click();

  URL.revokeObjectURL(url);
}
