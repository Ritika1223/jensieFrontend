import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import ReactMarkdown from "react-markdown";
import SideNavigation from "../doctors-listing/SideNavigation";
import { useTheme } from "../../contexts/ThemeContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { CHAT_API_URL } from "../../config/api";
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router";

const ChatScreen = () => {
  let params = useParams();
  const location = useLocation();

  const { isDarkMode } = useTheme();
  const { isCollapsed, isMobile } = useSidebar();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [showInitialState, setShowInitialState] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Theme colors extracted from Figma - Memoized for performance
  const theme = useMemo(
    () => ({
      dark: {
        background: "#000000",
        sidebarBg: "#111111",
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255, 255, 255, 0.6)",
        textTertiary: "rgba(255, 255, 255, 0.3)",
        borderPrimary: "rgba(255, 255, 255, 0.1)",
        borderSecondary: "rgba(76, 158, 255, 0.3)",
        buttonBg: "rgba(255, 255, 255, 0.06)",
        buttonBgSecondary: "rgba(255, 255, 255, 0.08)",
        buttonBorder: "rgba(255, 255, 255, 0.15)",
        gradientFrom: "#796bff",
        gradientTo: "#4c9eff",
        shadow: "rgba(121, 107, 255, 0.6)",
        shadowGlow: "rgba(39, 82, 255, 0.8)",
      },
      light: {
        background: "#FFFFFF",
        sidebarBg: "#F8F8F8",
        textPrimary: "#000000",
        textSecondary: "rgba(0, 0, 0, 0.6)",
        textTertiary: "rgba(0, 0, 0, 0.3)",
        borderPrimary: "rgba(0, 0, 0, 0.1)",
        borderSecondary: "rgba(76, 158, 255, 0.3)",
        buttonBg: "rgba(0, 0, 0, 0.06)",
        buttonBgSecondary: "rgba(0, 0, 0, 0.04)",
        buttonBorder: "rgba(0, 0, 0, 0.04)",
        gradientFrom: "#796bff",
        gradientTo: "#4c9eff",
        shadow: "rgba(121, 107, 255, 0.6)",
        shadowGlow: "rgba(39, 82, 255, 0.8)",
      },
    }),
    []
  );

  const currentTheme = useMemo(
    () => (isDarkMode ? theme.dark : theme.light),
    [isDarkMode, theme]
  );

  // Scroll to bottom when new messages arrive - Optimized for performance
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // Changed to 'auto' for faster scrolling
      });
    }
  }, []);

  async function loadMessags(thread_id) {
    // Check if this is a private conversation
    if (location.pathname.split("/")[1] === "private") {
      // Load messages from localStorage
      const storedMessages = localStorage.getItem(thread_id);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          const newMessages = parsedMessages.map((msg) => ({
            id: Date.now() + Math.random(),
            text: msg.message,
            sender: msg.role === "assistant" ? "ai" : "user",
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(newMessages);
          
          // Count user messages for private mode
          const userMessages = parsedMessages.filter(msg => msg.role === "user");
          setUserMessageCount(userMessages.length);
          
          // Delete the messages from localStorage after loading
          localStorage.removeItem(thread_id);
        } catch (error) {
          console.error("Error parsing messages from localStorage:", error);
          setMessages([]);
          setUserMessageCount(0);
        }
      } else {
        // No messages found in localStorage
        setMessages([]);
        setUserMessageCount(0);
      }
      return;
    }

    // Original API logic for non-private conversations
    const messageListResponse = await fetch(
      `${CHAT_API_URL}/threads/${thread_id}/messages`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const messageList = await messageListResponse.json();
    if (!messageListResponse.ok || !messageList?.messages) {
      throw new Error(messageList?.error || "Failed to create thread");
    }
    const newMessages = messageList.messages.map((msg) => ({
      id: Date.now() + Math.random(),
      text: msg.message,
      sender: msg.role === "assistant" ? "ai" : "user",
      timestamp: new Date(msg.timestamp),
    }));
    setMessages(newMessages);
    
    // Count user messages for normal mode
    const userMessages = messageList.messages.filter(msg => msg.role === "user");
    setUserMessageCount(userMessages.length);
  }

  // Function to fetch thread details and set language
  async function fetchThreadDetails(thread_id) {
    // Check if this is a private conversation
    if (location.pathname.split("/")[1] === "private") {
      // Load language from localStorage
      const storedLanguage = localStorage.getItem(`${thread_id}_language`);
      if (storedLanguage) {
        try {
          // Set language based on stored value (en -> EN, hnd -> HND)
          if (storedLanguage === "en") {
            setSelectedLanguage("EN");
          } else if (storedLanguage === "hnd") {
            setSelectedLanguage("HND");
          }
        } catch (error) {
          console.error("Error reading language from localStorage:", error);
        }
      }
      return;
    }

    // Original API logic for non-private conversations
    try {
      const threadResponse = await fetch(`${CHAT_API_URL}/threads/${thread_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        // Set language based on API response (en -> EN, hnd -> HND)
        if (threadData.language === "en") {
          setSelectedLanguage("EN");
        } else if (threadData.language === "hnd") {
          setSelectedLanguage("HND");
        }
      } else {
        console.error("Failed to fetch thread details");
      }
    } catch (error) {
      console.error("Error fetching thread details:", error);
    }
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    setIsAttachmentMenuOpen(false);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  // Handle file removal
  const handleFileRemove = (indexToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    setIsLoadingMessages(true);
    setThreadId(params.thread_id);
    setUserMessageCount(0); // Reset user message count when thread changes
    console.log(params.thread_id);
    
    // Fetch thread details to get language
    fetchThreadDetails(params.thread_id);
    
    // Load messages
    loadMessags(params.thread_id);
  }, [params.thread_id]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setIsAttachmentMenuOpen(false);
      }
    };

    if (isAttachmentMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading || userMessageCount >= 50) return;

    const languageCode = selectedLanguage === "HND" ? "hnd" : "en";

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserMessageCount(prev => {
      const newCount = prev + 1;
      console.log(`User message count updated: ${newCount}/50`);
      return newCount;
    }); // Increment user message count
    setInputValue("");
    setShowInitialState(false);
    setIsLoading(true);

    try {
      let activeThreadId = threadId;

      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          message: userMessage.text,
          thread_id: activeThreadId,
          mode: location.pathname.split("/")[1] === "private" ? "private" : "normal",
          language: languageCode,
        })
      );

      // Add files to FormData if any are selected
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          formData.append("files", file);
        });
      }

      const chatResponse = await fetch(`${CHAT_API_URL}/chat`, {
        method: "POST",
        body: formData, // ⬅️ multipart/form-data
      });

      // Clear selected files after sending
      setSelectedFiles([]);

      if (!chatResponse.ok || !chatResponse.body) {
        const errorText = await chatResponse.text();
        throw new Error(errorText || "Failed to get response");
      }

      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");

      const aiMessageId = Date.now() + 1;
      let aiText = "";
      let aiMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        aiText += chunk;

        if (!aiMessageAdded) {
          aiMessageAdded = true;
          setMessages((prev) => [
            ...prev,
            {
              id: aiMessageId,
              text: aiText,
              sender: "ai",
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: aiText } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action buttons
  const handleQuickAction = (action) => {
    let message = "";
    switch (action) {
      case "symptom":
        message = "I would like to evaluate my symptoms.";
        break;
      case "lab":
        message = "I want to upload and interpret my lab report.";
        break;
      case "doctor":
        message = "I would like to speak to a doctor.";
        break;
      default:
        return;
    }
    setInputValue(message);
    textareaRef.current?.focus();
  };

  // Handle key press (Enter to send, Shift+Enter for new line) - Memoized callback
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && userMessageCount < 50) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, userMessageCount]
  );

  // Handle file upload - Memoized callback
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log("File selected:", file);
      // You can add file upload API call here
    }
  }, []);

  // Handle start recording
  const handleStartRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get the mime type supported by the browser
      const options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback to default mime type if webm is not supported
        options.mimeType = "";
      }

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stopped event
      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Create blob from audio chunks
        if (audioChunksRef.current.length === 0) {
          console.error("No audio data collected");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        // Validate blob size
        if (audioBlob.size === 0) {
          console.error("Audio blob is empty");
          return;
        }

        // Send audio to STT API
        try {
          const formData = new FormData();
          formData.append("recording", audioBlob, "recording.webm");

          const response = await fetch(`${CHAT_API_URL}/stt`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log("STT response:", data);
            // Set the transcribed text as input value
            if (data.user_query) {
              setInputValue(data.user_query);
              // Focus the textarea after setting the value
              textareaRef.current?.focus();
            }
          } else {
            console.error("STT API error:", response.statusText);
          }
        } catch (error) {
          console.error("Error sending audio to STT:", error);
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to access microphone. Please check your permissions.");
      setIsRecording(false);
    }
  }, []);

  // Handle stop recording
  const handleStopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="w-full min-h-screen flex"
      style={{
        backgroundColor: "transparent",
        transition: "background-color 0.1s ease-out",
      }}
    >
      {/* Side Navigation */}
      <aside className="block shrink-0">
        <SideNavigation />
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative min-h-screen overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        !isMobile 
          ? (isCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[280px]') 
          : ''
      }`}>
        {/* Center Content */}
        <div className="flex-1 flex flex-col p-4 lg:p-8 relative z-10 w-full">
          <div className="flex-1 overflow-y-auto mb-7 pb-5 w-full max-w-[85%] mx-auto">
            <div className="flex flex-col gap-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "rounded-br-sm"
                        : "rounded-bl-sm"
                    }`}
                    style={{
                      backgroundColor:
                        message.sender === "user"
                          ? `linear-gradient(to bottom, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`
                          : currentTheme.buttonBg,
                      background:
                        message.sender === "user"
                          ? `linear-gradient(to bottom, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`
                          : currentTheme.buttonBg,
                      color:
                        message.sender === "user"
                          ? "#FFFFFF"
                          : currentTheme.textPrimary,
                    }}
                  >
                    {message.sender === "ai" ? (
                      <div className="prose prose-sm lg:prose-base max-w-none prose-invert prose-p:my-2 prose-headings:my-2 prose-li:my-0">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm lg:text-base whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] lg:max-w-[70%] rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{ backgroundColor: currentTheme.buttonBg }}
                  >
                    <div className="flex gap-1.5 items-center">
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="fixed w-[40%] bottom-5 w-full max-w-[45%] mx-auto z-50">
            {/* Message count indicator */}
            {userMessageCount >= 40 && (
              <div 
                className="mb-2 text-center text-sm font-medium px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: userMessageCount >= 50 
                    ? (isDarkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)")
                    : (isDarkMode ? "rgba(251, 191, 36, 0.1)" : "rgba(251, 191, 36, 0.1)"),
                  color: userMessageCount >= 50 
                    ? (isDarkMode ? "#ef4444" : "#dc2626")
                    : (isDarkMode ? "#fbbf24" : "#d97706"),
                  border: `1px solid ${userMessageCount >= 50 
                    ? (isDarkMode ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.3)")
                    : (isDarkMode ? "rgba(251, 191, 36, 0.3)" : "rgba(251, 191, 36, 0.3)")}`,
                }}
              >
                {userMessageCount >= 50 
                  ? "Message limit reached (50/50)" 
                  : `${userMessageCount}/50 messages used`}
              </div>
            )}
            
            {/* Input and Action Buttons */}
            <div className="flex gap-3 items-center justify-center w-full">
              {/* File add button */}
              <div className="relative" ref={attachmentMenuRef}>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-iconButton-background border border-iconButton-border rounded-md hover:opacity-80 transition-opacity duration-200"
                  style={{
                    cursor: "pointer",
                    backgroundColor: isDarkMode
                      ? currentTheme.buttonBgSecondary
                      : "rgba(255, 255, 255, 0.9)",
                    borderColor: isDarkMode
                      ? currentTheme.buttonBorder
                      : "rgba(0, 0, 0, 0.12)",
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                      : "0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    backdropFilter: isDarkMode ? "none" : "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDarkMode) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 1)";
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.18)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDarkMode) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.9)";
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.12)";
                    }
                  }}
                  aria-label="Upload file"
                >
                  <div className="w-6 h-6">
                    <img
                      alt="Send"
                      className="w-full h-full object-contain"
                      src="/chat/727a88af9b923d722f89bfedf898d899ad12f91c.svg"
                      style={{
                        filter: isDarkMode ? "brightness(1)" : "brightness(0.3)",
                        transition: "filter 0.3s ease",
                      }}
                    />
                  </div>
                </button>

                {/* Attachment Menu */}
                {isAttachmentMenuOpen && (
                  <div
                    className="absolute bottom-full mb-2 left-0 rounded-lg border overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(17, 17, 17, 0.98)"
                        : "rgba(255, 255, 255, 0.98)",
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(0, 0, 0, 0.1)",
                      boxShadow: isDarkMode
                        ? "0 4px 24px rgba(0, 0, 0, 0.35), 0 2px 12px rgba(0, 0, 0, 0.25)"
                        : "0 4px 24px rgba(0, 0, 0, 0.1), 0 2px 12px rgba(0, 0, 0, 0.06)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <button
                      onClick={triggerFileInput}
                      className="w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 hover:bg-opacity-80"
                      style={{
                        color: currentTheme.textPrimary,
                        backgroundColor: isDarkMode
                          ? "transparent"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode
                          ? "rgba(255, 255, 255, 0.04)"
                          : "rgba(0, 0, 0, 0.015)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 2V8H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 13H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 17H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 9H9H8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">Report Upload</span>
                    </button>
                    
                    <div
                      className="h-px"
                      style={{
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.06)",
                      }}
                    />
                    
                    <button
                      onClick={() => {
                        // Handle image upload
                        console.log("Image upload clicked");
                        setIsAttachmentMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 hover:bg-opacity-80"
                      style={{
                        color: currentTheme.textPrimary,
                        backgroundColor: isDarkMode
                          ? "transparent"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode
                          ? "rgba(255, 255, 255, 0.04)"
                          : "rgba(0, 0, 0, 0.015)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M21 15L16 10L5 21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">Image Upload</span>
                    </button>
                  </div>
                )}
              </div>
              {/* Input Box */}
              <div
                className="w-full rounded-2xl border-2 flex flex-col mx-auto"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(17, 17, 17, 0.95)"
                    : "rgba(255, 255, 255, 0.98)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.15)",
                  boxShadow: isDarkMode
                    ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                    : "0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  transition:
                    "background-color 0.15s ease-out, border-color 0.15s ease-out, box-shadow 0.15s ease-out",
                }}
              >
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="p-3 border-b" style={{
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  }}>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                          style={{
                            backgroundColor: isDarkMode
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.03)",
                            borderColor: isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                            color: currentTheme.textPrimary,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 2V8H20"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleFileRemove(index)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                            style={{ color: currentTheme.textSecondary }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={userMessageCount >= 50 
                    ? "Message limit reached (50 messages)" 
                    : "Type your symptoms, reports, or health questions…"}
                  className="w-full bg-transparent border-none outline-none resize-none font-normal text-lg lg:text-xl placeholder:transition-colors"
                  style={{
                    fontSize: "16px",
                    color: inputValue
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(31, 41, 55, 0.95)"
                      : isDarkMode
                      ? "rgba(255, 255, 255, 0.4)"
                      : "rgba(0, 0, 0, 0.4)",
                    minHeight: "60px",
                    maxHeight: "300px",
                    caretColor: isDarkMode
                      ? "rgba(76, 239, 255, 0.8)"
                      : "rgba(76, 158, 255, 0.8)",
                    padding: "10px",
                  }}
                  rows={1}
                  disabled={isLoading || userMessageCount >= 50}
                />
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Voice Input Button */}
              <button
                type="button"
                disabled={inputValue.trim() || isLoading || userMessageCount >= 50}
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-iconButton-background border border-iconButton-border rounded-md hover:opacity-80 transition-opacity duration-200"
                style={{
                  cursor: userMessageCount >= 50 ? "not-allowed" : "pointer",
                  backgroundColor: isDarkMode
                    ? currentTheme.buttonBgSecondary
                    : "rgba(255, 255, 255, 0.9)",
                  borderColor: isDarkMode
                    ? currentTheme.buttonBorder
                    : "rgba(0, 0, 0, 0.12)",
                  boxShadow: isDarkMode
                    ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                    : "0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  backdropFilter: isDarkMode ? "none" : "blur(10px)",
                  opacity: userMessageCount >= 50 ? 0.5 : 1,
                }}
                aria-label={
                  isRecording ? "Stop recording" : "Start voice recording"
                }
              >
                <div className="w-6 h-6">
                  {isRecording ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        fill={isDarkMode ? "#fff" : "#333"}
                      />
                    </svg>
                  ) : (
                    <img
                      alt="Voice"
                      className="w-full h-full object-contain"
                      src="/chat/53af455c113eef3a416cb10194b3c8b74de93d63.svg"
                      style={{
                        filter: isDarkMode
                          ? "brightness(1)"
                          : "brightness(0.3)",
                        transition: "filter 0.3s ease",
                      }}
                    />
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-[47px] h-[40px] rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  cursor: (isLoading || !inputValue.trim() || userMessageCount >= 50) ? "not-allowed" : "pointer",
                  background: `linear-gradient(to bottom, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`,
                  boxShadow: `0px 8px 44.1px 0px ${currentTheme.shadow}`,
                  opacity: userMessageCount >= 50 ? 0.5 : 1,
                }}
                aria-label="Send message"
                disabled={isLoading || !inputValue.trim() || userMessageCount >= 50}
              >
                <div className="w-6 h-6">
                  <img
                    alt="Send"
                    className="w-full h-full object-contain"
                    src="/chat/51122819fb56ff67038dce997e14e2510366ead5.svg"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatScreen;