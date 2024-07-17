import React, { useEffect, useState } from 'react';
import { Link, BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { header, introduction } from './staticData';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {prism} from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from "remark-gfm";
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import { Helmet } from 'react-helmet';

interface Article {
  title: string;
  ctime: string,
  content: string;
}

function GoogleAnalytics() {
  return (
    <Helmet>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-F6K80FT3TZ"></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            window.dataLayer.push(arguments);
          }
          gtag('js', new Date());
          gtag('config', 'G-F6K80FT3TZ');
        `}
      </script>
    </Helmet>
  );
};

function ArticalList() {
  const [list, setList] = useState<Article[]>([]);

  useEffect(() => {
    axios.post<{code: number, data: Article[]}>('/api/article/list')
      .then(response => {
        console.log(response);
        if (!response || !response.data || response.data.code !== 0) {
          console.error('Error fetching the list: ', response.data);
          return;
        }
        if (response.data.data) {
          setList(response.data.data);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the list!', error);
      });
  }, []);

  return (
    <>
      <GoogleAnalytics/>
      <div className="App-body">
        <div className="App-list">
          {list.map((item, index) => (
            <div className="link-list-item" key={index}>
              <Link className="link-list-item-title" to={`/article/${item.title.replace(/ /g, "-")}`}>
                {item.title}
              </Link>
              <div className="link-list-item-ctime">{item.ctime}</div>
            </div>
          ))}
        </div>
        <div className="App-introduction">
            <a href="https://www.linkedin.com/in/chase-mao" target="_blank">
              <img src="/linkedin.ico" alt="Linkedin profile"/>
            </a>
            <a href="https://github.com/chasemao" target="_blank">
              <img src="/git.ico" alt="Github profile"/>
            </a>
          {introduction}
        </div>
      </div>
    </>
  );
}

function ArticleDetail() {
  // Format title, replace "-" with " "
  var { title } = useParams<{ title: string }>();
  if (!title) {
    title = ""
  }
  title = title.replace(/-/g, " ")

  // Set default value for article
  const [article, setArticle] = useState<Article>({ title: '', ctime:'', content: '' });
  const [error, setError] = useState<boolean>(false);

  // Fetch article content
  useEffect(() => {
    axios.post<{ code: number; data: Article }>('/api/article/get', {
      title: title,
    })
      .then(response => {
        if (!response || !response.data || response.data.code !== 0) {
          console.error('Error fetching the article: ', response.data);
          setError(true);
          return;
        }
        if (response.data.data) {
          setArticle(response.data.data);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the article!', error);
        setError(true);
      });
  }, [title]);

  // If error then redirect to 404
  if (error) {
    return (
      <RedirectToNotFound />
    );
  }

  // When no article, render none
  if (!article || article.title === "") {
    return null;
  }

  // Normal render
  return (
    <>
      <Helmet>
        <title>{article.title}</title>
      </Helmet>
      <GoogleAnalytics/>
      <div className="App-body">
        <div className="App-detail">
          <h1>{article.title}</h1>
          <div>Chase Mao</div>
          <div>{article.ctime}</div>
          <ReactMarkdown
            className="markdown"
            remarkPlugins={[remarkGfm, remarkToc]}
            rehypePlugins={[rehypeSlug]}
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={prism}
                    PreTag="div"
                    language={match[1]}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={className}
                    style={{
                      background: 'rgb(245, 242, 240)',
                      padding: '5px',
                    }}
                    {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}

const generateId = (children: React.ReactNode | undefined) => {
  if (!children || typeof children !== 'string') {
    return '';
  }
  return children[0].toLowerCase().replace(/\s+/g, '-');
};

function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 NOT FOUND</title>
      </Helmet>
      <GoogleAnalytics/>
      <div className="not-found">
        Page not found <a href='/'>back to front page</a>
      </div>
    </>
  )
}

function RedirectToNotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/404");
  });
  return null;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>{header}</h1>
        </a>
      </header>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ArticalList />} />
          <Route path="/article/:title" element={<ArticleDetail />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<RedirectToNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
