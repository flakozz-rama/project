import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Search, MoreVertical, Phone, Video,
  Paperclip, Smile, Image as ImageIcon, Check, CheckCheck,
  Circle, Home, Calendar, Settings, Archive, Star, Info, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useConversations, useMessages, useSendMessage } from "../api";

interface MessagesProps {
  onBack?: () => void;
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  read: boolean;
  type?: "text" | "image" | "booking";
  attachmentUrl?: string;
  bookingInfo?: {
    propertyName: string;
    dates: string;
    bookingId: string;
  };
}

interface Conversation {
  id: number;
  contactName: string;
  contactAvatar: string;
  contactType: "host" | "guest" | "support";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  propertyRelated?: string;
  messages: Message[];
}

export function Messages({ onBack }: MessagesProps) {
  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const sendMessageMutation = useSendMessage();

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedConversationId || 0);

  const conversations: Conversation[] = (conversationsData || []).map((c) => ({
    id: c.id,
    contactName: c.contact_name,
    contactAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.contact_name}`,
    contactType: c.contact_type,
    lastMessage: c.last_message,
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    online: false,
    propertyRelated: c.property_name,
    messages: [],
  }));

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0] || null;

  // Combine API messages with local conversation structure
  const currentMessages: Message[] = (messagesData || []).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.text,
    timestamp: m.created_at,
    read: m.read,
  }));

  // Set first conversation as selected on load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 2; // Current logged-in user ID

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate(
      { conversation_id: selectedConversationId, text: newMessage },
      {
        onSuccess: () => {
          setNewMessage("");
        },
      }
    );
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getFilteredConversations = () => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conv =>
      conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.propertyRelated?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredConversations = getFilteredConversations();
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const markAsRead = (conversationId: number) => {
    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    }));
  };

  const getContactTypeBadge = (type: string) => {
    switch (type) {
      case "support":
        return <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-xs">{t('messages.support')}</Badge>;
      case "host":
        return <Badge variant="secondary" className="text-xs">{t('messages.host')}</Badge>;
      case "guest":
        return <Badge variant="secondary" className="text-xs">{t('messages.guest')}</Badge>;
      default:
        return null;
    }
  };

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t('messages.backToHome')}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-2 flex items-center gap-3">
                {t('messages.title')}
                {totalUnread > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500">
                    {totalUnread} {t('messages.unread')}
                  </Badge>
                )}
              </h1>
              <p className="text-slate-600">
                {t('messages.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[380px_1fr] h-[calc(100vh-280px)] min-h-[600px]">
              {/* Conversations List */}
              <div className="border-r bg-slate-50/50">
                {/* Search */}
                <div className="p-4 border-b bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder={t('messages.searchConversations')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <ScrollArea className="h-[calc(100%-73px)]">
                  <div className="p-2">
                    {filteredConversations.length > 0 ? (
                      <AnimatePresence>
                        {filteredConversations.map((conversation) => (
                          <motion.div
                            key={conversation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <button
                              onClick={() => {
                                setSelectedConversationId(conversation.id);
                                markAsRead(conversation.id);
                              }}
                              className={`w-full p-4 rounded-lg text-left transition-colors mb-2 ${
                                selectedConversation?.id === conversation.id
                                  ? "bg-white shadow-sm"
                                  : "hover:bg-white/50"
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={conversation.contactAvatar} />
                                    <AvatarFallback>
                                      {conversation.contactName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  {conversation.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-1">
                                    <h4 className={`truncate ${
                                      conversation.unreadCount > 0 ? "text-slate-900" : "text-slate-700"
                                    }`}>
                                      {conversation.contactName}
                                    </h4>
                                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                                      {formatMessageTime(conversation.lastMessageTime)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-1">
                                    {getContactTypeBadge(conversation.contactType)}
                                  </div>

                                  {conversation.propertyRelated && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                      <Home className="h-3 w-3" />
                                      <span className="truncate">{conversation.propertyRelated}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm truncate ${
                                      conversation.unreadCount > 0 
                                        ? "text-slate-900" 
                                        : "text-slate-500"
                                    }`}>
                                      {conversation.lastMessage}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                      <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs rounded-full">
                                        {conversation.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No conversations found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              {selectedConversation ? (
                <div className="flex flex-col bg-white">
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.contactAvatar} />
                          <AvatarFallback>
                            {selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-slate-900 flex items-center gap-2">
                          {selectedConversation.contactName}
                          {getContactTypeBadge(selectedConversation.contactType)}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {selectedConversation.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Property Context Banner */}
                  {selectedConversation.propertyRelated && (
                    <div className="px-4 py-3 bg-blue-50 border-b">
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-slate-700">
                          Conversation about:{" "}
                          <strong className="text-slate-900">{selectedConversation.propertyRelated}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : (
                      <AnimatePresence>
                        {currentMessages.map((message, index) => {
                          const isMine = message.senderId === currentUserId;
                          const showAvatar = index === 0 ||
                            currentMessages[index - 1].senderId !== message.senderId;

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}
                            >
                              <div className="flex-shrink-0">
                                {showAvatar ? (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                      src={isMine ? "https://api.dicebear.com/7.x/avataaars/svg?seed=user" : selectedConversation.contactAvatar} 
                                    />
                                    <AvatarFallback>
                                      {isMine ? "You" : selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-8"></div>
                                )}
                              </div>

                              <div className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isMine
                                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                                      : "bg-slate-100 text-slate-900"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">{message.text}</p>
                                </div>
                                <div className="flex items-center gap-1 px-2">
                                  <span className="text-xs text-slate-500">
                                    {formatMessageTime(message.timestamp)}
                                  </span>
                                  {isMine && (
                                    message.read ? (
                                      <CheckCheck className="h-3 w-3 text-blue-600" />
                                    ) : (
                                      <Check className="h-3 w-3 text-slate-400" />
                                    )
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      )}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedConversation.contactAvatar} />
                            <AvatarFallback>
                              {selectedConversation.contactName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-slate-100 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                              <Circle className="h-2 w-2 fill-slate-400 text-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <Circle className="h-2 w-2 fill-slate-400 text-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <Circle className="h-2 w-2 fill-slate-400 text-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                          <ImageIcon className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="pr-12"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </div>

                      <Button 
                        type="submit" 
                        size="icon"
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 flex-shrink-0"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-white">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-slate-900 mb-2">Select a conversation</h3>
                    <p className="text-slate-600">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}