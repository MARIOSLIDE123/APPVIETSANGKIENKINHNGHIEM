import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  Trash2,
  Bookmark,
  FileText
} from "lucide-react";
import { refineText } from "../utils/geminiClient";
interface AIPanelProps {
  currentStep: number;
  projectTitle: string;
  sourceTextForAI: string;
  onApplyRefinedText?: (text: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const STEP_TIPS: Record<number, { title: string; prompt: string; tips: string[] }> = {
  1: {
    title: "Thiết lập thông tin",
    prompt: "Gợi ý 5 đề tài Sáng kiến kinh nghiệm nâng cao chất lượng dạy học môn Tin học lớp 4 gắn liền với chuyển đổi số.",
    tips: [
      "Đặt tên đề tài súc tích, phản ánh rõ giải pháp tác động và đối tượng thụ hưởng.",
      "Xác định rõ phạm vi thời gian (thường áp dụng liên tục 1 hoặc 2 năm học chính thức).",
      "Xác định cấp học và môn học để AI tinh chỉnh thuật ngữ hành văn sư phạm tương thích."
    ]
  },
  2: {
    title: "Lập dàn ý bài viết",
    prompt: "Hãy đánh giá tính khả thi và bổ sung luận cứ thực tiễn cho đề tài ở trên.",
    tips: [
      "Sáng kiến kinh nghiệm Việt Nam yêu cầu rõ ràng 3 phần chính học thuật.",
      "Phần đặt vấn đề cần thể hiện bật tính cấp thiết (mâu thuẫn giữa thực trạng giáo dục với lý thuyết).",
      "Phần nội dung chính: Cần ít nhất 3 biện pháp giải quyết vấn đề xuyên suốt."
    ]
  },
  3: {
    title: "Khảo sát thực trạng",
    prompt: "Gợi ý mẫu câu hỏi khảo sát mức độ hứng thiết học tập của học sinh tiểu học.",
    tips: [
      "Bộ GD&ĐT khuyến khích các bảng khảo sát tính cảm xúc (Báo cáo Định lượng).",
      "Nên khảo sát diện rộng nguyên nhân học sinh chưa tích cực phát biểu.",
      "Sử dụng công cụ Recharts để theo dõi tỷ lệ Đạt (Achieved) vs Chưa Đạt (Not Achieved) trực quan hóa dữ liệu."
    ]
  },
  4: {
    title: "Đề xuất giải pháp",
    prompt: "Đề xuất quy trình 4 bước tổ chức hoạt động STEM nhóm hiệu quả trên lớp.",
    tips: [
      "Sáng kiến xuất sắc đòi hỏi miêu tả cặn kẽ từng hoạt động sư phạm chính.",
      "Luôn liên hệ trực tiếp đến vai trò của giáo viên (tổ chức, đốc thúc) và học sinh (phối hợp, tự chủ).",
      "Đánh dấu chọn Thêm bảng biểu, Minh chứng hoặc Infographic để AI đề xuất đầy đủ."
    ]
  },
  5: {
    title: "Thực nghiệm đối chứng",
    prompt: "Phân tích số liệu thực thực nghiệm cho thấy cải thiện rõ rệt sau 6 tháng áp dụng.",
    tips: [
      "Số liệu lớp thực nghiệm phải vượt trội lớp đối chứng ở mức độ khá giỏi.",
      "Ghi nhận cả cải tiến về năng lực phẩm chất chung ngoài điểm số chính thức.",
      "Phần phân tích toán học sư phạm giúp tăng điểm tuyệt đối của hội đồng kiểm định chuyên môn."
    ]
  },
  6: {
    title: "Viết nội dung văn bản",
    prompt: "Viết tiếp một đoạn văn lập luận chặt chẽ khẳng định vai trò của học liệu số trong kiểm tra học sinh.",
    tips: [
      "Sử dụng công cụ biên tập tinh chỉnh văn phong ở khung bên trái.",
      "Ấn 'Viết tiếp bằng AI' hoặc 'Chuyển sang giọng điệu Sư phạm chuyên nghiệp' để tự động hiệu đính văn bản học thuật."
    ]
  },
  7: {
    title: "Phần phụ lục minh chứng",
    prompt: "Thiết kế một mẫu Phiếu tự đánh giá hoạt động nhóm cho học sinh tự tích điểm.",
    tips: [
      "Các chứng cứ thực tế như phiếu rèn luyện tự thiết kế, ảnh tư liệu là bắt buộc.",
      "Hãy liệt kê tài liệu tham khảo theo đúng định dạng học thuật quốc gia."
    ]
  },
  8: {
    title: "Chuyên gia AI Phản biện",
    prompt: "Phản biện sâu làm rõ điểm yếu của đề tài và đề xuất cách giải quyết.",
    tips: [
      "Trợ lý AI mô phỏng hội đồng thẩm định Sở GD&ĐT.",
      "Tập trung chỉnh sửa theo các gợi ý hạn chế (Cons) để tối ưu hóa điểm số.",
      "Các tiêu chí đánh giá nghiêm ngặt, bám sát các đề thi giáo viên giỏi cấp tỉnh."
    ]
  },
  9: {
    title: "Báo cáo trình chiếu",
    prompt: "Soạn lời thuyết trình dài 3 phút cho Slide giải pháp số 2.",
    tips: [
      "Bài thuyết trình giới hạn trong 10-15 phút.",
      "Gợi ý thiết kế màu sắc: Sử dụng tone xanh ngọc thanh lịch, tránh chèn quá nhiều chữ lý thuyết."
    ]
  },
  10: {
    title: "Thể thức Nghị định 30",
    prompt: "Căn lề chuẩn Nghị định 30 của Bộ nội vụ là gì?",
    tips: [
      "Trực tiếp kiểm tra lỗi chính tả Việt Nam và độ tương thích văn bản pháp quy.",
      "Mọi từ viết tắt sư phạm phải được thống nhất ở bảng quy ước đầu trang."
    ]
  },
  11: {
    title: "Xuất bản và Tải về",
    prompt: "Hãy hoàn thiện lời tựa mở đầu lời cam đoan của tác giả đăng ký sáng kiến cấp Tỉnh.",
    tips: [
      "Tải file báo cáo hoàn chỉnh xuống dạng Word (.docx) chuẩn chỉnh.",
      "Chúc mừng thầy/cô đã hoàn thiện toàn bộ công trình Sáng kiến kinh nghiệm 2026!"
    ]
  }
};

export const AIPanel: React.FC<AIPanelProps> = ({ 
  currentStep, 
  projectTitle,
  sourceTextForAI,
  onApplyRefinedText
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào quý thầy cô! Tôi là trợ lý AI chuyên gia Sư phạm quốc gia. Thầy cô đang thực hiện từng bước viết Sáng kiến kinh nghiệm. Tôi luôn túc trực để hỗ trợ giải quyết khó khăn lập luận học thuật, trau chuốt ngôn từ hành văn sư phạm.",
      timestamp: "Vừa xong"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState<string | null>(null);
  const [refinedOutput, setRefinedOutput] = useState("");

  const currentTip = STEP_TIPS[currentStep] || STEP_TIPS[1];

  // Set initial suggest prompt based on active step changes
  useEffect(() => {
    // We can show active steps tip prompt
  }, [currentStep]);

  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: finalMsg,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setLoading(true);

    try {
      const data = await refineText({
        text: `[Dữ liệu đề tài SKKN hiện tại: "${projectTitle || "Sắp đặt"}", môn học ở bước "${currentTip.title}"]\nCâu hỏi/Yêu cầu: ${finalMsg}`,
        action: "chat"
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.refinedText || "Trợ lý AI đã xử lý hoàn tất.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: `⚠️ Có lỗi kết nối xảy ra. Vui lòng thử lại. Lỗi cụ thể: ${err.message}`,
          timestamp: "Bây giờ"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineButton = async (action: "polish" | "continue" | "simplify") => {
    if (!sourceTextForAI.trim()) {
      alert("Quý thầy cô vui lòng nhập hoặc chọn văn bản cần chỉnh sửa ở khung soạn thảo bên trái trước!");
      return;
    }

    setRefining(action);
    setRefinedOutput("");

    try {
      const data = await refineText({
        text: sourceTextForAI,
        action: action
      });
      setRefinedOutput(data.refinedText || "");
    } catch (err: any) {
      setRefinedOutput(`❌ Gặp sự phiền toái khi liên hệ AI: ${err.message}`);
    } finally {
      setRefining(null);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Hội thoại đã được đặt lại. Tôi luôn sẵn sàng trả lời các câu hỏi về chuyên môn chấm giải và chuẩn sư phạm của Thầy Cô.",
        timestamp: "Vừa xong"
      }
    ]);
  };

  const useSuggestPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="w-[340px] h-screen bg-[#F8FAFC] border-l border-slate-200 flex flex-col shrink-0">
      {/* Tab select header */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600 animate-pulse shrink-0" />
        <div>
          <h2 className="font-display font-semibold text-xs text-slate-800 uppercase tracking-wider">Bảng Điều Khiển Trí Tuệ Nhân Tạo</h2>
          <p className="text-[10px] text-slate-400">Trợ lý sư phạm cá nhân chuyên sâu</p>
        </div>
      </div>

      {/* Main content body: Guidance + Chat block */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Step-specific pedagogical guide */}
        <div className="bg-gradient-to-tr from-[#FF6B00]/5 to-[#7C3AED]/5 border border-[#7C3AED]/12 p-3.5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[#FF6B00]" />
            <h3 className="font-display font-bold text-xs text-slate-800">Cẩm nang Bước {currentStep}: {currentTip.title}</h3>
          </div>
          <ul className="space-y-1">
            {currentTip.tips.map((tip, idx) => (
              <li key={idx} className="text-[11px] text-slate-600 leading-normal flex items-start gap-1">
                <span className="text-[#7C3AED] select-none font-bold">▪</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => useSuggestPrompt(currentTip.prompt)}
            className="mt-3 w-full bg-white hover:bg-slate-50 transition border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] text-[#7C3AED] font-semibold flex items-center justify-between text-left"
          >
            <span className="line-clamp-1">Prompt: {currentTip.prompt}</span>
            <ArrowRight className="w-3 h-3 text-[#FF6B00] shrink-0" />
          </button>
        </div>

        {/* Real-time Document Text Refiner integration */}
        {sourceTextForAI && (
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                Văn bản đang chọn ({sourceTextForAI.length} kí tự)
              </span>
              <button 
                onClick={() => handleRefineButton("polish")}
                className="text-[10px] text-[#7C3AED] font-semibold hover:underline"
              >
                Tự động tối ưu
              </button>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl italic">
              "{sourceTextForAI}"
            </p>

            <div className="grid grid-cols-3 gap-1">
              <button
                disabled={!!refining}
                onClick={() => handleRefineButton("polish")}
                className="bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-[9px] font-bold py-1.5 px-1 rounded-lg transition disabled:opacity-50"
              >
                Mài dũa sư phạm
              </button>
              <button
                disabled={!!refining}
                onClick={() => handleRefineButton("continue")}
                className="bg-orange-50 hover:bg-orange-100 text-[#FF6B00] text-[9px] font-bold py-1.5 px-1 rounded-lg transition disabled:opacity-50"
              >
                Viết nối tiếp AI
              </button>
              <button
                disabled={!!refining}
                onClick={() => handleRefineButton("simplify")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold py-1.5 px-1 rounded-lg transition disabled:opacity-50"
              >
                Rút gọn slide
              </button>
            </div>

            {refining && (
              <div className="flex items-center gap-2 justify-center py-2 text-xs text-slate-500 font-mono">
                <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
                <span>Gemini đang mài dũa...</span>
              </div>
            )}

            {refinedOutput && !refining && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 animate-fade-in">
                <div className="text-[10px] font-bold text-slate-600">✨ Đề xuất cải thiện từ AI:</div>
                <div className="text-[11px] text-slate-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 leading-normal max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {refinedOutput}
                </div>
                {onApplyRefinedText && (
                  <button
                    onClick={() => {
                      onApplyRefinedText(refinedOutput);
                      setRefinedOutput("");
                    }}
                    className="w-full bg-slate-900 text-white rounded-lg py-1.5 px-2.5 text-[10px] font-semibold hover:bg-black transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    Thay thế vào nội dung soạn thảo
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conversation flow */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 select-none">
            <span>Luồng Hội Thoại AI</span>
            <button 
              onClick={clearChat}
              className="hover:text-red-500 flex items-center gap-0.5 transition cursor-pointer"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-3 h-3" />
              Xóa
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col space-y-1 animate-fade-in ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs font-normal leading-normal ${
                  msg.sender === "user" 
                    ? "bg-[#7C3AED] text-white rounded-tr-none shadow-md shadow-purple-500/10" 
                    : "bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-sm"
                }`}>
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                </div>
                <span className="text-[8px] text-slate-400 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white border border-slate-100 p-2.5 rounded-xl">
                <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
                <span>AI Sư phạm đang phân tích suy luận...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Chat Input Form */}
      <div className="p-3 bg-white border-t border-slate-150 flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Hỏi AI bí quyết đạt giải..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-300 focus:bg-white transition"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition shrink-0 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
