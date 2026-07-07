"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User as UserIcon, Clock, PlayCircle, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Career Mentor. I can help you with resume tips, interview prep, or career roadmaps. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Mock interview UI state
  const [isMockMode, setIsMockMode] = useState(false);
  const [mockAnswer, setMockAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isListening, setIsListening] = useState(false);
  const [isSubmittingMock, setIsSubmittingMock] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Refs — these are always current inside timer/callbacks
  const mockAnswerRef = useRef("");
  const mockQuestionRef = useRef("");
  const isSubmittingRef = useRef(false);
  const isMockModeRef = useRef(false);
  const timeLeftRef = useRef(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isMockMode]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  // Submit — reads from refs, never stale
  const submitMockInterview = useCallback(async () => {
    if (isSubmittingRef.current || !mockQuestionRef.current) return;
    isSubmittingRef.current = true;
    isMockModeRef.current = false;

    stopVoice();
    if (timerRef.current) clearInterval(timerRef.current);

    const finalAnswer = mockAnswerRef.current.trim();
    const question = mockQuestionRef.current;

    setIsSubmittingMock(true);
    setIsMockMode(false);
    setMessages(prev => [...prev, {
      role: "user",
      content: finalAnswer || "(Time expired, no answer provided)"
    }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/mentor/mock-interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, answer: finalAnswer || "No answer provided." })
      });
      if (res.ok) {
        try {
          const data = await res.json();
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `📊 Evaluation Complete!\n\nScore: ${data.score}/100\nFeedback: ${data.feedback}`
          }]);
        } catch (e) {
          setMessages(prev => [...prev, { role: "assistant", content: "Failed to evaluate (Server offline). Please try again." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Failed to evaluate. Please try again." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to evaluate. Please try again." }]);
    } finally {
      setIsTyping(false);
      setIsSubmittingMock(false);
      isSubmittingRef.current = false;
    }
  }, [stopVoice]);

  const startTimer = useCallback(() => {
    timeLeftRef.current = 60;
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current!);
        submitMockInterview();
      }
    }, 1000);
  }, [submitMockInterview]);

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopVoice();
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      mockAnswerRef.current = transcript;
      setMockAnswer(transcript);
    };
    recognition.onerror = (e: any) => {
      console.error("Speech error", e.error);
      setIsListening(false);
    };
    recognition.onend = (e: any) => {
      // Auto-restart if still in mock mode (browser cuts off after ~60s)
      if (isMockModeRef.current && !isSubmittingRef.current) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [stopVoice]);

  const startMockInterview = async () => {
    mockAnswerRef.current = "";
    mockQuestionRef.current = "";
    isSubmittingRef.current = false;
    isMockModeRef.current = true;
    setMockAnswer("");
    setIsMockMode(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/mentor/mock-interview/start", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        mockQuestionRef.current = data.question;
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `⏱️ 60-Second Mock Interview Started!\n\nQuestion: ${data.question}`
        }]);
        startTimer();
        // Auto-start voice if supported
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
          startVoice();
        }
      } else {
        isMockModeRef.current = false;
        setIsMockMode(false);
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, couldn't start the mock interview." }]);
      }
    } catch (err) {
      console.error(err);
      isMockModeRef.current = false;
      setIsMockMode(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isMockMode) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="bg-terracotta/10 px-6 py-4 flex items-center justify-between border-b border-terracotta/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-[#E9B44C] flex items-center justify-center text-white shadow-inner">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg dark:text-cream-white leading-tight">AI Career Mentor</h2>
            <p className="text-sm text-terracotta font-medium">Always here to help</p>
          </div>
        </div>
        {!isMockMode && (
          <button
            onClick={startMockInterview}
            className="flex items-center gap-2 bg-gradient-to-r from-terracotta to-[#E9B44C] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-terracotta/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlayCircle size={16} />
            60s Mock Interview
          </button>
        )}
      </div>

      {/* Timer Bar */}
      <AnimatePresence>
        {isMockMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-dark-slate dark:bg-cream-white text-cream-white dark:text-dark-slate border-b border-dark-slate/10 px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Clock size={16} className={timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-terracotta"} />
              <span className={timeLeft <= 10 ? "text-red-500" : ""}>{timeLeft}s remaining</span>
            </div>
            <div className="flex-1 max-w-xs mx-4 h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? "bg-red-500" : "bg-terracotta"}`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>
            <button
              onClick={submitMockInterview}
              className="text-xs font-bold bg-white/10 dark:bg-black/10 px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors"
            >
              Submit Early
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-cream-white/30 dark:bg-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${msg.role === "user" ? "bg-gradient-to-br from-dark-slate to-gray-700 dark:from-cream-white dark:to-gray-200 text-white dark:text-dark-slate" : "bg-gradient-to-br from-terracotta to-[#E9B44C] text-white"}`}>
              {msg.role === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[75%] px-5 py-4 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-dark-slate text-white dark:bg-cream-white dark:text-dark-slate rounded-tr-sm" : "bg-white dark:bg-dark-slate/80 border border-dark-slate/10 dark:border-white/10 text-dark-slate dark:text-cream-white rounded-tl-sm leading-relaxed whitespace-pre-wrap"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-[#E9B44C] text-white flex items-center justify-center shrink-0">
              <Bot size={20} />
            </div>
            <div className="bg-white dark:bg-dark-slate/80 border border-dark-slate/10 dark:border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm flex gap-2 items-center">
              <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-dark-slate border-t border-dark-slate/10 dark:border-white/10">
        {isMockMode ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={mockAnswer}
                onChange={(e) => { setMockAnswer(e.target.value); mockAnswerRef.current = e.target.value; }}
                placeholder={isListening ? "🎤 Listening... speak your answer" : "Speak or type your answer here..."}
                className={`w-full h-28 bg-black/5 dark:bg-white/5 border rounded-xl p-4 pr-14 focus:outline-none transition-colors text-dark-slate dark:text-cream-white resize-none custom-scrollbar ${isListening ? "border-red-500 focus:border-red-500" : "border-dark-slate/10 dark:border-white/10 focus:border-terracotta"}`}
                disabled={isSubmittingMock}
                autoFocus
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                  className={`absolute right-3 top-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse" : "bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white"}`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-dark-slate/50 dark:text-cream-white/50 flex items-center gap-2">
                {isListening
                  ? <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" /> Listening — speak now</>
                  : `${mockAnswer.split(/\s+/).filter(w => w.length > 0).length} words typed`
                }
              </span>
              <button
                onClick={submitMockInterview}
                disabled={isSubmittingMock}
                className="bg-terracotta text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-terracotta/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingMock ? "Evaluating..." : "Submit Answer"} <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about resumes, interviews, or career advice..."
              className="w-full bg-black/5 dark:bg-white/5 border border-dark-slate/10 dark:border-white/10 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:border-terracotta transition-colors text-dark-slate dark:text-cream-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-terracotta text-white rounded-full flex items-center justify-center hover:bg-terracotta/90 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
