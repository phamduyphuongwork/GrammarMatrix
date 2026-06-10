// Namespace for Grammar Matrix Static Data
window.GrammarData = {
    whQuestionsPool: [
        {
            vi: "Bạn dùng trang web này để làm gì?",
            correct: ["What", "do", "you", "use", "this", "website", "for", "?"],
            scrambled: ["you", "What", "website", "do", "for", "use", "this", "?"]
        },
        {
            vi: "HTML viết tắt của từ gì?",
            correct: ["What", "does", "HTML", "stand", "for", "?"],
            scrambled: ["for", "What", "does", "?", "HTML", "stand"]
        },
        {
            vi: "Họ lưu lại trên website của bạn trong bao lâu?",
            correct: ["How", "long", "do", "they", "stay", "on", "your", "website", "?"],
            scrambled: ["stay", "they", "on", "How", "website", "do", "your", "long", "?"]
        },
        {
            vi: "Trang web này đón bao nhiêu lượt khách truy cập?",
            correct: ["How", "many", "visitors", "does", "this", "website", "get", "?"],
            scrambled: ["visitors", "How", "?", "this", "get", "many", "does", "website"]
        }
    ],

    quizBank: [
        {
            id: 1,
            topic: "wh",
            question: "Điền từ thích ứng để hỏi ý nghĩa từ viết tắt: 'What does CSS ______ for?'",
            options: ["mean", "stand", "be", "define"],
            answer: 1,
            explain: "Cấu trúc chuẩn để hỏi ý nghĩa chữ viết tắt: 'What does [Acronym] stand for?'"
        },
        {
            id: 2,
            topic: "tenses",
            question: "Since we launched the new server cluster, the response time ______ significantly.",
            options: ["improved", "has improved", "improves", "is improving"],
            answer: 1,
            explain: "Sự kết hợp các thì: Vế chứa Since chia quá khứ đơn (launched), vế còn lại chia hiện tại hoàn thành (has improved)."
        },
        {
            id: 3,
            topic: "comp",
            question: "Dịch nghĩa & Chọn đáp án so sánh đồng tiến đúng: 'The ______ the plan, the faster the team works.'",
            options: ["clearest", "more clear", "clearer", "clearly"],
            answer: 2,
            explain: "Công thức so sánh đồng tiến: 'The + comparative (clearer - tính từ ngắn), the + comparative (faster)'."
        },
        {
            id: 4,
            topic: "cond",
            question: "If I ______ you, I would refactor the duplicate React components.",
            options: ["am", "was", "were", "had been"],
            answer: 2,
            explain: "Câu điều kiện loại 2 (giả thiết trái thực tế hiện tại): To be ở vế If luôn dùng 'were' cho mọi ngôi."
        },
        {
            id: 5,
            topic: "wh",
            question: "We need to know _______ traffic our website receives daily to size the load balancer.",
            options: ["how many", "how much", "how often", "how long"],
            answer: 1,
            explain: "Traffic là danh từ không đếm được nên dùng 'how much' để hỏi số lượng."
        },
        {
            id: 6,
            topic: "cond",
            question: "Choose the correct Inversion of Conditional Type 3: '______ we implemented caching, our database would not have crashed.'",
            options: ["Were", "Should", "Had", "Unless"],
            answer: 2,
            explain: "Đảo ngữ loại 3: Đảo 'Had' lên trước chủ ngữ thay thế If (Had we implemented = If we had implemented)."
        },
        {
            id: 7,
            topic: "tenses",
            question: "Currently, the developers ______ the payment API integration.",
            options: ["test", "are testing", "have tested", "tested"],
            answer: 1,
            explain: "Trạng từ 'Currently' chỉ hành động đang xảy ra/tiến triển tại thời điểm nói, do đó dùng Hiện tại tiếp diễn."
        }
    ]
};
