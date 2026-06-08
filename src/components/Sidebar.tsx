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
  { id: 1, name: "Thông tin", desc: "Thiết lập thông tin cơ bản" },
  { id: 2, name: "Lập Dàn Ý", desc: "Xây dựng khung sườn cho SKKN" },
  { id: 3, name: "Phần I & II", desc: "Đặt vấn đề & Cơ sở lý luận" },
  { id: 4, name: "Phần III", desc: "Thực trạng vấn đề" },
  { id: 5, name: "Giải pháp 1", desc: "Viết giải pháp trọng tâm" },
  { id: 6, name: "Giải pháp 2", desc: "Viết giải pháp thứ hai" },
  { id: 7, name: "Giải pháp 3", desc: "Viết giải pháp thứ ba" },
  { id: 8, name: "Hiệu quả & KL", desc: "Hiệu quả, Kết luận & Khuyến nghị" }
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
    if (project.contentPart1And2 && project.contentPart1And2.length > 100) completedCount += 1; // Step 3
    if (project.contentPart3 && project.contentPart3.length > 100) completedCount += 1; // Step 4
    if (project.contentSolution1 && project.contentSolution1.length > 100) completedCount += 1; // Step 5
    if (project.contentSolution2 && project.contentSolution2.length > 100) completedCount += 1; // Step 6
    if (project.contentSolution3 && project.contentSolution3.length > 100) completedCount += 1; // Step 7
    if (project.contentConclusion && project.contentConclusion.length > 100) completedCount += 1; // Step 8
    
    return Math.min(Math.round((completedCount / 8) * 100), 100);
  };

  const isStepCompleted = (stepId: number) => {
    if (!project) return false;
    switch (stepId) {
      case 1: return !!project.title;
      case 2: return !!(project.outline?.items && project.outline.items.length > 0);
      case 3: return !!(project.contentPart1And2 && project.contentPart1And2.length > 100);
      case 4: return !!(project.contentPart3 && project.contentPart3.length > 100);
      case 5: return !!(project.contentSolution1 && project.contentSolution1.length > 100);
      case 6: return !!(project.contentSolution2 && project.contentSolution2.length > 100);
      case 7: return !!(project.contentSolution3 && project.contentSolution3.length > 100);
      case 8: return !!(project.contentConclusion && project.contentConclusion.length > 100);
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
            <h1 className="font-display font-bold text-sm leading-none tracking-tight text-slate-800">
              Maris Slide
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Zalo: 0396.581.283</p>
          </div>
        </div>

        {/* Global Progress Indicators */}
        {project && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1.5">
              <span>Tiến độ viết Sáng kiến</span>
              <span className="text-purple-600 font-mono font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${
                  progressPct === 100 
                    ? "bg-emerald-500" 
                    : "bg-gradient-to-r from-[#FF6B00] to-[#7C3AED]"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {stepsList.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = isStepCompleted(step.id);

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all relative block cursor-pointer ${
                isActive 
                  ? "border-[#2563eb] bg-white shadow-sm ring-1 ring-[#2563eb]/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Dot indicator in top right */}
              <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                isActive ? "bg-[#2563eb]" : "bg-slate-300"
              }`} />
              
              <div className="pr-6 space-y-0.5">
                <div className={`text-xs font-bold leading-snug ${
                  isActive ? "text-slate-900" : "text-slate-700"
                }`}>
                  {step.name}
                </div>
                <p className={`text-[10px] leading-normal ${
                  project?.status === "error" && !isDone
                    ? "text-red-500 font-bold"
                    : "text-slate-400 font-medium"
                }`}>
                  {project?.status === "error" && !isDone ? "Đã dừng do lỗi" : step.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
        {/* Ad Space for Maris Slide */}
        <div className="bg-gradient-to-tr from-orange-50/50 to-purple-50/20 border border-orange-100 p-3 rounded-2xl text-[10px] text-slate-600 space-y-1">
          <span className="font-bold text-[#FF6B00] block uppercase tracking-wider">QC: Maris Slide</span>
          <p className="leading-relaxed">
            Thiết kế slide báo cáo chuyên nghiệp, bài giảng điện tử E-learning đạt chuẩn Bộ GD&ĐT.
          </p>
          <a
            href="https://zalo.me/0396581283"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C3AED] font-bold block hover:underline mt-1"
          >
            Liên hệ Zalo: 0396.581.283 →
          </a>
        </div>

        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-650 hover:text-slate-900 hover:border-slate-400 transition-colors bg-slate-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          Khởi tạo đề tài mới
        </button>
        <div className="text-[9px] text-center text-slate-400 font-mono">
          Maris Slide - Zalo: 0396.581.283
        </div>
      </div>
    </div>
  );
};
