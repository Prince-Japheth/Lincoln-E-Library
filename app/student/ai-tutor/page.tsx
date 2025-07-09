"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2,
  Plus,
  MessageCircle,
  Lightbulb,
  Calculator,
  Globe,
  Code,
  Copy,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EmptyChatsIllustration } from "@/components/empty-state-illustrations"
import ReactMarkdown from 'react-markdown'
import AnimatedLogo from "@/components/animated-logo"
import { useToast } from "@/components/ui/use-toast"
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
}

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain quantum physics in simple terms", category: "Science" },
  { icon: Calculator, text: "Help me solve calculus problems", category: "Math" },
  { icon: Globe, text: "Teach me about world history", category: "History" },
  { icon: Code, text: "Learn programming concepts", category: "Technology" },
  { icon: Sparkles, text: "Analyze literature themes", category: "Literature" },
  { icon: Sparkles, text: "Creative writing tips", category: "Writing" },
]

export default function AITutorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);
  const [chatSearch, setChatSearch] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [bookContext, setBookContext] = useState<{title?: string, author?: string, genre?: string}>({})
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [shouldAutoSend, setShouldAutoSend] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        setUser(user)
        await loadChatSessions(user.id)
        setLoading(false)

        // Initialize with welcome message if no chats
        if (chats.length === 0) {
          const welcomeMessage: Message = {
            id: "welcome",
            content:
              "Hello! I'm your AI tutor powered by Gemini. I'm here to help you with your studies, answer questions about any topic, explain concepts, and assist with your learning journey. What would you like to learn about today?",
            role: "assistant",
            timestamp: new Date(),
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error("Error checking user:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  useEffect(() => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const bookTitle = urlParams.get('book')
    const bookAuthor = urlParams.get('author')
    const bookGenre = urlParams.get('genre')
    
    if (bookTitle || bookAuthor || bookGenre) {
      setBookContext({
        title: bookTitle || undefined,
        author: bookAuthor || undefined,
        genre: bookGenre || undefined
      })
      // Auto-fill input with book-related question
      if (bookTitle) {
        setInput(`I'm reading "${bookTitle}" by ${bookAuthor || 'an author'}. Can you help me understand this book?`)
        setShouldAutoSend(true)
      }
    }
  }, [])

  useEffect(() => {
    if (shouldAutoSend && input && !isLoading) {
      // Programmatically submit the form
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      setShouldAutoSend(false)
    }
  }, [shouldAutoSend, input, isLoading])

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('ai-tutor-current-chat-id', currentChatId)
    } else {
      localStorage.removeItem('ai-tutor-current-chat-id')
    }
  }, [currentChatId])

  useEffect(() => {
    if (chats.length > 0) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('ai-tutor-current-chat-id') : null
      const found = savedId && chats.find(c => c.id === savedId)
      if (found) {
        setCurrentChatId(savedId)
        setMessages(found.messages)
      } else {
        setCurrentChatId(chats[0].id)
        setMessages(chats[0].messages)
      }
    }
  }, [chats])

  const loadChatSessions = async (userId: string) => {
    try {
      // First get sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("ai_chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (sessionsError) {
        console.error("Error loading chat sessions:", sessionsError)
        return
      }

      if (sessions && sessions.length > 0) {
        // Then get messages for each session
        const chatsWithMessages = await Promise.all(
          sessions.map(async (session) => {
            const { data: messages, error: messagesError } = await supabase
              .from("ai_chat_messages")
              .select("*")
              .eq("session_id", session.id)
              .order("created_at", { ascending: true })

            if (messagesError) {
              console.error("Error loading messages for session:", session.id, messagesError)
              return {
                id: session.id,
                title: session.title,
                lastUpdated: new Date(session.updated_at),
                messages: [],
              }
            }

            return {
              id: session.id,
              title: session.title,
              lastUpdated: new Date(session.updated_at),
              messages: (messages || []).map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: new Date(msg.created_at),
              })),
            }
          }),
        )

        setChats(chatsWithMessages)
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error)
    }
  }

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 4).join(" ")
    return words.length > 30 ? words.substring(0, 30) + "..." : words
  }

  const createNewChat = () => {
    const welcomeMessage: Message = {
      id: "welcome-" + Date.now(),
      content: "Hello! I'm your AI tutor. What would you like to learn about today?",
      role: "assistant",
      timestamp: new Date(),
    }

    setCurrentChatId(null)
    setMessages([welcomeMessage])
  }

  const saveChatSession = async (
    sessionId: string | null,
    title: string,
    userMessage: Message,
    assistantMessage: Message,
  ) => {
    try {
      let finalSessionId = sessionId

      if (!sessionId) {
        // Create new session
        const { data: session, error: sessionError } = await supabase
          .from("ai_chat_sessions")
          .insert({
            user_id: user.id,
            title: title,
          })
          .select()
          .single()

        if (sessionError) {
          console.error("Session creation error:", sessionError)
          return null
        }

        finalSessionId = session.id
        setCurrentChatId(finalSessionId)
      } else {
        // Update existing session timestamp
        const { error: updateError } = await supabase
          .from("ai_chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", sessionId)

        if (updateError) {
          console.error("Session update error:", updateError)
        }
      }

      // Save both messages
      const messagesToInsert = [
        {
          session_id: finalSessionId,
          role: userMessage.role,
          content: userMessage.content,
        },
        {
          session_id: finalSessionId,
          role: assistantMessage.role,
          content: assistantMessage.content,
        },
      ]

      const { error: messagesError } = await supabase.from("ai_chat_messages").insert(messagesToInsert)

      if (messagesError) {
        console.error("Messages insert error:", messagesError)
        return null
      }

      return finalSessionId
    } catch (error) {
      console.error("Error saving chat session:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI tutor")
      }

      const data = await response.json()
      const aiResponse = data.response || "I'm sorry, I couldn't process that request."

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      // Save to database
      const title = currentChatId
        ? chats.find((c) => c.id === currentChatId)?.title || generateChatTitle(input.trim())
        : generateChatTitle(input.trim())

      const savedSessionId = await saveChatSession(currentChatId, title, userMessage, assistantMessage)

      // Update local state
      if (!currentChatId && savedSessionId) {
        const newChat: Chat = {
          id: savedSessionId,
          title: title,
          messages: updatedMessages,
          lastUpdated: new Date(),
        }
        setChats((prev) => [newChat, ...prev])
        setCurrentChatId(savedSessionId)
      } else if (currentChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId ? { ...chat, messages: updatedMessages, lastUpdated: new Date() } : chat,
          ),
        )
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    console.log("Suggestion clicked:", suggestion)
    setInput(suggestion)
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      role: "user",
      timestamp: new Date(),
    }

    console.log("Adding user message to chat")
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("Calling AI API with suggestion:", suggestion)
      // Call AI API
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: suggestion,
          sessionId: currentChatId,
        }),
      })

      console.log("API response status:", response.status)
      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      console.log("API response data:", data)
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }

      console.log("Adding assistant message to chat")
      // Add assistant message to chat
      setMessages((prev) => [...prev, assistantMessage])

      // Save chat session
      if (!currentChatId) {
        const title = generateChatTitle(suggestion)
        await saveChatSession(null, title, userMessage, assistantMessage)
        await loadChatSessions(user.id)
      } else {
        await saveChatSession(currentChatId, "", userMessage, assistantMessage)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const loadChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase.from("ai_chat_sessions").delete().eq("id", chatId)
      if (error) {
        console.error("Error deleting chat:", error)
        return
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (currentChatId === chatId) {
        createNewChat()
      }
      
      // Reset confirmation state
      setShowDeleteConfirm(false)
      setChatToDelete(null)
    } catch (error) {
      console.error("Error deleting chat:", error)
      // Reset confirmation state even on error
      setShowDeleteConfirm(false)
      setChatToDelete(null)
    }
  }

  // Filter chats based on search
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(chatSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-16 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#fe0002]/30 border-t-[#fe0002] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading AI Tutor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="flex pt-16 h-screen">
        {/* Sidebar for desktop */}
        <div className={`hidden md:block transition-all duration-300 overflow-hidden chat-sidebar relative ${sidebarCollapsed ? 'w-14' : 'w-80'}`}>
          {/* Sidebar content, hidden when collapsed */}
          <div className={`p-6 h-full flex flex-col transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'}`}
            style={{ width: sidebarCollapsed ? 0 : 'auto' }}
          >
            <Button
              onClick={createNewChat}
              className="w-full mb-6 morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Past Chats</h3>
              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="h-10 pl-10 pr-3 rounded-2xl glassmorphism-card border border-border focus:border-[#fe0002] shadow-sm text-sm bg-background"
                />
              </div>
              {filteredChats.length === 0 ? (
                <div className="text-center py-8">
                  <EmptyChatsIllustration />
                  <p className="text-muted-foreground text-sm">
                    {chatSearch ? "No chats match your search" : "No chat history yet"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {chatSearch ? "Try a different search term" : "Start a conversation to see your chats here"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentChatId === chat.id ? "bg-[#fe0002]/10 border border-[#fe0002]/20" : "hover:bg-muted/50"
                          }`}
                        onClick={() => loadChat(chat.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">{chat.lastUpdated.toLocaleDateString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(true)
                              setChatToDelete(chat.id)
                            }}
                            title="Delete chat"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-background h-full shadow-xl chat-sidebar">
              {typeof window !== 'undefined' && window.innerWidth < 768 && (
                <div className="flex justify-center px-5 pt-5">
                  <img src="/logo.png" alt="Lincoln Logo" className="w-full object-contain" />
                </div>
              )}
              <div className="p-6 h-full flex flex-col">
                <Button
                  onClick={() => {
                    createNewChat();
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
                  }}
              className="w-full mb-6 morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Past Chats</h3>
              
              {/* Search input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search chats..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                      className="h-10 pl-10 pr-3 rounded-2xl glassmorphism-card border border-border focus:border-[#fe0002] shadow-sm text-sm bg-background"
                />
              </div>

              {filteredChats.length === 0 ? (
                <div className="text-center py-8">
                  <EmptyChatsIllustration />
                  <p className="text-muted-foreground text-sm">
                    {chatSearch ? "No chats match your search" : "No chat history yet"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {chatSearch ? "Try a different search term" : "Start a conversation to see your chats here"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentChatId === chat.id ? "bg-[#fe0002]/10 border border-[#fe0002]/20" : "hover:bg-muted/50"
                          }`}
                        onClick={() => loadChat(chat.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">{chat.lastUpdated.toLocaleDateString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(true)
                              setChatToDelete(chat.id)
                            }}
                            title="Delete chat"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSidebarOpen(false)}>
                  Close
                </Button>
          </div>
        </div>
          </div>
        )}
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="glassmorphism-nav p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Sidebar collapse/expand button (desktop only) */}
              <button
                className={`hidden md:inline-flex items-center justify-center mr-2 h-9 w-9 rounded-full glassmorphism-card shadow transition hover:scale-110 border border-border focus:outline-none focus:ring-2 focus:ring-[#fe0002]`} 
                onClick={() => setSidebarCollapsed((c) => !c)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{ zIndex: 20 }}
              >
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5 text-[#fe0002]" /> : <ChevronLeft className="h-5 w-5 text-[#fe0002]" />}
              </button>
              {/* Mobile sidebar toggle button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="glassmorphism-card md:hidden"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-[#fe0002]" />
                <h1 className="text-xl font-bold">AI Tutor</h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Powered by Gemini</div>
          </div>

          {/* Book Context Display */}
          {bookContext.title && (
            <div className="glassmorphism-nav p-4 border-b border-gray-200">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-[#fe0002]" />
                  <span className="font-medium">Reading:</span>
                  <span className="text-gray-700">"{bookContext.title}"</span>
                  {bookContext.author && (
                    <>
                      <span className="text-gray-500">by</span>
                      <span className="text-gray-700">{bookContext.author}</span>
                    </>
                  )}
                  {bookContext.genre && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-700">{bookContext.genre}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div
                      className={`flex gap-4 animate-slide-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-[#fe0002] to-[#ff4444] text-white"
                            : "glassmorphism-card"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Copy button and timestamp directly under AI messages */}
                    {message.role === "assistant" && (
                      <div className="flex items-center justify-end gap-2 mt-2 mb-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1 h-7 w-7"
                          onClick={() => {
                            navigator.clipboard.writeText(message.content)
                            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                              toast({ title: 'Copied to clipboard!' })
                            }
                          }}
                          title="Copy reply"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 animate-slide-up justify-start">
                    <div className="max-w-[80%] rounded-2xl px-6 py-4 glassmorphism-card flex items-center">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-[#fe0002] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <span className="inline-block w-2 h-2 bg-[#fe0002] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="inline-block w-2 h-2 bg-[#fe0002] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </span>
                      <span className="ml-3 text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={endOfMessagesRef} />

                {/* Suggestions */}
                {messages.length === 1 && messages[0]?.role === "assistant" && !isLoading && (
                  <div className="space-y-4 animate-slide-up delay-300">
                    <h3 className="text-lg font-semibold text-center text-foreground">Try asking about:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SUGGESTIONS.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="glassmorphism-card border-[#fe0002]/20 text-left h-auto p-4 hover:bg-[#fe0002]/5 hover:border-[#fe0002]/40 transition-all duration-300 bg-transparent justify-start"
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          disabled={isLoading}
                        >
                          <div className="flex flex-row items-start space-x-3">
                            {isLoading ? (
                              <Loader2 className="h-5 w-5 text-[#fe0002] animate-spin" />
                            ) : (
                              <suggestion.icon className="h-5 w-5 text-[#fe0002]" />
                            )}
                            <div className="flex flex-col items-start">
                              <p className="font-medium">{suggestion.text}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.category}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <div className="glassmorphism-nav p-6">
            <div className="max-w-4xl mx-auto">
              <form ref={formRef} onSubmit={handleSubmit} className="flex gap-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  disabled={false}
                  aria-invalid={false}
                  className="flex-1 h-12 min-h-[3rem] max-h-40 glassmorphism-card border-0 text-base bg-white resize-none py-3 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fe0002]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !(e.shiftKey || e.metaKey)) {
                      e.preventDefault();
                      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                    // Otherwise, allow Shift+Enter or Cmd+Enter for new lines
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-full morph-button bg-gradient-to-r from-[#fe0002] to-[#ff4444] hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 hover:scale-105 transition-all duration-300 flex items-center justify-center p-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>

              <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                AI responses are generated to assist with learning
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && chatToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glassmorphism-card p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Delete Chat</h2>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this chat? All messages in this conversation will be permanently removed.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setChatToDelete(null)
                }}
                className="hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteChat(chatToDelete)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 






