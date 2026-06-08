import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { StepRenderer } from "./components/StepRenderer";
import { AIPanel } from "./components/AIPanel";
import { ProjectManager } from "./components/ProjectManager";
import { LandingPage } from "./components/LandingPage";
import { Project } from "./types";
import { BookOpen, FolderGit2, Sparkles, AlertCircle, Settings, ExternalLink } from "lucide-react";
import { AVAILABLE_MODELS } from "./utils/geminiClient";

// Pre-seeded high-quality Vietnamese pedagogical prototypes to allow instant use & evaluation
const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: "reversed-learning-tint-4",
    title: "Một số giải pháp ứng dụng mô hình dạy học đảo ngược kết hợp học liệu tương tác số hóa nhằm nâng cao hiệu quả tự học môn Tin học lớp 4",
    author: "Phan Ngọc Liên",
    school: "Trường Tiểu học Nguyễn Huệ, Quận 1",
    grade: "Lớp 4",
    subject: "Tin học",
    level: "Tiểu học",
    description: "Thực trạng học sinh lớp 4 học tập môn Tin học còn thụ động, phòng máy tính trường học còn hạn chế số lượng, dẫn đến việc thực hành trên lớp bị ngắt quãng. Ứng dụng mô hình lớp học đảo ngược (Flipped Classroom) giúp học sinh tự xem lý thuyết và video hướng dẫn trước ở nhà.",
    createdAt: new Date("2026-06-01").toISOString(),
    updatedAt: new Date("2026-06-08").toISOString(),
    solutionsCount: 3,
    solutionOptions: { tables: true, evidence: true, infographic: false },
    outline: {
      analyticalRating: {
        newness: 88,
        urgency: 92,
        feasibility: 85,
        comment: "Đề tài ứng dụng lớp học đảo ngược cực kì đúng xu hướng GDPT 2018. Rất có triển vọng đạt giải cao cấp Tỉnh/Thành phố."
      },
      items: [
        {
          section: "I. ĐẶT VẤN ĐỀ",
          details: [
            "1. Tính cấp thiết của đề tài ứng dụng Flipped Classroom trong bối cảnh Tin học Tiểu học.",
            "2. Mục tiêu nâng cao năng lực tự chủ và tự học kỹ năng số.",
            "3. Xác định đối tượng tác động trực tiếp: 40 học sinh lớp 4A."
          ]
        },
        {
          section: "II. GIẢI QUYẾT VẤN ĐỀ",
          details: [
            "1. Cơ sở lý luận về tự học và mô hình chuẩn bị trước giờ học.",
            "2. Cơ sở thực tiễn: Khảo sát thái độ và kỹ năng máy tính đầu năm của học sinh.",
            "3. Thiết kế 3 giải pháp đổi mới cốt lõi bao gồm video nhỏ tự quay và bảng tự theo dõi.",
            "4. Đánh giá chất lượng thực nghiệm đối chứng."
          ]
        },
        {
          section: "III. KẾT LUẬN VÀ KIẾN NGHỊ",
          details: [
            "1. Ý nghĩa sâu rộng của đề tài trong việc tối ưu hóa thời gian đứng lớp.",
            "2. Kiến nghị Nhà trường trang bị thêm tài nguyên học tập số hóa."
          ]
        }
      ]
    },
    survey: {
      totalQty: 40,
      surveyRows: [
        { criteria: "Chủ động chuẩn bị học liệu trước giờ học", achievedCount: 10, achievedRate: 25, notAchievedCount: 30, notAchievedRate: 75 },
        { criteria: "Hứng thú tham gia thảo luận nhóm thực hành", achievedCount: 14, achievedRate: 35, notAchievedCount: 26, notAchievedRate: 65 },
        { criteria: "Độc lập tự tin thao tác phần mềm văn phòng", achievedCount: 8, achievedRate: 20, notAchievedCount: 32, notAchievedRate: 80 },
        { criteria: "Kết quả bài tập thực hành đạt Xuất Sắc", achievedCount: 6, achievedRate: 15, notAchievedCount: 34, notAchievedRate: 85 }
      ],
      pedagogicalComment: "Số liệu khảo sát ban đầu cho thấy năng lực tự chọn, tự sắp xếp lộ trình học của học sinh rất yếu, phần lớn học sinh chỉ thao tác khi có giáo viên đốc thúc trực tiếp cạnh bên."
    },
    solutions: [
      {
        index: 1,
        title: "Xây dựng ngân hàng video hướng dẫn ngắn (Micro-learning) gửi phụ huynh hỗ trợ học sinh chuẩn bị bài trước giờ lên lớp",
        purpose: "Giúp học sinh nắm chắc thao tác di chuột, gõ phím cơ bản trước khi đặt chân vào phòng máy thực tế.",
        steps: [
          "Bước 1: Giáo viên quay các video thao tác màn hình dài dưới 3 phút bằng phần mềm OBS.",
          "Bước 2: Giao nhiệm vụ nhỏ thông qua link câu hỏi trắc nghiệm Google Form cực kì ngắn để kiểm soát việc chuẩn bị.",
          "Bước 3: Nhận xét biểu dương học sinh xem bài nhanh nhất vào đầu tiết học chính thức."
        ],
        pedagogicalAdvice: "Nên ưu tiên phụ đề chữ lớn và âm thanh sinh động dễ nhớ, tránh lý thuyết rườm rà kích ứng học sinh chán nản.",
        evidenceDescription: "Đường dẫn thư viện video Drive dùng chung và ảnh chụp tin nhắn phối hợp cùng hội phụ huynh học sinh.",
        infographicConcept: "Mô hình kim tự tháp lật ngược tương ứng 3 bước hành động của học sinh trước - trong - sau giờ lên lớp."
      },
      {
        index: 2,
        title: "Thiết kế phiếu tích điểm năng lực (Gamified Checklist) tự học tự làm việc tại nhà",
        purpose: "Dùng phần thưởng tinh thần khơi dậy tinh thần thi đua lành mạnh của cả lớp.",
        steps: [
          "Bước 1: In các phiếu học tập khổ A5 gửi học sinh dán trực tiếp góc bàn tự học.",
          "Bước 2: Phụ huynh ký xác nhận khi học sinh hoàn thành các thao tác tự luyện vẽ hoặc tự soạn thảo ngắn.",
          "Bước 3: Đổi điểm thưởng tích luỹ thành chức vụ 'Trợ lý CNTT nhí' trợ giúp các bạn cùng bàn."
        ],
        pedagogicalAdvice: "Không áp lực điểm số, tập trung khích lệ thái độ bền bỉ liên tục.",
        evidenceDescription: "Mẫu phiếu rèn luyện tự học Tin học 4 gửi kèm phụ lục.",
        infographicConcept: "Bản đồ chinh phục hành trình số hóa qua 5 nấc danh hiệu lấp lánh."
      },
      {
        index: 3,
        title: "Ứng dụng phần mềm sơ đồ tư duy Mindmap số hóa hệ thống hóa kiến thức tóm tắt bài học",
        purpose: "Mở rộng tư duy liên kết, giúp học sinh tiểu học nhớ lâu lý thuyết cấu trúc vật lý máy tính.",
        steps: [
          "Bước 1: Sử dụng công cụ tương tác miễn phí thiết lập sẵn sơ đồ mẫu khuyết nhánh.",
          "Bước 2: Tổ chức rèn luyên nhóm 4 học sinh trên lớp lắp ghép các ô nhánh thông tin đúng vị trí.",
          "Bước 3: Đại diện nhóm thuyết trình báo cáo sản phẩm sơ đồ tư duy của nhóm mình."
        ],
        pedagogicalAdvice: "Nên lồng ghép nhiều ảnh minh hoạ ngộ nghĩnh thay vì nhồi nhét chữ.",
        evidenceDescription: "Các sơ đồ màu do nhóm học sinh tự thực hiện trên lớp học và phiếu đánh giá đồng đẳng.",
        infographicConcept: "Bản đồ tư duy trung tâm rẽ nhánh vòng tròn màu sắc thu hút thị giác."
      }
    ],
    experiment: {
      comparisonData: [
        { category: "Hoàn thiện Xuất sắc (Giỏi)", controlGroup: 6, experimentalGroup: 22 },
        { category: "Hoàn thành Tốt (Khá)", controlGroup: 14, experimentalGroup: 13 },
        { category: "Hoàn thành Cơ bản (TB)", controlGroup: 16, experimentalGroup: 5 },
        { category: "Cần cố gắng thêm (Yêu)", controlGroup: 4, experimentalGroup: 0 }
      ],
      statisticalAnalysis: "Hệ số kiểm định T-test chứng tỏ sự chênh lệch chất lượng học tập cực kỳ ý nghĩa khoa học. Điểm trung bình nhóm ứng dụng mới tăng đột phá từ 6.12 lên 8.45. Tỷ lệ học sinh yếu CNTT hoàn toàn biến mất khỏi lớp học biến đổi.",
      conclusion: "Việc lật ngược phương trình đứng lớp giúp giải toả áp lực thời gian cho giáo viên, dành 100% thời gian thực tế để kèm cặp các học sinh tiếp thu chậm."
    },
    textEditorContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nBÁO CÁO SÁNG KIẾN KINH NGHIỆM\nTên đề tài: MỘT SỐ GIẢI PHÁP ỨNG DỤNG MÔ HÌNH DẠY HỌC ĐẢO NGƯỢC KẾT HỢP HỌC LIỆU TƯƠNG TÁC SỐ HÓA NHẰM NHẰM NÂNG CAO HIỆU QUẢ TỰ HỌC MÔN TIN HỌC LỚP 4\nNgười thực hiện: Phan Ngọc Liên\nĐơn vị công tác: Trường Tiểu học Nguyễn Huệ, Quận 1\n\n-----------------------------------\n\nPHẦN I: ĐẶT VẤN ĐỀ\n1. Tính cấp thiết của đề tài\nTrong kỷ nguyên số hóa giáo dục mạnh mẽ hiện nay, việc rèn luyện thái độ năng lực tự học và tự chủ công nghệ số cho học sinh tiểu học đóng vai trò cốt lõi chiến lược. Môn Tin học lớp 4 theo Chương trình giáo dục phổ thông năm 2018 không chỉ nhắm tới kỹ thuật mà tập trung vào năng lực tư duy máy tính. Tuy nhiên, thời lượng 1 tiết/tuần cùng giới hạn phòng máy nhà trường mang lại thách thức rất lớn. Học sinh thường lúng túng khi bắt tay thực hành thực tế, làm tiêu tốn rất nhiều thời lượng quý báu của tiết học.\nđể tháo gỡ điểm nghẽn này, đề tài được triển khai nhằm tái sắp xếp trình tự, rèn luyên ý thức cho học sinh thích nghi mọi môi trường.\n\nPHẦN II: GIẢI QUYẾT VẤN ĐỀ\n1. Cơ sở thực tiễn của đề tài\nQua theo dõi rà soát khảo sát đầu năm học, số lượng học sinh có ý thức chuẩn bị bài, ôn tập lý thuyết chủ động trước khi lên lớp vô cùng thấp chỉ đạt dưới 25%. Kỹ năng di chuột kết hợp phím lệnh cơ bản hầu như quên sạch sau hè. Điều này buộc giáo viên phải giảng lại lý thuyết thao tác tốn từ 15-20 phút của bài học, thời gian rèn luyện sản phẩm thực hành bị co hẹp, làm nảy sinh tâm lý chán nản kéo dài.\n\n2. Thiết kế các biện pháp rèn luyện thông minh:\n- Biện pháp 1: Thiết lập ngân hàng video ngắn (Micro-learning) sinh động hướng dẫn thao tác.\n- Biện pháp 2: Xây dựng bộ phiếu rèn luyện năng lực (Gamified Checklist) tự học tự làm và tự tích dấu tại nhà có sự cộng tác ký xác nhận của cha mẹ học sinh.\n\nPHẦN III: KẾT LUẬN VÀ KIẾN NGHỊ\nSáng kiến kinh nghiệm áp dụng thành quả lớp học lật ngược mang lại bộ mặt sinh khí hoàn toàn mới cho phòng máy nhà trường. Học sinh tự tin hăng say sáng tác phần mềm, chia sẻ học liệu đắc lực cùng cộng đồng. Rất mong quý nhà trường nhân rộng mô hình này sang các lớp lân cận trong thời gian sớm nhất.\n\nTác giả xin trân trọng cam đoan tính trung thực độc lập của sáng kiến kinh nghiệm này!`,
    annexList: [
      "Phụ lục 1: Mẫu kế hoạch bài dạy bài Thiết kế slide lật ngược lớp 4",
      "Phụ lục 2: Bảng khảo sát ý kiến đánh giá hứng thú thực hành của học sinh",
      "Tài liệu tham khảo: Sách Giáo viên Tin học 4 - Bộ sách Kết nối tri thức"
    ],
    evaluation: {
      scores: { novelty: 88, practicality: 90, scientificValue: 85, presentation: 95, total: 89 },
      pros: [
        "Đề tài chạm trúng điểm nóng thực tiễn chuyển đổi số giáo dục Việt Nam.",
        "Thiết kế video ngắn (Micro-learning) có tính thích ứng và bám sát tâm lý học sinh lớp 4 cực kỳ chuẩn xác.",
        "Thiết lập cơ chế phối hợp ba bên giữa Giáo viên - Học sinh - Phụ huynh vô cùng chặt chẽ."
      ],
      cons: [
        "Cần bổ sung hướng dẫn cài đặt phần mềm mẫu hỗ trợ những học sinh có điều kiện gia đình khó khăn, không có máy tính cá nhân riêng.",
        "Làm nổi bật mức độ chênh lệch của các em cá biệt học tập chậm chạp."
      ],
      suggestions: [
        "Bố sung 1 biểu đồ con thống kê mức độ tương thích máy tính của các học sinh tại nhà để tăng sức thuyết phục tuyệt đối.",
        "Chia sẻ cụ thể bí quyết thiết kế clip OBS tốc độ cực cao trong mục kinh nghiệm cá nhân."
      ]
    },
    slides: {
      presentationTheme: "Thiết kế chủ đạo: Nền tảng Slate xám ánh tím nhẹ nhàng thanh lịch tạo phong thái khoa học",
      slides: [
        { slideIndex: 1, title: "Báo Cáo Sáng Kiến Kinh Nghiệm Tin Học", subtitle: "Mô hình dạy học đảo ngược lớp 4 đổi mới", bullets: ["Người thực hiện: Phan Ngọc Liên", "Đơn vị: Tiểu học Nguyễn Huệ", "Năm thực hiện: 2026"] },
        { slideIndex: 2, title: "Thực Trạng Khó Khăn Trước Tác Động", bullets: ["Thời gian thực hành phòng máy cực kỳ eo hẹp.", "Học sinh thụ động trông chờ giáo viên chỉ tay từng bước.", "Tỉ lệ sẵn sàng chuẩn bị học liệu dưới 25%."] },
        { slideIndex: 3, title: "Biện Pháp 1: Video Ngắn Hướng Dẫn Sớm", bullets: ["Độ dài dưới 3 phút giúp giữ trọn vẹn tập trung của học sinh.", "Gửi qua nhóm tương tác rèn luyện hàng tuần dễ dàng.", "Giúp nhớ nhanh thao tác gõ vẽ chuẩn mực."] },
        { slideIndex: 4, title: "Biện Pháp 2 & 3: Phiếu Gamified & Sơ đồ Tư Duy", bullets: ["Tích luỹ huân chương thi đua trao quyền tự làm chủ.", "Vận dụng ghép nối tư duy khối kiến thức logic không nhàm chán.", "Phụ huynh hỗ trợ giám sát thái độ học tập lý thú bám sát lộ trình."] },
        { slideIndex: 5, title: "Kết Quả Thực Nghiệm Biến Chuyển Xuất Sắc", bullets: ["Tỷ lệ học lực loại Giỏi tăng từ 6 học sinh lên 22 học sinh.", "Lớp học ngập tràn tiếng cười tranh luận giải quyết vấn đề.", "Học sinh yếu kém được kèm cặp tỉ mỉ hơn hẳn."] },
        { slideIndex: 6, title: "Lời Tri Ân Của Tác Giả", bullets: ["Xin chân thành cảm ơn sự xem xét của Hội đồng Giám khảo chuyên môn.", "Đề tài cam kết sở hữu trí tuệ hoàn toàn độc lập xuất sắc."] }
      ]
    },
    proofing: {
      totalErrorsCount: 1,
      errorsList: [
        { original: "nhằm nhằm nâng cao", corrected: "nhằm nâng cao", reason: "Lỗi lặp từ ngữ 'nhằm' liên tiếp hai lần trong câu tiêu đề sáng kiến." }
      ],
      govComplianceComment: "Văn bản tuân thủ tuyệt vời Nghị định 30/2020/NĐ-CP của Chính phủ. Font chữ thống nhất, căn lề trái để đóng gáy chuẩn 3cm.",
      improvedParagraph: "Văn bản mẫu đã được tự động quét sạch các lỗi trùng lập và hoàn chỉnh ngữ nghĩa."
    }
  }
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_DEMO_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("reversed-learning-tint-4");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTextForAI, setSelectedTextForAI] = useState<string>("");
  const [viewMode, setViewMode] = useState<"catalog" | "workspace">("workspace");
  const [setupMode, setSetupMode] = useState<"landing" | "workspace">("workspace");

  const [apiKey1, setApiKey1] = useState<string>(() => localStorage.getItem("gemini_api_key_1") || "");
  const [apiKey2, setApiKey2] = useState<string>(() => localStorage.getItem("gemini_api_key_2") || "");
  const [apiKey3, setApiKey3] = useState<string>(() => localStorage.getItem("gemini_api_key_3") || "");
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem("gemini_selected_model") || "gemini-3-pro-preview");
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  useEffect(() => {
    const hasKeys = localStorage.getItem("gemini_api_key_1") || 
                    localStorage.getItem("gemini_api_key_2") || 
                    localStorage.getItem("gemini_api_key_3") || 
                    localStorage.getItem("gemini_api_key");
    if (!hasKeys) {
      setShowSettingsModal(true);
    }
  }, []);

  const handleSaveSettings = (key1: string, key2: string, key3: string, model: string) => {
    localStorage.setItem("gemini_api_key_1", key1);
    localStorage.setItem("gemini_api_key_2", key2);
    localStorage.setItem("gemini_api_key_3", key3);
    localStorage.setItem("gemini_selected_model", model);
    setApiKey1(key1);
    setApiKey2(key2);
    setApiKey3(key3);
    setSelectedModel(model);
    setShowSettingsModal(false);
  };

  const [modalKey1Input, setModalKey1Input] = useState(apiKey1);
  const [modalKey2Input, setModalKey2Input] = useState(apiKey2);
  const [modalKey3Input, setModalKey3Input] = useState(apiKey3);
  const [modalModelInput, setModalModelInput] = useState(selectedModel);

  useEffect(() => {
    if (showSettingsModal) {
      setModalKey1Input(apiKey1);
      setModalKey2Input(apiKey2);
      setModalKey3Input(apiKey3);
      setModalModelInput(selectedModel);
    }
  }, [showSettingsModal, apiKey1, apiKey2, apiKey3, selectedModel]);

  const currentProject = projects.find(p => p.id === selectedProjectId) || null;

  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  const handleCreateNewProject = () => {
    const newProj: Project = {
      id: `project-${Date.now()}`,
      title: "",
      author: "Nguyễn Văn B",
      school: "Trường THPT Chu Văn An",
      grade: "Lớp 10",
      subject: "Toán",
      level: "Trung học phổ thông",
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      solutionsCount: 3,
      solutionOptions: { tables: true, evidence: true, infographic: false }
    };

    setProjects(prev => [...prev, newProj]);
    setSelectedProjectId(newProj.id);
    setCurrentStep(1);
    setSelectedTextForAI("");
    setViewMode("workspace");
    setSetupMode("landing");
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentStep(1);
    setSelectedTextForAI("");
    setViewMode("workspace");
    
    const proj = projects.find(p => p.id === id);
    if (proj && (proj.title || proj.outline || proj.uploadedCriteria)) {
      setSetupMode("workspace");
    } else {
      setSetupMode("landing");
    }
  };

  const handleApplyRefinedText = (refinedText: string) => {
    if (!currentProject) return;
    
    // Replace text into the textEditorContent dynamically
    const currentText = currentProject.textEditorContent || "";
    if (selectedTextForAI && currentText.includes(selectedTextForAI)) {
      const updatedText = currentText.replace(selectedTextForAI, refinedText);
      handleUpdateProject({ textEditorContent: updatedText });
      setSelectedTextForAI("");
    } else {
      // Append if no exact selection matched
      const updatedText = currentText + "\n\n" + refinedText;
      handleUpdateProject({ textEditorContent: updatedText });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Universal Navbar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 shrink-0 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setViewMode("workspace")}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF6B00] to-[#7C3AED] flex items-center justify-center text-white font-black text-sm shadow-sm">
              M
            </div>
            <span className="font-display font-black text-sm tracking-tight text-slate-800">
              Viết sáng kiến kinh nghiệm cùng <span className="text-[#FF6B00]">Maris Slide</span> - ZALO: 0396.581.283
            </span>
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
          <a
            href="https://zalo.me/0396581283"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-3.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Liên hệ tư vấn khóa học & thiết kế: Zalo: 0396.581.283</span>
          </a>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="py-1.5 px-3.5 rounded-xl border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Cấu hình AI</span>
            <span className="text-[10px] text-red-500 font-bold ml-1 animate-pulse">
              (Lấy API key để sử dụng app)
            </span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === "catalog" ? "workspace" : "catalog")}
            className="py-1.5 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{viewMode === "catalog" ? "Quay về soạn thảo" : "Xem Thư viện Đề tài"}</span>
          </button>
          
          <button
            onClick={handleCreateNewProject}
            className="py-1.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-black font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            + Khởi tạo mới
          </button>
        </div>
      </header>

      {/* Main Container View Router */}
      <div className="flex-1 flex overflow-hidden">
        
        {viewMode === "catalog" ? (
          <div className="flex-1 overflow-y-auto bg-slate-50/50 py-12 px-6">
            <ProjectManager 
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              onNewProject={handleCreateNewProject}
            />
          </div>
        ) : (
          setupMode === "landing" && currentProject ? (
            <LandingPage 
              project={currentProject}
              onUpdateProject={handleUpdateProject}
              onProceed={() => setSetupMode("workspace")}
            />
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Column 1: Sidebar (Menu dọc 8 bước chuẩn) */}
              <Sidebar 
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                project={currentProject}
                onNewProject={handleCreateNewProject}
              />

              {/* Column 2: Step-by-step Interactive Workspace */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                <StepRenderer 
                  currentStep={currentStep}
                  project={currentProject}
                  onUpdateProject={handleUpdateProject}
                  onStepChange={setCurrentStep}
                  onSetSelectedText={setSelectedTextForAI}
                />
              </div>

              {/* Column 3: AI Assistant Right Panel */}
              <AIPanel 
                currentStep={currentStep}
                project={currentProject}
                onUpdateProject={handleUpdateProject}
              />
            </div>
          )
        )}

      </div>
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#7C3AED] animate-spin-slow" />
                <h3 className="font-display font-bold text-base text-slate-800">Cấu Hướng Kết Nối Gemini AI</h3>
              </div>
              {(apiKey1 || apiKey2 || apiKey3) && (
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-slate-400 hover:text-slate-650 text-sm font-semibold transition"
                >
                  Đóng
                </button>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Gemini API Key 1</label>
                  <input
                    type="password"
                    value={modalKey1Input}
                    onChange={(e) => setModalKey1Input(e.target.value)}
                    placeholder="Nhập API Key 1 (AI Studio)..."
                    className="w-full border border-slate-200 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Gemini API Key 2</label>
                  <input
                    type="password"
                    value={modalKey2Input}
                    onChange={(e) => setModalKey2Input(e.target.value)}
                    placeholder="Nhập API Key 2 (AI Studio)..."
                    className="w-full border border-slate-200 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Gemini API Key 3</label>
                  <input
                    type="password"
                    value={modalKey3Input}
                    onChange={(e) => setModalKey3Input(e.target.value)}
                    placeholder="Nhập API Key 3 (AI Studio)..."
                    className="w-full border border-slate-200 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#7C3AED] transition"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="text-slate-400">Các API Key sẽ luân phiên xoay vòng khi hết quota.</span>
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <span>Lấy API key ở đây</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase block">Lựa chọn Model mặc định</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {AVAILABLE_MODELS.map((model) => {
                    const isSelected = modalModelInput === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => setModalModelInput(model.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                          isSelected 
                            ? "border-[#7C3AED] bg-purple-50/20 ring-1 ring-[#7C3AED]" 
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-[#7C3AED] bg-[#7C3AED]" : "border-slate-300"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          {model.name}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal ml-5">{model.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!(modalKey1Input || modalKey2Input || modalKey3Input) && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-800 leading-normal">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p>
                    <strong>Lưu ý:</strong> Nếu không nhập API Key, hệ thống sẽ gọi qua Express server local (nếu đang chạy). Khi chạy trên trang tĩnh Vercel, ứng dụng sẽ bị lỗi nếu thiếu API Key.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2.5">
              {(apiKey1 || apiKey2 || apiKey3) && (
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 text-slate-650 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={() => handleSaveSettings(modalKey1Input, modalKey2Input, modalKey3Input, modalModelInput)}
                className="py-2.5 px-5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#7C3AED] text-white hover:opacity-90 transition shadow-sm cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
