import React, { useState } from "react";
import { 
  Sparkles, 
  Upload, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { Project } from "../types";
import { generateOutline } from "../utils/geminiClient";

interface LandingPageProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onProceed: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  project,
  onUpdateProject,
  onProceed
}) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleCriteriaUpload = async (file: File) => {
    if (!file) return;
    
    // Check if the file is PDF, Word, or TXT
    const isDoc = file.name.endsWith(".doc") || file.name.endsWith(".docx");
    const isPdf = file.name.endsWith(".pdf");
    const isTxt = file.name.endsWith(".txt");
    
    if (!isDoc && !isPdf && !isTxt) {
      setErrorMsg("Chỉ hỗ trợ file PDF, Word (.docx, .doc) hoặc TXT. Vui lòng chọn đúng định dạng!");
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg("File vượt quá giới hạn 100MB. Vui lòng chọn file nhỏ hơn!");
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
      
      // Build criteria text block
      let ctx = "";
      if (data.criteriaList && data.criteriaList.length > 0) {
        ctx += "TIÊU CHÍ ĐÁNH GIÁ:\n";
        data.criteriaList.forEach((cr: any) => {
          ctx += `- ${cr.name} (${cr.maxScore} điểm): ${cr.description}\n`;
        });
      }
      if (data.requirements && data.requirements.length > 0) {
        ctx += "\nYÊU CẦU BẮT BUỘC:\n";
        data.requirements.forEach((r: any) => { ctx += `- ${r}\n`; });
      }
      if (data.focusPoints && data.focusPoints.length > 0) {
        ctx += "\nTRỌNG TÂM CẦN LƯU Ý:\n";
        data.focusPoints.forEach((f: any) => { ctx += `- ${f}\n`; });
      }

      // Automatically generate the outline matched to guidelines
      const outlineData = await generateOutline({
        title: project.title || "Sáng kiến kinh nghiệm bám sát mẫu hướng dẫn",
        subject: project.subject || "Tự chọn",
        grade: project.grade || "Tự chọn",
        level: project.level || "Tự chọn",
        context: project.description || "",
        criteriaContext: ctx
      });
      
      onUpdateProject({
        uploadedCriteria: {
          fileName: data.fileName,
          uploadedAt: data.uploadedAt,
          rawTextPreview: data.rawTextPreview,
          criteriaList: data.criteriaList || [],
          requirements: data.requirements || [],
          focusPoints: data.focusPoints || [],
          aiSummary: data.aiSummary || ""
        },
        outline: {
          analyticalRating: outlineData.analyticalRating,
          items: outlineData.outline
        }
      });
      // Proceed straight to the workspace after successful upload
      onProceed();
    } catch (err: any) {
      setErrorMsg(`Lỗi phân tích hoặc lập dàn ý: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-[#FFF5EE] via-white to-[#F5F3FF] flex flex-col items-center justify-center p-6 select-none animate-fade-in">
      
      {/* Sparkles Icon at top */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8C00] flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-6">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      {/* Main Title Section */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="font-display font-black text-3xl tracking-tight text-[#FF6B00]">
          VIẾT SÁNG KIẾN KINH NGHIỆM CÙNG MARIS SLIDE
        </h1>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/60 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          AI-Powered • Gemini
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5">
          Trợ lý viết mọi mẫu SKKN các Sở
        </p>
      </div>

      {/* Center Box Card */}
      <div className="max-w-xl w-full bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        {/* Orange Banner Header */}
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] px-6 py-5 flex items-center gap-4 text-white">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
            1
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">Tải lên mẫu yêu cầu SKKN</h3>
            <p className="text-[10px] text-orange-50 mt-0.5">File Word hoặc PDF mẫu từ Sở/Phòng Giáo dục</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 flex-1">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleCriteriaUpload(file);
            }}
            onClick={() => {
              if (!uploadLoading) {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt';
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0];
                  if (file) handleCriteriaUpload(file);
                };
                input.click();
              }
            }}
            className={`border border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
              dragOver 
                ? "border-[#7C3AED] bg-purple-50/50 scale-[1.01]" 
                : "border-slate-200 bg-slate-50/30 hover:border-[#FF6B00]/50 hover:bg-orange-50/10"
            } ${uploadLoading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploadLoading ? (
              <div className="flex flex-col items-center gap-3 py-3">
                <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">AI đang quét tài liệu & lập dàn ý bám sát công văn...</p>
                  <p className="text-[10px] text-slate-400 mt-1">Hệ thống đang cấu trúc hóa nội dung học thuật</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 py-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Kéo thả file vào đây hoặc <span className="text-[#FF6B00] underline font-bold">chọn file</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ: PDF, Word (.docx), TXT • Tối đa 100MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Yellow Box Info */}
          <div className="bg-[#FFFDF4] border border-[#FBEFA6] p-4 rounded-2xl text-[11px] text-[#8C6D1F] space-y-2">
            <h4 className="font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-[#C19A31] shrink-0" />
              Mẫu yêu cầu SKKN là gì?
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>File Word/PDF mẫu hướng dẫn viết SKKN từ <b>Sở/Phòng GD&ĐT</b></li>
              <li>AI sẽ phân tích và <b>bám sát cấu trúc</b> mẫu này khi viết</li>
              <li>Giúp SKKN đúng format yêu cầu của đơn vị</li>
            </ul>
          </div>

          {/* Skip link */}
          <div className="text-center pt-2 select-none">
            <button
              onClick={onProceed}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <span>Không có mẫu? Dùng mẫu chuẩn Bộ GD&ĐT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-12 select-none">
        VIẾT SÁNG KIẾN KINH NGHIỆM CÙNG MARIS SLIDE • Trợ lý viết mọi mẫu SKKN các Sở
      </div>
    </div>
  );
};
