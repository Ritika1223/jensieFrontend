import React, {
  useMemo
} from "react";
import { ChatScreen } from "../components/chat";
import { SuggestionScreen } from "../components/chat";
import { useTheme } from "../contexts/ThemeContext";

export default function ChatPage() {
  const { isDarkMode } = useTheme();
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
  return (
    <div
      className="flex w-full"
      style={{
        background: `
          radial-gradient(circle at top right, ${
            isDarkMode ? "#3413A1" : "#b9b2ffff"
          } 0%, transparent 20%),
          radial-gradient(circle at bottom left, ${
            isDarkMode ? "#3413A1" : "#b9b2ffff"
          } 0%, transparent 20%),
          ${currentTheme.background}
        `,
      }}
    >
      <div className="w-[70%]">
        <ChatScreen />
      </div>
      <div className="w-[30%]">
        <SuggestionScreen />
      </div>
    </div>
  );
}
