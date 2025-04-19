import { useEffect, useState } from "react";
import HistoryScreen from "@/components/HistoryScreen";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { LocalSession } from "@shared/schema";
import { useLocation } from "wouter";

export default function History() {
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const { loadPracticeSessions } = useSessionStorage();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Load sessions when the component mounts
    const loadedSessions = loadPracticeSessions();
    setSessions(loadedSessions);
  }, [loadPracticeSessions]);

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen w-screen relative overflow-hidden">
      <HistoryScreen 
        sessions={sessions}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}
