import pptxgen from "pptxgenjs";
import { Project } from "../types";

export const exportToPptx = async (project: Project) => {
  const pptx = new pptxgen();
  
  // Set layout
  pptx.layout = "LAYOUT_16x9";
  pptx.author = project.author || "Tác giả SKKN";
  pptx.title = `Báo cáo SKKN: ${project.title.substring(0, 50)}`;

  const cleanHex = (color: string) => color.replace("#", "");

  // Slide Styles
  const bgFill = "F8FAFC"; // off-white
  const brandPurple = "7C3AED"; // purple
  const accentOrange = "FF6B00"; // orange
  const textDark = "1E293B"; // slate-800
  const textMuted = "64748B"; // slate-500
  
  // Custom font
  const defaultFont = "Times New Roman";

  // --- SLIDE 1: COVER SLIDE ---
  const slide1 = pptx.addSlide();
  slide1.background = { fill: bgFill };

  // Add decorative shape
  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.0, y: 0.0, w: 0.3, h: 5.625, // vertical bar on the left
    fill: { color: brandPurple }
  });

  slide1.addText("BÁO CÁO SÁNG KIẾN KINH NGHIỆM 2026", {
    x: 0.8, y: 0.8, w: 8.5, h: 0.4,
    fontSize: 16, bold: true, color: accentOrange, fontFace: defaultFont
  });

  slide1.addText(project.title.toUpperCase(), {
    x: 0.8, y: 1.3, w: 8.5, h: 1.5,
    fontSize: 24, bold: true, color: brandPurple, fontFace: defaultFont
  });

  slide1.addText([
    { text: "Người thực hiện: ", options: { bold: true } },
    { text: project.author },
    { text: "\nĐơn vị công tác: ", options: { bold: true } },
    { text: project.school },
    { text: "\nMôn học: ", options: { bold: true } },
    { text: `${project.subject} - Lớp ${project.grade}` }
  ], {
    x: 0.8, y: 3.2, w: 8.5, h: 1.5,
    fontSize: 14, fontFace: defaultFont, color: textDark, lineSpacing: 22
  });

  // --- SLIDE 2: PROBLEM & URGENCY ---
  const slide2 = pptx.addSlide();
  slide2.background = { fill: bgFill };
  
  slide2.addText("TÍNH CẤP THIẾT & THỰC TRẠNG ĐỀ TÀI", {
    x: 0.8, y: 0.4, w: 8.5, h: 0.5,
    fontSize: 20, bold: true, color: brandPurple, fontFace: defaultFont
  });

  const urgencyBullets = [
    { text: "Chương trình GDPT 2018 đòi hỏi đổi mới phương pháp giảng dạy và kiểm tra đánh giá.", options: { bullet: true } },
    { text: `Đề tài "${project.title}" giải quyết mâu thuẫn lớn giữa thực trạng dạy học thụ động và mục tiêu phát triển năng lực tự học của học sinh.`, options: { bullet: true } },
    { text: "Bối cảnh thực trạng khảo sát ban đầu cho thấy tỷ lệ học sinh hứng thú học tập còn thấp, giáo viên mất nhiều thời gian giảng lý thuyết.", options: { bullet: true } }
  ];

  if (project.survey?.pedagogicalComment) {
    urgencyBullets.push({ text: `Nhận xét thực trạng: ${project.survey.pedagogicalComment}`, options: { bullet: true } });
  }

  slide2.addText(urgencyBullets, {
    x: 0.8, y: 1.1, w: 8.5, h: 3.8,
    fontSize: 13, fontFace: defaultFont, color: textDark, lineSpacing: 20
  });

  // --- SLIDES 3 & 4: CORE SOLUTIONS ---
  if (project.solutions && project.solutions.length > 0) {
    project.solutions.forEach((sol, index) => {
      // Create a slide for each major solution if solutionCount <= 3, otherwise group them
      const slide = pptx.addSlide();
      slide.background = { fill: bgFill };

      slide.addText(`BIỆN PHÁP ${sol.index}: ${sol.title.toUpperCase()}`, {
        x: 0.8, y: 0.4, w: 8.5, h: 0.6,
        fontSize: 18, bold: true, color: brandPurple, fontFace: defaultFont
      });

      // Split into two columns: Left (Purpose & Steps) | Right (Advice & Evidence)
      // Left Column
      const leftBullets = [
        { text: "Mục tiêu biện pháp:", options: { bold: true } },
        { text: sol.purpose },
        { text: "\nCác bước triển khai thực hiện:", options: { bold: true } }
      ];
      sol.steps.forEach(step => {
        leftBullets.push({ text: step, options: { bullet: true } });
      });

      slide.addText(leftBullets, {
        x: 0.8, y: 1.2, w: 4.2, h: 3.8,
        fontSize: 12, fontFace: defaultFont, color: textDark, lineSpacing: 18
      });

      // Right Column
      const rightContent: any[] = [];
      if (sol.pedagogicalAdvice) {
        rightContent.push(
          { text: "💡 Chỉ dẫn sư phạm cho giáo viên:\n", options: { bold: true, color: accentOrange } },
          { text: sol.pedagogicalAdvice + "\n\n" }
        );
      }
      if (sol.evidenceDescription) {
        rightContent.push(
          { text: "📸 Minh chứng và Phụ lục đi kèm:\n", options: { bold: true, color: "059669" } },
          { text: sol.evidenceDescription + "\n\n" }
        );
      }
      if (sol.infographicConcept) {
        rightContent.push(
          { text: "🎨 Ý tưởng trực quan hóa (Infographic):\n", options: { bold: true, color: brandPurple } },
          { text: `"${sol.infographicConcept}"` }
        );
      }

      if (rightContent.length > 0) {
        slide.addText(rightContent, {
          x: 5.2, y: 1.2, w: 4.0, h: 3.8,
          fontSize: 12, fontFace: defaultFont, color: textDark, lineSpacing: 18
        });
      }
    });
  }

  // --- SLIDE 5: EXPERIMENT PEDAGOGICAL RESULTS ---
  const slide5 = pptx.addSlide();
  slide5.background = { fill: bgFill };

  slide5.addText("HIỆU QUẢ THỰC NGHIỆM SƯ PHẠM ĐẠT ĐƯỢC", {
    x: 0.8, y: 0.4, w: 8.5, h: 0.5,
    fontSize: 20, bold: true, color: brandPurple, fontFace: defaultFont
  });

  // Left Column Bullets
  const slide5Bullets = [
    { text: "Kết quả đối chứng chứng minh tính hiệu quả và vượt trội của các giải pháp mới.", options: { bullet: true } },
    { text: "Tỷ lệ học sinh hoàn thành xuất sắc tăng lên đáng kể, các học sinh trung bình - yếu được kèm cặp sát sao.", options: { bullet: true } }
  ];
  if (project.experiment?.conclusion) {
    slide5Bullets.push({ text: project.experiment.conclusion, options: { bullet: true } });
  }

  slide5.addText(slide5Bullets, {
    x: 0.8, y: 1.1, w: 4.2, h: 3.8,
    fontSize: 12, fontFace: defaultFont, color: textDark, lineSpacing: 20
  });

  // Right Column Table
  if (project.experiment?.comparisonData) {
    const tableData = [
      [
        { text: "Mức Đạt Học Lực", options: { fill: { color: brandPurple }, color: "FFFFFF", bold: true } },
        { text: "Đối Chứng (HS)", options: { fill: { color: brandPurple }, color: "FFFFFF", bold: true } },
        { text: "Thực Nghiệm (HS)", options: { fill: { color: brandPurple }, color: "FFFFFF", bold: true } }
      ]
    ];
    project.experiment.comparisonData.forEach(item => {
      tableData.push([
        { text: item.category, options: {} },
        { text: String(item.controlGroup), options: {} },
        { text: String(item.experimentalGroup), options: {} }
      ]);
    });

    slide5.addTable(tableData, {
      x: 5.2, y: 1.1, w: 4.0, h: 3.5,
      border: { pt: 1, color: "CCCCCC" },
      align: "center",
      valign: "middle",
      fontSize: 10,
      fontFace: defaultFont
    });
  }

  // --- SLIDE 6: THANK YOU SLIDE ---
  const slide6 = pptx.addSlide();
  slide6.background = { fill: brandPurple }; // inverse brand colored background for ending

  slide6.addText("XIN TRÂN TRỌNG CẢM ƠN!", {
    x: 0.5, y: 1.8, w: 9.0, h: 0.8,
    fontSize: 32, bold: true, color: "FFFFFF", align: "center", fontFace: defaultFont
  });

  slide6.addText("QUÝ HỘI ĐỒNG GIÁM KHẢO ĐÃ LẮNG NGHE BÁO CÁO", {
    x: 0.5, y: 2.6, w: 9.0, h: 0.5,
    fontSize: 18, color: "FFD3B6", align: "center", fontFace: defaultFont
  });

  slide6.addText(`Tác giả: ${project.author} | Đơn vị: ${project.school}`, {
    x: 0.5, y: 3.4, w: 9.0, h: 0.4,
    fontSize: 13, color: "FFFFFF", align: "center", fontFace: defaultFont
  });

  // Save presentation
  const cleanTitle = project.title.substring(0, 30).trim().replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");
  const fileName = `Slide_SKKN_${cleanTitle || "Bao_cao"}.pptx`;
  await pptx.writeFile({ fileName });
};
