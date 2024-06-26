document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const homeLink = document.getElementById('homeLink');
  const newsLink = document.getElementById('newsLink');
  const favoritesLink = document.getElementById('favoritesLink');
  const searchBar = document.getElementById('searchBar');
  const searchButton = document.getElementById('searchButton');
  const yearSpan = document.getElementById('year');
  yearSpan.textContent = new Date().getFullYear();

  function loadHome() {
    content.innerHTML = `
      <div>
        <h1>Home</h1>
        <div class="form-control">
          <label for="newsType">News Type:</label>
          <select id="newsType">
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div class="form-control">
          <label for="newsCountry">Country:</label>
          <select id="newsCountry">
            <option value="in">India</option>
            <option value="us">USA</option>
            <option value="gb">UK</option>
          </select>
        </div>
        <button id="loadNewsButton">Load News</button>
      </div>
    `;

    document.getElementById('loadNewsButton').addEventListener('click', () => {
      const type = document.getElementById('newsType').value;
      const country = document.getElementById('newsCountry').value;
      loadNews(1, type, country);
    });
  }

  function loadNews(page = 1, type = 'sports', country = 'in', query = '') {
    content.innerHTML = '<div>Loading news...</div>';
    fetchNews(page, type, country, query);
  }

  function fetchNews(page, type, country, query) {
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${type}&pageSize=6&page=${page}&apiKey=a3d59420be644414bf7aca4e31ca1648`;
    if (query) {
      url = `https://newsapi.org/v2/everything?q=${query}&pageSize=6&page=${page}&apiKey=a3d59420be644414bf7aca4e31ca1648`;
    }
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const articles = data.articles;
        if (articles.length > 0) {
          content.innerHTML = '<div class="news-grid">' + articles.map((article, index) => `
            <div class='news-article' data-index='${index}'>
              <h2><b class='news-icon'>👉</b><b class='news-title'>${article.title}</b></h2>
              <p>${article.description}</p>
              <img src='${article.urlToImage}' alt='article_image'>
              <p class='news-date'>Published on: ${new Date(article.publishedAt).toLocaleDateString()}</p>
              <span class='favorite-icon' onclick='toggleFavorite(${index})'>&hearts;</span>
            </div>
          `).join('') + '</div>' + `
            <div class='pagination'>
              <button onclick='changePage(${page - 1}, "${type}", "${country}", "${query}")' ${page === 1 ? 'disabled' : ''}>prev</button>
              <button onclick='changePage(${page + 1}, "${type}", "${country}", "${query}")'>next</button>
            </div>
          `;
          highlightFavorites();
        } else {
          content.innerHTML = '<p>No news available</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching news:', error);
        content.innerHTML = '<p>Error loading news</p>';
      });
  }

  window.changePage = function(newPage, type, country, query) {
    if (newPage > 0) {
      fetchNews(newPage, type, country, query);
    }
  }

  function loadFavorites() {
    const favorites = getFavorites();
    if (favorites.length > 0) {
      content.innerHTML = '<div class="news-grid">' + favorites.map((article, index) => `
        <div class='news-article'>
          <h2><b class='news-icon'>👉</b><b class='news-title'>${article.title}</b></h2>
          <p>${article.description}</p>
          <img src='${article.urlToImage}' alt='article_image'>
          <p class='news-date'>Published on: ${new Date(article.publishedAt).toLocaleDateString()}</p>
        </div>
      `).join('') + '</div>';
    } else {
      content.innerHTML = '<p>No favorite news available</p>';
    }
  }

  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }

  window.toggleFavorite = function(index) {
    const articles = Array.from(document.querySelectorAll('.news-article'));
    const article = articles[index];
    const title = article.querySelector('.news-title').innerText;
    const description = article.querySelector('p').innerText;
    const urlToImage = article.querySelector('img').src;
    const publishedAt = article.querySelector('.news-date').innerText.replace('Published on: ', '');

    const articleData = { title, description, urlToImage, publishedAt };
    const favorites = getFavorites();
    const isFavorite = favorites.some(fav => fav.title === articleData.title);

    if (isFavorite) {
      const updatedFavorites = favorites.filter(fav => fav.title !== articleData.title);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      article.querySelector('.favorite-icon').classList.remove('liked');
    } else {
      favorites.push(articleData);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      article.querySelector('.favorite-icon').classList.add('liked');
    }
  }

  function highlightFavorites() {
    const favorites = getFavorites();
    const articles = Array.from(document.querySelectorAll('.news-article'));
    articles.forEach(article => {
      const title = article.querySelector('.news-title').innerText;
      if (favorites.some(fav => fav.title === title)) {
        article.querySelector('.favorite-icon').classList.add('liked');
      }
    });
  }

  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadHome();
  });

  newsLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadNews();
  });

  favoritesLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadFavorites();
  });

  searchButton.addEventListener('click', () => {
    const query = searchBar.value;
    if (query) {
      loadNews(1, '', '', query);
    }
  });

  loadHome();
});
