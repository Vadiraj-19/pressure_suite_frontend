import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const urlToBase64 = async (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generatePressureTestReport = async (testData) => {
  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  //header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("PRESSURE TEST REPORT", pageWidth / 2, 40, { align: "center" });
  pdf.setFontSize(13);
  pdf.text("PRESSURE TESTING OF PIPELINE", pageWidth / 2, 60, { align: "center" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Document No : ${testData.documentNo || "1"}`, 40, 90);
  pdf.text(`Report No: ${testData.reportNo || "_________"}`, pageWidth - 180, 90);
  pdf.text(`Project / Client : ${testData.projectName || "-"}`, 40, 110);
  pdf.text(`Date : ${new Date(testData.startDate).toLocaleDateString()}`, pageWidth - 180, 110);

  //prepare rows two per location
  const tableColumn = [
    "Sl No.", "Floor", "Location", "Start Date & Time", "End Date & Time", "Reading", "Pressure Gauge"
  ];
  
  const tableRows = [];
  const gaugeImages = [];
  let slNo = 1;

  for (const floor of testData.floors || []) {
    for (const loc of floor.locations || []) {
      // format date without comma, for consistency
      const formatDate = (dt) => dt ? new Date(dt).toLocaleString().replace(',', '') : '-';

      // First row, start info and start image
      const startImg = await urlToBase64(loc.startImage);
      tableRows.push([
        slNo,
        floor.floorName || "-",
        loc.locationName || "-",
        formatDate(loc.startDateTime),
        "",  // no end date/time here
        loc.startPressure ? `${loc.startPressure} kg` : "-",
        ""
      ]);
      gaugeImages.push({ rowIdx: tableRows.length - 1, img: startImg });

      // Second row, end info and end image, rest blank
      const endImg = await urlToBase64(loc.endImage);
      tableRows.push([
        "", "", "", "", formatDate(loc.endDateTime),
        loc.endPressure ? `${loc.endPressure} kg` : "-",
        ""
      ]);
      gaugeImages.push({ rowIdx: tableRows.length - 1, img: endImg });

      slNo++;
    }
  }

  // autTable with didDrawCell injecting images
 autoTable(pdf, {
  startY: 140,
  head: [tableColumn],
  body: tableRows,
  styles: {
    font: "helvetica",
    fontSize: 10,
    valign: "middle",
    halign: "center",
    cellPadding: { top: 10, right: 4, bottom: 10, left: 4 }, // More top/bottom padding
    minCellHeight: 45, // Minimum row height increased for image fit
  },
  headStyles: {
    fillColor: [36, 79, 171],
    textColor: [255, 255, 255],
    fontStyle: "bold",
    fontSize: 11,
  },
  columnStyles: {
    0: { cellWidth: 38 },
    1: { cellWidth: 70 },
    2: { cellWidth: 80 },
    3: { cellWidth: 100 },
    4: { cellWidth: 100 },
    5: { cellWidth: 60 },
    6: { cellWidth: 80 },
  },
  margin: { left: 40, right: 40 },
  theme: "grid",
  didDrawCell: (data) => {
    if (data.column.index === 6 && data.row.section === "body") {
      const found = gaugeImages.find(g => g.rowIdx === data.row.index);
      if (found && found.img) {
        try {
          pdf.addImage(found.img, "JPEG", data.cell.x + 8, data.cell.y + 3, 66, 36);
        } catch (e) {}
      }
    }
  },
});


  let finalY = pdf.lastAutoTable.finalY + 24;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Pressure Holding Time - ${testData.pressureHoldingTime || "-"}`, 40, finalY);
  pdf.text(`Drawing Reference No: ${testData.drawingReferenceNo || "-"}`, 280, finalY);
  finalY += 22;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Result:", 40, finalY);

 pdf.setFont("helvetica", "bold");
pdf.text("Result:", 40, finalY);

pdf.setFont("helvetica", "normal");
pdf.text("Accepted", 120, finalY);
pdf.text("Rejected", 240, finalY);

// Draw selection marks (tick for accepted, tick for rejected)
pdf.setFont("helvetica", "bold");
pdf.text("Result:", 40, finalY);

pdf.setFont("helvetica", "normal");

// Accepted option
// Accepted box and check
pdf.rect(190, finalY - 10, 12, 12);
if (testData.result === "accepted") {
  // Draw a checkmark manually
  pdf.setLineWidth(1.5);
  pdf.setDrawColor(0);
  pdf.line(192, finalY - 3, 196, finalY + 2); // \
  pdf.line(196, finalY + 2, 200, finalY - 6); // /
}

// Rejected box and check
pdf.rect(330, finalY - 10, 12, 12);
if (testData.result === "rejected") {
  pdf.setLineWidth(1.5);
  pdf.setDrawColor(0);
  pdf.line(332, finalY - 3, 336, finalY + 2);
  pdf.line(336, finalY + 2, 340, finalY - 6);
}
pdf.setLineWidth(0.2); // Reset for later lines

  finalY += 22;
  pdf.setFontSize(10);
  pdf.text("Comments:", 40, finalY);
  if (testData.comments) {
    pdf.text(testData.comments, 100, finalY);
  }

  finalY += 32;
  pdf.setFont("helvetica", "normal");
  pdf.text("For Laymen's Clevertech", 40, finalY);
  pdf.text("For Client", pageWidth - 200, finalY);

  finalY += 32;
  pdf.text("Signature: ________________", 40, finalY);
  pdf.text("Signature: ________________", pageWidth - 200, finalY);

  finalY += 22;
  pdf.text("Date: ________________", 40, finalY);
  pdf.text("Date: ________________", pageWidth - 200, finalY);

  finalY += 22;
  pdf.text("Name: ________________", 40, finalY);
  pdf.text("Name: ________________", pageWidth - 200, finalY);

  return pdf;
};
