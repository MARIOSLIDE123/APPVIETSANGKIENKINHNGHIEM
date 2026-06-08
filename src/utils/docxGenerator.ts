import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  Footer,
  PageNumber
} from "docx";
import { Project } from "../types";


// Main Export Function
export const exportToDocx = async (project: Project) => {
  const sectionChildren: any[] = [];

  // --- 1. COVER PAGE ---
  sectionChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({ text: "SỞ GIÁO DỤC VÀ ĐÀO TẠO", bold: true, size: 26, font: "Times New Roman" }),
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({ text: `ĐƠN VỊ: ${project.school.toUpperCase()}`, bold: true, size: 26, font: "Times New Roman" }),
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
      children: [
        new TextRun({ text: "-------------------", size: 26, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({ text: "BÁO CÁO SÁNG KIẾN KINH NGHIỆM", bold: true, size: 34, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2500 },
      children: [
        new TextRun({ text: project.title.toUpperCase(), bold: true, size: 30, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 2880 }, // Indent to middle of the page
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Tác giả: ", bold: true, size: 28, font: "Times New Roman" }),
        new TextRun({ text: project.author, size: 28, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 2880 },
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Môn giảng dạy: ", bold: true, size: 28, font: "Times New Roman" }),
        new TextRun({ text: project.subject, size: 28, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 2880 },
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Khối lớp: ", bold: true, size: 28, font: "Times New Roman" }),
        new TextRun({ text: project.grade, size: 28, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 2880 },
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Cấp học: ", bold: true, size: 28, font: "Times New Roman" }),
        new TextRun({ text: project.level, size: 28, font: "Times New Roman" })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 2880 },
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Năm học: ", bold: true, size: 28, font: "Times New Roman" }),
        new TextRun({ text: "2025 - 2026", size: 28, font: "Times New Roman" })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- 2. REPORT CONTENT parsing ---
  let combinedContent = "";
  if (project.contentPart1And2) {
    combinedContent += "PHẦN I: ĐẶT VẤN ĐỀ & PHẦN II: CƠ SỞ LÝ LUẬN\n" + project.contentPart1And2 + "\n\n";
  }
  if (project.contentPart3) {
    combinedContent += "PHẦN III: THỰC TRẠNG VẤN ĐỀ\n" + project.contentPart3 + "\n\n";
  }
  if (project.contentSolution1) {
    combinedContent += "PHẦN IV: CÁC BIỆN PHÁP THỰC HIỆN CỐT LÕI\n";
    combinedContent += "Biện pháp 1\n" + project.contentSolution1 + "\n\n";
  }
  if (project.contentSolution2) {
    combinedContent += "Biện pháp 2\n" + project.contentSolution2 + "\n\n";
  }
  if (project.contentSolution3) {
    combinedContent += "Biện pháp 3\n" + project.contentSolution3 + "\n\n";
  }
  if (project.contentConclusion) {
    combinedContent += "PHẦN V: HIỆU QUẢ, KẾT LUẬN & KHUYẾN NGHỊ\n" + project.contentConclusion + "\n\n";
  }

  // Fallback to legacy field if no sections content
  if (!combinedContent.trim() && project.textEditorContent) {
    combinedContent = project.textEditorContent;
  }

  const lines = combinedContent.split("\n");

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line -> blank space
      sectionChildren.push(new Paragraph({ spacing: { before: 120, after: 120 } }));
      return;
    }

    // Title Section detection
    if (trimmed.startsWith("PHẦN ") || trimmed.includes("PHẦN I:") || trimmed.includes("PHẦN II:") || trimmed.includes("PHẦN III:")) {
      sectionChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 180 },
          children: [
            new TextRun({ text: trimmed, bold: true, size: 30, font: "Times New Roman" })
          ]
        })
      );
    }
    // Sub-title detection
    else if (trimmed.match(/^\d+\.\s+/) || trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ") || trimmed.startsWith("4. ")) {
      sectionChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({ text: trimmed, bold: true, size: 28, font: "Times New Roman" })
          ]
        })
      );
    }
    // Normal paragraph text
    else {
      // Handle alignment for standard Ministry header
      const isHeaderLine = trimmed.includes("CỘNG HÒA XÃ HỘI CHỦ NGHĨA") || trimmed.includes("Độc lập - Tự do") || trimmed.includes("BÁO CÁO SÁNG KIẾN");
      sectionChildren.push(
        new Paragraph({
          alignment: isHeaderLine ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: 120, after: 120 },
          indent: isHeaderLine ? undefined : { firstLine: 720 }, // Indent first line of paragraph (0.5 inches = 720 dxa)
          children: [
            new TextRun({
              text: trimmed,
              bold: isHeaderLine || trimmed.includes("Tên đề tài:"),
              size: 28, // 14pt
              font: "Times New Roman"
            })
          ]
        })
      );
    }

  });

  // --- 3. ANNEXES & BIBLIOGRAPHY ---
  if (project.annexList && project.annexList.length > 0) {
    sectionChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 180 },
        children: [
          new TextRun({ text: "PHỤ LỤC & TÀI LIỆU THAM KHẢO", bold: true, size: 30, font: "Times New Roman" })
        ]
      })
    );

    project.annexList.forEach((annex, idx) => {
      sectionChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          indent: { firstLine: 360 },
          children: [
            new TextRun({ text: `${idx + 1}. ${annex}`, size: 28, font: "Times New Roman" })
          ]
        })
      );
    });
  }

  // Define Document structure
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1130,      // 2.0 cm
              bottom: 1130,   // 2.0 cm
              left: 1700,     // 3.0 cm (Decree 30 binding gap)
              right: 850      // 1.5 cm
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 24, // 12pt
                    font: "Times New Roman"
                  })
                ]
              })
            ]
          })
        },
        children: sectionChildren
      }
    ]
  });

  // Export and download
  const blob = await Packer.toBlob(doc);
  const cleanTitle = project.title.substring(0, 30).trim().replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");
  const fileName = `SKKN-2026_${cleanTitle || "Bao_cao"}.docx`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
