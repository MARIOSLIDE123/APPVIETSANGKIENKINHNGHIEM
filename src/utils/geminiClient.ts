import { GoogleGenAI } from "@google/genai";

// Standard pedagogical system instruction
export const SYSTEM_PEDAGOGICAL_PROMPT = `Bạn là cố vấn chuyên môn viết Sáng kiến kinh nghiệm (SKKN) và Nghiên cứu khoa học sư phạm ứng dụng cấp Quốc gia. Có kiến thức uyên thâm, tuân thủ chặt chẽ các thông tư, quy định mới nhất của Bộ Giáo dục và Đào tạo Việt Nam (đặc biệt là căn lề chuẩn theo Nghị định 30/2020/NĐ-CP). Hãy sử dụng thuật ngữ sư phạm chuẩn mực như: "biện pháp", "minh chứng", "khả năng nhân rộng", "tính cấp thiết", "thực nghiệm đối chứng", "kế hoạch bài dạy". Không sử dụng từ ngữ sáo rỗng, luôn hướng dẫn thực tiễn, cụ thể và khoa học.`;

export const AVAILABLE_MODELS = [
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Default)", description: "Tốc độ nhanh, lý tưởng cho phác thảo và khảo sát thực trạng." },
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", description: "Độ tư duy chuyên sâu, soạn thảo và phản biện học thuật sắc bén." },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Bản chính thức ổn định, hành văn lưu loát và tối ưu." }
];

export const getApiKey = (): string => {
  return localStorage.getItem("gemini_api_key") || "";
};

export const getSelectedModel = (): string => {
  return localStorage.getItem("gemini_selected_model") || "gemini-3-flash-preview";
};

let aiInstance: any = null;
const getAiInstance = (apiKey: string) => {
  if (!aiInstance || aiInstance.apiKey !== apiKey) {
    // Initialize GoogleGenAI SDK instance
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Retry and fallback model wrapper
const executeWithFallback = async (prompt: string, responseJson = true): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key chưa được thiết lập. Vui lòng thiết lập ở góc trên bên phải.");
  }

  const userModel = getSelectedModel();
  const fallbackModels = [
    userModel,
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
  ];
  
  // Keep unique models in order
  const uniqueModels = Array.from(new Set(fallbackModels));
  let lastError: any = null;
  const ai = getAiInstance(apiKey);

  for (const model of uniqueModels) {
    try {
      console.log(`🤖 [Gemini Client] Đang gọi model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PEDAGOGICAL_PROMPT,
          responseMimeType: responseJson ? "application/json" : undefined,
        }
      });
      
      const text = response.text || "";
      if (responseJson) {
        // Strip code block markers if any exist
        let cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.substring(7, cleaned.length - 3).trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.substring(3, cleaned.length - 3).trim();
        }
        return JSON.parse(cleaned);
      }
      return text;
    } catch (err: any) {
      console.warn(`⚠️ [Gemini Client] Model ${model} gặp lỗi:`, err);
      lastError = err;
      // Continue loop for fallback
    }
  }

  throw lastError || new Error("Tất cả các model Gemini đều thất bại.");
};

// 1. Generate Outline (Step 1 -> Step 2)
export const generateOutline = async (params: {
  title: string;
  subject: string;
  grade: string;
  level: string;
  context: string;
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Fallback to Express backend server
    const response = await fetch("/api/gemini/generate-outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi tạo dàn ý.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Căn cứ vào dữ liệu sau:
Tên đề tài SKKN: "${params.title}"
Môn học: "${params.subject || "Tự chọn"}"
Lớp/Khối: "${params.grade || "Tự chọn"}"
Cấp học: "${params.level || "Tự chọn"}"
Bối cảnh/Thực trạng sơ khởi: "${params.context || "Chưa cung cấp"}"

Hãy lập một dàn ý chi tiết cấu trúc 3 phần tiêu chuẩn của một Sáng kiến kinh nghiệm đạt chuẩn chấm giải cấp Tỉnh/Thành phố.
Yêu cầu trả về định dạng JSON phù hợp với giao diện ứng dụng.
Hãy trả về JSON theo cấu trúc chính xác sau:
{
  "analyticalRating": {
    "newness": 85,
    "urgency": 90,
    "feasibility": 88,
    "comment": "Đề tài mang tính thực tiễn cao, cần tập trung làm nổi bật tính mới trong các biện pháp."
  },
  "outline": [
    { "section": "I. ĐẶT VẤN ĐỀ", "details": ["1. Tính cấp thiết của đề tài", "2. Mục đích nghiên cứu", "3. Đối tượng nghiên cứu", "4. Giới hạn phạm vi nghiên cứu"] },
    { "section": "II. GIẢI QUYẾT VẤN ĐỀ", "details": ["1. Cơ sở lý luận", "2. Cơ sở thực tiễn (Nêu rõ ưu điểm, hạn chế và nguyên nhân)", "3. Thiết kế và thực hiện các biện pháp tác động (Nêu chi tiết ít nhất 3 biện pháp cụ thể)", "4. Hiệu quả của sáng kiến kinh nghiệm"] },
    { "section": "III. KẾT LUẬN, KIẾN NGHỊ", "details": ["1. Kết luận rút ra được từ sáng kiến", "2. Kiến nghị, đề xuất đối với các cấp quản lý giáo dục"] }
  ]
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 2. Generate Survey Data (Step 2 -> Step 3)
export const generateSurvey = async (params: {
  title: string;
  subject: string;
  grade: string;
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/generate-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi tạo khảo sát thực trạng.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Dựa trên đề tài SKKN: "${params.title}" dành cho môn "${params.subject}" khối "${params.grade}".
Hãy tạo dữ liệu khảo sát thực trạng thực tế (số liệu giả định khoa học) trước khi tiến hành thực nghiệm để vẽ biểu đồ so sánh.
Khảo sát này đo lường các tiêu chí như: "Độ tích cực tham gia", "Kết quả học tập đạt Yêu cầu trở lên", "Lòng ham thích môn học", hoặc "Khả năng vận dụng thực tiễn" cụ thể của học sinh.
Hãy tạo 4 chỉ số khảo sát, mỗi chỉ số gồm số lượng Học sinh Đạt (số lượng và tỷ lệ %) và Chưa Đạt (số lượng và tỷ lệ %) trong tổng mẫu khảo sát là 40 học sinh.

Yêu cầu trả về định dạng JSON chính xác như sau:
{
  "totalQty": 40,
  "surveyRows": [
    { "criteria": "Ý thức chủ động tham gia bài học", "achievedCount": 12, "achievedRate": 30, "notAchievedCount": 28, "notAchievedRate": 70 },
    { "criteria": "Hứng thú và lòng say mê học tập", "achievedCount": 10, "achievedRate": 25, "notAchievedCount": 30, "notAchievedRate": 75 },
    { "criteria": "Kỹ năng thực hành/vận dụng thực tế", "achievedCount": 8, "achievedRate": 20, "notAchievedCount": 32, "notAchievedRate": 80 },
    { "criteria": "Kết quả kiểm tra khảo sát chất lượng", "achievedCount": 15, "achievedRate": 37.5, "notAchievedCount": 25, "notAchievedRate": 62.5 }
  ],
  "pedagogicalComment": "Thực trạng cho thấy phần lớn học sinh vẫn thụ động, thiếu cơ hội thực hành thảo luận nhóm, phương pháp giảng dạy cũ chưa khơi gợi được hứng thú khám phá."
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 3. Generate Solutions (Step 3 -> Step 4)
export const generateSolutions = async (params: {
  title: string;
  subject: string;
  grade: string;
  solutionCount: number;
  options: { tables: boolean; evidence: boolean; infographic: boolean };
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/generate-solutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi thiết kế giải pháp.");
    }
    return response.json();
  }

  const includeTables = params.options.tables ? "Có tích hợp bảng biểu thống kê chi tiết" : "Không cần bảng";
  const includeEvidence = params.options.evidence ? "Có mô tả minh chứng hoạt động của giáo viên và học sinh" : "Mô tả ngắn gọn";
  const includeInfographic = params.options.infographic ? "Có ý tưởng thiết kế Infographic tóm tắt sơ đồ giải pháp" : "Không cần";

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Dựa trên đề tài: "${params.title}" (${params.subject} - lớp ${params.grade}).
Hãy đề xuất chính xác ${params.solutionCount} biện pháp/giải pháp thực hiện cốt lõi để nâng cao hiệu quả giảng dạy.
Cách tiếp cận: Cụ thể, mang tính đổi mới, sáng tạo, ứng dụng chuyển đổi số hoặc phương pháp dạy học tích cực (nhóm, dự án, stem, trải nghiệm).
Yêu cầu đính kèm tiêu chuẩn:
- ${includeTables}
- ${includeEvidence}
- ${includeInfographic}

Yêu cầu trả về định dạng JSON chính xác như sau:
{
  "solutions": [
    {
      "index": 1,
      "title": "Tên biện pháp 1 (VD: Ứng dụng mô hình trò chơi học tập bằng công cụ số hóa)",
      "purpose": "Mục tiêu giảng dạy cần đạt của biện pháp này",
      "steps": [
        "Bước 1: Chuẩn bị học liệu và công cụ tương tác nhóm",
        "Bước 2: Tổ chức hoạt động thực hành trên lớp",
        "Bước 3: Đánh giá và ghi nhận kết quả"
      ],
      "pedagogicalAdvice": "Lưu ý giáo viên cần phân nhóm học sinh đồng đều, tránh thiên vị học sinh khá giỏi.",
      "evidenceDescription": "Bảng kiểm đánh giá thái độ học tập và link phiếu câu hỏi trực tuyến.",
      "infographicConcept": "Sơ đồ 3 nhánh vòng tròn khép kín tương tác giữa Giáo viên - Học sinh - Học liệu số."
    }
  ]
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 4. Generate Experiment Data (Step 4 -> Step 5)
export const generateExperiment = async (params: {
  title: string;
  subject: string;
  grade: string;
  solutionsDraft: any[];
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/generate-experiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi tính toán thực nghiệm.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Từ sáng kiến kinh nghiệm: "${params.title}" (${params.subject} - lớp ${params.grade}).
Hãy tạo dữ liệu thực nghiệm sư phạm đối chứng giữa Nhóm Thực nghiệm (áp dụng giải pháp) và Nhóm Đối chứng (phương pháp truyền thống) để chứng minh hiệu quả vượt trội.
Mỗi nhóm gồm 40 học sinh. Hãy cung cấp số liệu cải thiện cụ thể trước tác động và sau tác động về các mức độ: "Hoàn thành tốt / Giỏi", "Hoàn thành / Khá", "Chưa hoàn thành / Trung bình yếu".

Yêu cầu trả về JSON chính xác theo dạng sau:
{
  "comparisonData": [
    { "category": "Giỏi / Xuất sắc (Hoàn thành tốt)", "controlGroup": 10, "experimentalGroup": 24 },
    { "category": "Khá (Hoàn thành đạt năng lực)", "controlGroup": 18, "experimentalGroup": 13 },
    { "category": "Trung bình (Đạt cơ bản)", "controlGroup": 10, "experimentalGroup": 3 },
    { "category": "Yếu / Chưa hoàn thành", "controlGroup": 2, "experimentalGroup": 0 }
  ],
  "statisticalAnalysis": "Phân tích giá trị trung bình cộng cho thấy điểm kiểm tra của lớp thực nghiệm đạt 8.24, tăng vượt bậc so với lớp đối chứng chỉ đạt 6.95. Hệ số chênh lệch có ý nghĩa thống kê khoa học chặt chẽ.",
  "conclusion": "Biện pháp sư phạm mới đã kích thích tư duy giải quyết vấn đề, nâng cao tỉ lệ đạt mức xuất sắc vượt mong đợi."
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 5. Refine Text & Chat (Step 6 & Sidebar panel)
export const refineText = async (params: {
  text: string;
  action: "polish" | "continue" | "simplify" | "chat";
  projectTitle?: string;
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/refine-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi xử lý văn bản.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  let prompt = "";
  if (params.action === "continue") {
    prompt = `Hãy viết tiếp nội dung sư phạm học thuật tiếp theo một cách mạch lạc, phong phú từ đoạn văn sau:\n"${params.text}"` + criteriaBlock;
  } else if (params.action === "polish") {
    prompt = `Hãy trau chuốt, biên tập lại đoạn văn sau theo chuẩn giọng điệu văn phong nghiên cứu khoa học sư phạm chính thống của Việt Nam cực kỳ trang trọng và chuyên nghiệp:\n"${params.text}"` + criteriaBlock;
  } else if (params.action === "simplify") {
    prompt = `Hãy cô đọng, rút gọn đoạn văn dài này thành các luận điểm súc tích để đưa vào slide thuyết trình hoặc báo cáo tóm tắt:\n"${params.text}"` + criteriaBlock;
  } else {
    // Default chat mode
    prompt = `${params.text}` + criteriaBlock;
  }

  const refinedText = await executeWithFallback(prompt, false);
  return { refinedText };
};

// 6. Evaluate SKKN (Step 8)
export const evaluateSKKN = async (params: {
  title: string;
  subject: string;
  grade: string;
  outline: any[];
  solutions: any[];
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi chấm điểm phản biện.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Bạn là chủ tịch hội đồng giám khảo cấp Tỉnh đánh giá Sáng kiến kinh nghiệm năm 2026.
Hãy phản biện sắc bén và đánh giá trung thực sáng kiến kinh nghiệm sau để định hướng chỉnh sửa đạt giải cao nhất:
Đề tài: "${params.title}"
Môn học: "${params.subject}"
Lớp: "${params.grade}"
Dàn ý: ${JSON.stringify(params.outline || [])}
Tóm tắt các giải pháp áp dụng: ${JSON.stringify(params.solutions || [])}

Hãy chấm điểm và nhận xét cực kỳ chi tiết theo đúng cấu trúc JSON sau:
{
  "scores": {
    "novelty": 82,
    "practicality": 88,
    "scientificValue": 85,
    "presentation": 90,
    "total": 86
  },
  "pros": [
    "Đề tài chạm trúng thực trạng nóng hổi của trường học hiện đại tại Việt Nam.",
    "Bố cục chặt chẽ theo thông tư hướng dẫn của ngành giáo dục.",
    "Các biện pháp đề xuất có áp dụng chuyển đổi số thực tế và khả thi cao."
  ],
  "cons": [
    "Cần làm rõ hơn cách giáo viên phân hóa học sinh tiếp cận trong biện pháp số 2.",
    "Số liệu khảo sát đầu năm còn thiếu sự phân bổ theo học lực của đối tượng cá biệt.",
    "Phần cơ sở thực tiễn cần nhấn mạnh các khó khăn thực tế địa phương đang gặp phải."
  ],
  "suggestions": [
    "Bổ sung thêm 1 bảng biểu khảo sát nhu cầu hứng thú của học sinh trước tác động để tăng tính khách quan.",
    "Viết sâu thêm về giải pháp bồi dưỡng học sinh yếu kém ở phần kế hoạch hành động.",
    "Đính kèm hướng dẫn sử dụng công cụ dạy học ở danh mục phụ lục minh chứng."
  ]
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 7. Proof Read (Step 10)
export const proofReadSKKN = async (params: {
  content: string;
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/proof-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi soát lỗi chính tả.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Soat lỗi chính tả tiếng Việt, lỗi dấu câu, lỗi lặp từ và định dạng hành văn trong văn bản sư phạm sau. 
Đồng thời kiểm tra xem cách trình bày có hợp chuẩn mực Thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP của Chính phủ hay không (Fonts chữ, cỡ chữ, căn lề, bố trí tiêu mục).
Nhận xét và gợi ý từ ngữ sửa hoàn hảo. Trả về dưới định dạng JSON sau:
{
  "totalErrorsCount": 2,
  "errorsList": [
    { "original": "sử dụng phầm mềm để giạy học", "corrected": "sử dụng phần mềm để dạy học", "reason": "Sai chính tả phụ âm 'm' thành 'm' thừa dấu sắc, và sai 'giạy' thành 'dạy' chuẩn tiếng Việt" }
  ],
  "govComplianceComment": "Văn bản đã tuân thủ định dạng cơ bản của Nghị định 30/2020/NĐ-CP. Nên lưu ý viết hoa các danh từ riêng như 'Bộ Giáo dục và Đào tạo' và điều chỉnh dòng khoảng cách đoạn (Line spacing) từ 1.15 thành 1.5.",
  "improvedParagraph": "Bao gồm văn bản đã được bạn sửa đổi lý tưởng, sẵn sàng để sao chép."
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};

// 8. Generate Slides Structure (Step 9)
export const generateSlides = async (params: {
  title: string;
  subject: string;
  grade: string;
  solutions: any[];
  criteriaContext?: string;
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const response = await fetch("/api/gemini/generate-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Lỗi máy chủ Express khi xây dựng slide.");
    }
    return response.json();
  }

  const criteriaBlock = params.criteriaContext ? `\n\nLƯU Ý QUAN TRỌNG - TIÊU CHÍ ĐÁNH GIÁ TỪ CÔNG VĂN:\n${params.criteriaContext}\nHãy đảm bảo nội dung sinh ra tuân thủ chặt chẽ các tiêu chí đánh giá và yêu cầu nêu trên.` : "";

  const prompt = `Từ thông tin đề tài SKKN: "${params.title}" (${params.subject} - lớp ${params.grade})
Hãy xây dựng cấu trúc hoàn hảo của 6 slide thuyết trình bảo vệ đề tài trước hội đồng chấm giải cấp Huyện/Tỉnh.
Cấu trúc chuẩn sư phọng khoa học chuyên nghiệp. 

Trả về JSON định dạng chính xác sau:
{
  "presentationTheme": "Màu sắc đề xuất chủ đạo: Xanh ngọc lục bảo kết hợp Trắng xám sang trọng khoa học",
  "slides": [
    { "slideIndex": 1, "title": "Báo Cáo Sáng Kiến Kinh Nghiệm 2026", "subtitle": "Đề tài: ${params.title}", "bullets": ["Người thực hiện: [Tên tác giả]", "Đơn vị công tác: [Đơn vị]", "Môn giảng dạy: ${params.subject} lớp ${params.grade}"] },
    { "slideIndex": 2, "title": "Tính cấp thiết và Thực trạng trước tác động", "bullets": ["Thiếu hứng thú chủ trì học tập ở học sinh.", "Tỷ lệ thực hành sáng tạo chiếm dưới 30%.", "Phương pháp truyền thống thiếu tính đối thoại và trải nghiệm trực tiếp."] },
    { "slideIndex": 3, "title": "Biện pháp cốt lõi 1", "bullets": ["Chi tiết giải pháp triển khai thực tế hành động.", "Thay đổi cách thức tương tác của giáo viên và học sinh.", "Minh chứng áp dụng cụ thể: Bảng đánh giá năng lực tích cực."] },
    { "slideIndex": 4, "title": "Biện pháp cốt lõi 2 & 3", "bullets": ["Triển khai ứng dụng chuyển đổi số nâng cao kết quả học tập.", "Thực hiện đa dạng hóa hình thức tự học, trải nghiệm ngoại khóa.", "Công cụ hỗ trợ hữu ích: Phiếu trắc nghiệm điểm số tức thời."] },
    { "slideIndex": 5, "title": "Kết quả thực nghiệm sư phạm đạt được", "bullets": ["Tỷ lệ học sinh Khá Giỏi tăng vượt bậc rõ rệt.", "Mức độ hăng say học bài cải thiện đáng mừng.", "Được tập thể giáo viên trong tổ chuyên môn công nhận nhân rộng."] },
    { "slideIndex": 6, "title": "Lời cảm ơn & Cam kết", "bullets": ["Xin trân trọng cảm ơn quý Hội đồng Giám khảo lắng nghe.", "Cam kết tính trung thực tuyệt đối của sáng kiến kinh nghiệm.", "Rất mong nhận được phản hồi đóng ý kiến quý giá."] }
  ]
}` + criteriaBlock;

  return executeWithFallback(prompt, true);
};
