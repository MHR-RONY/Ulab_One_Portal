import { useState } from "react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";

const TeacherChat = () => {
  const [activeConversation, setActiveConversation] = useState("prof-ahmed");
  const [showThread, setShowThread] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <TeacherSidebar activePage="Messages" />
      </div>

      <main className="flex-1 flex overflow-hidden">
        <div className={`${showThread ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col shrink-0`}>
          <ConversationList
            activeId={activeConversation}
            onSelect={(id) => {
              setActiveConversation(id);
              setShowThread(true);
            }}
          />
        </div>

        <div className={`${showThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background relative`}>
          <ChatThread onBack={() => setShowThread(false)} />
        </div>
      </main>

      <div className="md:hidden">
        <TeacherBottomNav />
      </div>
    </div>
  );
};

export default TeacherChat;
