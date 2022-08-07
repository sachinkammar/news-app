const apikey = 'test';
const main = document.querySelector('#main');
const searchInput = document.querySelector('#q');
const search = document.querySelector('#form');
const pagination = document.getElementById('pagination');
const searchTitle = document.getElementById('search-info');

window.addEventListener('load', async e => {
    updateNews();
    // TODO: add search func   
    search.addEventListener('submit', e => {
        e.preventDefault();
        if(searchInput.value.length>0){
            Search(searchInput.value, 1, 10);
        } else {
            searchTitle.innerText = ``;
            pagination.replaceChildren();
            main.innerHTML = `<div style="width:100%;background:white"><p style="text-align:center">Search articles..</p></div>`
        }
    });
    q.addEventListener('keypress', e => {
        e = e || window.event;
        var charCode = e.keyCode || e.which;
        if (charCode === 13 && searchInput.value.length>0) {
            Search(searchInput.value, 1, 10);
            pagination.replaceChildren();
        }
    });
});

function createPageButton(innerText, value, pageSize, attachClickEvent=false) {
    const newButton = document.createElement('button');
    newButton.innerText = innerText;
    if(attachClickEvent) {
        newButton.onclick = function () {
            Search(searchInput.value, value, pageSize);
        };
    }
    newButton.style.marginRight = '8px';
    newButton.style.cursor = 'pointer';
    return newButton;
}

function createPagination(currentPage=1, pageSize=10, pages) {
    console.log("currentPage", currentPage, "pageSize", pageSize, "pages", pages);
    pagination.replaceChildren();

    //input to enter page number
    const newInput = document.createElement('input');
    newInput.type = 'number';
    newInput.max = pages;
    newInput.min = 1;
    newInput.value = currentPage;
    newInput.style.marginRight = '8px';
    newInput.onchange = function (e) {
        if(e.target.value>0 && e.target.value<pages) {
            Search(searchInput.value, e.target.value, pageSize);
        } else {
            newInput.value = currentPage;
        }
    };
    pagination.appendChild(newInput);

    const prevButton = document.createElement('button');
    prevButton.innerText = 'Prev';
    prevButton.onclick = function () {
        Search(searchInput.value, currentPage-1, pageSize);
    };
    if(currentPage===1) {
        prevButton.disabled = true;
    }
    prevButton.style.marginRight = '8px';
    prevButton.style.cursor = 'pointer';
    pagination.appendChild(prevButton);

    if(pages>currentPage && currentPage<pages) {
        let createdButton = createPageButton(currentPage, currentPage, pageSize, false);
        createdButton.style.backgroundColor = '#fff';
        createdButton.style.border = 'none';
        pagination.appendChild(createdButton);
    }
    if(pages>currentPage+1 && currentPage<pages) {
        let createdButton = createPageButton(currentPage+1, currentPage+1, pageSize, true);
        pagination.appendChild(createdButton);
    }
    if(pages>currentPage+2 && currentPage<pages) {
        let createdButton = createPageButton(currentPage+2, currentPage+2, pageSize, true);
        pagination.appendChild(createdButton);
    }
    if(pages>3) {
        const newSpan = document.createElement('span');
        newSpan.innerHTML = '...';
        newSpan.style.marginRight = '8px';
        pagination.appendChild(newSpan);
        let createdButton = createPageButton(pages, pages, pageSize, currentPage!==pages);
        if(currentPage===pages) {
            createdButton.style.backgroundColor = '#fff';
            createdButton.style.border = 'none';
        }
        pagination.appendChild(createdButton);
    }

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.onclick = function () {
        Search(searchInput.value, currentPage+1, pageSize);
    };
    if(currentPage===pages) {
        nextButton.disabled = true;
    }
    // nextButton.style.marginRight = '8px';
    nextButton.style.cursor = 'pointer';
    pagination.appendChild(nextButton);
}

async function updateNews() {
    const uri = 'https://content.guardianapis.com/search?api-key=test&show-fields=thumbnail,headline&show-tags=keyword&page=1&page-size=10'
    const res = await fetch(uri);
    const json = await res.json();
    generateRender(json)
}

function generateRender(json) {
    if(json.response.results.length===0) {
        pagination.replaceChildren();
        main.innerHTML = `
            <div style="width:100%;background:white">
                <p style="text-align:center">No article found.</p>
            </div>`;
        return;
    }
    main.innerHTML = json.response.results.map(createArticle).join("\n");
    if(json.response.pages>1) {
        createPagination(json.response.currentPage, pageSize=10, json.response.pages)
    } else {
        pagination.replaceChildren();
    }
    //way 1
    // const keywords = document.getElementsByClassName('tags');
    // for(keyword of keywords){
    //     keyword.addEventListener('click', (e)=>{
    //         e.preventDefault();
    //         Search(e.target.innerText)
    //     })
    // }
    const articles = json.response.results;
    let keywords = [];
    articles.forEach(element => {
        const articleKeywords = document.getElementById(element.id);
        keywords.push(articleKeywords);
    });  
    
    for(articleKeyword of keywords){
        articleKeyword.addEventListener('click', (e)=>{
            e.preventDefault();
            searchInput.value = e.target.innerText;
            Search(e.target.innerText);
        })
    }
}

async function Search(query, page=1, size=10) {
    pagination.style.visibility = 'hidden';
    main.innerHTML = `<div style="width:100%;background:white"><p style="text-align:center">Searching...</p></div>`;
    try {
        const uri = `https://content.guardianapis.com/search?api-key=test&q=${query}&show-fields=thumbnail,headline&show-tags=keyword&page=${page}&page-size=${size}`
        const res = await fetch(uri);
        const json = await res.json();
        pagination.style.visibility = 'visible';
        generateRender(json);
        searchTitle.innerText = `Results for ${searchInput.value}`;
    } catch(err) {
        searchTitle.innerText = '';
        main.innerHTML = `<div style="width:100%;background:white"><p style="text-align:center">Something went wrong. please try again!</p></div>`;
    }
}

function createArticle(article) {
    const img = article.fields.thumbnail || 'https://www.nccpimandtip.gov.eg/uploads/newsImages/1549208279-default-news.png';
    const headline = article.fields.headline || 'Article headline';
    const uri = article.webUrl;
    const tags = article.tags;
    return `
     <div class="col-md-12">
        <div class="" style="display:flex;padding: 16px;margin: 8px 0;background: white;">
            <a href="${uri}" target="_blank">
                <img class="" src="${img}" alt="${headline}" style="height:140px;width:100%">
            </a>
            <div class="" style="padding:16px">
                <div>
                    <a href="${uri}" target="_blank" style="text-decoration: none;color: black;font-size: 16px;font-weight: 600;">${headline}</a>
                </div>
                <div id="${article.id}">
                    ${tags.map(function(tag){
                        return `<button class="tags" style="cursor:pointer">
                            ${tag.webTitle}
                        </button>`
                    }).join(" ")}
                </div>
            </div>
        </div>
    </div>
    `;
}
