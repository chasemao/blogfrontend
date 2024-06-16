import React, { useEffect, useState } from 'react';
import { Link, BrowserRouter, Routes, Route, useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { header, introduction } from './staticData'; // Assuming staticData.js exports are TypeScript compatible

interface Article {
  title: string;
  content: string;
}

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
    <div className="App-body">
      <div className="App-left">
        {list.map((item, index) => (
          <div key={index}>
            <Link className="link-list-item" to={`/article/${item.title}`}>
              {item.title}
            </Link>
          </div>
        ))}
      </div>
      <div className="App-right">
        {introduction}
      </div>
    </div>
  );
}

function convertToHTML(str: string | null | undefined): string {
  if (!str) {
    return "";
  }

  // Replace newline characters with <p> tags
  const htmlString = str.replace(/\n/g, '</p><p>');

  // Wrap the entire string with <p> tags
  const wrappedHTML = `<p>${htmlString}</p>`;

  // Add CSS to preserve leading spaces
  const styledHTML = `<style>
    p {
      white-space: pre-wrap;
    }
  </style>
  ${wrappedHTML}`;

  return styledHTML;
}

function ArticleDetail() {
  const { title } = useParams<{ title: string }>(); // Define type for title as string
  const [article, setArticle] = useState<Article>({ title: '', content: '' });
  const [error, setError] = useState<boolean>(false);

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

  if (error) {
    return (
      <NotFound />
    );
  }

  return (
    <div className="App-body">
      <div className="App-left">
        <h2>{article.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: convertToHTML(article.content) }} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      Page not found <a href='/'>back to front page</a>
    </div>
  )
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
          <Route path="/article/:title" element={<ArticleDetail />} />
          <Route path="" element={<ArticalList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
