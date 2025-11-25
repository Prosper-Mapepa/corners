"use client"

import { useState } from "react"
import { X, Calendar, Clock, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { TIME_OPTIONS } from "@/lib/form-options"

type Props = {
  placeId: string
  placeName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Convert 12-hour format (e.g., "12:30 PM") to 24-hour format (e.g., "12:30")
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(" ")
  let [hours, minutes] = time.split(":")
  if (hours === "12") {
    hours = modifier === "AM" ? "00" : "12"
  } else if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12)
  }
  return `${hours.padStart(2, "0")}:${minutes}`
}

export function ReservationModal({ placeId, placeName, isOpen, onClose, onSuccess }: Props) {
  const { token, user } = useAuth()
  const [formData, setFormData] = useState({
    reservationDate: "",
    reservationTime: "",
    partySize: 2,
    specialRequests: "",
    contactPhone: "",
    contactEmail: user?.email || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !user) {
      setError("Please sign in to make a reservation")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      await api.post(
        "/reservations",
        {
          placeId,
          reservationDate: formData.reservationDate,
          reservationTime: formData.reservationTime,
          partySize: formData.partySize,
          specialRequests: formData.specialRequests || undefined,
          contactPhone: formData.contactPhone || undefined,
          contactEmail: formData.contactEmail || undefined,
        },
        { auth: token }
      )

      setSuccess(true)
      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
        setSuccess(false)
        setFormData({
          reservationDate: "",
          reservationTime: "",
          partySize: 2,
          specialRequests: "",
          contactPhone: "",
          contactEmail: user?.email || "",
        })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Make Reservation: {placeName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservation Requested!</h3>
              <p className="text-gray-600">Your reservation has been submitted. The business will confirm shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={formData.reservationDate}
                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select
                    value={formData.reservationTime}
                    onValueChange={(value) => setFormData({ ...formData, reservationTime: value })}
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={convertTo24Hour(time)}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partySize">Party Size</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="partySize"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any dietary restrictions, seating preferences, etc."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Reservation"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

