// RedirectTo404.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RedirectTo404 = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/404')
  }, [navigate])

  return null
}

export default RedirectTo404
