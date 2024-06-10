import React, { useEffect, useState } from 'react';
import { Link, BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import {header, introduction} from './staticData.js';


function ArticalList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get('/api/article/list')
      .then(response => {
        if (response.data != null) {
          setList(response.data);
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
          <div>
            <Link className="link-list-item" to={`/article/${item.id}`} key={index} target="_blank">
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

function convertToHTML(str) {
  if (str == null) {
    return ""
  }
  // Replace newline characters with <p> tags
  const htmlString = str.replace(/\n/g, '</p><p>');
  
  // Wrap the entire string with <p> tags
  return `<p>${htmlString}</p>`;
}

function ArticleDetail() {
  const { id } = useParams(); // Get the article ID from the route parameters
  const [article, setArticle] = useState({});

  useEffect(() => {
    axios.get(`/api/article/${id}`)
      .then(response => {
        setArticle(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the article!', error);
      });
  }, [id]);

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
      PAGE NOT FOUND
    </div>
  )
}

function App() {
  return (
    // why use BrowserRouter, because Link component relay on it
    <div className="App">
      <header className="App-header">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>{header}</h1>
        </a>
      </header>
        <BrowserRouter>
          <Routes>
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="" element={<ArticalList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
