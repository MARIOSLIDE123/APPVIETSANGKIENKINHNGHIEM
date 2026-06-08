import React, { useState } from "react";
import { Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    if (!trimmedPassword) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }

    // 1. Admin login verification
    if (trimmedEmail === "marioslide.animation@gmail.com" && trimmedPassword === "MARIS2026") {
      onLoginSuccess(trimmedEmail);
      return;
    }

    // 2. Standard user login verification
    const storedUsers = localStorage.getItem("maris_authorized_users");
    const authorizedUsersList: string[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (authorizedUsersList.map(u => u.toLowerCase()).includes(trimmedEmail) && trimmedPassword === "MARIS2026") {
      onLoginSuccess(trimmedEmail);
      return;
    }

    setError("Tài khoản hoặc mật khẩu không chính xác, hoặc bạn chưa được cấp quyền truy cập. Vui lòng liên hệ Maris Slide để được kích hoạt tài khoản.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF5EE] via-[#FAF9FF] to-[#F5F3FF] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[32px] p-8 space-y-6 relative z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/10 mx-auto mb-4">
            M
          </div>
          <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight">
            Đăng Nhập Hệ Thống
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Viết sáng kiến kinh nghiệm cùng Maris Slide
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-2.5 text-xs leading-relaxed animate-pulse">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Email đăng nhập</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-850 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-850 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2 transition cursor-pointer mt-6"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Vào ứng dụng</span>
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-450">
            Chưa có tài khoản? Liên hệ đăng ký khóa học và dịch vụ:
          </p>
          <a
            href="https://zalo.me/0396581283"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#7C3AED] hover:underline mt-1.5 inline-block"
          >
            Zalo: 0396.581.283
          </a>
        </div>

      </div>
    </div>
  );
};
