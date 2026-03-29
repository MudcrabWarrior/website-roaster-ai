// Validate URLs to prevent SSRF attacks
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  'metadata.google.internal',
  'metadata.google',
];

const BLOCKED_IP_RANGES = [
  /^127\./,          // Loopback
  /^10\./,           // Private class A
  /^172\.(1[6-9]|2\d|3[01])\./,  // Private class B
  /^192\.168\./,     // Private class C
  /^169\.254\./,     // Link-local / AWS metadata
  /^0\./,            // Current network
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./,  // Carrier-grade NAT
  /^198\.51\.100\./, // Documentation range
  /^203\.0\.113\./,  // Documentation range
  /^fc00:/i,         // IPv6 private
  /^fe80:/i,         // IPv6 link-local
  /^::1$/,           // IPv6 loopback
];

export function validateUrl(input: string): { valid: boolean; url: string; error?: string } {
  let urlString = input.trim();

  // Add protocol if missing
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    urlString = 'https://' + urlString;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, url: urlString, error: 'Invalid URL format.' };
  }

  // Only allow http and https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, url: urlString, error: 'Only HTTP and HTTPS URLs are allowed.' };
  }

  // Block numeric IPs and known internal hosts
  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, url: urlString, error: 'This URL is not allowed.' };
  }

  // Block IP addresses entirely (only allow domain names)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    for (const range of BLOCKED_IP_RANGES) {
      if (range.test(hostname)) {
        return { valid: false, url: urlString, error: 'This URL is not allowed.' };
      }
    }
  }

  // Block cloud metadata endpoints
  if (hostname === '169.254.169.254' || hostname.includes('metadata')) {
    return { valid: false, url: urlString, error: 'This URL is not allowed.' };
  }

  // Block non-standard ports commonly used for internal services
  if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
    return { valid: false, url: urlString, error: 'Non-standard ports are not allowed.' };
  }

  return { valid: true, url: urlString };
}
