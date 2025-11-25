"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
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
  placeId: string
  placeName: string
  recipientEmail?: string
  isOpen: boolean
  onClose: () => void
}

export function MessageModal({ placeId, placeName, recipientEmail, isOpen, onClose }: Props) {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otherUserId, setOtherUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && token && user) {
      loadConversation()
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadConversation, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, token, user, placeId, recipientEmail])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversation = async () => {
    if (!token || !user) return

    try {
      setIsLoading(true)
      // First, get conversations to find the conversation with this place
      const conversations = await api.get<any[]>("/messages/conversations", { auth: token })
      const conversation = conversations.find((conv) => conv.place.id === placeId)

      if (conversation) {
        setOtherUserId(conversation.otherUser.id)
        // Load messages for this conversation
        const messagesData = await api.get<Message[]>(
          `/messages/conversation/${placeId}/${conversation.otherUser.id}`,
          { auth: token }
        )
        setMessages(messagesData)
      } else {
        // New conversation - messages will be empty
        setMessages([])
      }
    } catch (err) {
      console.error("Failed to load conversation:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!token || !user || !newMessage.trim()) return

    try {
      setIsSending(true)
      setError(null)

      await api.post(
        "/messages",
        {
          placeId,
          recipientId: otherUserId,
          content: newMessage.trim(),
        },
        { auth: token }
      )

      setNewMessage("")
      await loadConversation()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Message: {placeName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender.id === user?.id
                return (
                  <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start space-x-2 max-w-[70%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
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
                      <div className={`rounded-lg px-4 py-2 ${isOwn ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-orange-100" : "text-gray-500"}`}>
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="border-t p-4">
            <div className="flex space-x-2">
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
                className="min-h-[60px] resize-none"
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

