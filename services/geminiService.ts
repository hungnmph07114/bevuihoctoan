import { GoogleGenAI, Type } from "@google/genai";
import { Question, Topic, AnsweredQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Custom error to be thrown when API quota is exceeded
export const QUOTA_EXCEEDED_ERROR = 'QUOTA_EXCEEDED';

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "Câu hỏi toán học. Ví dụ: '5 + 3 = ?' hoặc 'Điền số thích hợp vào chỗ trống: 10 - ___ = 4' hoặc '2 x 5 = 11. Đúng hay sai?'",
      },
      type: {
        type: Type.STRING,
        enum: ['multiple_choice', 'fill_in_the_blank', 'true_false'],
        description: "Loại câu hỏi.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Đối với 'multiple_choice', cung cấp 4 lựa chọn. Đối với 'true_false', cung cấp ['Đúng', 'Sai']. Để trống cho 'fill_in_the_blank'.",
      },
      answer: {
        type: Type.STRING,
        description: "Đáp án đúng. Đối với 'true_false', phải là 'Đúng' hoặc 'Sai'.",
      },
      explanation: {
        type: Type.STRING,
        description: "Giải thích ngắn gọn, đơn giản (1 câu) tại sao đáp án lại đúng, phù hợp cho trẻ em.",
      },
    },
    required: ["question", "type", "options", "answer", "explanation"],
  },
};

const singleQuestionSchema = {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "Câu hỏi toán học dạng lời văn. Ví dụ: 'Bạn Thỏ có 5 củ cà rốt, bạn ấy ăn hết 2 củ. Hỏi bạn Thỏ còn lại bao nhiêu củ cà rốt?'",
      },
      type: {
        type: Type.STRING,
        enum: ['multiple_choice'],
        description: "Loại câu hỏi, luôn là 'multiple_choice'.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Cung cấp 4 lựa chọn trắc nghiệm.",
      },
      answer: {
        type: Type.STRING,
        description: "Đáp án đúng.",
      },
      explanation: {
        type: Type.STRING,
        description: "Giải thích ngắn gọn, đơn giản (1 câu) tại sao đáp án lại đúng, phù hợp cho trẻ em.",
      },
    },
    required: ["question", "type", "options", "answer", "explanation"],
};

const getTopicPrompt = (topic: Topic): string => {
    switch (topic) {
        case 'addition_subtraction':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán cộng và trừ. Không hỏi về hình học, nhân chia hay bất kỳ chủ đề nào khác.';
        case 'multiplication_division':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán nhân và chia. Không hỏi về hình học, cộng trừ hay bất kỳ chủ đề nào khác.';
        case 'comparison':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán so sánh số (lớn hơn, nhỏ hơn, bằng). KHÔNG tạo câu hỏi dạng điền vào chỗ trống yêu cầu điền toán tử so sánh (ví dụ: "14 ___ 16"). Thay vào đó, câu hỏi điền vào chỗ trống phải yêu cầu điền MỘT CON SỐ (ví dụ: "Số liền sau của 15 là ___"). Đối với câu hỏi trắc nghiệm, có thể hỏi trực tiếp về dấu so sánh (ví dụ: "Chọn dấu thích hợp: 14 ___ 16", với các lựa chọn là "<", ">", "=").';
        case 'word_problems':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán có lời văn. Các bài toán này có thể chứa phép tính nhưng phải có một câu chuyện hoặc bối cảnh.';
        case 'geometry':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán về đặc điểm của hình học cơ bản. Ví dụ: "Hình vuông có mấy cạnh?", "Một hình tam giác có bao nhiêu góc?". NGHIÊM CẤM tạo các câu hỏi yêu cầu nhận dạng hình ảnh, ví dụ như "Trong các hình sau, hình nào là hình tròn?". Chỉ hỏi về các thuộc tính như số cạnh, số góc.';
        case 'measurement':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán về đo lường (thời gian, độ dài, tiền tệ Việt Nam).';
        case 'logic':
            return 'Tập trung TUYỆT ĐỐI vào các bài toán logic, tìm quy luật của dãy số, hoặc các câu đố tư duy.';
        case 'fractions':
            return 'Tập trung TUYỆT ĐỐI vào các khái niệm phân số cơ bản và so sánh phân số đơn giản.';
        case 'general':
        default:
            return 'Bao gồm nhiều dạng toán khác nhau một cách đa dạng.';
    }
}

/**
 * Generates specific difficulty instructions based on the player's grade and level.
 * This translates the abstract 'level' into concrete mathematical concepts for the AI.
 * @param grade The player's grade.
 * @param level The player's level.
 * @returns A string of instructions for the AI.
 */
const getDifficultyInstructions = (grade: number, level: number): string => {
    let instructions = "Yêu cầu về độ khó:\n";
    
    switch (grade) {
        case 1:
            if (level <= 3) {
                instructions += `Cấp 1–3 (Kém): Nhận biết số 1–20, so sánh lớn hơn/nhỏ hơn, cộng trừ trong phạm vi 10 không nhớ.`;
            } else if (level <= 5) {
                instructions += `Cấp 4–5 (Trung bình yếu): Cộng trừ trong phạm vi 20 (có nhớ đơn giản), nhận biết chẵn – lẻ, bài toán đố một bước có minh họa.`;
            } else if (level <= 6) {
                instructions += `Cấp 6 (Trung bình): Cộng trừ trong phạm vi 100, bước đầu làm quen bảng cửu chương 2–3, toán đố hai bước (ví dụ: mua đồ rồi trả lại tiền thừa).`;
            } else if (level <= 7) {
                instructions += `Cấp 7 (Khá): Cộng trừ trong phạm vi 100 có nhớ, nhân chia trong phạm vi 20, đo độ dài bằng cm, nhận biết phân số 1/2.`;
            } else if (level <= 8) {
                instructions += `Cấp 8 (Giỏi): Kết hợp cộng, trừ, nhân đơn giản; bài toán tìm quy luật dãy số nhỏ (2,4,6,…); so sánh số có 2 chữ số.`;
            } else if (level <= 10) {
                instructions += `Cấp 9–10 (Xuất sắc): Toán đố nhiều bước (ví dụ: trong hộp có bi đỏ và xanh, lấy ra rồi thêm vào…), đố logic nhỏ.`;
            } else { // level > 10
                instructions += `Cấp >10 (Thần đồng): Toán mẹo lớp 1 nâng cao, đố vui tư duy, bài toán đếm hình, dạng toán quốc tế cho học sinh nhỏ tuổi.`;
            }
            break;
        case 2:
            if (level <= 3) {
                instructions += `Cấp 1–3: Cộng trừ trong phạm vi 100 không nhớ, nhận biết dãy số, toán đố một bước.`;
            } else if (level <= 5) {
                instructions += `Cấp 4–5: Cộng trừ có nhớ trong phạm vi 100, bảng cửu chương 2–5, bài toán đố thực tế.`;
            } else if (level <= 6) {
                instructions += `Cấp 6: Thành thạo cộng trừ nhân chia trong phạm vi 100, bảng cửu chương đến 9, toán đố 2 bước.`;
            } else if (level <= 7) {
                instructions += `Cấp 7: Nhân chia số có 2 chữ số với 1 chữ số, đo độ dài, khối lượng (kg/g), nhận biết phân số cơ bản (1/3, 1/4).`;
            } else if (level <= 8) {
                instructions += `Cấp 8: Kết hợp 4 phép tính trong phạm vi 100, tìm quy luật số, toán logic đơn giản.`;
            } else if (level <= 10) {
                instructions += `Cấp 9–10: Bài toán nhiều bước có thông tin gây nhiễu, bài toán chia đều, chia nhóm.`;
            } else { // level > 10
                instructions += `Cấp >10: Toán tư duy quốc tế lớp 2 (ví dụ: điền số vào ô trống theo quy luật, toán mẹo).`;
            }
            break;
        case 3:
            if (level <= 3) {
                instructions += `Cấp 1–3: Cộng trừ nhân chia trong phạm vi 100, nhẩm nhanh.`;
            } else if (level <= 5) {
                instructions += `Cấp 4–5: Nhân chia có nhớ với số 2 chữ số, toán gấp/giảm theo tỉ lệ đơn giản.`;
            } else if (level <= 6) {
                instructions += `Cấp 6: Bảng nhân chia mở rộng, phép tính với số đến 1000, bài toán đố hai bước.`;
            } else if (level <= 7) {
                instructions += `Cấp 7: Bắt đầu học phân số (so sánh, cộng trừ phân số đơn giản), chu vi, diện tích hình chữ nhật, hình vuông.`;
            } else if (level <= 8) {
                instructions += `Cấp 8: Toán kết hợp 4 phép tính với số 3 chữ số, bài toán dãy số logic, gấp đôi/giảm nửa.`;
            } else if (level <= 10) {
                instructions += `Cấp 9–10: Bài toán có nhiều dữ kiện, phân tích loại trừ, giải toán bằng sơ đồ.`;
            } else { // level > 10
                instructions += `Cấp >10: Toán mẹo, toán quốc tế lớp 3 (Olympiad dạng cơ bản).`;
            }
            break;
        case 4:
            if (level <= 3) {
                instructions += `Cấp 1–3: Phép tính cộng trừ nhân chia với số có 3 chữ số.`;
            } else if (level <= 5) {
                instructions += `Cấp 4–5: Nhân chia số có 2–3 chữ số, toán có lời văn 2 bước.`;
            } else if (level <= 6) {
                instructions += `Cấp 6: Phân số, hỗn số, so sánh – rút gọn phân số, tính toán đơn giản với phân số.`;
            } else if (level <= 7) {
                instructions += `Cấp 7: Diện tích các hình cơ bản (hình chữ nhật, tam giác), bài toán trung bình cộng.`;
            } else if (level <= 8) {
                instructions += `Cấp 8: Bài toán quy luật số, bài toán logic, kết hợp phân số + số tự nhiên.`;
            } else if (level <= 10) {
                instructions += `Cấp 9–10: Toán đố nhiều bước, dạng toán năng khiếu lớp 4 (chia phần, tìm ẩn).`;
            } else { // level > 10
                instructions += `Cấp >10: Toán tư duy nâng cao: bài toán tổ hợp đơn giản, toán Olympiad lớp 4.`;
            }
            break;
        case 5:
            if (level <= 3) {
                instructions += `Cấp 1–3: Thành thạo bốn phép tính với số có nhiều chữ số.`;
            } else if (level <= 5) {
                instructions += `Cấp 4–5: Phép nhân chia số thập phân với số tự nhiên, toán tỉ số phần trăm đơn giản.`;
            } else if (level <= 6) {
                instructions += `Cấp 6: Thực hiện bốn phép tính với số thập phân, phân số nâng cao.`;
            } else if (level <= 7) {
                instructions += `Cấp 7: Hình học: diện tích, thể tích hình hộp chữ nhật, hình lập phương; bài toán tỉ lệ.`;
            } else if (level <= 8) {
                instructions += `Cấp 8: Kết hợp phân số, số thập phân, phần trăm trong bài toán thực tế.`;
            } else if (level <= 10) {
                instructions += `Cấp 9–10: Bài toán nâng cao nhiều bước, toán suy luận, bài toán có dữ kiện thừa.`;
            } else { // level > 10
                instructions += `Cấp >10: Toán Olympiad tiểu học (tổ hợp, xác suất đơn giản, toán mẹo nâng cao).`;
            }
            break;
        default:
             // Fallback to a generic difficulty scale if grade is not 1-5
            if (level <= 3) {
                instructions += `- Dành cho học sinh có sức học KÉM. Tập trung vào các phép cộng và trừ KHÔNG NHỚ trong phạm vi 10 (ví dụ: 3 + 4, 9 - 5).\n- Chỉ sử dụng các số có một chữ số, nhận biết số, so sánh số rất cơ bản.\n- Các bài toán đố chỉ có một bước tính và rất đơn giản, dễ hình dung.`;
            } else if (level <= 5) {
                instructions += `- Dành cho học sinh có sức học TRUNG BÌNH YẾU. Giới thiệu phép cộng và trừ CÓ NHỚ trong phạm vi 20 (ví dụ: 8 + 7, 15 - 9).\n- Bắt đầu các bài toán nhân đơn giản với bảng cửu chương 2 và 5.\n- Các bài toán đố có thể phức tạp hơn một chút nhưng vẫn chỉ có một bước tính.`;
            } else if (level <= 6) {
                instructions += `- Dành cho học sinh có sức học TRUNG BÌNH. Tập trung vào phép cộng và trừ các số có hai chữ số (có nhớ).\n- Mở rộng các bài toán nhân và chia trong phạm vi bảng cửu chương (từ 2 đến 9).\n- Các bài toán đố có thể yêu cầu hai bước tính.`;
            } else if (level <= 7) {
                instructions += `- Dành cho học sinh KHÁ. Sử dụng các phép cộng và trừ với các số có ba chữ số.\n- Giới thiệu các khái niệm cơ bản về phân số (ví dụ: 1/2, 1/4) và so sánh phân số đơn giản.\n- Các bài toán về đo lường (thời gian, tiền tệ Việt Nam - VNĐ).`;
            } else if (level <= 8) {
                instructions += `- Dành cho học sinh GIỎI. Các bài toán phức tạp hơn với các số lớn, kết hợp cả bốn phép tính.\n- Các bài toán logic, tìm quy luật của dãy số.\n- Các bài toán đố có nhiều bước tính và thông tin gây nhiễu nhẹ.`;
            } else if (level <= 10) {
                instructions += `- Dành cho học sinh XUẤT SẮC. Các bài toán đố phức tạp, có nhiều dữ kiện và có thể có thông tin gây nhiễu để thử thách khả năng phân tích.\n- Yêu cầu tư duy logic cao hơn, có thể là các bài toán về cấu tạo số.`;
            } else { // level > 10
                instructions += `- Dành cho học sinh có tố chất THẦN ĐỒNG. Tạo ra các bài toán mẹo, toán Olympiad cấp độ dễ.\n- Các bài toán đòi hỏi tư duy sáng tạo, suy luận nhiều bước và không theo lối mòn.\n- Câu hỏi phải thực sự thử thách và độc đáo.`;
            }
            break;
    }
    return instructions;
}

const getFallbackQuestions = (): Question[] => {
    const fallbackQuestions: Question[] = [
      { question: '2 + 2 = ?', type: 'multiple_choice', options: ['3', '4', '5', '6'], answer: '4', explanation: 'Vì khi con có 2 cái kẹo, thêm 2 cái nữa thì con sẽ có tất cả 4 cái kẹo.' },
      { question: '5 - 1 = 4. Đúng hay sai?', type: 'true_false', options: ['Đúng', 'Sai'], answer: 'Đúng', explanation: 'Chính xác! 5 bớt đi 1 còn 4 đó con.' },
      { question: '3 x 3 = ?', type: 'multiple_choice', options: ['6', '7', '8', '9'], answer: '9', explanation: '3 được lấy 3 lần. 3 cộng 3 bằng 6, cộng thêm 3 nữa là 9.' },
      { question: '10 - ___ = 7', type: 'fill_in_the_blank', options: [], answer: '3', explanation: 'Vì 10 trừ đi 3 sẽ bằng 7.' },
      { question: '10 + 0 = ?', type: 'multiple_choice', options: ['0', '1', '10', '100'], answer: '10', explanation: 'Bất kỳ số nào cộng với 0 cũng bằng chính nó.' },
      { question: 'Hình vuông có mấy cạnh?', type: 'multiple_choice', options: ['2', '3', '4', '5'], answer: '4', explanation: 'Hình vuông là hình có 4 cạnh bằng nhau đó con.' },
      { question: 'Trong các số 2, 8, 5, 1, số nào lớn nhất?', type: 'multiple_choice', options: ['2', '8', '5', '1'], answer: '8', explanation: 'Số 8 là số lớn nhất trong dãy số này.' },
      { question: 'An có 3 quả bóng, Bình cho An thêm 2 quả nữa. Hỏi An có tất cả bao nhiêu quả bóng?', type: 'multiple_choice', options: ['3 quả', '4 quả', '5 quả', '6 quả'], answer: '5 quả', explanation: 'Để tìm tổng số bóng, con làm phép cộng 3 + 2 = 5 nhé.' },
      { question: '2 x 4 = 8. Đúng hay sai?', type: 'true_false', options: ['Đúng', 'Sai'], answer: 'Đúng', explanation: 'Chính xác, 2 nhân 4 bằng 8.' },
      { question: 'Số liền sau của số 99 là số nào?', type: 'fill_in_the_blank', options: [], answer: '100', explanation: 'Số liền sau của một số là số lớn hơn nó 1 đơn vị, nên sau 99 là 100.' },
    ];
    return fallbackQuestions.sort(() => Math.random() - 0.5); // Randomize fallback questions
};


export const generateMathQuestions = async (grade: number, level: number, topic: Topic, history: Question[], incorrectlyAnsweredQuestions: AnsweredQuestion[], count: number = 5): Promise<Question[]> => {
  try {
    const topicInstruction = getTopicPrompt(topic);
    const difficultyInstruction = getDifficultyInstructions(grade, level);
    
    let historyManagementInstruction = '';
    if (history.length > 0 || incorrectlyAnsweredQuestions.length > 0) {
        historyManagementInstruction += '\n**QUY TẮC VỀ TÍNH MỚI CỦA CÂU HỎI (RẤT QUAN TRỌNG):**';
    }
    if (history.length > 0) {
        historyManagementInstruction += `\n- **ƯU TIÊN SỐ 1:** Tạo ra các câu hỏi HOÀN TOÀN MỚI. NGHIÊM CẤM lặp lại các câu hỏi hoặc dạng toán tương tự từ danh sách lịch sử câu hỏi gần đây:\n${history.map(q => `- ${q.question}`).slice(-20).join('\n')}`;
    }
    if (incorrectlyAnsweredQuestions.length > 0) {
        historyManagementInstruction += `\n- **ƯU TIÊN SỐ 2 (chỉ khi cần):** Để giúp bé ôn tập, con có thể chọn và làm mới lại 1 hoặc 2 câu hỏi từ danh sách các câu bé đã trả lời sai. Hãy thay đổi số hoặc ngữ cảnh để câu hỏi có cảm giác mới mẻ. Danh sách câu sai:\n${incorrectlyAnsweredQuestions.map(item => `- Câu hỏi: "${item.question.question}", Đáp án: "${item.question.answer}"`).slice(-10).join('\n')}`;
    }

    const prompt = `Tạo ra ${count} câu hỏi toán tư duy vui nhộn cho một học sinh lớp ${grade} ở Việt Nam.

**YÊU CẦU BẮT BUỘC SỐ 1: CHỦ ĐỀ CÂU HỎI.**
Tất cả các câu hỏi phải thuộc chủ đề sau: **${topicInstruction}**.
Nghiêm cấm tạo câu hỏi không liên quan đến chủ đề này.

**CÁC YÊU CẦU KHÁC:**
- **QUAN TRỌNG VỀ CÚ PHÁP:** Khi tạo câu hỏi dạng "Điền số..." hoặc "Tìm x...", hãy sử dụng dấu bằng (=) hoặc các cấu trúc câu hoàn chỉnh thay vì dấu hai chấm (:) để giới thiệu biểu thức toán học. Ví dụ ĐÚNG: "Điền số thích hợp vào chỗ trống để 3/___ = 1/2." Ví dụ SAI: "Điền số thích hợp...: 3/___".
- **QUAN TRỌNG:** NGHIÊM CẤM tạo ra các câu hỏi yêu cầu người dùng phải tưởng tượng ra một hình ảnh, đồ vật, hoặc kịch bản không được mô tả trực tiếp. Ví dụ về câu hỏi CẦN TRÁNH: "Trong hình sau có bao nhiêu quả táo? (Hãy tưởng tượng có 7 quả táo)". Thay vào đó, mọi dữ kiện cần thiết để trả lời phải có trong văn bản của câu hỏi.
- Các câu hỏi nên phù hợp với chương trình học của lớp ${grade}.
- ${difficultyInstruction}
- Tạo ra một hỗn hợp các dạng câu hỏi: 'multiple_choice' (trắc nghiệm), 'fill_in_the_blank' (điền vào chỗ trống), và 'true_false' (đúng/sai).
- Đối với 'multiple_choice', cung cấp 4 lựa chọn và chỉ MỘT đáp án đúng.
- Đối với 'true_false', câu hỏi phải là một mệnh đề, phần options phải là ['Đúng', 'Sai'], và đáp án là 'Đúng' hoặc 'Sai'.
- Đối với 'fill_in_the_blank', câu hỏi phải có chỗ trống (ví dụ: ___) và đáp án là con số hoặc từ cần điền. Phần options là một mảng rỗng.
- Đáp án đúng PHẢI có trong danh sách các lựa chọn (đối với trắc nghiệm).
- Đối với MỖI câu hỏi, hãy cung cấp một 'explanation' (giải thích) ngắn gọn, dễ hiểu tại sao đáp án đó là đúng, như thể một gia sư đang nói với một đứa trẻ.
- Chỉ trả về một mảng JSON.${historyManagementInstruction}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.9,
      },
    });
    
    const jsonText = response.text.trim();
    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Generated content is not a valid array of questions.");
    }
    
    // Randomize options for multiple choice questions
    return questions.map((q: any) => {
        if (q.type === 'multiple_choice' && q.options) {
            return { ...q, options: q.options.sort(() => Math.random() - 0.5) };
        }
        return q;
    });

  } catch (error: any) {
    console.error("Error generating math questions:", error);
     // If quota is exceeded or another error occurs, use fallback questions
    // This ensures the core gameplay is never interrupted.
    console.log("Gemini API failed. Using fallback questions.");
    return getFallbackQuestions();
  }
};

export const generateCreativeQuestion = async (idea: string, grade: number): Promise<Question | null> => {
  try {
    const prompt = `Trở thành một người kể chuyện và gia sư toán học vui nhộn cho một học sinh lớp ${grade} ở Việt Nam.
Dựa trên ý tưởng sau của bé: "${idea}".

Hãy tạo ra MỘT bài toán có lời văn độc đáo và hấp dẫn.
Yêu cầu:
1.  Bài toán phải liên quan trực tiếp đến ý tưởng của bé.
2.  Độ khó phải phù hợp với học sinh lớp ${grade}.
3.  Bài toán phải ở dạng 'multiple_choice' (trắc nghiệm) với 4 lựa chọn.
4.  Cung cấp một đáp án đúng và một lời giải thích thật đơn giản, thân thiện.
5.  Chỉ trả về một đối tượng JSON duy nhất theo đúng cấu trúc, không có văn bản giới thiệu nào khác.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleQuestionSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const question = JSON.parse(jsonText);

    if (!question || typeof question !== 'object' || !question.question) {
        throw new Error("Generated content is not a valid question object.");
    }
    
    // Randomize options
    if (question.options) {
        question.options.sort(() => Math.random() - 0.5);
    }

    return question as Question;

  } catch (error: any) {
    console.error("Error generating creative question:", error);
    if (error.message?.toLowerCase().includes('quota')) {
        throw new Error(QUOTA_EXCEEDED_ERROR);
    }
    return null; // Return null for other errors
  }
};

export const generateParentalAnalysis = async (grade: number, incorrectAnswers: AnsweredQuestion[]): Promise<string> => {
    if (incorrectAnswers.length === 0) {
        return "Bé không làm sai câu nào cả. Thật tuyệt vời!";
    }
    try {
        const errorsList = incorrectAnswers.map(item => `- Câu hỏi: "${item.question.question}", Bé chọn: "${item.userAnswer}", Đáp án đúng: "${item.question.answer}"`).join('\n');
        
        const prompt = `Là một chuyên gia giáo dục tiểu học, hãy phân tích danh sách các câu hỏi toán mà một học sinh lớp ${grade} ở Việt Nam đã trả lời sai:\n${errorsList}\n\nDựa trên những lỗi này, hãy đưa ra một bản phân tích ngắn gọn (khoảng 3-4 câu) về các điểm yếu của học sinh và gợi ý một số dạng bài tập mà phụ huynh có thể cho con luyện tập thêm. Hãy viết với giọng văn tích cực, mang tính xây dựng và hỗ trợ.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error: any) {
        console.error("Error generating parental analysis:", error);
        if (error.message?.toLowerCase().includes('quota')) {
            throw new Error(QUOTA_EXCEEDED_ERROR);
        }
        return "Có lỗi xảy ra khi tạo phân tích. Vui lòng thử lại sau.";
    }
};

export const generateHint = async (question: string, grade: number): Promise<string> => {
    try {
        const prompt = `Đây là một câu hỏi toán dành cho học sinh lớp ${grade} ở Việt Nam: "${question}".
        Hãy đưa ra một gợi ý đơn giản, từng bước một để giúp bé giải bài toán này.
        Quan trọng:
        - KHÔNG được tiết lộ đáp án cuối cùng.
        - Giữ cho gợi ý thật ngắn gọn và dễ hiểu.
        - Tập trung vào phương pháp giải hoặc bước đầu tiên cần làm.
        Ví dụ, nếu câu hỏi là 'Lan có 5 quả táo, mẹ cho Lan thêm 3 quả nữa. Hỏi Lan có tất cả bao nhiêu quả táo?', một gợi ý tốt sẽ là 'Để tìm tổng số táo, con hãy thử làm phép tính cộng nhé.'`

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });

        return response.text;
    } catch (error: any) {
        console.error("Error generating hint:", error);
        if (error.message?.toLowerCase().includes('quota')) {
            throw new Error(QUOTA_EXCEEDED_ERROR);
        }
        return "Gợi ý không có sẵn lúc này. Con hãy thử tự suy nghĩ nhé!";
    }
};


export const generateLightningRoundQuestions = async (grade: number, level: number): Promise<Question[]> => {
    try {
        const difficultyInstruction = getDifficultyInstructions(grade, level);
        const prompt = `Tạo ra 5 câu hỏi toán tư duy CỰC DỄ và có thể trả lời NHANH cho một học sinh lớp ${grade} ở Việt Nam cho một vòng chơi tốc độ.
        
        YÊU CẦU:
        - **QUAN TRỌNG:** NGHIÊM CẤM tạo ra các câu hỏi yêu cầu người dùng phải tưởng tượng ra một hình ảnh. Mọi dữ kiện cần thiết để trả lời phải có trong văn bản của câu hỏi. Ví dụ về câu hỏi CẦN TRÁNH: "Trong hình sau có bao nhiêu quả táo? (Hãy tưởng tượng có 7 quả táo)".
        - Độ khó: ${difficultyInstruction}. Ưu tiên các phép tính nhẩm, câu hỏi một bước.
        - Tất cả câu hỏi phải là dạng 'multiple_choice' hoặc 'true_false' để có thể trả lời nhanh.
        - Cung cấp 4 lựa chọn cho 'multiple_choice'.
        - Cung cấp giải thích đơn giản cho mỗi câu.
        - Chỉ trả về một mảng JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Generated content is not a valid array of questions.");
        }
        return questions.map((q: any) => ({ ...q, options: q.options?.sort(() => Math.random() - 0.5) }));

    } catch (error: any) {
        console.error("Error generating lightning round questions:", error);
        console.log("Using fallback questions for Lightning Round.");
        return getFallbackQuestions().slice(0, 5);
    }
};

export const generateRiddleQuestion = async (grade: number): Promise<Question | null> => {
  try {
    const prompt = `Tạo ra MỘT câu đố logic hoặc toán mẹo vui, phù hợp cho học sinh lớp ${grade} ở Việt Nam.
    YÊU CẦU:
    1. Câu đố nên thông minh, hài hước và đòi hỏi suy luận một chút, không chỉ là tính toán đơn thuần.
    2. Độ khó phải phù hợp với lứa tuổi.
    3. **QUAN TRỌNG:** Câu đố không được yêu cầu người dùng tưởng tượng ra hình ảnh. Mọi dữ kiện cần thiết phải được nêu rõ bằng chữ.
    4. Câu đố phải ở dạng 'multiple_choice' với 4 lựa chọn. Một trong các lựa chọn phải là đáp án đúng, các lựa chọn còn lại phải hợp lý nhưng sai.
    5. Cung cấp một lời giải thích thật đơn giản, thân thiện, giải thích tại sao đáp án lại đúng.
    6. Chỉ trả về một đối tượng JSON duy nhất.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleQuestionSchema,
        temperature: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const question = JSON.parse(jsonText);

    if (!question || typeof question !== 'object' || !question.question) {
        throw new Error("Generated content is not a valid question object.");
    }
    
    if (question.options) {
        question.options.sort(() => Math.random() - 0.5);
    }
    return question as Question;

  } catch (error: any) {
    console.error("Error generating riddle question:", error);
    if (error.message?.toLowerCase().includes('quota')) {
        throw new Error(QUOTA_EXCEEDED_ERROR);
    }
    return null;
  }
};

export const generateTutorExplanation = async (questionData: AnsweredQuestion, grade: number): Promise<string> => {
    try {
        const { question, userAnswer } = questionData;
        const prompt = `Bạn là một gia sư toán tiểu học thân thiện và kiên nhẫn tên là Tí Nị. Một học sinh lớp ${grade} đã trả lời sai một câu hỏi. Hãy giải thích lại vấn đề một cách chi tiết, từng bước một, như thể bạn đang trò chuyện trực tiếp với bé.
        
        **Yêu cầu:**
        1.  **Bắt đầu bằng việc động viên:** An ủi bé rằng sai lầm là một phần của việc học. Ví dụ: "Không sao đâu con ơi, sai câu này không có nghĩa là con không giỏi toán đâu!".
        2.  **Phân tích câu hỏi:** Giải thích câu hỏi đang muốn hỏi điều gì một cách đơn giản.
        3.  **Phân tích lỗi sai:** Nhẹ nhàng chỉ ra tại sao câu trả lời của bé (${userAnswer}) lại chưa đúng. Cố gắng đoán xem bé có thể đã suy nghĩ sai ở bước nào.
        4.  **Hướng dẫn cách làm đúng:** Trình bày lại cách giải đúng một cách cặn kẽ, từng bước.
        5.  **Kết luận:** Kết thúc bằng một lời khích lệ.

        **Thông tin bài toán:**
        - **Câu hỏi:** "${question.question}"
        - **Bé đã chọn:** "${userAnswer}"
        - **Đáp án đúng là:** "${question.answer}"

        Hãy viết lời giải thích thật thân thiện và dễ hiểu nhé!`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });
        
        return response.text;

    } catch (error: any) {
        console.error("Error generating tutor explanation:", error);
        if (error.message?.toLowerCase().includes('quota')) {
            throw new Error(QUOTA_EXCEEDED_ERROR);
        }
        return "Thầy Hùng đang bận một chút, con hãy xem lại lời giải thích ngắn gọn và thử lại sau nhé!";
    }
};