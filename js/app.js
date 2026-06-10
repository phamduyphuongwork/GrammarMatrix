// Namespace for Grammar Matrix Application Controller
window.GrammarApp = {
    // 1. Initial State & UI settings
    state: {
        whBuilder: {
            currentIdx: 0,
            selectedWords: []
        },
        quiz: {
            activeQuestions: [],
            currentQuestionIdx: 0,
            selectedOptionIdx: null,
            isAnswerSubmitted: false,
            correctCount: 0,
            attemptedCount: 0
        }
    },

    // 2. Initialization on window load
    init() {
        // Setup initial theme icon
        const isDark = document.documentElement.classList.contains('dark');
        const iconBtn = document.getElementById('theme-toggle-btn');
        if (iconBtn) {
            iconBtn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
        }

        lucide.createIcons();
        this.initWhBuilder();
        this.matchConditionalMixer();
        this.startNewQuizSession();
    },

    // 3. Theme & Layout Management
    toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        const iconBtn = document.getElementById('theme-toggle-btn');

        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (iconBtn) {
                iconBtn.innerHTML = `<i data-lucide="moon" class="w-4 h-4"></i>`;
            }
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (iconBtn) {
                iconBtn.innerHTML = `<i data-lucide="sun" class="w-4 h-4"></i>`;
            }
        }
        lucide.createIcons();
    },

    switchTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        
        // Reset navigation buttons styles
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = "tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-slate-400 hover:text-slate-200 dark:hover:text-slate-100";
        });

        // Show target tab content
        const targetContent = document.getElementById(`tab-content-${tabId}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        // Apply active button styles
        const activeBtn = document.getElementById(`tab-btn-${tabId}`);
        if (activeBtn) {
            if (tabId === 'ai-tutor') {
                activeBtn.className = "tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap bg-emerald-600 text-white shadow-sm shadow-emerald-500/20";
            } else {
                activeBtn.className = "tab-btn px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap bg-brand-600 text-white shadow-sm shadow-brand-500/20";
            }
        }
    },

    scrollToSection(secId) {
        const target = document.getElementById(secId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    },

    showTenseDetail(tenseKey) {
        // Hide all tense details
        document.querySelectorAll('.tense-detail-content').forEach(el => el.classList.add('hidden'));
        
        // Reset tense tab buttons styles
        document.querySelectorAll('.tense-tab-btn').forEach(btn => {
            btn.className = "tense-tab-btn p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold text-center hover:border-slate-300 dark:hover:border-slate-700 transition";
        });

        // Show target detail & set active button style
        const targetDetail = document.getElementById(`tense-detail-${tenseKey}`);
        if (targetDetail) {
            targetDetail.classList.remove('hidden');
        }
        
        const activeBtn = document.getElementById(`tb-${tenseKey}`);
        if (activeBtn) {
            activeBtn.className = "tense-tab-btn p-3 bg-white dark:bg-slate-950 rounded-xl border border-brand-500 text-xs font-semibold text-brand-600 dark:text-brand-400 text-center transition";
        }
    },

    // 4. Sandbox 1: Wh- Question Builder
    initWhBuilder() {
        const pool = window.GrammarData.whQuestionsPool;
        const state = this.state.whBuilder;
        const currentQ = pool[state.currentIdx];
        
        document.getElementById('wh-clue-vi').textContent = `"${currentQ.vi}"`;
        state.selectedWords = [];
        this.renderWhWords();
    },

    renderWhWords() {
        const pool = window.GrammarData.whQuestionsPool;
        const state = this.state.whBuilder;
        const currentQ = pool[state.currentIdx];
        
        const targetContainer = document.getElementById('wh-builder-target');
        const sourceContainer = document.getElementById('wh-builder-source');

        // Render selected words in target dropzone
        targetContainer.innerHTML = '';
        if (state.selectedWords.length === 0) {
            targetContainer.innerHTML = `<span class="text-xs text-slate-400 dark:text-slate-600 italic select-none">Mảnh từ ghép sẽ nằm ở đây...</span>`;
        } else {
            state.selectedWords.forEach((word, idx) => {
                const btn = document.createElement('button');
                btn.className = "px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 rounded-lg text-xs font-mono transition flex items-center gap-1";
                btn.innerHTML = `${word} <i data-lucide="x" class="w-3 h-3 text-brand-500 dark:text-brand-400"></i>`;
                btn.onclick = () => this.removeWordFromBuilder(idx);
                targetContainer.appendChild(btn);
            });
        }

        // Render available source word bank (excluding selected occurrences)
        sourceContainer.innerHTML = '';
        let remainingWords = [...currentQ.scrambled];
        state.selectedWords.forEach(selected => {
            const index = remainingWords.indexOf(selected);
            if (index > -1) {
                remainingWords.splice(index, 1);
            }
        });

        remainingWords.forEach(word => {
            const btn = document.createElement('button');
            btn.className = "px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-xs font-mono transition";
            btn.textContent = word;
            btn.onclick = () => this.addWordToBuilder(word);
            sourceContainer.appendChild(btn);
        });

        lucide.createIcons();
        document.getElementById('wh-builder-feedback').textContent = '';
    },

    addWordToBuilder(word) {
        this.state.whBuilder.selectedWords.push(word);
        this.renderWhWords();
    },

    removeWordFromBuilder(index) {
        this.state.whBuilder.selectedWords.splice(index, 1);
        this.renderWhWords();
    },

    checkWhQuestion() {
        const pool = window.GrammarData.whQuestionsPool;
        const state = this.state.whBuilder;
        const currentQ = pool[state.currentIdx];
        const feedbackEl = document.getElementById('wh-builder-feedback');

        const isCorrect = state.selectedWords.length === currentQ.correct.length &&
            state.selectedWords.every((word, i) => word === currentQ.correct[i]);

        if (isCorrect) {
            feedbackEl.className = "text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1";
            feedbackEl.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i> Chính xác! Tuyệt vời.`;

            // Auto advance after a brief delay
            setTimeout(() => {
                state.currentIdx = (state.currentIdx + 1) % pool.length;
                this.initWhBuilder();
            }, 1800);
        } else {
            feedbackEl.className = "text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1";
            feedbackEl.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i> Sai rồi, hãy thử sắp xếp lại nhé!`;
        }
        lucide.createIcons();
    },

    resetWhQuestion() {
        this.state.whBuilder.selectedWords = [];
        this.renderWhWords();
    },

    // 5. Sandbox 2: Conditional Clause Mixer
    matchConditionalMixer() {
        const ifVal = document.getElementById('cond-if-select').value;
        const mainVal = document.getElementById('cond-main-select').value;
        const formulaEl = document.getElementById('cond-mixer-formula');
        const labelEl = document.getElementById('cond-mixer-label');
        const explainEl = document.getElementById('cond-mixer-explain');

        if (!ifVal || !mainVal) {
            formulaEl.textContent = "[Công thức lắp ráp sẽ xuất hiện ở đây...]";
            labelEl.textContent = "Chưa hoàn thiện";
            labelEl.className = "text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded";
            explainEl.textContent = "Hãy kết nối vế phù hợp để xem lời giải và ví dụ cụ thể.";
            return;
        }

        let state = "invalid";
        let formulaText = "";
        let labelText = "";
        let explainText = "";

        if (ifVal === 'pres-simple' && mainVal === 'pres-simple') {
            state = "valid";
            labelText = "Câu Điều Kiện Loại 0";
            formulaText = "If + S + V(s/es) (Hiện tại đơn) , S + V(s/es) (Hiện tại đơn)";
            explainText = "Sự thật hiển nhiên, chân lý khoa học. Ví dụ: If you heat ice, it melts.";
        } else if (ifVal === 'pres-simple' && mainVal === 'will-v0') {
            state = "valid";
            labelText = "Câu Điều Kiện Loại 1";
            formulaText = "If + S + V(s/es) , S + will/can/should + V0";
            explainText = "Sự việc hoàn toàn có thể xảy ra ở hiện tại hoặc tương lai. Ví dụ: If the traffic is good, I will arrive on time.";
        } else if (ifVal === 'should' && mainVal === 'will-v0') {
            state = "valid";
            labelText = "Đảo Ngữ Loại 1";
            formulaText = "Should + S + V0... , S + will/can + V0";
            explainText = "Mức độ trang trọng cao hơn. Ví dụ: Should you need any support, our DevOps team will respond immediately.";
        } else if (ifVal === 'past-simple' && mainVal === 'would-v0') {
            state = "valid";
            labelText = "Câu Điều Kiện Loại 2";
            formulaText = "If + S + V2/ed (tobe were) , S + would/could + V0";
            explainText = "Giả thiết trái với thực tế hiện tại. Ví dụ: If I were a rich entrepreneur, I would scale this platform globally.";
        } else if (ifVal === 'past-perfect' && mainVal === 'would-have-v3') {
            state = "valid";
            labelText = "Câu Điều Kiện Loại 3";
            formulaText = "If + S + Had + V3/ed , S + would have + V3/ed";
            explainText = "Giả thiết trái thực tế quá khứ (sự hối tiếc). Ví dụ: If we had backed up the database, we would not have lost the user tables.";
        } else if (ifVal === 'past-perfect' && mainVal === 'would-v0') {
            state = "valid";
            labelText = "Câu Điều Kiện Hỗn Hợp (Loại 4)";
            formulaText = "If + S + Had + V3/ed , S + would + V0";
            explainText = "Giả thiết trái quá khứ nhưng để lại kết quả trái hiện tại. Ví dụ: If you had studied JavaScript last week, you would know how to fix this component now.";
        } else {
            state = "mismatch";
            labelText = "Sai cấu trúc phối hợp";
            formulaText = "SỰ KẾT HỢP KHÔNG HỢP LỆ VỀ THÌ & NGỮ PHÁP!";
            explainText = "Vui lòng điều chỉnh lại vế If và vế Chính để tạo thành một tổ hợp câu điều kiện đúng chuẩn.";
        }

        // Design colors matching Tailwind dark mode
        if (state === "valid") {
            labelEl.className = "text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold";
            formulaEl.className = "text-xs text-emerald-600 dark:text-emerald-300 font-mono mt-2.5 leading-relaxed";
        } else if (state === "mismatch") {
            labelEl.className = "text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-bold";
            formulaEl.className = "text-xs text-rose-600 dark:text-rose-300 font-mono mt-2.5 leading-relaxed";
        } else {
            labelEl.className = "text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded";
            formulaEl.className = "text-xs text-slate-700 dark:text-slate-300 font-mono mt-2.5 leading-relaxed";
        }

        labelEl.textContent = labelText;
        formulaEl.textContent = formulaText;
        explainEl.textContent = explainText;
    },

    // 6. Sandbox 3: AI Writing Lab
    async analyzeWriting() {
        const inputVal = document.getElementById('ai-write-input').value.trim();
        const resultBox = document.getElementById('ai-write-result');

        if (!inputVal) {
            resultBox.classList.remove('hidden');
            resultBox.innerHTML = `
                <div class="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <i data-lucide="alert-circle" class="w-4 h-4"></i> Vui lòng nhập nội dung câu/đoạn văn cần kiểm tra trước khi phân tích.
                </div>
            `;
            lucide.createIcons();
            return;
        }

        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
            <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <i data-lucide="loader" class="w-4 h-4 animate-spin text-emerald-500 dark:text-emerald-400"></i>
                <span>Đang gọi Trí tuệ nhân tạo Gemini phân tích văn bản...</span>
            </div>
        `;
        lucide.createIcons();

        const prompt = `Hãy phân tích bài viết/câu này của học viên: "${inputVal}".
Hãy kiểm tra xem họ có áp dụng đúng ngữ pháp liên quan đến 6 chủ điểm này không:
1. Wh- questions, 2. Tenses, 3. Comparatives (so sánh), 4. Conditional (điều kiện), 5. Modal Verbs, 6. Sở hữu & giao tiếp thông dụng.

Phản hồi dưới dạng báo cáo chi tiết bằng tiếng Việt:
- Chấm điểm ngữ pháp (Thang điểm 1-10)
- Liệt kê lỗi ngữ pháp/chính tả (nếu có) và cách sửa cụ thể.
- Nhận xét cấu trúc ngữ pháp học viên đã áp dụng thành công.
- Phiên bản viết lại (Premium Rewrite) tối ưu hơn theo văn phong bản xứ chuẩn công nghệ/đời sống kèm bản dịch tiếng Việt.`;

        const systemInstruction = "You are an Elite AI English Copywriter and Senior Grammar Evaluator. Analyze grammar inputs strictly, providing clean formatted markdown outputs in Vietnamese with clear bullet points, highlighting modified words using bold or inline codes.";

        try {
            const result = await window.GrammarAPI.callGeminiAPI(prompt, systemInstruction);
            const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được phản hồi từ AI.";

            resultBox.innerHTML = `
                <div class="border-b border-slate-200 dark:border-slate-800 pb-3 mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <i data-lucide="sparkles" class="w-4 h-4"></i> Phân Tích Chi Tiết Từ AI
                    </span>
                    <span class="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">Hoàn tất</span>
                </div>
                <div class="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                    ${this.formatMarkdown(aiResponse)}
                </div>
            `;
            lucide.createIcons();
        } catch (err) {
            resultBox.innerHTML = `
                <div class="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                    <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i> 
                    <span>Không thể kết nối đến Trí tuệ Nhân tạo Gemini. Vui lòng kiểm tra API Key hoặc kết nối mạng!</span>
                </div>
            `;
            lucide.createIcons();
        }
    },

    // 7. Tab 3: Adaptive Quiz Arena
    startNewQuizSession() {
        const whChecked = document.getElementById('qfilter-wh').checked;
        const tensesChecked = document.getElementById('qfilter-tenses').checked;
        const compChecked = document.getElementById('qfilter-comp').checked;
        const condChecked = document.getElementById('qfilter-cond').checked;

        const state = this.state.quiz;
        state.activeQuestions = window.GrammarData.quizBank.filter(q => {
            if (q.topic === 'wh' && whChecked) return true;
            if (q.topic === 'tenses' && tensesChecked) return true;
            if (q.topic === 'comp' && compChecked) return true;
            if (q.topic === 'cond' && condChecked) return true;
            return false;
        });

        // Randomize questions
        state.activeQuestions.sort(() => Math.random() - 0.5);

        state.currentQuestionIdx = 0;
        state.selectedOptionIdx = null;
        state.isAnswerSubmitted = false;
        state.correctCount = 0;
        state.attemptedCount = 0;

        this.updateQuizStats();
        this.renderActiveQuestion();
    },

    async generateAIQuestion() {
        const container = document.getElementById('quiz-question-container');
        const topicsList = [];

        if (document.getElementById('qfilter-wh').checked) topicsList.push("Wh- questions and quantitative words");
        if (document.getElementById('qfilter-tenses').checked) topicsList.push("Present Simple, Continuous, Perfect, Past Simple, Future tenses");
        if (document.getElementById('qfilter-comp').checked) topicsList.push("Comparatives, Superlatives and double progressive (The clearer, the faster)");
        if (document.getElementById('qfilter-cond').checked) topicsList.push("Conditional clauses (Type 0-4, mixed, inversion, alternatives)");

        if (topicsList.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center flex flex-col items-center justify-center gap-4 flex-grow">
                    <div class="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full">
                        <i data-lucide="alert-triangle" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-lg">Thiếu chủ đề</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Vui lòng tích chọn ít nhất một chủ đề ôn tập ở bảng bên trái trước khi thách đấu AI!</p>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = `
            <div class="p-8 text-center flex flex-col items-center justify-center gap-4 flex-grow">
                <div class="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 animate-pulse">
                    <i data-lucide="sparkles" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 dark:text-white text-md">Đang kiến tạo câu hỏi độc quyền từ AI...</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Sử dụng Gemini để sinh đề trắc nghiệm chuẩn chỉnh.</p>
                </div>
            </div>
        `;
        lucide.createIcons();

        const selectedTopicsText = topicsList.join(", ");
        const prompt = `Hãy sinh ngẫu nhiên một câu hỏi trắc nghiệm tiếng Anh cực hay về chủ đề: [${selectedTopicsText}]. 
Yêu cầu câu hỏi phải liên quan đến bối cảnh lập trình, công nghệ thông tin (IT), khởi nghiệp (startup) hoặc làm việc trong văn phòng. 
Cung cấp 4 lựa chọn (options) duy nhất chỉ 1 đáp án chính xác. Trả về đúng mẫu cấu trúc JSON được yêu cầu.`;

        const systemInstruction = "You are a professional IELTS and Cambridge examiner specialized in Business and Tech English. Generate challenging questions in clean English, with clear explanations written in Vietnamese.";

        const schema = {
            type: "OBJECT",
            properties: {
                question: { type: "STRING" },
                options: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                answer: { type: "INTEGER" }, // 0 to 3
                explain: { type: "STRING" },
                topic: { type: "STRING" }
            },
            required: ["question", "options", "answer", "explain", "topic"]
        };

        try {
            const response = await window.GrammarAPI.callGeminiAPI(prompt, systemInstruction, schema);
            const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text;
            
            // Clean Markdown markers before parsing
            const cleanedText = window.GrammarAPI.cleanJSONResponse(rawText);
            const questionData = JSON.parse(cleanedText);

            questionData.id = "ai-" + Date.now();
            
            // Insert question at current position in active queue
            const state = this.state.quiz;
            state.activeQuestions.splice(state.currentQuestionIdx, 0, questionData);

            this.renderActiveQuestion();
        } catch (err) {
            console.error("AI Question Generation Error: ", err);
            container.innerHTML = `
                <div class="p-8 text-center flex flex-col items-center justify-center gap-4 flex-grow bg-rose-500/5">
                    <div class="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full">
                        <i data-lucide="alert-circle" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-md">Không thể tải đề thi từ AI</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Có lỗi xảy ra khi phân tích cú pháp hoặc kết nối API. Vui lòng cấu hình API Key và thử lại.</p>
                    </div>
                    <button onclick="generateAIQuestion()" class="px-4 py-2 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-xs font-semibold">Thử lại</button>
                </div>
            `;
            lucide.createIcons();
        }
    },

    updateQuizStats() {
        const state = this.state.quiz;
        const completedEl = document.getElementById('quiz-stat-completed');
        const accuracyEl = document.getElementById('quiz-stat-accuracy');

        completedEl.textContent = `${state.attemptedCount}/${state.activeQuestions.length}`;
        if (state.attemptedCount > 0) {
            accuracyEl.textContent = `${Math.round((state.correctCount / state.attemptedCount) * 100)}%`;
        } else {
            accuracyEl.textContent = "0%";
        }
    },

    renderActiveQuestion() {
        const container = document.getElementById('quiz-question-container');
        const state = this.state.quiz;

        if (state.activeQuestions.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center flex flex-col items-center justify-center gap-4 flex-grow">
                    <div class="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full">
                        <i data-lucide="alert-triangle" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-lg">Không có câu hỏi được chọn</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Vui lòng tích chọn ít nhất một chủ đề ôn tập ở bảng cấu hình bên trái.</p>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        if (state.currentQuestionIdx >= state.activeQuestions.length) {
            container.innerHTML = `
                <div class="p-8 text-center flex flex-col items-center justify-center gap-4 flex-grow bg-slate-100/30 dark:bg-slate-900/40">
                    <div class="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                        <i data-lucide="smile" class="w-10 h-10"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-white text-lg">Hoàn thành lượt câu hỏi!</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Kết quả: ${state.correctCount}/${state.attemptedCount} câu trả lời chính xác.</p>
                    </div>
                    <button onclick="startNewQuizSession()" class="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition">
                        Chơi lại từ đầu
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const currentQ = state.activeQuestions[state.currentQuestionIdx];

        let optionsHtml = currentQ.options.map((opt, idx) => {
            let borderClass = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60";
            let iconClass = "text-slate-400 dark:text-slate-600";
            let iconName = "circle";

            if (state.selectedOptionIdx === idx) {
                borderClass = "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300";
                iconClass = "text-brand-500 dark:text-brand-400";
                iconName = "check-circle-2";
            }

            if (state.isAnswerSubmitted) {
                if (idx === currentQ.answer) {
                    borderClass = "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
                    iconClass = "text-emerald-500 dark:text-emerald-400";
                    iconName = "check-circle";
                } else if (state.selectedOptionIdx === idx) {
                    borderClass = "border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300";
                    iconClass = "text-rose-500 dark:text-rose-400";
                    iconName = "x-circle";
                } else {
                    borderClass = "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 opacity-50";
                }
            }

            const action = state.isAnswerSubmitted ? "" : `onclick="selectQuizOption(${idx})"`;

            return `
                <div ${action} class="p-3.5 rounded-xl border ${borderClass} text-xs font-medium cursor-pointer transition flex items-center justify-between gap-3">
                    <span>${opt}</span>
                    <i data-lucide="${iconName}" class="w-4 h-4 ${iconClass} shrink-0"></i>
                </div>
            `;
        }).join('');

        const isAIGenerated = (typeof currentQ.id === 'string' && currentQ.id.startsWith("ai-"));

        container.innerHTML = `
            <div class="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <span class="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    ${isAIGenerated ? '<i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"></i> AI Generated' : 'Mẫu Đề Khảo Sát'} 
                    ${state.currentQuestionIdx + 1} / ${state.activeQuestions.length}
                </span>
                <span class="text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono uppercase">${currentQ.topic}</span>
            </div>

            <div class="p-6 flex-grow space-y-4">
                <p class="text-sm font-semibold text-slate-800 dark:text-white leading-relaxed">${currentQ.question}</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    ${optionsHtml}
                </div>

                ${state.isAnswerSubmitted ? `
                    <div class="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 animate-fadeIn">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giải thích lý thuyết:</span>
                        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${currentQ.explain}</p>
                    </div>
                ` : ''}
            </div>

            <div class="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div></div>
                <div class="flex items-center gap-2">
                    ${!state.isAnswerSubmitted ? `
                        <button onclick="submitQuizAnswer()" ${state.selectedOptionIdx === null ? "disabled" : ""} class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition">
                            Xác nhận đáp án
                        </button>
                    ` : `
                        <button onclick="nextQuizQuestion()" class="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-750 dark:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
                            Câu tiếp theo <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    selectQuizOption(idx) {
        this.state.quiz.selectedOptionIdx = idx;
        this.renderActiveQuestion();
    },

    submitQuizAnswer() {
        const state = this.state.quiz;
        if (state.selectedOptionIdx === null || state.isAnswerSubmitted) return;

        const currentQ = state.activeQuestions[state.currentQuestionIdx];
        state.isAnswerSubmitted = true;
        state.attemptedCount++;

        if (state.selectedOptionIdx === currentQ.answer) {
            state.correctCount++;
        }

        this.updateQuizStats();
        this.renderActiveQuestion();
    },

    nextQuizQuestion() {
        const state = this.state.quiz;
        state.currentQuestionIdx++;
        state.selectedOptionIdx = null;
        state.isAnswerSubmitted = false;
        this.renderActiveQuestion();
    },

    // 8. Tab 4: AI Grammar Co-Pilot
    injectPrompt(text) {
        const inputEl = document.getElementById('ai-chat-input');
        if (inputEl) {
            inputEl.value = text;
            inputEl.focus();
        }
    },

    async sendAIChatMessage() {
        const inputEl = document.getElementById('ai-chat-input');
        const messageText = inputEl.value.trim();
        if (!messageText) return;

        inputEl.value = '';

        const chatMessagesContainer = document.getElementById('ai-chat-messages');

        // Render User Message
        const userMsgHtml = `
            <div class="flex gap-3 justify-end animate-fadeIn">
                <div class="p-3.5 bg-brand-600 rounded-2xl rounded-tr-none border border-brand-500/20 text-xs text-white max-w-[85%] leading-relaxed">
                    ${this.escapeHTML(messageText)}
                </div>
            </div>
        `;
        chatMessagesContainer.insertAdjacentHTML('beforeend', userMsgHtml);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Render loading state
        const loadingId = 'loading-' + Date.now();
        const loadingMsgHtml = `
            <div class="flex gap-3 animate-fadeIn" id="${loadingId}">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <i data-lucide="bot" class="w-4 h-4 animate-spin"></i>
                </div>
                <div class="p-3.5 bg-white dark:bg-slate-950 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 max-w-[85%] leading-relaxed flex items-center gap-2">
                    <span>Đang phân tích và truy hồi ngữ pháp...</span>
                </div>
            </div>
        `;
        chatMessagesContainer.insertAdjacentHTML('beforeend', loadingMsgHtml);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        lucide.createIcons();

        const systemPrompt = `You are a strict, expert English Grammar Tutor for Vietnamese learners. 
Your target is to teach, correct and analyze grammar based on 6 core areas:
1. Wh- questions (including special abbreviations stand for/mean, "how often/long/fast/far")
2. Tenses (Present Simple, Continuous, Perfect, Past Simple, Future Simple, Near Future)
3. Comparatives & Superlatives (especially double comparatives: The clearer, the faster)
4. Conditional sentences (Types 0 to 4 + mixed, and inversions, alternatives to 'if' like Unless/Without)
5. Modal Verbs (must/mustn't, have to/don't have to, can, should)
6. Other communications (Have got, there is/are, quantifiers, linking words, prepositions).

Analyze user inputs in a high signal-density layout using bold bullet points, clear explanation, and tables when necessary. Always write explanations in Vietnamese but preserve English examples correctly.`;

        let responseText = "";
        try {
            const response = await window.GrammarAPI.callGeminiAPI(messageText, systemPrompt);
            responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "Gặp lỗi phản hồi từ hệ thống AI.";
        } catch (error) {
            responseText = "Không thể kết nối đến Trợ lý AI Ngữ Pháp lúc này. Hãy kiểm tra lại kết nối mạng hoặc API Key của bạn.";
        }

        // Clean up loading state
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.remove();
        }

        // Render AI Message
        const aiFormattedText = this.formatMarkdown(responseText);
        const aiMsgHtml = `
            <div class="flex gap-3 animate-fadeIn">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <i data-lucide="bot" class="w-4 h-4"></i>
                </div>
                <div class="p-3.5 bg-white dark:bg-slate-950 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 max-w-[85%] leading-relaxed space-y-2">
                    ${aiFormattedText}
                </div>
            </div>
        `;
        chatMessagesContainer.insertAdjacentHTML('beforeend', aiMsgHtml);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        lucide.createIcons();
    },

    // 9. API Configuration Modal Settings
    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const keyInput = document.getElementById('input-api-key');
        const modelSelect = document.getElementById('select-gemini-model');

        keyInput.value = window.GrammarAPI.apiKey;
        modelSelect.value = window.GrammarAPI.activeModel;

        modal.classList.remove('hidden');
    },

    closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('hidden');
    },

    saveSettings() {
        const keyInput = document.getElementById('input-api-key').value.trim();
        const modelSelect = document.getElementById('select-gemini-model').value;

        window.GrammarAPI.apiKey = keyInput;
        window.GrammarAPI.activeModel = modelSelect;

        this.closeSettingsModal();
        alert("Đã lưu cấu hình API Key và Model thành công!");
    },

    showAPIKeyPrompt() {
        alert("Vui lòng cấu hình Gemini API Key trước khi sử dụng tính năng AI!");
        this.openSettingsModal();
    },

    toggleKeyVisibility() {
        const input = document.getElementById('input-api-key');
        const icon = document.getElementById('eye-icon');
        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    },

    // 10. Mini Utilities
    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    },

    formatMarkdown(text) {
        let html = this.escapeHTML(text);

        // Parse code blocks ``` ... ```
        html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-800 dark:text-slate-300 font-mono text-[10px] my-2 overflow-x-auto">$1</pre>');

        // Parse inline code `code`
        html = html.replace(/`([^`\n]+)`/g, '<code class="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400 font-mono text-[11px]">$1</code>');

        // Parse bold **bold**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>');

        // Parse list items (- item or * item)
        html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');

        // Replace carriage returns with break tags
        html = html.replace(/\n/g, '<br>');

        return html;
    }
};

// Global handlers binding for back compatibility with inline HTML events
window.switchTab = (tabId) => window.GrammarApp.switchTab(tabId);
window.toggleDarkMode = () => window.GrammarApp.toggleDarkMode();
window.openSettingsModal = () => window.GrammarApp.openSettingsModal();
window.closeSettingsModal = () => window.GrammarApp.closeSettingsModal();
window.saveSettings = () => window.GrammarApp.saveSettings();
window.toggleKeyVisibility = () => window.GrammarApp.toggleKeyVisibility();
window.scrollToSection = (secId) => window.GrammarApp.scrollToSection(secId);
window.showTenseDetail = (tenseKey) => window.GrammarApp.showTenseDetail(tenseKey);
window.checkWhQuestion = () => window.GrammarApp.checkWhQuestion();
window.resetWhQuestion = () => window.GrammarApp.resetWhQuestion();
window.matchConditionalMixer = () => window.GrammarApp.matchConditionalMixer();
window.analyzeWriting = () => window.GrammarApp.analyzeWriting();
window.startNewQuizSession = () => window.GrammarApp.startNewQuizSession();
window.generateAIQuestion = () => window.GrammarApp.generateAIQuestion();
window.selectQuizOption = (idx) => window.GrammarApp.selectQuizOption(idx);
window.submitQuizAnswer = () => window.GrammarApp.submitQuizAnswer();
window.nextQuizQuestion = () => window.GrammarApp.nextQuizQuestion();
window.injectPrompt = (text) => window.GrammarApp.injectPrompt(text);
window.sendAIChatMessage = () => window.GrammarApp.sendAIChatMessage();

// Trigger application load
window.onload = () => window.GrammarApp.init();
