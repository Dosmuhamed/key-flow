export type Os = 'mac' | 'win'

interface NavigatorUAData {
  platform?: string
}

/** Detects the visitor's OS once; anything that isn't Apple gets the PC keyboard. */
function detectOs(): Os {
  if (typeof navigator === 'undefined') return 'win'
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData
  const hint = uaData?.platform || navigator.platform || navigator.userAgent
  return /mac|iphone|ipad|ipod/i.test(hint) ? 'mac' : 'win'
}

export const OS: Os = detectOs()
