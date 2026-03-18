"use client"

import { useEffect, useState, useRef } from "react"

interface MetricCounterProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export function MetricCounter({
  end,
  duration = 2000,
  suffix = "",
  className = ""
}: MetricCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const steps = 60
    const increment = end / steps
    const interval = duration / steps

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= end) {
          clearInterval(timer)
          return end
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className={className}>
      {Math.round(count)}
      {suffix}
    </div>
  )
}
