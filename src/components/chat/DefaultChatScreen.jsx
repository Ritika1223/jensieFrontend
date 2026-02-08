import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import SideNavigation from "../doctors-listing/SideNavigation";
import { useTheme } from "../../contexts/ThemeContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { CHAT_API_URL } from "../../config/api";
import Marcus from "../Marcus";
import { useNavigate, useLocation } from 'react-router-dom';
import { useMarcusGreeting } from '../../hooks/useMarcusGreeting';
import { useClickOutside } from '../../hooks/useClickOutside';
import { safeLocalStorage } from '../../utils/localStorage';
import './ChatInput.css';

const DefaultChatScreen = () => {
  const location = useLocation();

  const { isDarkMode } = useTheme();
  const { isCollapsed, isMobile } = useSidebar();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const textareaRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  
  // Use custom hooks
  const marcusMessage = useMarcusGreeting();
  
  useClickOutside(languageDropdownRef, () => setIsLanguageDropdownOpen(false), isLanguageDropdownOpen);
  useClickOutside(attachmentMenuRef, () => setIsAttachmentMenuOpen(false), isAttachmentMenuOpen);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return;

    const languageCode = selectedLanguage === "HND" ? "hnd" : "en";
    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    try {
      setIsLoading(true)
      let activeThreadId = threadId;

      let chatMode= location.pathname.split("/")[1] === "private" ? "private" : "normal"

      // Create thread if it doesn't exist
      if (!activeThreadId) {
        const threadResponse = await fetch(`${CHAT_API_URL}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: languageCode, mode: chatMode}),
        });

        const threadData = await threadResponse.json();
        if (!threadResponse.ok || !threadData?.thread_id) {
          throw new Error(threadData?.error || "Failed to create thread");
        }
        activeThreadId = threadData.thread_id;
        setThreadId(threadData.thread_id);
      }

      // Call chat API with thread_id
      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          message: userMessage.text,
          thread_id: activeThreadId,
          mode: chatMode,
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
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Store messages in localStorage for private conversations
          if (location.pathname.split("/")[1] === "private") {
            const messages = [
              {
                thread_id: activeThreadId,
                role: "user",
                message: userMessage.text,
                timestamp: userMessage.timestamp.toISOString()
              },
              {
                thread_id: activeThreadId,
                role: "assistant", 
                message: aiResponse,
                timestamp: new Date().toISOString()
              }
            ];
            safeLocalStorage.setItem(`${activeThreadId}_language`, languageCode);
            safeLocalStorage.setItem(activeThreadId, JSON.stringify(messages));
          }
          
          navigate(`${location.pathname}/${activeThreadId}`, { replace: true });
          break;
        }
        
        // Decode and accumulate the AI response
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          aiResponse += chunk;
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action buttons
  const handleQuickAction = (action) => {
    const messages = {
      symptom: "I would like to evaluate my symptoms.",
      lab: "I want to upload and interpret my lab report.",
      doctor: "I would like to speak to a doctor.",
    };
    
    if (messages[action]) {
      setInputValue(messages[action]);
      textareaRef.current?.focus();
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line) - Memoized callback
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

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
      className="relative w-full min-h-screen flex"
      style={{
        backgroundColor: currentTheme.background,
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
        <div
          className="flex-1 flex flex-col relative z-10 w-full overflow-hidden"
          style={{
            minHeight: "100vh",
            background: `
          url('/chat/${isDarkMode
                ? "defaultchatbackgrounddark.svg"
                : "defaultchatbackground.svg"
              }'),
          radial-gradient(circle at top right, ${isDarkMode ? "#3413A1" : "#b9b2ffff"
              } 0%, transparent 20%),
          ${currentTheme.background}
        `,
          }}
        >
          {/* Language Selector - Top Right */}
          <div
            className="absolute right-4 top-4 lg:right-8 lg:top-8 z-20"
            ref={languageDropdownRef}
          >
            <div className="relative">
              <button
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                className="flex items-center px-3.5 py-2 rounded-lg border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(255, 255, 255, 0.98)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                  boxShadow: isDarkMode
                    ? "0 2px 12px rgba(0, 0, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                    : "0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <p
                  className="font-semibold text-sm mr-2 whitespace-nowrap tracking-tight"
                  style={{ color: currentTheme.textPrimary }}
                >
                  {selectedLanguage}
                </p>
                <div
                  className={`w-3 h-3 transition-transform duration-300 ${isLanguageDropdownOpen ? "rotate-180" : ""
                    }`}
                >
                  <img
                    alt="Arrow"
                    className="w-full h-full object-contain"
                    src="/chat/61c1ff007e0cd325b32f28f1e56892b95559322d.svg"
                    style={{
                      filter: isDarkMode
                        ? "brightness(0) invert(1)"
                        : "brightness(0.3)",
                      transition: "filter 0.3s ease",
                    }}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isLanguageDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 rounded-lg border overflow-hidden min-w-[120px] animate-in fade-in slide-in-from-top-2 duration-200"
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
                    onClick={() => {
                      setSelectedLanguage("EN");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left transition-all duration-200 flex items-center justify-between ${selectedLanguage === "EN"
                        ? isDarkMode
                          ? "bg-[rgba(255,255,255,0.08)]"
                          : "bg-[rgba(0,0,0,0.03)]"
                        : isDarkMode
                          ? "hover:bg-[rgba(255,255,255,0.04)]"
                          : "hover:bg-[rgba(0,0,0,0.015)]"
                      }`}
                    style={{ color: currentTheme.textPrimary }}
                  >
                    <span className="font-medium text-sm">English</span>
                    {selectedLanguage === "EN" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3333 4L6 11.3333L2.66667 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
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
                      setSelectedLanguage("HND");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left transition-all duration-200 flex items-center justify-between ${selectedLanguage === "HI"
                        ? isDarkMode
                          ? "bg-[rgba(255,255,255,0.08)]"
                          : "bg-[rgba(0,0,0,0.03)]"
                        : isDarkMode
                          ? "hover:bg-[rgba(255,255,255,0.04)]"
                          : "hover:bg-[rgba(0,0,0,0.015)]"
                      }`}
                    style={{ color: currentTheme.textPrimary }}
                  >
                    <span className="font-medium text-sm">हिंदी</span>
                    {selectedLanguage === "HI" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3333 4L6 11.3333L2.66667 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Incognito Mode Message - Positioned at top center of viewport */}
          {location.pathname.split("/")[1] === "private" && (
            <div className="absolute top-4 lg:top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20 w-full max-w-[752px] px-4">
              <img
                src={isDarkMode ? "/chat/uil_lock.svg" : "/chat/uil_lock_dark.svg"}
                alt="Private Mode"
                className="mr-3"
                loading="lazy"
                style={{ width: '20px', height: '20px' }}
              />
              <p 
                style={{ 
                  color: isDarkMode ? "#fff" : "#333", 
                  textAlign: "left"
                }}
                className="text-xs md:text-sm"
              >
                Incognito Mode Active: This session's history will not be saved.
                Your privacy is protected.
              </p>
            </div>
          )}

          <div
            className="w-full max-w-[752px] mx-auto flex flex-col items-center justify-center"
            style={{
              minHeight: "100vh",
            }}
          >
            {/* Input and Action Buttons */}
            <div className="flex flex-col gap-6 items-center justify-center align-center w-full">
              {/* Welcome Greeting - Original design restored */}
              <div className="w-full flex items-center justify-center relative mb-5">
                <div className="p-1 w-full max-w-md text-center">
                  {/* Marcus Logo - Replaced original image */}
                  <div className="mx-auto mb-4 flex justify-center items-center">
                    <Marcus 
                      size="lg" 
                      style={{
                        position: 'static',
                        display: 'inline-block',
                        top: 'auto',
                        left: 'auto',
                        bottom: 'auto',
                        right: 'auto',
                        width: '52px',
                        height: '52px',
                      }}
                    />
                  </div>
                  
                  {/* Welcome Heading with Gradient Text - Original styling restored */}
                  <h1 
                    className="text-3xl font-bold mb-4 gradient-text"
                    style={{
                      backgroundImage: isDarkMode 
                        ? `linear-gradient(to right, #796BFF, #fff, #4C9EFF)`
                        : `linear-gradient(to right, #796BFF, #333, #4C9EFF)`,
                    }}
                  >
                    How Can I help you today?
                  </h1>
                  
                  {/* Subtitle - Original styling */}
                  <p 
                    className="text-gray-600"
                    style={{
                      color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    Try new feature Lab report interpretation
                  </p>
                </div>
              </div>

              {/* Input Box with Animated Neon Border */}
              <div className={`chat-input-wrapper ${isInputFocused ? 'chat-input-focused' : ''} ${isDarkMode ? 'dark-mode' : ''}`}>
              <div
                className="chat-input-inner w-full rounded-3xl p-4 min-h-[120px] flex flex-col justify-between mx-auto"
                style={{
                  backgroundColor: isDarkMode
                    ? "#000000"
                    : "#e8e8e8",
                  border: 'none',
                  boxShadow: isInputFocused 
                    ? 'none' 
                    : isDarkMode
                      ? "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05), inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)"
                      : "8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.9), inset 4px 4px 8px rgba(0, 0, 0, 0.05), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
                  transition:
                    "background-color 0.15s ease-out, box-shadow 0.15s ease-out",
                }}
              >
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 pb-3" style={{
                    borderBottom: isDarkMode
                      ? "1px solid rgba(255, 255, 255, 0.05)"
                      : "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: isDarkMode
                      ? "0 1px 0 rgba(0, 0, 0, 0.2)"
                      : "0 1px 0 rgba(255, 255, 255, 0.8)",
                  }}>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: isDarkMode
                              ? "#000000"
                              : "#e8e8e8",
                            border: 'none',
                            boxShadow: isDarkMode
                              ? "3px 3px 6px rgba(0, 0, 0, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.03), inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.03)"
                              : "3px 3px 6px rgba(0, 0, 0, 0.08), -3px -3px 6px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(0, 0, 0, 0.05), inset -2px -2px 4px rgba(255, 255, 255, 0.9)",
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

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Type your symptoms, reports, or health questions…"
                  className="w-full bg-transparent border-none outline-none resize-none font-normal text-lg lg:text-xl placeholder:transition-colors"
                  style={{
                    color: inputValue
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(31, 41, 55, 0.95)"
                      : isDarkMode
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(0, 0, 0, 0.4)",
                    minHeight: "80px",
                    maxHeight: "300px",
                    caretColor: isDarkMode
                      ? "rgba(76, 239, 255, 0.8)"
                      : "rgba(76, 158, 255, 0.8)",
                  }}
                  rows={3}
                  disabled={isLoading}
                />

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-[10px]">
                  {/* File add button */}
                  <div className="relative" ref={attachmentMenuRef}>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                      className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-iconButton-background border border-iconButton-border rounded-md hover:opacity-80 transition-opacity duration-200"
                      style={{
                        cursor: 'pointer',
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
                          e.currentTarget.style.borderColor =
                            "rgba(0, 0, 0, 0.18)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDarkMode) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.9)";
                          e.currentTarget.style.borderColor =
                            "rgba(0, 0, 0, 0.12)";
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
                            filter: isDarkMode
                              ? "brightness(1)"
                              : "brightness(0.3)",
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
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    disabled={inputValue.trim() || isLoading}
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-[40px] lg:h-[40px] flex items-center justify-center bg-iconButton-background border border-iconButton-border rounded-md hover:opacity-80 transition-opacity duration-200"
                    style={{
                      cursor: 'pointer',
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
                            fill="#333"
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
                    className="w-[42px] h-[42px] rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      cursor: 'pointer',
                      background: '#000000',
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3), 0px 8px 40px rgba(0, 0, 0, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0px 6px 30px rgba(0, 0, 0, 0.4), 0px 12px 60px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.15), 0px 0px 20px rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.3), 0px 8px 40px rgba(0, 0, 0, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    aria-label="Add attachment"
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <div className="w-6 h-6 transition-all duration-300">
                      <img
                        alt="Send"
                        className="w-full h-full object-contain"
                        src="/chat/51122819fb56ff67038dce997e14e2510366ead5.svg"
                        style={{
                          filter: 'brightness(0) invert(1) drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.3))',
                        }}
                      />
                    </div>
                  </button>
                </div>
              </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-3 items-center justify-center w-full mx-auto">
                {/* Symptom Evaluation */}
                <button
                  type="button"
                  onClick={() => handleQuickAction("symptom")}
                  className="flex gap-2.5 items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: currentTheme.buttonBg,
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                      : "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: `1px solid ${isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.06)"
                      }`,
                  }}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img
                      alt="Symptom"
                      className="w-full h-full object-contain"
                      src="/chat/884b3b61d9d8e657c03f5b0595a3131172166cbe.svg"
                      style={{
                        filter: isDarkMode
                          ? "brightness(1.2) drop-shadow(0 0 3px rgba(76, 239, 255, 0.5)) drop-shadow(0 0 6px rgba(25, 246, 220, 0.3))"
                          : "brightness(0) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                        transition: "filter 0.3s ease",
                        opacity: isDarkMode ? 1 : 0.85,
                      }}
                    />
                  </div>
                  <p
                    className="font-medium text-sm whitespace-nowrap"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    Symptom Evaluation
                  </p>
                </button>

                {/* Upload Lab Report */}
                <button
                  type="button"
                  onClick={() => handleQuickAction("lab")}
                  className="flex gap-2.5 items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: currentTheme.buttonBg,
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                      : "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: `1px solid ${isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.06)"
                      }`,
                  }}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img
                      alt="Document"
                      className="w-full h-full object-contain"
                      src="/chat/528072832e04731c041e5a8b3f4ad778bd5715c0.svg"
                      style={{
                        filter: isDarkMode ? "brightness(1)" : "brightness(0)",
                        transition: "filter 0.3s ease",
                      }}
                    />
                  </div>
                  <p
                    className="font-medium text-sm whitespace-nowrap"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    Upload Lab Report
                  </p>
                </button>

                {/* Speak to Doctor */}
                <button
                  type="button"
                  onClick={() => handleQuickAction("doctor")}
                  className="flex gap-2.5 items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: currentTheme.buttonBg,
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                      : "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: `1px solid ${isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.06)"
                      }`,
                  }}
                >
                  <div className="w-4 h-4 flex items-center justify-center relative">
                    <img
                      alt="Calendar"
                      className="w-full h-full object-contain"
                      src="/chat/c7109c2e5381f3f50aec9b5045b98fabdf79a465.svg"
                      style={{
                        filter: isDarkMode
                          ? "brightness(1) drop-shadow(0 0 2px rgba(76, 239, 255, 0.4)) drop-shadow(0 1px 1px rgba(25, 246, 220, 0.3))"
                          : "brightness(0) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))",
                        transition: "filter 0.3s ease, transform 0.2s ease",
                        transform: "translateZ(0)",
                        willChange: "filter, transform",
                      }}
                    />
                  </div>
                  <p
                    className="font-medium text-sm whitespace-nowrap"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    Speak to a Doctor
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DefaultChatScreen;
