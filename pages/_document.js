import Document, { Head, Main, NextScript } from 'next/document';
import Link from 'next/link';

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
      	<Head>
          <meta name="description" content="Hello There, My name is Oscar Beaumont, I am a high school student, developer and a tech enthusiast. This is my personal website and blog. Click Here to read more!" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="icon" type="image/x-icon" href="../static/favicon.ico" />
          <link rel="stylesheet" href="/static/css/apollo.css" />
          <link rel="search" type="application/opensearchdescription+xml" href="https://otbeaumont.me/atom.xml" title="Oscar Beaumont" />
      	</Head>
      	<body>
          <div className="wrap">
            <header>
              <Link href="/">
                <a className="logo-link">
                  <img src="/static/assets/logo-lite.png" alt="My Logo" />
                </a>
              </Link>

              <ul className="nav nav-list">
                <li className="nav-list-item">
                  <Link href="/">
                    <a className="nav-list-link">HOME</a>
                  </Link>
                </li>

                <li className="nav-list-item">
                  <Link href="/blog">
                    <a className="nav-list-link">BLOG</a>
                  </Link>
                </li>

                <li className="nav-list-item">
                  <Link href="/showcase">
                    <a className="nav-list-link">SHOWCASE</a>
                  </Link>
                </li>


                  <li className="nav-list-item">
                    <Link href="/contact">
                      <a className="nav-list-link">CONTACT</a>
                    </Link>
                  </li>

                <li className="nav-list-item">
                  <a href="https://github.com/oscartbeaumont" target="_blank" className="nav-list-link">GITHUB</a>
                </li>
              </ul>
            </header>
            <main className="container">
              <div className="post">
                <article className="post-block">
                  <div className="post-content">
                    <Main />
                  </div>
                </article>
              </div>
            </main>
            <footer>
              <div className="copyright">
                <p>© 2018 <a href="https://otbeaumont.me">Oscar Beaumont</a>, powered by <a href="https://hexo.io/" target="_blank" rel="external nofollow noopener noreferrer">Hexo</a> and a modified version of <a href="https://github.com/pinggod/hexo-theme-apollo" target="_blank">hexo-theme-apollo</a>.</p>
                <div className="services"><a href="https://github.com/oscartbeaumont" target="_blank" className="social-icon"><img src="/static/img/github.png" alt="Github" /></a><a href="https://open.spotify.com/user/oscartbeaumont" target="_blank" className="social-icon"><img src="/static/img/spotify.png" alt="Spotify" /></a><a href="mailto:oscartbeaumont@gmail.com" target="_blank" className="social-icon"><img src="/static/img/email.png" alt="Email" /></a><a href="https://otbeaumont.me/atom.xml" target="_blank" className="social-icon"><img src="/static/img/rss.png" alt="RSS" /></a></div>
              </div>
            </footer>
          </div>

      		<NextScript />
      	</body>
      </html>
    )
  }
}
