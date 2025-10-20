import './index.css'
import png404 from 'assets/images/404_images/404.png'
import pngCloud from 'assets/images/404_images/404.png'

const NotFound = () => {
  document.title = '页面未找到'
  const message = 'The webmaster said that you can not enter this page...'

  return (
    <div className="wscn-http404-container">
      <div className="flex-column wscn-http404">
        <div className="pic-404">
          <img className="pic-404__parent" src={png404} alt="404" />
          <img className="pic-404__child left" src={pngCloud} alt="404" />
          <img className="pic-404__child mid" src={pngCloud} alt="404" />
          <img className="pic-404__child right" src={pngCloud} alt="404" />
        </div>
        <div className="bullshit">
          <div className="bullshit__oops">{message}</div>
          {/* <div className="bullshit__info">
            All rights reserved
            <a
              style={{ color: '#20a0ff' }}
              href="https://wallstreetcn.com"
              target="_blank"
              rel="noreferrer"
            >
              wallstreetcn
            </a>
          </div>
          <div className="bullshit__headline">{message}</div> */}
          {/* <div className="bullshit__info">
            Please check that the URL you entered is correct, or click the button below to return to
            the homepage.
          </div> */}
          {/* <a href="/" className="bullshit__return-home">
            回到首页
          </a> */}
        </div>
      </div>
    </div>
  )
}

export default NotFound
