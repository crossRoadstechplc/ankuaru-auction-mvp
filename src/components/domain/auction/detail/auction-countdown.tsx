"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type AuctionPhase = "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED"

export interface AuctionCountdownProps {
  phase: AuctionPhase
  days: number
  hours: number
  minutes: number
  seconds: number
  /** When phase is SCHEDULED, shows time until start instead */
  timeUntilStart?: { days: number; hours: number; minutes: number; seconds: number }
  className?: string
}

const PHASE_CONFIG: Record<AuctionPhase, { label: string; bg: string }> = {
  SCHEDULED: { label: "Auction Starts In", bg: "bg-blue-600 dark:bg-blue-600/90" },
  OPEN:      { label: "Auction Ends In",   bg: "bg-primary dark:bg-primary/90" },
  REVEAL:    { label: "Reveal Phase",      bg: "bg-orange-600 dark:bg-orange-600/90" },
  CLOSED:    { label: "Auction Closed",    bg: "bg-slate-700" },
}

export function AuctionCountdown({
  phase,
  days,
  hours,
  minutes,
  seconds,
  timeUntilStart,
  className,
}: AuctionCountdownProps) {
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.OPEN
  const isScheduled = phase === "SCHEDULED"
  const isClosed = phase === "CLOSED"
  const isReveal = phase === "REVEAL"

  const display = isScheduled && timeUntilStart ? timeUntilStart : { days, hours, minutes, seconds }

  // SVG circle for the progress ring
  const circleRadius = 80
  const circleCircumference = 2 * Math.PI * circleRadius

  return (
    <div className={cn(`${config.bg} rounded-xl p-6 text-white shadow-lg shadow-black/10`, className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80 text-center">
        {config.label}
      </p>

      {/* Active Countdown (OPEN or SCHEDULED) */}
      {!isClosed && !isReveal && (
        <div className="flex flex-col items-center">
          {/* Circular Progress Ring */}
          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
              <circle cx="100" cy="100" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle
                cx="100" cy="100" r={circleRadius} fill="none"
                stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleCircumference * 0.25}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {display.days > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-0.5">
                  {display.days}d remaining
                </p>
              )}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-bold opacity-80">{String(display.hours).padStart(2, "0")}</span>
                <span className="text-xs opacity-50">h</span>
                <span className="text-sm font-bold opacity-80">{String(display.minutes).padStart(2, "0")}</span>
                <span className="text-xs opacity-50">m</span>
              </div>
              <p
                className="text-5xl font-black tabular-nums leading-none tracking-tight"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)", animation: "secondsPulse 1s ease-in-out infinite" }}
              >
                {String(display.seconds).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">Seconds</p>
            </div>
          </div>
          {isScheduled && (
            <div className="text-center mt-2">
              <p className="text-xs opacity-70">Auction has not started yet</p>
            </div>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {isReveal && (
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl mb-2">visibility</span>
          <p className="text-sm">Bids are now closed. Please wait for the creator to reveal bids.</p>
        </div>
      )}

      {/* Closed Phase */}
      {isClosed && (
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl mb-2">lock</span>
          <p className="text-sm">Auction has ended</p>
        </div>
      )}
    </div>
  )
}
