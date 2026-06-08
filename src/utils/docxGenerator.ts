import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  Header,
  Footer,
  PageNumber
} from "docx";
import { Project } from "../types";

// Helper: Build Survey Data Table
const buildSurveyTable = (project: Project): Table => {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
  
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 4000, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tiêu chí đánh giá khảo sát thực trạng", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Đạt (HS)", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tỷ lệ (%)", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Chưa Đạt", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tỷ lệ (%)", bold: true, size: 22, font: "Times New Roman" })] })]
        })
      ]
    })
  ];

  if (project.survey?.surveyRows) {
    project.survey.surveyRows.forEach(row => {
      rows.push(new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 4000, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: row.criteria, size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.achievedCount), size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.achievedRate.toFixed(1)}%`, size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.notAchievedCount), size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.notAchievedRate.toFixed(1)}%`, size: 22, font: "Times New Roman" })] })]
          })
        ]
      }));
    });
  }

  return new Table({
    columnWidths: [4000, 1300, 1300, 1300, 1300],
    rows
  });
};

// Helper: Build Experiment pedagogical comparison Table
const buildExperimentTable = (project: Project): Table => {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
  
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 4600, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phân loại mức độ hoàn thành", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 2300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nhóm Đối Chứng (HS)", bold: true, size: 22, font: "Times New Roman" })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 2300, type: WidthType.DXA },
          shading: { fill: "E6E6E6", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nhóm Thực Nghiệm (HS)", bold: true, size: 22, font: "Times New Roman" })] })]
        })
      ]
    })
  ];

  if (project.experiment?.comparisonData) {
    project.experiment.comparisonData.forEach(row => {
      rows.push(new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 4600, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: row.category, size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 2300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.controlGroup), size: 22, font: "Times New Roman" })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 2300, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.experimentalGroup), size: 22, font: "Times New Roman" })] })]
          })
        ]
      }));
    });
  }

  return new Table({
    columnWidths: [4600, 2300, 2300],
    rows
  });
};

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
  const lines = (project.textEditorContent || "").split("\n");
  let surveyTableInserted = false;
  let experimentTableInserted = false;

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

    // Intelligent insertion of tables based on text content
    if (!surveyTableInserted && (trimmed.toLowerCase().includes("cơ sở thực tiễn") || trimmed.toLowerCase().includes("khảo sát thực trạng"))) {
      sectionChildren.push(
        new Paragraph({ spacing: { before: 180, after: 120 }, children: [new TextRun({ text: "Bảng 1.1: Khảo sát thực trạng ban đầu của đối tượng học sinh trước tác động:", bold: true, italic: true, size: 22, font: "Times New Roman" })] }),
        buildSurveyTable(project),
        new Paragraph({ spacing: { before: 120, after: 120 } })
      );
      surveyTableInserted = true;
    }

    if (!experimentTableInserted && (trimmed.toLowerCase().includes("thực nghiệm sư phạm") || trimmed.toLowerCase().includes("kết quả thực nghiệm"))) {
      sectionChildren.push(
        new Paragraph({ spacing: { before: 180, after: 120 }, children: [new TextRun({ text: "Bảng 2.1: Đối sánh kết quả học tập giữa nhóm Đối chứng và nhóm Thực nghiệm:", bold: true, italic: true, size: 22, font: "Times New Roman" })] }),
        buildExperimentTable(project),
        new Paragraph({ spacing: { before: 120, after: 120 } })
      );
      experimentTableInserted = true;
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

  // --- 4. FALLBACK TABLE INSERTS ---
  // Append tables at the very end if they were not triggered by text content keywords
  if (!surveyTableInserted || !experimentTableInserted) {
    sectionChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 180 },
        children: [
          new TextRun({ text: "PHỤ LỤC BẢNG BIỂU SỐ LIỆU", bold: true, size: 30, font: "Times New Roman" })
        ]
      })
    );

    if (!surveyTableInserted) {
      sectionChildren.push(
        new Paragraph({ spacing: { before: 180, after: 120 }, children: [new TextRun({ text: "Bảng 1.1: Khảo sát thực trạng ban đầu của đối tượng học sinh trước tác động:", bold: true, italic: true, size: 22, font: "Times New Roman" })] }),
        buildSurveyTable(project),
        new Paragraph({ spacing: { before: 120, after: 120 } })
      );
    }

    if (!experimentTableInserted) {
      sectionChildren.push(
        new Paragraph({ spacing: { before: 180, after: 120 }, children: [new TextRun({ text: "Bảng 2.1: Đối sánh kết quả học tập giữa nhóm Đối chứng và nhóm Thực nghiệm:", bold: true, italic: true, size: 22, font: "Times New Roman" })] }),
        buildExperimentTable(project),
        new Paragraph({ spacing: { before: 120, after: 120 } })
      );
    }
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
