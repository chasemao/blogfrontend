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
        console.log(response.data);
        setList(response.data);
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
            <Link to={`/article/${item.id}`} key={index}>
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

function ArticleDetail() {
  console.log('ArticleDetail');
  const { id } = useParams(); // Get the article ID from the route parameters
  const [article, setArticle] = useState({});

  useEffect(() => {
    axios.get(`/api/article/${id}`)
      .then(response => {
        console.log(response.data);
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
        <p>{article.content}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    // why use BrowserRouter, because Link component relay on it
    <div className="App">
      <header className="App-header">
        <h1>{header}</h1>
      </header>
        <BrowserRouter>
          <Routes>
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="" element={<ArticalList />} />
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
