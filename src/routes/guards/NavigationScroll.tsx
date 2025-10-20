import { ReactElement, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { throttle } from 'lodash'

/**
 * NavigationScroll 组件
 *
 * 用于在页面间导航时记忆并恢复滚动位置
 * 当用户导航离开页面时，会在DOM更新之前记录当前页面的滚动位置，并存储在sessionStorage中
 * 当用户返回到此页面时，如果找到存储的滚动位置信息，则会恢复到之前的滚动位置，否则默认滚动到顶部。
 */
const NavigationScroll = ({ children }: { children: ReactElement | null }) => {
  const { pathname } = useLocation()
  const savePos = useRef<() => void>()

  // 在DOM更新前保存滚动位置
  useLayoutEffect(() => savePos.current && savePos.current())

  useEffect(() => {
    // 恢复滚动位置或滚动到顶部
    window.scrollTo(0, parseInt(sessionStorage.getItem(pathname) || '0'))

    savePos.current = () => sessionStorage.setItem(pathname, window.pageYOffset.toString())
  }, [pathname])

  // 监听滚动事件并保存滚动位置
  useEffect(() => {
    // 200ms记录滚动位置
    const handleScroll = throttle(() => savePos.current && savePos.current(), 200)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return children || null
}

export default NavigationScroll
