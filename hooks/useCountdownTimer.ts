import { useEffect, useState } from "react"

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isClosed: boolean
  shouldReveal: boolean
  isScheduled: boolean
  timeUntilStart?: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

export function useCountdownTimer(startAt: string, endAt: string, status: string) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    getTimeRemaining(startAt, endAt, status)
  )

  useEffect(() => {
    // Only tick for OPEN (countdown to end) or SCHEDULED (countdown to start)
    if (status !== "OPEN" && status !== "SCHEDULED") return
    // Also stop if already resolved
    if (timeLeft.isClosed) return

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(startAt, endAt, status)
      setTimeLeft(remaining)
      if (remaining.isClosed) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startAt, endAt, status, timeLeft.isClosed])

  return timeLeft
}

// Helper to calculate time remaining and determine auction status
function getTimeRemaining(
  startAt: string,
  endAt: string,
  status: string,
): TimeRemaining {
  const now = new Date().getTime()
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()

  // If auction is SCHEDULED, calculate time until start
  if (status === "SCHEDULED") {
    const startDiff = start - now

    if (startDiff <= 0) {
      // Should transition to OPEN, but still return as scheduled for safety
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isClosed: false,
        shouldReveal: false,
        isScheduled: true,
        timeUntilStart: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      }
    }

    const days = Math.floor(startDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    )
    const minutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((startDiff % (1000 * 60)) / 1000)

    return {
      days: 0, // Not relevant for scheduled
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: false,
      shouldReveal: false,
      isScheduled: true,
      timeUntilStart: { days, hours, minutes, seconds },
    }
  }

  // For OPEN, REVEAL, CLOSED status, calculate time until end
  const diff = end - now

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: true,
      shouldReveal: true,
      isScheduled: false,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isClosed: false,
    shouldReveal: false,
    isScheduled: false,
  }
}
