import React, { useEffect, useState } from 'react';
import { IntlProvider, MessageFormatElement } from 'react-intl';
import { useSelector } from 'store'; // 确保这个路径正确

// load locales files success then load children
const loadLocaleData = (locale: string) => {
  switch (locale) {
    case 'zh':
      return import('./languages/zh.json');
    case 'en':
      return import('./languages/en.json');
    default:
      return import('./languages/en.json');
  }
};

interface LocalsProps {
  children: React.ReactNode;
}

const Locales = ({ children }: LocalsProps) => {
  const { language } = useSelector((state) => state.lang);
  const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>();
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态

  useEffect(() => {
    setIsLoading(true); // 开始加载时设置为true
    loadLocaleData(language).then((d: { default: Record<string, string> | Record<string, MessageFormatElement[]> | undefined }) => {
      setMessages(d.default);
      setIsLoading(false); // 加载完成后设置为false
    });
  }, [language]);

  // 等待语言包加载完毕
  if (isLoading) {
    console.info('Loading language...');
    return;
  } else {
    return (
      <IntlProvider locale={language} messages={messages}>
        {children}
      </IntlProvider>
    );
  }
};

export default Locales;
