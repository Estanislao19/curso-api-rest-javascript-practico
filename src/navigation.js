let maxpage;
let page = 1 //que empezemos en la pagina 1
let infiniteScroll;

searchFormBtn.addEventListener('click', ()=> {//quiero escuchar cuando le den click al boton, y al darle click me llve al search
   
    location.hash = '#search=' + searchFormInput.value; //cada vez que le demos click al boton vamos a buscar el valor
})

trendingBtn.addEventListener('click', ()=> {//quiero escuchar cuando le den click al boton, y al darle click me llve al trends de tendencias
    location.hash = '#trends='
})


//Cada vez que le de click a la flechita me lleve al home
arrowBtn.addEventListener('click',()=>{
    history.back()
    //location.hash = '#home'
})

window.addEventListener('DOMContentLoaded' ,navigator,false)//cuandocargue la app
window.addEventListener('hashchange' ,navigator,false) //para llamar a navigator cuando cambie el hash
window.addEventListener('scroll',infiniteScroll,false)//voy a escuchar cualquier scroll que haya en la app,infiniteScroll funcion que vamos a llamar cada vez que queramos hacer un scroll infinito

function navigator () {//se ejecuta cada vez que cargamos la pagina y cambiamos de ruta
    console.log({location});


    if(infiniteScroll) {//si tiene algun valor la variable infinityScroll
       window.removeEventListener('scroll',infiniteScroll,{passive:false}) //si tiene algun valor lo voy a QUITAR
       infiniteScroll =undefined 
    }
    if(location.hash.startsWith('#trends')){//para mostrar la lista de tendencia
        trendsPage()
    }else if(location.hash.startsWith('#search=')) { //busquedas
        searchPage()
    }else if(location.hash.startsWith('#movie=')){ 
        movieDetailsPage()
    }else if (location.hash.startsWith('#category=')) { //Detalles de una pelicula
       categoriesPage()
    } else {//Cada vez que llamos a la funcion navigator y estamos en el home, llamamis a la funcion home
        homePage()
    }


   // document.body.scrollTop = 0; //para que siempre las categorias aparezcan arriba con el scroll y no abajo
    document.documentElement.scrollTop = 0;

    if(infiniteScroll){// si en alguna de las funciones de navigator agregamos infinityScroll
       window.addEventListener('scroll',infiniteScroll,{passive:false}) 
    }
}

//add= para ocultar

function homePage () {
    console.log('Home!!');

    headerSection.classList.remove('header-container--long') //no queremos que tenga esta clase ya que es para mobile
    headerSection.style.background = ''
    arrowBtn.classList.add('inactive')//ya que estamos en el home y no necesesitamos la flechita para volver hacia atras
    arrowBtn.classList.remove('header-arrow--white')
    headerCategoryTitle.classList.add('inactive'); 
    headerTitle.classList.remove('inactive'); //necesitamos que se muestre el titulo
    searchForm.classList.remove('inactive') //queremos que se muestre el formulario de busqueda
    likedMoviesSection.classList.remove('inactive')
    trendingPreviewSection.classList.remove('inactive')
    categoriesPreviewSection.classList.remove('inactive')
    genericSection.classList.add('inactive')
    movieDetailSection.classList.add('inactive')

    getTrendingMoviesPreview()
    getCategegoriesPreview()
    getLikedMovies()
}
function categoriesPage () {
    console.log('categories');

    headerSection.classList.remove('header-container--long') //queremos que tenga esta clase ya que es para mobile
    // headerSection.style.background = '';
     arrowBtn.classList.remove('inactive')//queremos que aparezca la flecha
     arrowBtn.classList.remove('header-arrow--white') //para que aparezca la flechita en moradito
     headerCategoryTitle.classList.remove('inactive'); 
     headerTitle.classList.add('inactive'); //necesitamos que se muestre el titulo
     searchForm.classList.add('inactive') //queremos que se muestre el formulario de busqueda

 
     trendingPreviewSection.classList.add('inactive')
     likedMoviesSection.classList.add('inactive')
     categoriesPreviewSection.classList.add('inactive')
     genericSection.classList.remove('inactive')
     movieDetailSection.classList.add('inactive')
     
    const [_,categoryData] = location.hash.split('=') //lugar donde esta toda la url, cada vez que nos encontremos un = en la url que lo separe, lo que este antes del = va a ser el primer elemento, lo que este despues el segundo elemento
    const [categoryId,categoryName] = categoryData.split('-')
  
    headerCategoryTitle.innerHTML = categoryName //para que le aparezca el nombre de la cateogoria
     getMoviesByCategory(categoryId)

     infiniteScroll = getPaginatedMoviesByCategory(categoryId)
 
}
function movieDetailsPage() {
    console.log('Movie!!');

   
        
    headerSection.classList.add('header-container--long') //no queremos que tenga esta clase ya que es para mobile
    headerSection.style.background = ''
    arrowBtn.classList.remove('inactive')//queremos que aparezca la flecha
    arrowBtn.classList.add('header-arrow--white')
    headerCategoryTitle.classList.add('inactive'); 
    headerTitle.classList.add('inactive'); //necesitamos que se muestre el titulo
    searchForm.classList.add('inactive') //queremos que se muestre el formulario de busqueda
    likedMoviesSection.classList.add('inactive')
    trendingPreviewSection.classList.add('inactive')
    categoriesPreviewSection.classList.add('inactive')
    genericSection.classList.add('inactive')
    movieDetailSection.classList.remove('inactive');

    const [_,movieId] = location.hash.split('=')//la parte del hash de la url
    
    getMovieById(movieId);
}

function searchPage () {
    console.log('Search!!'); 

    headerSection.classList.remove('header-container--long') //queremos que tenga esta clase ya que es para mobile
    // headerSection.style.background = '';
     arrowBtn.classList.remove('inactive')//queremos que aparezca la flecha
     arrowBtn.classList.remove('header-arrow--white') //para que aparezca la flechita en moradito
     headerCategoryTitle.classList.add('inactive'); //paraa que no nos aparezca ninugn titulo
     headerTitle.classList.add('inactive'); //necesitamos que se muestre el titulo
     searchForm.classList.remove('inactive') //queremos que se muestre el formulario de busqueda
     likedMoviesSection.classList.add('inactive')
     trendingPreviewSection.classList.add('inactive')
     categoriesPreviewSection.classList.add('inactive')
     genericSection.classList.remove('inactive')
     movieDetailSection.classList.add('inactive')

     const [_,query] = location.hash.split('=')//la parte del hash de la url
     getMoviesBySearch(query)

     infiniteScroll = getPaginatedMoviesBySearch(query)
}

function trendsPage(){
    console.log('TRENDSS!!'); 

    headerSection.classList.remove('header-container--long') //queremos que tenga esta clase ya que es para mobile
    // headerSection.style.background = '';
     arrowBtn.classList.remove('inactive')//queremos que aparezca la flecha
     arrowBtn.classList.remove('header-arrow--white') //para que aparezca la flechita en moradito
     headerCategoryTitle.classList.remove('inactive'); 
     headerTitle.classList.add('inactive'); //necesitamos que se muestre el titulo
     searchForm.classList.add('inactive') //queremos que se muestre el formulario de busqueda
     likedMoviesSection.classList.add('inactive')
     trendingPreviewSection.classList.add('inactive')
     categoriesPreviewSection.classList.add('inactive')
     genericSection.classList.remove('inactive')
     movieDetailSection.classList.add('inactive')

     headerCategoryTitle.innerHTML = 'Tendencias'   
     getTrendingMovies()
     infiniteScroll = getPaginatedTrendingMovies; //cada vez que carguemos la pagina de tendencia, le digo el nombre de la funcion que queremos que se ejecute cuando lleguemos al final del scroll
}

