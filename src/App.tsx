  const isApiKeyActive = !!(
    (apiKey1 || "").trim() ||
    (apiKey2 || "").trim() ||
    (apiKey3 || "").trim() ||
    safeGetItem("gemini_api_key", "").trim()
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Universal Navbar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 shrink-0 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode("workspace")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
              M
            </div>
            <div className="flex flex-col select-none">
              <span className="font-display font-black text-sm tracking-tight text-slate-800 leading-tight">
                <span className="text-[#FF6B00]">VIẾT SÁNG KIẾN KINH NGHIỆM CÙNG MARIS SLIDE</span>
              </span>
              <a 
                href="https://zalo.me/0396581283" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] text-[#7C3AED] hover:underline font-bold leading-none mt-0.5"
              >
                Zalo: 0396.581.283
              </a>
            </div>
          </div>
          
          {currentProject && viewMode === "workspace" && (
            <div className="hidden md:flex items-center gap-2 border-l border-slate-205 pl-4 ml-2">
              <span className="text-[11px] font-bold text-[#7C3AED] uppercase bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                Đề tài đang mở
              </span>
              <span className="text-xs font-semibold text-slate-500 line-clamp-1 max-w-sm" title={currentProject.title}>
                {currentProject.title || "Dự thảo chưa đặt tên"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="py-1.5 px-3.5 rounded-xl border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              {isApiKeyActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </>
              )}
            </span>
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Cấu hình AI</span>
            {isApiKeyActive ? (
              <span className="text-[10px] text-emerald-600 font-bold ml-0.5">
                (Đang hoạt động)
              </span>
            ) : (
              <span className="text-[10px] text-rose-500 font-bold ml-0.5 animate-pulse">
                (Chưa cấu hình)
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode(viewMode === "catalog" ? "workspace" : "catalog")}
            className="py-1.5 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{viewMode === "catalog" ? "Quay về soạn thảo" : "Xem Thư viện Đề tài"}</span>
          </button>
