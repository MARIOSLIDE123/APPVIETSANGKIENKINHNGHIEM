import React from "react";
import { 
  Info, 
  ListOrdered, 
  BarChart3, 
  Lightbulb, 
  LineChart, 
  FileEdit, 
  FolderGit2, 
  CheckCircle2, 
  Presentation, 
  AlertTriangle, 
  Download,
  BookOpen,
  Award,
  Sparkles
} from "lucide-react";
import { Project } from "../types";

interface SidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  project: Project | null;
  onNewProject: () => void;
}

export const stepsList = [
  { id: 1, name: "1. Thiết lập thông tin", icon: Info, desc: "Đề tài, cấp học, môn học" },
  { id: 2, name: "2. Lập dàn ý khoa học", icon: ListOrdered, desc: "AI kiến tạo dàn ý 3 phần" },
  { id: 3, name: "3. Khảo sát thực trạng", icon: BarChart3, desc: "Số liệu & Biểu đồ trực quan" },
  { id: 4, name: "4. Biện pháp thực tiễn", icon: Lightbulb, desc: "Sáng kiến đổi mới giảng dạy" },
  { id: 5, name: "5. Thực nghiệm đối chứng", icon: LineChart, desc: "So sánh hiệu quả trước/sau" },
  { id: 6, name: "6. Soạn thảo chi tiết", icon: FileEdit, desc: "Trình soạn bài viết với AI" },
  { id: 7, name: "7. Minh chứng & Phụ lục", icon: FolderGit2, desc: "Phiếu học tập, tham chiếu" },
  { id: 8, name: "8. Thẩm định & Phản biện", icon: Award, desc: "Chấm điểm, nhận xét chuyên gia" },
  { id: 9, name: "9. Slide tóm tắt", icon: Presentation, desc: "Thiết lập khung PowerPoint" },
  { id: 10, name: "10. Soát lỗi & Nghị định 30", icon: AlertTriangle, desc: "Chính tả & Thể thức văn bản" },
  { id: 11, name: "11. Xuất bản quốc gia", icon: Download, desc: "Tải file Word & Hoàn thành" }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  onStepChange, 
  project, 
  onNewProject 
}) => {
  // Compute overall completion progress based on completed sections in state
  const getProgress = () => {
    if (!project) return 0;
    let completedCount = 0;
    if (project.title) completedCount += 1; // Step 1
    if (project.outline?.items && project.outline.items.length > 0) completedCount += 1; // Step 2
    if (project.survey?.surveyRows && project.survey.surveyRows.length > 0) completedCount += 1; // Step 3
    if (project.solutions && project.solutions.length > 0) completedCount += 1; // Step 4
    if (project.experiment?.comparisonData) completedCount += 1; // Step 5
    if (project.textEditorContent && project.textEditorContent.length > 100) completedCount += 1; // Step 6
    if (project.annexList && project.annexList.length > 0) completedCount += 1; // Step 7
    if (project.evaluation) completedCount += 1; // Step 8
    if (project.slides?.slides) completedCount += 1; // Step 9
    if (project.proofing) completedCount += 1; // Step 10
    if (project.textEditorContent && project.textEditorContent.length > 500) completedCount += 1; // Step 11
    
    return Math.min(Math.round((completedCount / 11) * 100), 100);
  };

  const isStepCompleted = (stepId: number) => {
    if (!project) return false;
    switch (stepId) {
      case 1: return !!project.title;
      case 2: return !!(project.outline?.items && project.outline.items.length > 0);
      case 3: return !!(project.survey?.surveyRows && project.survey.surveyRows.length > 0);
      case 4: return !!(project.solutions && project.solutions.length > 0);
      case 5: return !!project.experiment?.comparisonData;
      case 6: return !!(project.textEditorContent && project.textEditorContent.length > 150);
      case 7: return !!(project.annexList && project.annexList.length > 0);
      case 8: return !!project.evaluation;
      case 9: return !!(project.slides?.slides && project.slides.slides.length > 0);
      case 10: return !!project.proofing;
      case 11: return getProgress() > 90;
      default: return false;
    }
  };

  const progressPct = getProgress();

  return (
    <div className="w-[300px] h-screen bg-[#F8FAFC] border-r border-slate-200 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-1.5 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/10">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-tight">
              SKKN <span className="text-[#FF6B00]">2026</span> <span className="text-[#7C3AED] text-sm/none px-1.5 py-0.5 bg-purple-50 rounded-md font-mono border border-purple-100 font-semibold">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Hệ Sinh Thái Sáng Kiến Sư Phạm</p>
          </div>
        </div>

        {/* Global Progress Indicators */}
        {project && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1.5">
              <span>Tiến độ hoàn thiện bài viết</span>
              <span className="text-purple-600 font-mono font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2.5 mb-2">Quy Trình 11 Bước Chuẩn</div>
        {stepsList.map((step) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.id;
          const isDone = isStepCompleted(step.id);

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 relative ${
                isActive 
                  ? "bg-gradient-to-r from-[#FF6B00]/8 to-[#7C3AED]/8 text-[#7C3AED] font-semibold border-l-4 border-[#7C3AED]"
                  : "hover:bg-slate-50 text-slate-600 border-l-4 border-transparent"
              }`}
            >
              <div className="mt-0.5">
                <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-[#7C3AED]" : "text-slate-400 group-hover:text-slate-600"
                }`} />
              </div>
              <div className="flex-1 line-clamp-2">
                <div className="text-xs font-medium leading-normal flex items-center justify-between">
                  <span>{step.name}</span>
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5 group-hover:text-slate-500">
                  {step.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors bg-slate-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          Khởi tạo đề tài mới
        </button>
        <div className="text-[9px] text-center text-slate-400 font-mono">
          Model: gemini-3.5-flash-pedagogy
        </div>
      </div>
    </div>
  );
};
