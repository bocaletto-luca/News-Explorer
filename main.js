/********************************************************************************************
     * EN: News Aggregator App
     * IT: Aggregatore di Notizie
     * -----------------------------------------------------------------------------------------
     * EN: This app aggregates the latest news headlines using The Guardian Open Platform.
     *     It uses the free "test" API key to fetch data. Users can filter news by category (e.g.,
     *     All, Technology, Sport, Politics, Business, Culture, Environment, Lifestyle, Travel), and
     *     the results are displayed with pagination. Each news article is shown as a Bootstrap card.
     *
     * IT: Questa app aggrega gli ultimi titoli di notizie utilizzando The Guardian Open Platform.
     *     La chiave API "test" gratuita viene usata per ottenere i dati. Gli utenti possono filtrare
     *     le notizie per categoria (es. All, Technology, Sport, Politics, Business, Culture, Environment, 
     *     Lifestyle, Travel) e i risultati sono visualizzati con paginazione. Ogni articolo è mostrato come una card Bootstrap.
     ********************************************************************************************/
    
    // EN: Define global variables for pagination // IT: Definisci variabili globali per la paginazione
    let currentPage = 1;
    let totalPages = 1;
    let currentCategory = "all";
    const pageSize = 20;  // EN: Number of articles per page // IT: Numero di articoli per pagina
    
    // EN: Select DOM elements // IT: Seleziona gli elementi DOM
    const filterForm = document.getElementById("filterForm");
    const categorySelect = document.getElementById("categorySelect");
    const newsFeed = document.getElementById("newsFeed");
    const paginationContainer = document.getElementById("paginationContainer");
    
    /**
     * EN: Build the API URL for The Guardian based on the selected category and page.
     * IT: Costruisce l'URL dell'API di The Guardian in base alla categoria e alla pagina selezionate.
     * @param {string} category - Selected category (e.g., all, technology, sport, etc.) / Categoria selezionata.
     * @param {number} page - The current page number / Numero della pagina corrente.
     * @returns {string} The complete API URL for fetching news / URL completo dell'API per scaricare le notizie.
     */
    function buildApiUrl(category, page) {
      const baseUrl = "https://content.guardianapis.com/search";
      const apiKey = "test";  // EN: Free test API key; replace with your key for production / IT: Chiave API "test" gratuita; sostituisci per produzione.
      const additionalParams = `&show-fields=thumbnail,trailText&page-size=${pageSize}`;
      let sectionParam = "";
      if (category !== "all") {
        sectionParam = "&section=" + category;
      }
      return `${baseUrl}?api-key=${apiKey}${sectionParam}${additionalParams}&page=${page}`;
    }
    
    /**
     * EN: Fetch news data from The Guardian API.
     * IT: Scarica i dati delle notizie dall'API di The Guardian.
     * @param {string} url - API URL.
     * @returns {Promise<Object>} Parsed JSON data.
     */
    async function fetchNews(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error("Response status: " + response.status);
          throw new Error("Network response not OK: " + response.status);
        }
        const json = await response.json();
        return json;
      } catch (error) {
        console.error("Error fetching news:", error);
        return null;
      }
    }
    
    /**
     * EN: Display news articles as Bootstrap cards in the news feed.
     * IT: Visualizza gli articoli di notizie come card Bootstrap nel feed.
     * @param {Object} data - JSON data from The Guardian API.
     */
    function displayNews(data) {
      newsFeed.innerHTML = "";
      
      if (!data || !data.response || !data.response.results) {
        newsFeed.innerHTML = "<p class='text-center text-danger'>No news data available.</p>";
        return;
      }
      
      // EN: Extract pagination info // IT: Estrai le informazioni di paginazione
      currentPage = data.response.currentPage;
      totalPages = data.response.pages;
      
      const results = data.response.results;
      
      results.forEach(article => {
        const colDiv = document.createElement("div");
        colDiv.className = "col-12 col-md-6 col-lg-4";
        
        // Create card element
        const card = document.createElement("div");
        card.className = "card news-card h-100";
        
        // EN: Add thumbnail image if available // IT: Aggiungi l'immagine thumbnail se disponibile
        if (article.fields && article.fields.thumbnail) {
          const img = document.createElement("img");
          img.src = article.fields.thumbnail;
          img.alt = article.webTitle;
          img.className = "card-img-top";
          card.appendChild(img);
        }
        
        // Create card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body d-flex flex-column";
        
        // Article headline
        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = article.webTitle;
        cardBody.appendChild(title);
        
        // Article trail text (brief summary), if available
        if (article.fields && article.fields.trailText) {
          const trailText = document.createElement("p");
          trailText.className = "card-text";
          // EN: Use innerHTML if the trailText may contain HTML formatting // IT: Usa innerHTML se l'estratto contiene formattazioni HTML
          trailText.innerHTML = article.fields.trailText;
          cardBody.appendChild(trailText);
        }
        
        // "Read More" button
        const readMore = document.createElement("a");
        readMore.className = "btn btn-sm btn-primary mt-auto";
        readMore.href = article.webUrl;
        readMore.target = "_blank";
        readMore.textContent = "Read More";
        cardBody.appendChild(readMore);
        
        card.appendChild(cardBody);
        colDiv.appendChild(card);
        newsFeed.appendChild(colDiv);
      });
      
      updatePaginationControls();
    }
    
    /**
     * EN: Update the pagination controls based on current page and total pages.
     * IT: Aggiorna i controlli di paginazione in base alla pagina corrente e al totale delle pagine.
     */
    function updatePaginationControls() {
      // Clear the pagination container
      paginationContainer.innerHTML = "";
      
      // Create Previous button
      const prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-secondary me-2";
      prevBtn.textContent = "Previous";
      prevBtn.disabled = currentPage <= 1;
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          loadNews(currentPage - 1);
        }
      });
      
      // Create Next button
      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-secondary ms-2";
      nextBtn.textContent = "Next";
      nextBtn.disabled = currentPage >= totalPages;
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          loadNews(currentPage + 1);
        }
      });
      
      // Create page info text
      const pageInfo = document.createElement("span");
      pageInfo.className = "mx-2";
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      
      // Append buttons and page info to the pagination container
      paginationContainer.appendChild(prevBtn);
      paginationContainer.appendChild(pageInfo);
      paginationContainer.appendChild(nextBtn);
    }
    
    /**
     * EN: Load news based on the selected category and page.
     * IT: Carica le notizie in base alla categoria selezionata e alla pagina.
     * @param {number} [page=1] - Page number to load / Numero della pagina da caricare.
     */
    async function loadNews(page = 1) {
      currentCategory = categorySelect.value;
      currentPage = page;
      const url = buildApiUrl(currentCategory, currentPage);
      newsFeed.innerHTML = "<p class='text-center'>Loading news...</p>";
      const data = await fetchNews(url);
      if (data) {
        displayNews(data);
      } else {
        newsFeed.innerHTML = "<p class='text-center text-danger'>Error fetching news. Please try again later.</p>";
      }
    }
    
    // EN: Add event listener for filter form submission // IT: Aggiungi un listener per il submit del form di filtraggio
    filterForm.addEventListener("submit", function(event) {
      event.preventDefault();
      loadNews(1);  // Reset to page 1 on new filter
    });
    
    // EN: Load news on initial page load (default: All category, page 1) // IT: Carica le notizie al caricamento iniziale (categoria predefinita: all, pagina 1)
    loadNews(1);
