import { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState("prof-ahmed");
  const [showThread, setShowThread] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar activePage="Messages" />
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Conversation list - hidden on mobile when thread is open */}
        <div className={`${showThread ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col shrink-0`}>
          <ConversationList
            activeId={activeConversation}
            onSelect={(id) => {
              setActiveConversation(id);
              setShowThread(true);
            }}
          />
        </div>

        {/* Chat thread - hidden on mobile when list is shown */}
        <div className={`${showThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background relative`}>
          <ChatThread onBack={() => setShowThread(false)} />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};

export default Chat;
