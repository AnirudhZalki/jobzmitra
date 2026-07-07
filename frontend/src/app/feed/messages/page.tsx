"use client";
import { useEffect, useState, useRef } from "react";
import { Send, Users, Search, X, MessageSquarePlus, BellRing, Paperclip, Loader2, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  id: number;
  full_name: string;
  avatar_url?: string;
  role: string;
};

type Conversation = {
  user: User;
  last_message: string;
  unread_count: number;
  updated_at: string;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  
  // File Attachment States
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  // Real-time toast notifications
  const [inAppNotification, setInAppNotification] = useState<{title: string, body: string} | null>(null);

  // Networking Directory State
  const [showDirectory, setShowDirectory] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [myConnections, setMyConnections] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<User | null>(null);
  activeChatRef.current = activeChat;

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (id) {
      setCurrentUserId(parseInt(id));
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          ).join("")));
          const userId = payload.sub && !isNaN(Number(payload.sub)) ? parseInt(payload.sub) : 0;
          if (userId) {
            setCurrentUserId(userId);
            localStorage.setItem("user_id", userId.toString());
          }
        } catch (e) {
          console.error("Token decode error", e);
        }
      }
    }
    fetchConversations();
    fetchMyConnections();
    
    // Poll for new messages/conversations every 5 seconds
    const interval = setInterval(() => {
      pollUpdates();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const pollUpdates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        
        // Check if there are new unread messages to trigger notification
        setConversations(prev => {
          data.forEach(newConvo => {
            const oldConvo = prev.find(c => c.user.id === newConvo.user.id);
            if (oldConvo && newConvo.unread_count > oldConvo.unread_count && activeChatRef.current?.id !== newConvo.user.id) {
              setInAppNotification({
                title: newConvo.user.full_name,
                body: newConvo.last_message
              });
              setTimeout(() => setInAppNotification(null), 4000);
            }
          });
          return data;
        });

        // Also refresh active chat if exists
        if (activeChatRef.current) {
          const chatRes = await fetch(`/api/messages/${activeChatRef.current.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            setMessages(chatData);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/connections/my-connections", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyConnections(data.map((u: User) => u.id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (user: User) => {
    setActiveChat(user);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/messages/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Clear unread count locally
        setConversations(prev => prev.map(c => 
          c.user.id === user.id ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadDirectory = async () => {
    setShowDirectory(true);
    setActiveChat(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnect = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/connections/${user.id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyConnections([...myConnections, user.id]);
        startNewChat(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startNewChat = (user: User) => {
    setShowDirectory(false);
    loadChat(user);
    if (!conversations.find(c => c.user.id === user.id)) {
      setConversations([{
        user,
        last_message: "Start of conversation",
        unread_count: 0,
        updated_at: new Date().toISOString()
      }, ...conversations]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeChat) return;

    let finalAttachmentUrl = undefined;

    if (attachment) {
      setUploadingAttachment(true);
      const formData = new FormData();
      formData.append("file", attachment);
      try {
        const token = localStorage.getItem("token");
        const uploadRes = await fetch("http://localhost:8000/api/upload/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          finalAttachmentUrl = data.url.startsWith('http://') ? new URL(data.url).pathname : data.url;
        }
      } catch (err) {
        console.error("Upload error", err);
      }
      setUploadingAttachment(false);
      setAttachment(null);
      setAttachmentPreview(null);
    }

    // Optimistic UI
    const tempMsg = {
      id: Date.now(),
      sender_id: currentUserId,
      receiver_id: activeChat.id,
      content: newMessage,
      attachment_url: finalAttachmentUrl,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    const inputContent = newMessage;
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/messages/${activeChat.id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: inputContent, attachment_url: finalAttachmentUrl })
      });
      
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? msg : m));
        
        // Update conversation list locally
        setConversations(prev => prev.map(c => 
          c.user.id === activeChat.id ? { ...c, last_message: msg.content, updated_at: msg.created_at } : c
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex border border-dark-slate/10 dark:border-white/10 md:rounded-2xl overflow-hidden bg-white dark:bg-dark-slate/50 relative shadow-xl">
      
      <AnimatePresence>
        {inAppNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 10, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-2 left-1/2 z-50 bg-dark-slate dark:bg-cream-white text-cream-white dark:text-dark-slate px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer"
            onClick={() => {
              const user = conversations.find(c => c.user.full_name === inAppNotification.title)?.user;
              if (user) loadChat(user);
              setInAppNotification(null);
            }}
          >
            <div className="bg-terracotta p-1.5 rounded-full text-white">
              <BellRing size={16} />
            </div>
            <div>
              <p className="font-bold text-sm">{inAppNotification.title}</p>
              <p className="text-xs opacity-80 max-w-[200px] truncate">{inAppNotification.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Panel: Conversations List */}
      <div className={`w-full md:w-[240px] lg:w-[280px] border-r border-dark-slate/10 dark:border-white/10 flex flex-col shrink-0 ${(activeChat || showDirectory) ? 'hidden md:flex' : 'flex'} bg-cream-white/30 dark:bg-dark-slate/30`}>
        <div className="p-4 border-b border-dark-slate/10 dark:border-white/10 flex justify-between items-center bg-white dark:bg-dark-slate/50 shadow-sm z-10">
          <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white tracking-tight">Messages</h2>
          <button onClick={loadDirectory} className="p-2 rounded-full bg-terracotta text-white hover:bg-terracotta/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-terracotta/20" title="Find Connections">
            <MessageSquarePlus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-dark-slate/50 dark:text-cream-white/50 flex flex-col items-center gap-2">
              <MessageSquarePlus size={24} className="opacity-40" />
              <p className="text-xs font-medium">No conversations yet.<br/>Click + to chat!</p>
            </div>
          ) : (
            conversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((convo) => (
              <button 
                key={convo.user.id}
                onClick={() => loadChat(convo.user)}
                className={`w-full text-left p-3 mb-1 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
                  activeChat?.id === convo.user.id 
                    ? 'bg-terracotta/10 dark:bg-terracotta/20 shadow-sm' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    {convo.user.full_name.charAt(0)}
                  </div>
                  {convo.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-cream-white dark:border-dark-slate animate-bounce">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`font-bold truncate ${activeChat?.id === convo.user.id ? 'text-terracotta' : 'text-dark-slate dark:text-cream-white'}`}>
                      {convo.user.full_name}
                    </h4>
                    <span className="text-[10px] text-dark-slate/40 dark:text-cream-white/40 font-medium">
                      {new Date(convo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${convo.unread_count > 0 ? 'text-dark-slate dark:text-white font-bold' : 'text-dark-slate/60 dark:text-cream-white/60'}`}>
                    {convo.last_message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Active Chat or Directory */}
      <div className={`w-full md:flex-1 flex flex-col ${(!activeChat && !showDirectory) ? 'hidden md:flex' : 'flex'} bg-white dark:bg-dark-slate/40`}>
        {showDirectory ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-5 border-b border-dark-slate/10 dark:border-white/10 flex items-center gap-4 bg-white dark:bg-dark-slate/50">
              <button className="md:hidden text-dark-slate/60 p-2 hover:bg-black/5 rounded-full" onClick={() => setShowDirectory(false)}>
                &larr;
              </button>
              <h3 className="font-headings font-bold text-xl dark:text-cream-white flex-1">Find Connections</h3>
              <button className="text-dark-slate/40 hover:text-dark-slate dark:text-white/40 dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" onClick={() => setShowDirectory(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-5 border-b border-dark-slate/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-slate/40 dark:text-white/40" size={18} />
                <input 
                  type="text" 
                  placeholder="Search professionals, recruiters..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-dark-slate rounded-full pl-12 pr-4 py-3 text-sm outline-none border border-dark-slate/10 dark:border-white/10 focus:border-terracotta dark:focus:border-terracotta dark:text-white shadow-sm transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
                {allUsers.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== currentUserId).map(u => (
                  <div key={u.id} className="border border-dark-slate/10 dark:border-white/10 bg-white dark:bg-dark-slate/50 p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold shrink-0">
                      {u.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark-slate dark:text-cream-white truncate text-base">{u.full_name}</h4>
                      <p className="text-[11px] text-dark-slate/60 dark:text-white/60 truncate uppercase tracking-wider font-semibold">{u.role}</p>
                    </div>
                    {myConnections.includes(u.id) ? (
                      <button onClick={() => startNewChat(u)} className="px-3 py-1.5 bg-terracotta text-white hover:bg-terracotta/90 text-[11px] sm:text-xs font-bold rounded-full transition-colors shadow-sm shadow-terracotta/20 shrink-0">
                        Message
                      </button>
                    ) : (
                      <button onClick={() => handleConnect(u)} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-terracotta hover:text-white dark:hover:bg-terracotta text-[11px] sm:text-xs font-bold rounded-full transition-colors shrink-0">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-slate/40 dark:text-cream-white/40 p-8 text-center bg-cream-white/30 dark:bg-dark-slate/30">
            <div className="w-24 h-24 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mb-6">
              <Users size={40} />
            </div>
            <h3 className="font-headings text-2xl font-bold mb-2 text-dark-slate dark:text-cream-white">Your Messages</h3>
            <p className="max-w-md text-sm leading-relaxed">Select a conversation from the left or click the <MessageSquarePlus className="inline mx-1 text-terracotta" size={16}/> icon to find new connections and start chatting.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white dark:bg-dark-slate/50">
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-slate/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-dark-slate/80 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button className="md:hidden text-dark-slate/60 p-2 hover:bg-black/5 rounded-full mr-1" onClick={() => setActiveChat(null)}>
                  &larr;
                </button>
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold shadow-inner">
                  {activeChat.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-dark-slate dark:text-cream-white leading-tight">{activeChat.full_name}</h3>
                  <p className="text-[11px] text-dark-slate/50 dark:text-cream-white/50 font-semibold uppercase tracking-wider">{activeChat.role}</p>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-cream-white/50 dark:bg-dark-slate/30 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-sm text-dark-slate/50 dark:text-white/50 space-y-3">
                  <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center">
                    <Send size={24} className="ml-1" />
                  </div>
                  <p>Start a conversation with {activeChat.full_name}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.sender_id === currentUserId;
                  const showTime = idx === 0 || new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 300000;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {showTime && (
                        <span className="text-[10px] text-dark-slate/40 dark:text-white/40 mb-2 mt-2 font-medium">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <div className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${
                        isMine 
                          ? 'bg-terracotta text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white dark:bg-dark-slate/80 border border-dark-slate/5 dark:border-white/5 text-dark-slate dark:text-cream-white rounded-2xl rounded-tl-sm'
                      }`}>
                        {msg.attachment_url && (
                          <div className="mb-2">
                            {msg.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                              <img src={msg.attachment_url} alt="Attachment" className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.attachment_url, '_blank')} />
                            ) : (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors break-all">
                                <FileIcon size={16} className="shrink-0" />
                                <span className="underline">View Attachment</span>
                              </a>
                            )}
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-dark-slate/80 border-t border-dark-slate/10 dark:border-white/10 z-10 relative">
              {attachmentPreview && (
                <div className="absolute bottom-full left-0 p-4 w-full bg-white dark:bg-dark-slate/95 border-t border-dark-slate/10 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-dark-slate/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                      {attachment?.type.startsWith('image/') ? (
                        <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon size={24} className="text-terracotta" />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-dark-slate dark:text-white truncate max-w-[200px]">{attachment?.name}</p>
                      <p className="text-xs text-dark-slate/60 dark:text-white/60">{(attachment?.size || 0) / 1024 < 1024 ? `${((attachment?.size || 0) / 1024).toFixed(1)} KB` : `${((attachment?.size || 0) / 1024 / 1024).toFixed(1)} MB`}</p>
                    </div>
                  </div>
                  <button onClick={() => { setAttachment(null); setAttachmentPreview(null); }} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={16} className="text-dark-slate dark:text-white" />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("chat-file-upload")?.click()}
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-dark-slate/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-terracotta transition-colors mb-1"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" 
                  id="chat-file-upload" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachment(file);
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => setAttachmentPreview(e.target?.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setAttachmentPreview('file');
                      }
                    }
                  }} 
                />
                <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-3xl px-4 py-2 border border-transparent focus-within:border-terracotta/50 focus-within:bg-white dark:focus-within:bg-dark-slate transition-all shadow-inner">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder="Message..."
                    className="w-full bg-transparent text-sm outline-none text-dark-slate dark:text-white resize-none max-h-32 pt-2 custom-scrollbar"
                    rows={1}
                    style={{ minHeight: "24px" }}
                  />
                </div>
                  <button
                  type="submit"
                  disabled={(!newMessage.trim() && !attachment) || uploadingAttachment}
                  className="w-12 h-12 shrink-0 rounded-full bg-terracotta text-white flex items-center justify-center disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-md shadow-terracotta/30 mb-1"
                >
                  {uploadingAttachment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5" />}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
