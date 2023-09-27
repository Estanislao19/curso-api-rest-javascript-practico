const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  },
});

function likedMoviesList(){//objetivo de esta funcion devolvernos las peliculas guardadas en localStorage
  const item = JSON.parse(localStorage.getItem('liked_movies'))//que me devuelva lo que hayamos gurdado en liked_movies
  let movies;
  
  if(item){ //si item tiene algo
    movies = item;
  }else {
    movies = {} //sino tiene nada el localStorage
  }

  return movies;
}
function likedMovie(movie){
  //movie.id, cada pelicula tiene un id

  const likedMovies = likedMoviesList();//guardo la lista de peliculas en una variable
  console.log(likedMovies);

  if(likedMovies[movie.id]){//si dentro de likedMovies tengo el id que estoy recibiendo

    likedMovies[movie.id] = undefined //eliminamos la pripiedad de la peli del objeto de likedMovies
  }else {
    likedMovies[movie.id] = movie //si la pelicula no existia dentro de likedMovie deberiamos GUARDARLA
  }

  localStorage.setItem('liked_movies',JSON.stringify(likedMovies)) //la nueva lista no va a tener lo que le estamos quitando
}


// Utils

//Creaccion del lazy loading
//entries cada uno de los elementos que observamos
const lazyLoader = new IntersectionObserver((entries)=>{//en las options, no voy a enviar nada pq el lazyLoader lo voy a utilizar para todas las imagenes
entries.forEach((entry)=>{//vamos a recibir cada uno de los elementos que estemos observando en nuestro IntersectionObserver
  if(entry.isIntersecting){//si tiene la propiedad que puedne ver los usuarios como true
    const url = entry.target.getAttribute('data-img')//para agarrar el valor de ese atributo
  entry.target.setAttribute('src',url)//el valor de data-img se lo vamos a insertar a el valor src
  }
  
})
});


function createMovies(movies, container,{lazyLoad = false,clean=true}= {}) {//preguntamos si quieren que tengan lazyLoad, clean por defecto queremos que siempre nos limpie nuestro contenedor
  if(clean) {//si esa variable clean me llega como false, no quiero que me lo limpie, asi nos permite seguir insertando las pelis hacia abajo
    container.innerHTML = ''
  }

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    
    movieImg.setAttribute(
      lazyLoad ? 'data-img' : 'src', //si lazyLoader es true lo voy a agregar a data-img
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );
   movieImg.addEventListener('click', () => { //el click lo va a recibir la imagen
      location.hash = '#movie=' + movie.id;
    });
    movieImg.addEventListener('error',()=>{ //que escuche al evento de error  
      movieImg.setAttribute('src','https://static1-es.millenium.gg/articles/4/37/30/4/@/174653-montana-article_m-1.jpg') //agregarle una imagen por defecto cuando no cargue la img
    })

    const movieBtn = document.createElement('button');
    movieBtn.classList.add('movie-btn')//boton para cualquier pelicula
    likedMoviesList([movie.id] && movieBtn.classList.add('movie-btn--liked'))
    movieBtn.addEventListener('click', ()=> { //al darle click agregue la pelicula en favorito
      movieBtn.classList.toggle('movie-btn--liked')//agregue o quiete la clase 
      //Deberiamos agregar la pelicula al localStorage
      likedMovie(movie)

    })

    if(lazyLoad){ //si es true voy a mostrar el lazyloader
      lazyLoader.observe(movieImg)
    }

    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn)
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach(category => {  
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
  
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies)

  createMovies(movies, trendingMoviesPreviewList, true);//ese true es del lazyLoad
}

async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxpage = data.total_pages

  createMovies(movies, genericSection,{lazyLoad:true});
}

function getPaginatedMoviesByCategory(id) {
  return async function () { //gracias a los clousure vamos a poder utilizar query dentro de la funcion
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;
    
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxpage;
  
    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api('discover/movie', {
        params: {
          with_genres: id,
          page
        },
      });
      const movies = data.results;
      maxpage = data.total_pages
    
      createMovies(
        movies,
        genericSection,
        { lazyLoad: true, clean: false },
      );
    }
  }
}


async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;

  maxpage = data.total_pages 
  console.log(maxpage);

  createMovies(movies, genericSection);
}

function getPaginatedMoviesBySearch(query) {
  return async function () { //gracias a los clousure vamos a poder utilizar query dentro de la funcion
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;
    
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxpage;
  
    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api('search/movie', {
        params: {
          query,
          page,
        },
      });
      const movies = data.results;
    
      createMovies(
        movies,
        genericSection,
        { lazyLoad: true, clean: false },
      );
    }
  }
}
async function getTrendingMovies() {//tendencias
  const { data } = await api('trending/movie/day');
  const movies = data.results;
 maxpage = data.total_pages //son 1000 paginas, lo maximo de paginas de la api

  createMovies(movies, genericSection, {lazyLoad:true, clean:true}); //quiero que tenga lazyLoad, 

 /* const btnLoadMore = document.createElement('button')
  btnLoadMore.innerText = 'Cargar mas'
  btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)//cuando le demos click que queremos ejecutar
  genericSection.appendChild(btnLoadMore);*/
  
}



async function getPaginatedTrendingMovies(){//paginacion de la paginas de las peliculas en tendencias
  const {scrollTop,scrollHeight,clientHeight} = document.documentElement
  
  const scrollIsBottom =(scrollTop + clientHeight) >= scrollHeight - 15
  const pageIsNotMax = page < maxpage //vamos a validar si la pagina en la que estamos es menor a la paginaMaxima

  if(scrollIsBottom && pageIsNotMax) {
    page++ //cada vez que entre a esta funcion page se sume en 1++
    const { data } = await api('trending/movie/day',{
      params :{
        page//qe reciba la variable page
      }
    });
    const movies = data.results;
    
  
    createMovies(movies, genericSection,{lazyLoad:true,clean:false});//quiero que no  me limpie y me borre la primera pagina
  
  }


  /*const btnLoadMore = document.createElement('button')
  btnLoadMore.innerText = 'Cargar mas'
  btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)//cuando le demos click que queremos ejecutar
  genericSection.appendChild(btnLoadMore);*/
}

async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;
  
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
}

function getLikedMovies(){
  const likedMovies = likedMoviesList(); //para obtener la lista de peliculas en localStorage
  const moviesArray = Object.values(likedMovies) //para convertir un array con todas las propiedades del objeto
  createMovies(moviesArray, likedMoviesListArticle,{lazyLoad:true,clean:true})
  console.log(likedMovies);
}

