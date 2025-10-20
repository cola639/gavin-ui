let lastTouchEnd = 0
document.addEventListener(
  'touchstart',
  event => {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  },
  { passive: false }
)

document.addEventListener(
  'touchend',
  event => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  { passive: false }
)

document.addEventListener(
  'gesturestart',
  event => {
    event.preventDefault()
  },
  { passive: false }
)
