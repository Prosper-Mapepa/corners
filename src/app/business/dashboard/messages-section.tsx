"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

type Conversation = {
  place: {
    id: string
    name: string
  }
  otherUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
  unreadCount: number
}

type Message = {
  id: string
  content: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  recipient: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
}

type Props = {
  token: string | null
  user: { id: string; email: string; name?: string } | null
}

export function BusinessMessagesSection({ token, user }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token && user) {
      loadConversations()
      // Poll for new conversations every 5 seconds
      const interval = setInterval(loadConversations, 5000)
      return () => clearInterval(interval)
    }
  }, [token, user])

  useEffect(() => {
    if (selectedConversation && token) {
      loadMessages()
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation, token])

  useEffect(() => {
    // Only scroll when we have messages and a selected conversation
    if (selectedConversation && messages.length > 0 && messagesEndRef.current) {
      // Only scroll within the messages container, not the entire page
      const messagesContainer = messagesEndRef.current.closest('.overflow-y-auto')
      if (messagesContainer) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: "smooth"
          })
        }, 100)
      }
    }
  }, [messages, selectedConversation])

  const loadConversations = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const data = await api.get<Conversation[]>("/messages/conversations", { auth: token })
      setConversations(data)
    } catch (err) {
      console.error("Failed to load conversations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!token || !selectedConversation || !user) return
    try {
      const data = await api.get<Message[]>(
        `/messages/conversation/${selectedConversation.place.id}/${selectedConversation.otherUser.id}`,
        { auth: token }
      )
      setMessages(data)
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  const handleSendMessage = async () => {
    if (!token || !selectedConversation || !newMessage.trim()) return

    try {
      setIsSending(true)
      await api.post(
        "/messages",
        {
          placeId: selectedConversation.place.id,
          recipientId: selectedConversation.otherUser.id,
          content: newMessage.trim(),
        },
        { auth: token }
      )
      setNewMessage("")
      await loadMessages()
      await loadConversations()
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!token || !user) return null

  return (
    <div className="space-y-4">
      {isLoading && conversations.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-base">No messages yet. Customers can message you from your listings.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {conversations.map((conv) => (
              <div
                key={`${conv.place.id}-${conv.otherUser.id}`}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedConversation?.place.id === conv.place.id &&
                  selectedConversation?.otherUser.id === conv.otherUser.id
                    ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 shadow-md"
                    : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm"
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-gray-200">
                    {conv.otherUser.avatarUrl ? (
                      <Image
                        src={conv.otherUser.avatarUrl}
                        alt={conv.otherUser.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                        {conv.otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-gray-900 truncate">{conv.otherUser.name}</h4>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs font-semibold h-5 px-2">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(conv.lastMessage.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium truncate mb-1">{conv.place.name}</p>
                    <p className="text-sm text-gray-500 truncate line-clamp-2">{conv.lastMessage.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedConversation && (
            <div className="border-2 border-gray-200 rounded-xl flex flex-col h-[600px] bg-white shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    {selectedConversation.otherUser.avatarUrl ? (
                      <Image
                        src={selectedConversation.otherUser.avatarUrl}
                        alt={selectedConversation.otherUser.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold">
                        {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedConversation.otherUser.name}</h4>
                    <p className="text-xs text-gray-600">
                      <Link href={`/place/${selectedConversation.place.id}`} className="text-orange-600 hover:underline font-medium">
                        {selectedConversation.place.name}
                      </Link>
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p className="text-base font-medium">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.sender.id === user.id
                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`flex items-start gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                            {!isOwn && (
                              <Avatar className="w-8 h-8 flex-shrink-0 border border-gray-200">
                                {message.sender.avatarUrl ? (
                                  <Image
                                    src={message.sender.avatarUrl}
                                    alt={message.sender.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                    {message.sender.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isOwn 
                                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                              <p className={`text-xs mt-1.5 ${isOwn ? "text-orange-100" : "text-gray-500"}`}>
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-xl">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="min-h-[60px] resize-none border-gray-300 focus:border-orange-500"
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-auto px-4"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

