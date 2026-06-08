import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  BarChart, 
  Layers, 
  AlertCircle, 
  Download, 
  Printer, 
  Copy, 
  HelpCircle,
  FileText,
  BadgeAlert,
  Sliders,
  ChevronRight,
  User,
  School,
  Book,
  GraduationCap,
  Upload,
  FileCheck
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell 
} from "recharts";
import { Project, SurveyRow, Solution, OutlineItem } from "../types";
import {
  generateOutline,
  generateSurvey,
  generateSolutions,
  generateExperiment,
  evaluateSKKN,
  proofReadSKKN,
  generateSlides
} from "../utils/geminiClient";
import { exportToDocx } from "../utils/docxGenerator";
import { exportToPptx } from "../utils/pptxGenerator";

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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  // --- Step 1: Thiết lập thông tin ---
  const handleStep1Change = (field: keyof Project, value: any) => {
    onUpdateProject({ [field]: value });
  };

  const handleCriteriaUpload = async (file: File) => {
    if (!file) return;
    
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Chỉ hỗ trợ file PDF, DOC hoặc DOCX. Vui lòng chọn đúng định dạng!");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File vượt quá giới hạn 10MB. Vui lòng chọn file nhỏ hơn!");
      return;
    }
    
    setUploadLoading(true);
    setErrorMsg("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload-criteria", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Lỗi khi tải lên file.");
      }
      
      const data = await response.json();
      
      onUpdateProject({
        uploadedCriteria: {
          fileName: data.fileName,
          uploadedAt: data.uploadedAt,
          rawTextPreview: data.rawTextPreview,
          criteriaList: data.criteriaList || [],
          requirements: data.requirements || [],
          focusPoints: data.focusPoints || [],
          aiSummary: data.aiSummary || ""
        }
      });
    } catch (err: any) {
      setErrorMsg(`Lỗi phân tích file: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveCriteria = () => {
    onUpdateProject({ uploadedCriteria: undefined });
  };

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

  const handleStep1Submit = async () => {
    if (!project.title.trim()) {
      setErrorMsg("Vui lòng nhập tên đề tài của Sáng kiến kinh nghiệm!");
      return;
    }
    setErrorMsg("");
    setLoading(true);

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
        }
      });

      // Advance to step 2 automatically
      onStepChange(2);
    } catch (err: any) {
      setErrorMsg(`Có lỗi phát sinh từ AI: ${err.message}. Thầy cô vui lòng kiểm tra kết nối mạng và thử lại!`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Lập dàn ý khoa học ---
  const handleOutlineSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await generateSurvey({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        survey: {
          totalQty: data.totalQty || 40,
          surveyRows: data.surveyRows,
          pedagogicalComment: data.pedagogicalComment
        }
      });

      onStepChange(3);
    } catch (err: any) {
      setErrorMsg(`Lỗi khi khởi tạo số liệu khảo sát: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Khảo sát thực trạng ---
  const handleSurveyRowChange = (index: number, field: keyof SurveyRow, value: any) => {
    if (!project.survey) return;
    const rows = [...project.survey.surveyRows];
    rows[index] = { ...rows[index], [field]: value };
    
    // Auto-compute rates based on totalQty=40
    if (field === "achievedCount") {
      const ac = Number(value);
      rows[index].achievedRate = (ac / project.survey.totalQty) * 100;
      rows[index].notAchievedCount = project.survey.totalQty - ac;
      rows[index].notAchievedRate = ((project.survey.totalQty - ac) / project.survey.totalQty) * 100;
    }

    onUpdateProject({
      survey: {
        ...project.survey,
        surveyRows: rows
      }
    });
  };

  const addSurveyRow = () => {
    if (!project.survey) return;
    const newRow: SurveyRow = {
      criteria: "Tiêu chí khảo sát mới...",
      achievedCount: 20,
      achievedRate: 50,
      notAchievedCount: 20,
      notAchievedRate: 50
    };
    onUpdateProject({
      survey: {
        ...project.survey,
        surveyRows: [...project.survey.surveyRows, newRow]
      }
    });
  };

  const removeSurveyRow = (index: number) => {
    if (!project.survey) return;
    const rows = [...project.survey.surveyRows];
    rows.splice(index, 1);
    onUpdateProject({
      survey: {
        ...project.survey,
        surveyRows: rows
      }
    });
  };

  const handleStep3Submit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await generateSolutions({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        solutionCount: project.solutionsCount || 3,
        options: project.solutionOptions || { tables: true, evidence: true, infographic: false },
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        solutions: data.solutions
      });

      onStepChange(4);
    } catch (err: any) {
      setErrorMsg(`Lỗi khi thiết kế giải pháp: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4: Đột phá Biện pháp thực tiễn ---
  const handleSolutionChange = (index: number, field: keyof Solution, value: any) => {
    if (!project.solutions) return;
    const sols = [...project.solutions];
    sols[index] = { ...sols[index], [field]: value };
    onUpdateProject({ solutions: sols });
  };

  const handleStep4Submit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await generateExperiment({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        solutionsDraft: project.solutions || [],
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        experiment: {
          comparisonData: data.comparisonData,
          statisticalAnalysis: data.statisticalAnalysis,
          conclusion: data.conclusion
        }
      });

      onStepChange(5);
    } catch (err: any) {
      setErrorMsg(`Lỗi sinh chỉ số thực nghiệm đối chứng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5: Thực nghiệm đối chứng ---
  const handleStep5Submit = async () => {
    // Write full document first draft from prior modules
    setLoading(true);
    setErrorMsg("");
    
    try {
      // Create comprehensive structured essay base content
      let essay = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nBÁO CÁO SÁNG KIẾN KINH NGHIỆM\\N`;
      essay += `Tên đề tài: ${project.title.toUpperCase()}\n`;
      essay += `Tác giả: ${project.author || "[Chưa ghi]"}\n`;
      essay += `Đơn vị: ${project.school || "[Chưa ghi]"}\n`;
      essay += `Môn giảng dạy: ${project.subject} - Lớp ${project.grade}\n\n`;
      essay += `-------------------\n\n`;
      essay += `PHẦN I: ĐẶT VẤN ĐỀ\n1. Tính cấp thiết của đề tài\nHiện nay, công việc đổi mới chương trình GDPT đòi hỏi bức thiết việc thay đổi phương pháp dạy học. Đề tài "${project.title}" được hình thành xuất phát từ mâu thuẫn giữa thực trạng dạy học thụ động với yêu cầu bồi dưỡng năng lực tự học ở học sinh.\n\n`;
      essay += `PHẦN II: GIẢI QUYẾT VẤN ĐỀ\n1. Cơ sở lý luận & thực tiễn\n${project.survey?.pedagogicalComment || "Dữ liệu khảo sát cơ sở thực tiễn đầy đủ."}\n\n`;
      
      if (project.solutions) {
        essay += `2. Các biện pháp thực hiện cốt lõi:\n`;
        project.solutions.forEach((sol) => {
          essay += `- Biện pháp ${sol.index}: ${sol.title}\n`;
          essay += `  * Mục đích: ${sol.purpose}\n`;
          essay += `  * Các bước triển khai:\n  ${sol.steps.join("\n  ")}\n`;
          if (sol.pedagogicalAdvice) essay += `  * Cố vấn sư phạm: ${sol.pedagogicalAdvice}\n`;
          if (sol.evidenceDescription) essay += `  * Minh chứng kèm theo: ${sol.evidenceDescription}\n`;
          essay += `\n`;
        });
      }

      if (project.experiment) {
        essay += `3. Kết quả thực nghiệm sư phạm:\n${project.experiment.statisticalAnalysis}\n`;
        essay += `${project.experiment.conclusion}\n\n`;
      }

      essay += `PHẦN III: KẾT LUẬN VÀ KIẾN NGHỊ\nSáng kiến kinh nghiệm này có tính nhân rộng cao, đóng vai trò bản lề giúp liên kết các công cụ công nghệ mới với hoạt động làm việc nhóm thực tiễn của học sinh.\n\n`;

      onUpdateProject({
        textEditorContent: essay
      });

      onStepChange(6);
    } catch (err: any) {
      setErrorMsg(`Có lỗi mở trình soạn thảo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 6: Soạn thảo chi tiết ---
  const handleResetEditor = () => {
    if (window.confirm("Thầy cô có chắc chắn đặt lại văn phòng soạn thảo bằng biểu mẫu mới?")) {
      handleStep5Submit();
    }
  };

  const handleStep6Submit = async () => {
    if (!project.textEditorContent || project.textEditorContent.length < 50) {
      setErrorMsg("Vui lòng viết thêm nội dung sáng kiến trước khi đưa qua danh mục quản lý minh chứng phụ lục!");
      return;
    }
    setErrorMsg("");
    
    // Setup boilerplate annex lists
    const defaultAnnex = [
      "Phụ lục 1: Phiếu học tập số 1 - Bài giảng ứng dụng đổi mới",
      "Phụ lục 2: Bảng khảo sát ý kiến phản hồi của học sinh",
      "Tài liệu tham khảo 1: Chương trình Giáo dục phổ thông 2018 - Bộ GD&ĐT",
      "Tài liệu tham khảo 2: Sách giáo khoa kết nối tri thức với cuộc sống"
    ];

    onUpdateProject({
      annexList: project.annexList && project.annexList.length > 0 ? project.annexList : defaultAnnex
    });

    onStepChange(7);
  };

  // --- Step 7: Minh chứng & Phụ lục ---
  const handleStep7Submit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await evaluateSKKN({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        outline: project.outline?.items || [],
        solutions: project.solutions || [],
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        evaluation: data
      });

      onStepChange(8);
    } catch (err: any) {
      setErrorMsg(`Lỗi khi gửi thẩm định nhận xét: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 8: Thẩm định & Phản biện ---
  const handleStep8Submit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await generateSlides({
        title: project.title,
        subject: project.subject,
        grade: project.grade,
        solutions: project.solutions || [],
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        slides: data
      });

      onStepChange(9);
    } catch (err: any) {
      setErrorMsg(`Lỗi cấu trúc PowerPoint: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 9: PowerPoint Slide Structure ---
  const handleStep9Submit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await proofReadSKKN({
        content: project.textEditorContent || "",
        criteriaContext: buildCriteriaContext()
      });

      onUpdateProject({
        proofing: data
      });

      onStepChange(10);
    } catch (err: any) {
      setErrorMsg(`Lỗi soát chữ chính tả: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 10: Formatting & Spelling correction ---
  const handleStep10Submit = () => {
    onStepChange(11);
  };

  // --- Step 11: Export & Print ---
  const triggerPrint = () => {
    window.print();
  };

  const simulateDocxDownload = async () => {
    try {
      await exportToDocx(project);
    } catch (err: any) {
      setErrorMsg(`Lỗi xuất bản Word: ${err.message}`);
    }
  };

  const copyEditorText = () => {
    if (project.textEditorContent) {
      navigator.clipboard.writeText(project.textEditorContent);
      alert("Đã sao chép nội dung soạn thảo vào khay nhớ tạm!");
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto space-y-8 min-h-screen">
      
      {/* Alert Messaging Block */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-fade-in text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Hệ thống thông cáo:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* STEP 1: INFORMATION SETUP */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bước 1 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Thiết Lập Thông Tin Đề Tài & Tác Giả
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Vui lòng bổ sung đầy đủ dữ liệu bối cảnh giảng dạy để AI tối ưu hóa ngôn từ và xây dựng giải pháp mang đậm bản sắc giáo dục Việt Nam.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Tên Đề Tài Sáng Kiến Kinh Nghiệm (Bắt buộc) *</label>
              <textarea
                value={project.title}
                onChange={(e) => handleStep1Change("title", e.target.value)}
                placeholder="Ví dụ: Một số giải pháp nâng cao tính tích cực tham gia của học sinh khối lớp 4 thông qua các trò chơi tương tác số hóa."
                rows={3}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] hover:border-slate-300 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Họ và tên Tác giả
                </label>
                <input
                  type="text"
                  value={project.author}
                  onChange={(e) => handleStep1Change("author", e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  Đơn vị trường công tác
                </label>
                <input
                  type="text"
                  value={project.school}
                  onChange={(e) => handleStep1Change("school", e.target.value)}
                  placeholder="Ví dụ: Trường Tiểu học Nguyễn Huệ"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Book className="w-3.5 h-3.5 text-slate-400" />
                  Môn học ứng dụng
                </label>
                <input
                  type="text"
                  value={project.subject}
                  onChange={(e) => handleStep1Change("subject", e.target.value)}
                  placeholder="Ví dụ: Tin học / Toán / Tiếng Việt"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Khối / Khung Lớp
                </label>
                <input
                  type="text"
                  value={project.grade}
                  onChange={(e) => handleStep1Change("grade", e.target.value)}
                  placeholder="Ví dụ: Lớp 4 / Khối 4"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  Cấp học giảng dạy
                </label>
                <select
                  value={project.level}
                  onChange={(e) => handleStep1Change("level", e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-850 h-[42px] focus:outline-none focus:border-[#7C3AED] bg-white transition"
                >
                  <option value="Mầm non">Mầm non</option>
                  <option value="Tiểu học">Tiểu học</option>
                  <option value="Trung học cơ sở">Trung học cơ sở</option>
                  <option value="Trung học phổ thông">Trung học phổ thông</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Mô tả tóm tắt bối cảnh thực trạng ở trường *</label>
              <textarea
                value={project.description}
                onChange={(e) => handleStep1Change("description", e.target.value)}
                placeholder="Nêu ra những khó khăn: Học sinh chưa hứng thú, còn thụ động trong giờ học thực hành, phòng máy cũ..."
                rows={3}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#7C3AED] transition"
              />
            </div>

            {/* Upload Công Văn / Tiêu Chí Đánh Giá */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
                Tải công văn yêu cầu / Tiêu chí đánh giá chấm điểm SKKN (Không bắt buộc)
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed -mt-1">
                Tải lên file Word hoặc PDF chứa công văn hướng dẫn, bảng tiêu chí chấm điểm từ Sở/Phòng GD&ĐT để AI nắm rõ yêu cầu khi viết bài.
              </p>
              
              {!project.uploadedCriteria ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleCriteriaUpload(file);
                  }}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                    dragOver 
                      ? "border-[#7C3AED] bg-purple-50/50 scale-[1.01]" 
                      : "border-slate-200 hover:border-[#FF6B00]/50 hover:bg-orange-50/20"
                  } ${uploadLoading ? "pointer-events-none opacity-60" : ""}`}
                  onClick={() => {
                    if (!uploadLoading) {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.doc,.docx';
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) handleCriteriaUpload(file);
                      };
                      input.click();
                    }
                  }}
                >
                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center animate-pulse">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">AI đang phân tích nội dung công văn...</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Trích xuất tiêu chí đánh giá & yêu cầu quan trọng</p>
                      </div>
                      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{width: '60%'}} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        dragOver 
                          ? "bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] text-white" 
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">Kéo thả file vào đây hoặc <span className="text-[#7C3AED] underline">chọn file</span></p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ: PDF, DOC, DOCX — Tối đa 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File Info Header */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <FileCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800 line-clamp-1">{project.uploadedCriteria.fileName}</p>
                        <p className="text-[10px] text-emerald-600">Đã phân tích lúc {new Date(project.uploadedCriteria.uploadedAt).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveCriteria(); }}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline transition px-2 py-1"
                    >
                      Xoá & Tải lại
                    </button>
                  </div>

                  {/* AI Summary */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-orange-50/30 border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-[#7C3AED] tracking-wider">Tóm tắt AI</span>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{project.uploadedCriteria.aiSummary}</p>
                  </div>

                  {/* Criteria Table */}
                  {project.uploadedCriteria.criteriaList.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bảng tiêu chí đánh giá chấm điểm</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {project.uploadedCriteria.criteriaList.map((c, idx) => (
                          <div key={idx} className="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50/50 transition text-xs">
                            <span className="shrink-0 w-7 h-7 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold text-[11px]">
                              {c.maxScore}đ
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{c.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{c.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {project.uploadedCriteria.requirements.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Yêu cầu bắt buộc từ công văn</span>
                      <div className="space-y-1">
                        {project.uploadedCriteria.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/50 border border-amber-100 rounded-xl px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                            <span className="leading-relaxed">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus Points */}
                  {project.uploadedCriteria.focusPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Gợi ý trọng tâm khi viết</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.uploadedCriteria.focusPoints.map((fp, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7C3AED] bg-purple-50 border border-purple-100 rounded-full px-2.5 py-1">
                            <Sparkles className="w-3 h-3" />
                            {fp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                  <span>AI đang thiết kế cấu trúc khoa học...</span>
                </>
              ) : (
                <>
                  <span>Tự động phân tích & Lập dàn ý</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROPOSED OUTLINE */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400 tracking-wider">Bước 2 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Dàn Ý Khoa Học Tiêu Chuẩn Bộ GD&ĐT
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              AI đã kiến thiết mẫu đề cương 3 phần học thuật. Căn cứ vào các chỉ số phân tích dưới đây để tiếp tục.
            </p>
          </div>

          {project.outline?.analyticalRating && (
            <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50/20 border border-orange-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Tính cấp thiết</span>
                <span className="text-3xl font-display font-extrabold text-[#FF6B00] mt-1">{project.outline.analyticalRating.urgency}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-purple-50/20 border border-purple-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Tính sáng tạo mới</span>
                <span className="text-3xl font-display font-extrabold text-[#7C3AED] mt-1">{project.outline.analyticalRating.newness}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50/20 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-500">Khả năng thực thi</span>
                <span className="text-3xl font-display font-extrabold text-emerald-600 mt-1">{project.outline.analyticalRating.feasibility}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nhận định của hội đồng AI:</span>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal italic line-clamp-3">
                  "{project.outline.analyticalRating.comment}"
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">ĐỀ CƯƠNG CHI TIẾT</h3>
            
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
                Thầy cô vui lòng thực thi tạo dàn văn ở bước 1 trước.
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(1)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại thiết kế thông tin
            </button>
            <button
              onClick={handleOutlineSubmit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang thiết kế bảng khảo sát...</span>
                </>
              ) : (
                <>
                  <span>Gửi yêu cầu thiết kế số liệu khảo sát</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SURVEY STATISTICS & CHARTS */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 3 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Thiết Lập Số Liệu Khảo Sát Thực Trạng Đầu Năm
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Bảng khảo sát định lượng chứng minh tính thực tiễn học thuật. Trực quan bằng biểu đồ tương thích.
            </p>
          </div>

          {project.survey && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Editable Survey table */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Dữ liệu thô (Tổng mẫu: {project.survey.totalQty} HS)</h3>
                  <button 
                    onClick={addSurveyRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tiêu chí
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {project.survey.surveyRows.map((row, index) => (
                    <div key={index} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs relative">
                      <button 
                        onClick={() => removeSurveyRow(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Tiêu chí:</span>
                        <input
                          type="text"
                          value={row.criteria}
                          onChange={(e) => handleSurveyRowChange(index, "criteria", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 hover:border-slate-300 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600">Số lượng ĐẠT:</span>
                          <input
                            type="number"
                            min="0"
                            max={project.survey?.totalQty || 40}
                            value={row.achievedCount}
                            onChange={(e) => handleSurveyRowChange(index, "achievedCount", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">Tỷ lệ tương ứng:</span>
                          <div className="bg-slate-100 px-2.5 py-1 rounded-lg font-mono text-slate-600">{row.achievedRate}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[11px] text-slate-600 leading-relaxed italic">
                  <b>Khuyên dùng:</b> AI trợ lý đề xuất giữ tổng mẫu là 40 học sinh (tương đương quy mô 1 lớp học tiêu chuẩn Việt Nam) để phân tích đối sánh chính xác nhất.
                </div>
              </div>

              {/* Right: Dynamic Recharts survey graph */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Trực quan biểu đồ khảo sát</h3>
                
                <div className="flex-1 min-h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <RechartsBarChart
                      data={project.survey.surveyRows}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="criteria" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <YAxis unit="%" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar name="Tỉ lệ Đạt (%)" dataKey="achievedRate" fill="#7C3AED" radius={[6, 6, 0, 0]}>
                        {project.survey.surveyRows.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7C3AED" : "#FF6B00"} />
                        ))}
                      </Bar>
                      <Bar name="Chưa Đạt (%)" dataKey="notAchievedRate" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Đánh giá chung thực trạng:</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {project.survey.pedagogicalComment}
                  </p>
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(2)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại dàn ý đề cương
            </button>
            <button
              onClick={handleStep3Submit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang thiết kế giải pháp đột phá...</span>
                </>
              ) : (
                <>
                  <span>Thiết lập giải pháp đổi mới giảng dạy</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPLEMENTATION SOLUTIONS */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 4 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Biện Pháp Sư Phạm Cốt Lõi (Đột Phá Sáng Kiến)
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Thầy cô tuỳ biến số lượng và lựa chọn các công cụ gia tăng tính lập luận khoa học cho báo cáo.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                <Sliders className="w-4 h-4 text-[#7C3AED]" />
                Số lượng giải pháp đề xuất (1 - 10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={project.solutionsCount || 3}
                  onChange={(e) => onUpdateProject({ solutionsCount: parseInt(e.target.value) })}
                  className="flex-1 accent-[#7C3AED]"
                />
                <span className="w-8 h-8 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center font-mono font-bold text-sm">
                  {project.solutionsCount || 3}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">Căn chỉnh cấu trúc AI</span>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.solutionOptions?.tables || false}
                    onChange={(e) => onUpdateProject({ 
                      solutionOptions: { 
                        ...(project.solutionOptions || { tables: true, evidence: true, infographic: false }), 
                        tables: e.target.checked 
                      } 
                    })}
                    className="accent-[#7C3AED]"
                  />
                  Gồm bảng biểu thống kê
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.solutionOptions?.evidence || false}
                    onChange={(e) => onUpdateProject({ 
                      solutionOptions: { 
                        ...(project.solutionOptions || { tables: true, evidence: true, infographic: false }), 
                        evidence: e.target.checked 
                      } 
                    })}
                    className="accent-[#7C3AED]"
                  />
                  Gồm minh chứng
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.solutionOptions?.infographic || false}
                    onChange={(e) => onUpdateProject({ 
                      solutionOptions: { 
                        ...(project.solutionOptions || { tables: true, evidence: true, infographic: false }), 
                        infographic: e.target.checked 
                      } 
                    })}
                    className="accent-[#7C3AED]"
                  />
                  Sơ đồ Infographic
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {project.solutions && project.solutions.map((sol, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-normal">
                    Biện pháp {sol.index}:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Tự động cấu tạo bằng AI</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tên biện pháp sư phạm:</label>
                  <input
                    type="text"
                    value={sol.title}
                    onChange={(e) => handleSolutionChange(index, "title", e.target.value)}
                    className="w-full text-sm font-bold text-slate-800 bg-slate-50/50 p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mục tiêu của biện pháp:</label>
                  <input
                    type="text"
                    value={sol.purpose}
                    onChange={(e) => handleSolutionChange(index, "purpose", e.target.value)}
                    className="w-full text-xs text-slate-600 bg-slate-50/50 p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Tiến trình triển khai:</span>
                    <ul className="space-y-1.5">
                      {sol.steps.map((step, sIdx) => (
                        <li key={sIdx} className="bg-slate-50 p-2 rounded-lg leading-normal text-slate-650 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    {sol.pedagogicalAdvice && (
                      <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                        <span className="text-[10px] font-bold text-amber-800 block">💡 Chỉ dẫn chuyên môn sư phạm:</span>
                        <p className="text-slate-600 leading-normal text-[11px] mt-1">{sol.pedagogicalAdvice}</p>
                      </div>
                    )}
                    {sol.evidenceDescription && (
                      <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-800 block">📸 Chứng minh / Phụ lục đi kèm:</span>
                        <p className="text-slate-600 leading-normal text-[11px] mt-1">{sol.evidenceDescription}</p>
                      </div>
                    )}
                    {sol.infographicConcept && (
                      <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
                        <span className="text-[10px] font-bold text-[#7C3AED] block">🎨 Ý tưởng sơ đồ Infographic:</span>
                        <p className="text-slate-650 leading-normal text-[11px] mt-1 italic">"{sol.infographicConcept}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(3)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại khảo sát thô
            </button>
            <button
              onClick={handleStep4Submit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang đo lường đối chứng học sinh...</span>
                </>
              ) : (
                <>
                  <span>Gửi biểu mẫu thực nghiệm sư phạm</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PEDAGOGICAL EXPERIMENT COMPARISON */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 5 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Thực Nghiệm Sư Phạm (Đối Chứng Sau Tác Động)
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Đối chiếu trực quan kết quả giữa nhóm Đối chứng (không áp dụng) và nhóm Thực nghiệm (áp dụng giải pháp).
            </p>
          </div>

          {project.experiment && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recharts Double bar chart */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Đối sánh mức chất lượng đầu ra lớp học</h3>
                
                <div className="min-h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <RechartsBarChart
                      data={project.experiment.comparisonData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="category" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar name="Lớp Đối Chứng (HS)" dataKey="controlGroup" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar name="Lớp Thực Nghiệm (HS)" dataKey="experimentalGroup" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                        {project.experiment.comparisonData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? "#7C3AED" : idx === 1 ? "#FF6B00" : "#A78BFA"} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-slate-600 leading-relaxed text-center font-bold">
                  📈 Mức độ đạt Loại Giỏi ở nhóm ứng dụng mới tăng đột phá từ {project.experiment.comparisonData[0]?.controlGroup} học sinh lên {project.experiment.comparisonData[0]?.experimentalGroup} học sinh!
                </div>
              </div>

              {/* Textual analysis */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Khảo sát chứng nghiệm toán học & Kết luận</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl border border-slate-150 space-y-1 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phân tích toán học sư phạm:</span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {project.experiment.statisticalAnalysis}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#7C3AED]/20 space-y-1 bg-purple-50/40">
                    <span className="text-[10px] font-bold text-[#7C3AED] uppercase">Kết luận cuối:</span>
                    <p className="text-slate-750 leading-relaxed italic">
                      "{project.experiment.conclusion}"
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(4)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại biện pháp
            </button>
            <button
              onClick={handleStep5Submit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang phóng dự thảo văn bản gốc...</span>
                </>
              ) : (
                <>
                  <span>Khởi tạo trình soạn thảo thông minh</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SMART ACADEMIC EDITOR */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 6 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Trình Soạn Thảo Văn Bản Nghiên Cứu Sư Phạm
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Soạn thảo, thay đổi ngôn từ hành văn sư phạm chuẩn quốc gia. Bôi đen bôi đậm hoặc bấm vào các nút hỗ trợ AI ở khung bên phải.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg">Auto-save: Hoạt động</span>
                <span className="text-xs text-slate-400">{project.textEditorContent?.length || 0} kí tự</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyEditorText}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
                  title="Sao chép toàn bộ văn bản vào khay nhớ tạm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </button>
                <button
                  onClick={handleResetEditor}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-red-200 text-xs font-semibold hover:bg-red-50 text-red-600 transition"
                  title="Khởi tạo lại văn bản thô ban đầu"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            <textarea
              value={project.textEditorContent || ""}
              onChange={(e) => {
                onUpdateProject({ textEditorContent: e.target.value });
              }}
              onMouseUp={(e) => {
                // Support Text Selection for AI sidebar refinings
                const text = window.getSelection()?.toString();
                if (text && text.trim().length > 3) {
                  onSetSelectedText(text.trim());
                }
              }}
              className="w-full min-h-[420px] font-sans text-sm leading-relaxed text-slate-800 focus:outline-none border-none resize-y"
              placeholder="Thầy cô hãy viết hoặc để AI tạo khung sườn tại đây..."
            />
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(5)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại thực nghiệm thô
            </button>
            <button
              onClick={handleStep6Submit}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Vào danh mục Quản lý Phụ lục</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: PROOF OF EVIDENCE & BIBLIOGRAPHY */}
      {currentStep === 7 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 7 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Minh Chứng, Tài Liệu Tham Khảo & Phụ Lục Giáo Án
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Quản lý danh sách các phiếu học tập số hóa, bảng câu hỏi và sách tham khảo hành chính chuẩn quốc gia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Khung Danh Mục Phụ Lục Đính Kèm</h3>
              <button 
                onClick={() => {
                  const items = project.annexList ? [...project.annexList] : [];
                  items.push(`Phụ lục mới thứ ${items.length + 1}: Kế hoạch bài dạy đổi mới...`);
                  onUpdateProject({ annexList: items });
                }}
                className="flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm danh mục
              </button>
            </div>

            <div className="space-y-3">
              {project.annexList && project.annexList.map((annex, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                  <span className="w-6 h-6 rounded-lg bg-orange-50 text-[#FF6B00] font-bold text-[11px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={annex}
                    onChange={(e) => {
                      const items = [...(project.annexList || [])];
                      items[idx] = e.target.value;
                      onUpdateProject({ annexList: items });
                    }}
                    className="flex-1 bg-transparent border-none text-xs text-slate-700 font-medium focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      const items = [...(project.annexList || [])];
                      items.splice(idx, 1);
                      onUpdateProject({ annexList: items });
                    }}
                    className="text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(6)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600 transition"
            >
              Quay lại soạn thảo
            </button>
            <button
              onClick={handleStep7Submit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang mô phỏng Hội đồng thính giảng...</span>
                </>
              ) : (
                <>
                  <span>Trình Hội đồng AI Thẩm định báo cáo</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: EVALUATIONS & SCORECARD */}
      {currentStep === 8 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 8 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Thẩm Định Chuyên Gia AI (Đánh Giá Phản Biện Tự Động)
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Mô phỏng chân thực thang điểm hội đồng chấm giải Sở GD&ĐT cấp Tỉnh. Phản biện sắc bén để hoàn thiện văn bản.
            </p>
          </div>

          {project.evaluation && (
            <div className="space-y-6">
              
              {/* Score breakdown bar charts or indicators */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center text-center relative overflow-hidden md:col-span-1 shadow-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full scale-110" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Điểm Thẩm Định</span>
                  <span className="text-5xl font-display font-extrabold text-[#FF6B00] mt-2 leading-none">{project.evaluation.scores.total}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">/100 Điểm</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-405 block">Tính mới khoa học</span>
                    <div className="text-xl font-bold font-display text-slate-800">{project.evaluation.scores.novelty} / 25</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(project.evaluation.scores.novelty / 25) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-405 block">Tính thực tiễn sư phạm</span>
                    <div className="text-xl font-bold font-display text-slate-800">{project.evaluation.scores.practicality} / 25</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(project.evaluation.scores.practicality / 25) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-405 block">Giá trị khoa học</span>
                    <div className="text-xl font-bold font-display text-slate-800">{project.evaluation.scores.scientificValue} / 25</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(project.evaluation.scores.scientificValue / 25) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-405 block">Trình bày thể thức</span>
                    <div className="text-xl font-bold font-display text-slate-800">{project.evaluation.scores.presentation} / 25</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(project.evaluation.scores.presentation / 25) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout of Pros, cons, suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pros (Ưu điểm) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-display font-bold text-xs text-emerald-600 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    Ưu Điểm Nổi Bật (Pros)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {project.evaluation.pros.map((pro, idx) => (
                      <li key={idx} className="bg-emerald-50/40 p-2.5 rounded-2xl leading-relaxed">{pro}</li>
                    ))}
                  </ul>
                </div>

                {/* Cons (Hạn chế) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-display font-bold text-xs text-red-650 uppercase flex items-center gap-1.5">
                    <BadgeAlert className="w-4.5 h-4.5 text-red-500" />
                    Hạn Chế Cần Gắn Lại (Cons)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-650">
                    {project.evaluation.cons.map((con, idx) => (
                      <li key={idx} className="bg-red-50/40 p-2.5 rounded-2xl leading-relaxed">{con}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions (Gợi ý vàng) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-display font-bold text-xs text-purple-600 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-purple-500" />
                    Bí Quyết Vàng Đạt Giải Cao
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-650">
                    {project.evaluation.suggestions.map((sug, idx) => (
                      <li key={idx} className="bg-purple-50/40 p-2.5 rounded-2xl leading-relaxed font-medium">{sug}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(7)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
            >
              Quay lại Phụ lục
            </button>
            <button
              onClick={handleStep8Submit}
              disabled={loading}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang tóm tắt khung slide PPT...</span>
                </>
              ) : (
                <>
                  <span>Xây dựng Slide thuyết trình báo cáo</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: POWERPOINT SLIDES STRUCTURE */}
      {currentStep === 9 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 9 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Thiết Lập Khung Thuyết Trình Slide PowerPoint tóm tắt
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Cấu trúc dàn bài PowerPoint bảo vệ đề tài trước hội đồng thính án cấp trường/huyện.
            </p>
          </div>

          {project.slides && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-600 font-medium">
                💡 {project.slides.presentationTheme}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.slides.slides.map((slide, idx) => (
                  <div key={idx} className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-2 right-3 text-xs text-slate-600 font-mono">Slide {slide.slideIndex}</div>
                    
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-sm text-[#FF6B00]">{slide.title}</h4>
                      {slide.subtitle && <p className="text-[10px] text-slate-400">{slide.subtitle}</p>}
                    </div>

                    <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-normal">
                      {slide.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(8)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
            >
              Quay lại chấm điểm AI
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await exportToPptx(project);
                  } catch (err: any) {
                    setErrorMsg(`Lỗi xuất Slide PowerPoint: ${err.message}`);
                  }
                }}
                className="py-2.5 px-5 text-xs font-semibold rounded-2xl border border-purple-200 text-[#7C3AED] hover:bg-purple-50 transition flex items-center gap-1.5 cursor-pointer bg-white"
              >
                <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Tải slide PowerPoint (.PPTX)</span>
              </button>
              <button
                onClick={handleStep9Submit}
                disabled={loading}
                className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang rà soát chính tả & Thể thức...</span>
                  </>
                ) : (
                  <>
                    <span>Soát lỗi thể thức Nghị định 30/2020</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 10: SPELLING CHECK & GOV COMPLIANCE */}
      {currentStep === 10 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 10 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
              Kiểm Tra Lỗi Chính Tả & Thể Thức (Nghị định 30/2020/NĐ-CP)
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Rà soát tự động lỗi phát âm chính tả tiếng Việt nội địa, kiểm định phông chữ học thuật, lề dòng đáp ứng thông tư hành chính.
            </p>
          </div>

          {project.proofing && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left spell corrections */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase flex items-center gap-1">
                  <BadgeAlert className="w-4.5 h-4.5 text-amber-500" />
                  Phát hiện lỗi ngữ âm & chính tả ({project.proofing.totalErrorsCount} lỗi)
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {project.proofing.errorsList.length > 0 ? (
                    project.proofing.errorsList.map((err, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-150 hover:border-[#7C3AED]/30 hover:shadow-md transition duration-200 space-y-3 text-xs shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100/60">
                            <span className="text-[9px] font-bold text-red-500 uppercase block mb-1">Văn bản gốc:</span>
                            <span className="text-red-650 font-medium line-through font-mono break-all">"{err.original}"</span>
                          </div>
                          <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Đề xuất sửa:</span>
                            <span className="text-emerald-700 font-bold font-mono break-all">"{err.corrected}"</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-slate-550">
                          <span className="text-[#FF6B00] font-bold">●</span>
                          <p className="leading-normal"><span className="font-semibold text-slate-700">Nguyên nhân:</span> {err.reason}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100">
                      💯 Sáng kiến kinh nghiệm của thầy cô không phát hiện trùng lặp hay lỗi chính tả tiếng Việt cơ bản!
                    </div>
                  )}
                </div>
              </div>

              {/* Right Decree compliance review */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-xs text-[#7C3AED] uppercase">Chỉ số tuân thủ Nghị định 30/2020/NĐ-CP</h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                    {project.proofing.govComplianceComment}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-1.5 text-[11px] text-slate-650">
                  <span className="font-bold text-indigo-800 uppercase">Khuyến nghị chuẩn in hành chính:</span>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Căn lề trên/dưới: 20-25mm</li>
                    <li>Căn lề trái: 30mm (để ghim bấm gáy)</li>
                    <li>Căn lề phải: 15-20mm</li>
                    <li>Font chữ tương thích: Times New Roman, Cỡ 13-14pt</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-between pt-2">
            <button 
              onClick={() => onStepChange(9)}
              className="py-2.5 px-6 rounded-2xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-605 transition"
            >
              Quay lại slide PPT
            </button>
            <button
              onClick={handleStep10Submit}
              className="py-3 px-8 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-md shadow-purple-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Vào trang xuất bản tệp tin</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: EXPORT AND PUBLISH */}
      {currentStep === 11 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-slate-400">Bước 11 trên 11</div>
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              Xuất Bản Sáng Kiến Kinh Nghiệm Hoàn Chỉnh
            </h2>
            <p className="text-sm text-slate-500 leading-normal">
              Chúc mừng Quý Thầy Cô đã xây dựng hành trình bài viết hoàn chỉnh đạt chất lượng cao tại SKKN 2026 PRO.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] text-white flex items-center justify-center mx-auto text-3xl font-extrabold shadow-lg">
              ✓
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-slate-800">CẤT CÁNH BIÊN SOẠN THÀNH CÔNG</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-md mx-auto">
                Mọi phần nội dung, bảng biểu so sánh, biểu đồ Recharts và minh chứng đính kèm phụ lục đã được hệ thống hóa, sáp nhập chuẩn thể thức văn bản.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={simulateDocxDownload}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                Tải xuống tệp Word (.DOC)
              </button>
              <button
                onClick={triggerPrint}
                className="py-3.5 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                In / Xuất PDF báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
