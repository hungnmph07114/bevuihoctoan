export const speak = (text: string, lang: string = 'vi-VN') => {
  if (!('speechSynthesis' in window)) {
    console.warn("Trình duyệt của bạn không hỗ trợ Text-to-Speech.");
    return;
  }

  // Cancel any ongoing speech to prevent overlap
  window.speechSynthesis.cancel();

  // Preprocess text to make it more TTS-friendly for math symbols in Vietnamese.
  // This replaces symbols with their spoken word equivalents.
  // The placeholder is handled first to avoid whitespace issues.
  const processedText = text
    .replace(/\s*___\s*/g, ' mấy ') // Handle placeholder with surrounding spaces
    .replace(/\s*\+\s*/g, ' cộng ')
    .replace(/\s*-\s*/g, ' trừ ')
    .replace(/\s*x\s*/gi, ' nhân ')
    .replace(/\s*\*\s*/g, ' nhân ')
    .replace(/\s*:\s*/g, ' chia ')
    .replace(/\s*\/\s*/g, ' chia ')
    .replace(/\s*÷\s*/g, ' chia ')
    .replace(/\s*=\s*/g, ' bằng ')
    .replace(/\s*>\s*/g, ' lớn hơn ')
    .replace(/\s*<\s*/g, ' nhỏ hơn ');

  const utterance = new SpeechSynthesisUtterance(processedText.trim());
  utterance.lang = lang;
  utterance.rate = 0.8; // Slowed down from 0.9 for better clarity for children.

  window.speechSynthesis.speak(utterance);
};
