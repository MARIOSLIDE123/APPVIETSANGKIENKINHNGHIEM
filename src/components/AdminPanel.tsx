import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ShieldAlert, Mail } from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [emailInput, setEmailInput] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load users from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("maris_authorized_users");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const saveUsers = (updatedUsers: string[]) => {
    localStorage.setItem("maris_authorized_users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email!");
      return;
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không đúng định dạng!");
      return;
    }

    if (email === "marioslide.animation@gmail.com") {
      setError("Email này là tài khoản quản trị tối cao, không cần cấp phép thêm!");
      return;
    }

    if (users.includes(email)) {
      setError("Email này đã được cấp quyền truy cập từ trước!");
      return;
    }

    const updated = [...users, email];
    saveUsers(updated);
    setEmailInput("");
    setSuccess(`Đã cấp quyền thành công cho email: ${email}`);
  };

  const handleRemoveUser = (emailToRemove: string) => {
    setError("");
    setSuccess("");
    const updated = users.filter(u => u !== emailToRemove);
    saveUsers(updated);
    setSuccess(`Đã thu hồi quyền truy cập của email: ${emailToRemove}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="font-display font-bold text-base text-slate-800">Quản Trị Người Truy Cập APP</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[500px]">
          
          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase block">Cấp quyền email mới</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nhap-email-giao-vien@gmail.com"
                  className="w-full border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#7C3AED] transition"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#7C3AED] text-white hover:bg-purple-700 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Cấp quyền</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-450 mt-1">Mật khẩu đăng nhập mặc định của tài khoản được cấp là: <strong className="text-slate-750 font-bold">MARIS2026</strong></p>
          </form>

          {/* Feedback Messages */}
          {error && (
            <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Authorized Users List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase pb-1">
              <span>Danh sách email đã cấp phép</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-650">{users.length} tài khoản</span>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có tài khoản nào được cấp phép truy cập ngoài Admin.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {users.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs hover:bg-slate-100/50 transition"
                  >
                    <span className="font-medium text-slate-750 font-mono truncate mr-4">{email}</span>
                    <button
                      onClick={() => handleRemoveUser(email)}
                      className="p-1.5 text-slate-450 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Thu hồi quyền"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-bold rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>

      </div>
    </div>
  );
};
