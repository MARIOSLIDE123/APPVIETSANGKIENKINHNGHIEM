import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Download, 
  Printer, 
  Copy, 
  FileText,
  Sliders,
  User,
  School,
  Book,
  GraduationCap,
  Upload,
  FileCheck,
  MapPin,
  Building,
  Calendar,
  Layers,
  Cpu
} from "lucide-react";
import { Project, OutlineItem } from "../types";
import {
  generateOutline,
  refineText
} from "../utils/geminiClient";
import { exportToDocx } from "../utils/docxGenerator";

interface StepRendererProps {
  currentStep: number;
  project: Project | null;
  onUpdateProject: (updates: Partial<Project>) => void;
  onStepChange: (step: number) => void;
  onSetSelectedText: (text: string) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  project,
  onUpdateProject,
  onStepChange,
  onSetSelectedText
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center text-white mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">Chưa khởi tạo đề tài Sáng kiến kinh nghiệm</h2>
        <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
          Quý thầy cô vui lòng lựa chọn đề tài hoặc nhấn vào nút khởi tạo đề tài mới ở chân trang để mở quy trình xây dựng Sáng kiến kinh nghiệm bài bản.
        </p>
      </div>
    );
  }

  // Helper: Build context from uploaded criteria document
  const buildCriteriaContext = (): string | undefined => {
    if (!project?.uploadedCriteria) return undefined;
    const c = project.uploadedCriteria;
    let ctx = "";
    if (c.criteriaList.length > 0) {
      ctx += "TIÊU CHÍ ĐÁNH GIÁ:\n";
      c.criteriaList.forEach(cr => {
        ctx += `- ${cr.name} (${cr.maxScore} điểm): ${cr.description}\n`;
      });
    }
    if (c.requirements.length > 0) {
      ctx += "\nYÊU CẦU BẮT BUỘC:\n";
      c.requirements.forEach(r => { ctx += `- ${r}\n`; });
    }
    if (c.focusPoints.length > 0) {
      ctx += "\nTRỌNG TÂM CẦN LƯU Ý:\n";
      c.focusPoints.forEach(f => { ctx += `- ${f}\n`; });
    }
    return ctx || undefined;
  };



  const handleRemoveCriteria = () => {
    onUpdateProject({ uploadedCriteria: undefined });
  };

  // Step 1: Submit info to AI for Outline generation
  const handleStep1Submit = async () => {
    if (!project.title.trim()) {
      setErrorMsg("Vui lòng nhập tên đề tài của Sáng kiến kinh nghiệm!");
      return;
    }
    if (!project.subject.trim()) {
      setErrorMsg("Vui lòng nhập môn học/lĩnh vực!");
      return;
    }
    if (!project.school.trim()) {
      setErrorMsg("Vui lòng nhập tên trường / đơn vị!");
      return;
    }
    
    setErrorMsg("");
    setLoading(true);
    onUpdateProject({ status: "generating", errorMsg: undefined });

    try {
      const data = await generateOutline({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        level: project.level,
        context: project.description,
        criteriaContext: buildCriteriaContext()
      });
      
      onUpdateProject({
        outline: {
          analyticalRating: data.analyticalRating,
          items: data.outline
        },
        status: "idle",
        errorMsg: undefined
      });

      onStepChange(2);
    } catch (err: any) {
      setErrorMsg(`Có lỗi phát sinh từ AI: ${err.message}. Thầy cô vui lòng kiểm tra cấu hình API Key và thử lại!`);
      onUpdateProject({ status: "error", errorMsg: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Seed standard/pre-made high-quality outline manually if requested
  const handleUsePredefinedOutline = () => {
    setErrorMsg("");
    onUpdateProject({
      outline: {
        analyticalRating: {
          urgency: 90,
          newness: 88,
          feasibility: 92,
          comment: "Cấu trúc dàn ý chuẩn quy định Bộ GD&ĐT Việt Nam, kết nối logic giữa thực trạng và giải pháp."
        },
        items: [
          {
            section: "I. ĐẶT VẤN ĐỀ",
            details: [
              "1. Tính cấp thiết của đề tài nghiên cứu.",
              "2. Mục đích và đối tượng khảo sát.",
              "3. Phạm vi giới hạn nội dung sáng kiến."
            ]
          },
          {
            section: "II. CƠ SỞ LÝ LUẬN",
            details: [
              "1. Các văn bản pháp lý định hướng GDPT 2018.",
              "2. Lý thuyết nền tảng sư phạm của phương pháp mới."
            ]
          },
          {
            section: "III. THỰC TRẠNG VẤN ĐỀ",
            details: [
              "1. Khảo sát thuận lợi, khó khăn đầu năm học.",
              "2. Phân tích nguyên nhân điểm nghẽn thực tế."
            ]
          },
          {
            section: "IV. CÁC BIỆN PHÁP THỰC HIỆN CỐT LÕI",
            details: [
              "1. Biện pháp 1: Thiết kế hoạt động số hóa tương tác.",
              "2. Biện pháp 2: Xây dựng bộ phiếu rèn luyện tự học.",
              "3. Biện pháp 3: Tổ chức hoạt động thực hành làm việc nhóm."
            ]
          },
          {
            section: "V. HIỆU QUẢ, KẾT LUẬN & KIẾN NGHỊ",
            details: [
              "1. Đánh giá kết quả đối sánh sau thực nghiệm.",
              "2. Bài học kinh nghiệm sư phạm rút ra.",
              "3. Đề xuất kiến nghị với các cấp quản lý giáo dục."
            ]
          }
        ]
      }
    });
    onStepChange(2);
  };

  // Generic AI text generation handler for sections
  const handleGenerateSection = async (
    sectionKey: "contentPart1And2" | "contentPart3" | "contentSolution1" | "contentSolution2" | "contentSolution3" | "contentConclusion", 
    promptType: string
  ) => {
    setErrorMsg("");
    setLoading(true);
    onUpdateProject({ status: "generating", errorMsg: undefined });

    try {
      let prompt = `Bạn là cố vấn chuyên môn viết Sáng kiến kinh nghiệm (SKKN) và Nghiên cứu khoa học sư phạm ứng dụng cấp Quốc gia. Có kiến thức uyên thâm, tuân thủ chặt chẽ các quy định của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy viết một bài viết cực kỳ chi tiết, học thuật chuyên sâu và có dẫn chứng thực tế cho: ${promptType}.
Thông tin đề tài:
- Tên đề tài: "${project.title}"
- Tác giả: "${project.author || "Nguyễn Văn A"}"
- Đơn vị công tác: "${project.school || "Trường học"}"
- Địa điểm: "${project.location || "Chưa cung cấp"}"
- Môn học: "${project.subject}"
- Khối lớp: "${project.grade}"
- Cấp học: "${project.level}"
- Bối cảnh thực trạng: "${project.description}"
- Cơ sở vật chất (CSVC): "${project.facilities || "Chưa cung cấp"}"
- Sách giáo khoa: "${project.textbook || "GDPT 2018"}"
- Đối tượng nghiên cứu: "${project.targetStudents || "Học sinh"}"
- Thời gian thực hiện: "${project.duration || "Năm học hiện tại"}"
- Ứng dụng AI/Công nghệ: "${project.aiTools || "Chưa áp dụng"}"
- Trọng tâm/Đặc thù đề tài: "${project.focusPointsText || "Đổi mới phương pháp"}"
`;

      if (project.limitPages) {
        prompt += `- Độ dài yêu cầu: Viết nội dung phong phú tương thích với giới hạn ${project.limitPages} trang của toàn bài.\n`;
      }
      if (project.includeRealExamples) {
        prompt += `- Yêu cầu đặc biệt: Tích hợp nhiều ví dụ thực tế cụ thể, bài toán mẫu hoặc ví dụ minh họa trực quan sinh động.\n`;
      }
      if (project.includeStatsTables) {
        prompt += `- Yêu cầu đặc biệt: Bổ sung bảng biểu số liệu thống kê kết quả học tập giả định (ví dụ bảng đối sánh khảo sát hoặc thực nghiệm có tổng số học sinh là 40).\n`;
      }
      if (project.otherRequirements) {
        prompt += `- Yêu cầu bổ sung khác của người dùng: "${project.otherRequirements}"\n`;
      }

      // Add outline items to give context if present
      if (project.outline?.items) {
        prompt += `\nDàn ý chung đã lập:\n${JSON.stringify(project.outline.items)}\n`;
      }

      // Add previously written content for coherence if generated
      if (sectionKey !== "contentPart1And2" && project.contentPart1And2) {
        prompt += `\nĐọc Phần I & II đã viết để viết tiếp mạch lạc:\n${project.contentPart1And2.substring(0, 1500)}...\n`;
      }

      prompt += `\nYÊU CẦU HÀNH VĂN:
1. Viết trực tiếp nội dung phần ${promptType}, không được chèn lời chào, không chèn các ghi chú giải thích bên ngoài.
2. Sử dụng văn phong nghiên cứu khoa học sư phạm chính thống trang trọng của Việt Nam.
3. Đảm bảo dung lượng bài viết dài, chi tiết, học thuật chuyên sâu sắc sảo (mục tiêu viết tối đa lên đến 100 trang khi ghép nối các phần).
4. Phân tích rõ nét vai trò của giáo viên trong việc hướng dẫn tổ chức, và học sinh trong việc tự học chủ động.`;

      const response = await refineText({
        text: prompt,
        action: "chat",
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        [sectionKey]: response.refinedText,
        status: "idle",
        errorMsg: undefined
      });
    } catch (err: any) {
      setErrorMsg(`Lỗi khi tạo nội dung: ${err.message}`);
      onUpdateProject({ status: "error", errorMsg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copySectionText = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Đã sao chép nội dung vào khay nhớ tạm!");
    }
  };

  const hasAnyKey = !!(
    localStorage.getItem("gemini_api_key_1") ||
    localStorage.getItem("gemini_api_key_2") ||
    localStorage.getItem("gemini_api_key_3") ||
    localStorage.getItem("gemini_api_key")
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto space-y-8 min-h-screen">
      
      {/* Alert Messaging Block */}
      {(project.errorMsg || errorMsg) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-fade-in text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Hệ thống thông báo:</span> {project.errorMsg || errorMsg}
          </div>
        </div>
      )}

      {/* STEP 1: INFORMATION SETUP */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bước 1 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Thiết Lập Thông Tin Sáng Kiến
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Cung cấp thông tin chính xác để AI tạo ra bản thảo chất lượng nhất.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            {/* THÔNG TIN BẮT BUỘC */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#7C3AED] uppercase border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                1. THÔNG TIN BẮT BUỘC
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Tên đề tài SKKN *</label>
                <textarea
                  value={project.title}
                  onChange={(e) => onUpdateProject({ title: e.target.value })}
                  placeholder="Ví dụ: Một số giải pháp nâng cao tính tích cực tham gia của học sinh khối lớp 4 thông qua các trò chơi tương tác số hóa."
                  rows={3}
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Book className="w-3.5 h-3.5 text-slate-400" />
                    Môn học/Lĩnh vực *
                  </label>
                  <input
                    type="text"
                    value={project.subject}
                    onChange={(e) => onUpdateProject({ subject: e.target.value })}
                    placeholder="Ví dụ: Tin học / Toán / Ngữ văn"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Cấp học
                  </label>
                  <select
                    value={project.level}
                    onChange={(e) => onUpdateProject({ level: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 h-[42px] focus:outline-none focus:border-[#7C3AED] bg-white transition"
                  >
                    <option value="Mầm non">Mầm non</option>
                    <option value="Tiểu học">Tiểu học</option>
                    <option value="Trung học cơ sở">Trung học cơ sở</option>
                    <option value="Trung học phổ thông">Trung học phổ thông</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Khối lớp
                  </label>
                  <input
                    type="text"
                    value={project.grade}
                    onChange={(e) => onUpdateProject({ grade: e.target.value })}
                    placeholder="Ví dụ: Khối 4 / Lớp 10A"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    Tên trường / Đơn vị *
                  </label>
                  <input
                    type="text"
                    value={project.school}
                    onChange={(e) => onUpdateProject({ school: e.target.value })}
                    placeholder="Ví dụ: Trường Tiểu học Nguyễn Huệ"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Địa điểm (Huyện, Tỉnh) *
                  </label>
                  <input
                    type="text"
                    value={project.location || ""}
                    onChange={(e) => onUpdateProject({ location: e.target.value })}
                    placeholder="Ví dụ: Quận 1, TP.HCM"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Điều kiện CSVC (Tivi, Máy chiếu, WiFi...) *
                </label>
                <input
                  type="text"
                  value={project.facilities || ""}
                  onChange={(e) => onUpdateProject({ facilities: e.target.value })}
                  placeholder="Ví dụ: Phòng máy chiếu, Tivi thông minh, Internet ổn định..."
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

            {/* THÔNG TIN BỔ SUNG */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-[#FF6B00] uppercase pb-1.5 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                2. THÔNG TIN BỔ SUNG <span className="text-[10px] font-medium text-slate-400 lowercase">(Khuyên dùng để tăng chi tiết)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Sách giáo khoa</label>
                  <input
                    type="text"
                    value={project.textbook || ""}
                    onChange={(e) => onUpdateProject({ textbook: e.target.value })}
                    placeholder="Ví dụ: Cánh Diều, Kết nối tri thức..."
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Đối tượng nghiên cứu</label>
                  <input
                    type="text"
                    value={project.targetStudents || ""}
                    onChange={(e) => onUpdateProject({ targetStudents: e.target.value })}
                    placeholder="Ví dụ: 45 HS lớp 4A (thực nghiệm) và 45 HS lớp 4B (đối chứng)"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Thời gian thực hiện
                  </label>
                  <input
                    type="text"
                    value={project.duration || ""}
                    onChange={(e) => onUpdateProject({ duration: e.target.value })}
                    placeholder="Ví dụ: Năm học 2025 - 2026"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    Ứng dụng AI/Công nghệ
                  </label>
                  <input
                    type="text"
                    value={project.aiTools || ""}
                    onChange={(e) => onUpdateProject({ aiTools: e.target.value })}
                    placeholder="Ví dụ: ChatGPT, Canva, Padlet, Quizziz..."
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Đặc thù / Trọng tâm đề tài</label>
                <input
                  type="text"
                  value={project.focusPointsText || ""}
                  onChange={(e) => onUpdateProject({ focusPointsText: e.target.value })}
                  placeholder="Ví dụ: Phát triển năng lực tự học, tăng tính chủ động thực hành, nâng cao điểm số..."
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

            {/* TÀI LIỆU THAM KHẢO */}
            {project.uploadedCriteria && (
              <div className="space-y-3 pt-4 border-t border-slate-100 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  3. TÀI LIỆU THAM KHẢO / CÔNG VĂN ĐÃ NẠP
                </h3>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 line-clamp-1">{project.uploadedCriteria.fileName}</p>
                      <p className="text-[10px] text-emerald-600">AI đã phân tích và sẽ bám sát cấu trúc của mẫu này khi viết.</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveCriteria(); }}
                    className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline transition px-2 py-1"
                  >
                    Xoá
                  </button>
                </div>

                {project.uploadedCriteria.aiSummary && (
                  <div className="p-3.5 rounded-2xl bg-purple-50/20 border border-purple-100 text-xs text-slate-650 leading-relaxed">
                    <span className="font-bold text-[#7C3AED] uppercase text-[10px] tracking-wider block mb-1">Tóm tắt AI về công văn:</span>
                    {project.uploadedCriteria.aiSummary}
                  </div>
                )}
              </div>
            )}

            {/* YÊU CẦU KHÁC */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                4. YÊU CẦU KHÁC <span className="text-[10px] font-medium text-slate-400 lowercase">(Tùy chọn - AI sẽ tuân thủ nghiêm ngặt)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-750">Số lượng giải pháp cần viết (Mặc định: 3 giải pháp)</label>
                  <select
                    value={project.solutionsCount || 3}
                    onChange={(e) => onUpdateProject({ solutionsCount: parseInt(e.target.value) })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-800 bg-white"
                  >
                    <option value="1">1 giải pháp</option>
                    <option value="2">2 giải pháp</option>
                    <option value="3">3 giải pháp</option>
                    <option value="4">4 giải pháp</option>
                    <option value="5">5 giải pháp</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Số trang SKKN cần giới hạn</label>
                  <input
                    type="text"
                    value={project.limitPages || ""}
                    onChange={(e) => onUpdateProject({ limitPages: e.target.value })}
                    placeholder="Ví dụ: 25, 30... (Để trống nếu không giới hạn)"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.includeRealExamples || false}
                    onChange={(e) => onUpdateProject({ includeRealExamples: e.target.checked })}
                    className="accent-[#7C3AED]"
                  />
                  <span>Thêm nhiều bài toán thực tế, ví dụ minh họa</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.includeStatsTables || false}
                    onChange={(e) => onUpdateProject({ includeStatsTables: e.target.checked })}
                    className="accent-[#7C3AED]"
                  />
                  <span>Bổ sung bảng biểu, số liệu thống kê</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705">Yêu cầu bổ sung khác (tùy ý)</label>
                <textarea
                  value={project.otherRequirements || ""}
                  onChange={(e) => onUpdateProject({ otherRequirements: e.target.value })}
                  placeholder="Nhập các yêu cầu đặc biệt khác của bạn. Ví dụ: Viết ngắn gọn phần cơ sở lý luận (khoảng 3 trang), tập trung vào giải pháp ứng dụng AI..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

            {/* Tùy chọn khởi tạo (Footer buttons) */}
            <div className="space-y-4 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Tùy chọn khởi tạo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleStep1Submit}
                  disabled={loading || !project.title.trim()}
                  className="py-3 px-6 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7C3AED] font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  )}
                  <span>AI Lập Dàn Ý Chi Tiết</span>
                </button>
                <button
                  onClick={handleUsePredefinedOutline}
                  disabled={loading || !project.title.trim()}
                  className="py-3 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Sử Dụng Dàn Ý Có Sẵn</span>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStep1Submit}
                  disabled={loading || !project.title.trim()}
                  className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI đang lập dàn ý...</span>
                    </>
                  ) : (
                    <>
                      <span>Bắt đầu lập dàn ý ngay</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PROPOSED OUTLINE */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400 tracking-wider">Bước 2 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Dàn Ý Khoa Học Tiêu Chuẩn Bộ GD&ĐT
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Dưới đây là dàn ý chi tiết cấu trúc của Sáng kiến kinh nghiệm. Hãy xem xét và bấm nút tiếp tục để tiến hành viết bài.
            </p>
          </div>

          {project.outline?.analyticalRating && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50/20 border border-orange-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Tính cấp thiết</span>
                <span className="text-2xl font-display font-extrabold text-[#FF6B00] mt-1">{project.outline.analyticalRating.urgency}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-purple-50/20 border border-purple-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Tính sáng tạo mới</span>
                <span className="text-2xl font-display font-extrabold text-[#7C3AED] mt-1">{project.outline.analyticalRating.newness}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50/20 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Khả năng thực thi</span>
                <span className="text-2xl font-display font-extrabold text-emerald-600 mt-1">{project.outline.analyticalRating.feasibility}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nhận định chung của AI:</span>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal italic line-clamp-3">
                  "{project.outline.analyticalRating.comment}"
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">ĐỀ CƯƠNG CHI TIẾT BẢN THẢO</h3>
            
            {project.outline?.items ? (
              <div className="space-y-4">
                {project.outline.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-[#7C3AED] uppercase">{item.section}</div>
                    <ul className="space-y-1.5 pl-4 list-decimal text-xs text-slate-600">
                      {item.details.map((detail, dIdx) => (
                        <li key={dIdx} className="leading-relaxed hover:text-slate-900 transition">{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400 italic">
                Thầy cô vui lòng thực thi tạo dàn ý ở bước 1 trước.
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(1)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại Bước 1
            </button>
            <button
              onClick={() => onStepChange(3)}
              disabled={!project.outline?.items}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Bắt đầu viết các phần</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PHẦN I & II */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 3 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#7C3AED]" />
              Phần I: Đặt Vấn Đề & Phần II: Cơ Sở Lý Luận
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Soạn thảo chi tiết về tính cấp thiết, lý thuyết nền tảng sư phạm và các cơ sở pháp lý của đề tài.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentPart1And2?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentPart1And2", "Phần I: ĐẶT VẤN ĐỀ & Phần II: CƠ SỞ LÝ LUẬN")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentPart1And2 || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentPart1And2 || ""}
              onChange={(e) => onUpdateProject({ contentPart1And2: e.target.value })}
              className="w-full min-h-[400px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(2)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại dàn ý
            </button>
            <button
              onClick={() => onStepChange(4)}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục (Bước 4)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PHẦN III */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 4 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#FF6B00]" />
              Phần III: Thực Trạng Vấn Đề
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Viết khảo sát thực trạng thuận lợi, khó khăn tại địa phương và số liệu khảo sát định lượng ban đầu.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentPart3?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentPart3", "Phần III: THỰC TRẠNG VẤN ĐỀ")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentPart3 || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentPart3 || ""}
              onChange={(e) => onUpdateProject({ contentPart3: e.target.value })}
              className="w-full min-h-[400px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(3)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại Bước 3
            </button>
            <button
              onClick={() => onStepChange(5)}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục (Bước 5)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: GIẢI PHÁP 1 */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 5 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-[#7C3AED]" />
              Giải Pháp 1: Viết giải pháp trọng tâm
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Trình bày giải pháp số một, quy trình tổ chức, các bước tiến hành, ví dụ minh họa và minh chứng cụ thể.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentSolution1?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentSolution1", "Biện pháp 1 (Giải pháp trọng tâm thứ nhất)")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentSolution1 || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentSolution1 || ""}
              onChange={(e) => onUpdateProject({ contentSolution1: e.target.value })}
              className="w-full min-h-[400px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(4)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại Bước 4
            </button>
            <button
              onClick={() => onStepChange(6)}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục (Bước 6)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: GIẢI PHÁP 2 */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 6 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-[#FF6B00]" />
              Giải Pháp 2: Viết giải pháp thứ hai
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Trình bày chi tiết giải pháp thứ hai ứng dụng thực tế sư phạm.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentSolution2?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentSolution2", "Biện pháp 2 (Giải pháp thứ hai)")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentSolution2 || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentSolution2 || ""}
              onChange={(e) => onUpdateProject({ contentSolution2: e.target.value })}
              className="w-full min-h-[400px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(5)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition cursor-pointer"
            >
              Quay lại Bước 5
            </button>
            <button
              onClick={() => onStepChange(7)}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục (Bước 7)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: GIẢI PHÁP 3 */}
      {currentStep === 7 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 7 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-[#7C3AED]" />
              Giải Pháp 3: Viết giải pháp thứ ba
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Trình bày chi tiết giải pháp thứ ba và hoàn thiện các bước triển khai hành động.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentSolution3?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentSolution3", "Biện pháp 3 (Giải pháp thứ ba)")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentSolution3 || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentSolution3 || ""}
              onChange={(e) => onUpdateProject({ contentSolution3: e.target.value })}
              className="w-full min-h-[400px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(6)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại Bước 6
            </button>
            <button
              onClick={() => onStepChange(8)}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục (Bước 8)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: HIỆU QUẢ, KẾT LUẬN & KIẾN NGHỊ */}
      {currentStep === 8 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 8 trên 8</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Hiệu Quả, Kết Luận & Khuyến Nghị
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Đánh giá hiệu quả sau tác động, nêu bài học kinh nghiệm và đề xuất các kiến nghị lên nhà trường và các cấp quản lý giáo dục.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{project.contentConclusion?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateSection("contentConclusion", "Phần CUỐI: HIỆU QUẢ, KẾT LUẬN VÀ KIẾN NGHỊ KHUYẾN NGHỊ")}
                  disabled={loading}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-purple-55 bg-gradient-to-tr from-[#FF6B00]/10 to-[#7C3AED]/10 text-[#7C3AED] hover:opacity-90 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>AI Viết Chi Tiết</span>
                </button>
                <button
                  onClick={() => copySectionText(project.contentConclusion || "")}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
              </div>
            </div>

            <textarea
              value={project.contentConclusion || ""}
              onChange={(e) => onUpdateProject({ contentConclusion: e.target.value })}
              className="w-full min-h-[300px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Nhập nội dung hoặc nhấn 'AI Viết Chi Tiết' để sinh tự động..."
            />
          </div>

          {/* Combined publishing box */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase">Đóng gói & Xuất bản Sáng kiến kinh nghiệm</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Chúc mừng thầy/cô đã hoàn thiện toàn bộ bản thảo. Mọi phần nội dung viết chi tiết sẽ được tự động sáp nhập và căn lề chuẩn Nghị định 30/2020/NĐ-CP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => exportToDocx(project)}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                Tải xuống file Word (.DOCX)
              </button>
              <button
                onClick={() => window.print()}
                className="py-3.5 px-6 rounded-2xl border border-slate-350 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer bg-white"
              >
                <Printer className="w-4 h-4" />
                In / Xuất PDF báo cáo
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(7)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              Quay lại Giải pháp 3
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
