"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"

type Reservation = {
  id: string
  reservationDate: string
  reservationTime: string
  partySize: number
  specialRequests?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  place: {
    id: string
    name: string
  }
}

type Props = {
  token: string | null
  user: { id: string; email: string; name?: string } | null
}

const statusBadgeStyles: Record<Reservation["status"], string> = {
  pending: "bg-yellow-500 text-gray-900",
  confirmed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
  completed: "bg-blue-500 text-white",
}

export function BusinessReservationsSection({ token, user }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Reservation["status"] | "all">("all")

  useEffect(() => {
    if (token && user) {
      loadReservations()
      // Poll for new reservations every 10 seconds
      const interval = setInterval(loadReservations, 10000)
      return () => clearInterval(interval)
    }
  }, [token, user])

  const loadReservations = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const data = await api.get<Reservation[]>("/reservations", { auth: token })
      setReservations(data)
    } catch (err) {
      console.error("Failed to load reservations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (reservationId: string, newStatus: Reservation["status"]) => {
    if (!token) return
    try {
      await api.patch(`/reservations/${reservationId}`, { status: newStatus }, { auth: token })
      await loadReservations()
    } catch (err) {
      console.error("Failed to update reservation:", err)
    }
  }

  const filteredReservations = reservations.filter(
    (res) => statusFilter === "all" || res.status === statusFilter
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!token || !user) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Reservation["status"] | "all")}>
          <SelectTrigger className="w-48 border-2 border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && reservations.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-base">No reservations {statusFilter !== "all" ? `with status "${statusFilter}"` : ""} yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-gray-900">{reservation.user.name}</h4>
                    <Badge className={`${statusBadgeStyles[reservation.status]} font-semibold px-3 py-1`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-4">{reservation.place.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{formatDate(reservation.reservationDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{formatTime(reservation.reservationTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}</span>
                    </div>
                    {reservation.contactPhone && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Phone:</span> {reservation.contactPhone}
                      </div>
                    )}
                  </div>
                  {reservation.contactEmail && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Email:</span> {reservation.contactEmail}
                    </div>
                  )}
                  {reservation.specialRequests && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Special Requests:</p>
                      <p className="text-sm text-gray-600">{reservation.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
              {reservation.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(reservation.id, "confirmed")}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(reservation.id, "cancelled")}
                    className="border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
              {reservation.status === "confirmed" && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(reservation.id, "completed")}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(reservation.id, "cancelled")}
                    className="border-red-300 text-red-700 hover:bg-red-50 font-semibold"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

