interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

const LIMIT = 3 // 3 requests
const WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return true
  }

  if (now > entry.resetTime) {
    // Window has expired, reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return true
  }

  // Within window
  if (entry.count < LIMIT) {
    entry.count++
    return true
  }

  return false
}

export function getRemainingQuota(ip: string): number {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    return LIMIT
  }

  if (now > entry.resetTime) {
    return LIMIT
  }

  return Math.max(0, LIMIT - entry.count)
}

export function getResetTime(ip: string): number {
  const entry = rateLimitMap.get(ip)
  if (!entry) {
    return Date.now()
  }
  return entry.resetTime
}
