import React from "react";
import { 
  Sparkles, 
  FolderGit2, 
  Plus, 
  Clock, 
  ChevronRight, 
  GraduationCap, 
  BookOpen 
} from "lucide-react";
import { Project } from "../types";

interface ProjectManagerProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 max-w-4xl mx-auto my-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#7C3AED]" />
            Thư Viện Đề Tài & Bài Viết Đang Soạn Thảo
          </h2>
          <p className="text-xs text-slate-500 mt-1">Danh mục lưu trữ các đề tài sáng kiến kinh nghiệm đang thực hiện trong năm 2026</p>
        </div>
        <button
          onClick={onNewProject}
          className="py-2 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-white" />
          Tạo Đề Tài Mới
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Chưa có đề tài nào đang tiến hành. Thầy cô vui lòng nhấn nút tạo mới hoặc chọn nhanh mẫu nghiên cứu ở trên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-40 ${
                  isSelected 
                    ? "border-[#7C3AED] bg-purple-50/10 shadow-md shadow-purple-500/5 ring-1 ring-[#7C3AED]" 
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {proj.level} - Lớp {proj.grade}
                    </span>
                    <span className="flex items-center gap-0.5 font-mono text-[9px]">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="font-display font-medium text-xs text-slate-800 line-clamp-2 leading-snug">
                    {proj.title || "Chưa đặt tên đề tài"}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {proj.description || "Chưa có tóm tắt bối cảnh thực trạng..."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 mt-2">
                  <span className="text-[10px] text-[#7C3AED] font-semibold">{proj.author || "Tác giả ẩn danh"}</span>
                  <div className="flex items-center text-[10px] text-[#FF6B00] font-bold gap-0.5">
                    <span>Soạn tiếp</span>
                    <ChevronRight className="w-3 h-3 text-[#FF6B00]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
