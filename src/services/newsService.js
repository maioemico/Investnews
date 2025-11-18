const encodingFixes = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#039;": "'", "&apos;": "'", "&mdash;": "—", "&ndash;": "–", "&nbsp;": " ", "&laquo;": "«", "&raquo;": "»", "&lsquo;": "‘", "&rsquo;": "’", "&ldquo;": "“", "&rdquo;": "”", "&bull;": "•", "&hellip;": "…", "&trade;": "™", "&reg;": "®", "&copy;": "©", "&euro;": "€", "&pound;": "£", "&yen;": "¥", "&cent;": "¢", "&sect;": "§", "&para;": "¶", "&deg;": "°", "&plusmn;": "±", "&frac12;": "½", "&frac14;": "¼", "&frac34;": "¾", "&times;": "×", "&divide;": "÷", "&ne;": "≠", "&le;": "≤", "&ge;": "≥", "&infin;": "∞", "&sum;": "∑", "&prod;": "∏", "&pi;": "π", "&int;": "∫", "&radic;": "√", "&asymp;": "≈", "&delta;": "δ", "&Delta;": "Δ", "&omega;": "ω", "&Omega;": "Ω", "&alpha;": "α", "&beta;": "β", "&gamma;": "γ", "&lambda;": "λ", "&mu;": "μ", "&nu;": "ν", "&xi;": "ξ", "&rho;": "ρ", "&sigma;": "σ", "&tau;": "τ", "&phi;": "φ", "&chi;": "χ", "&psi;": "ψ", "&zeta;": "ζ", "&theta;": "θ", "&epsilon;": "ε", "&eta;": "η", "&iota;": "ι", "&kappa;": "κ",
    // Caracteres de codificação incorreta
    "Ã§": "ç", "Ã‡": "Ç", "Ã¡": "á", "Ã": "Á", "Ã£": "ã", "Ãƒ": "Ã", "Ã¢": "â", "Ã‚": "Â", "Ã©": "é", "Ã‰": "É", "Ãª": "ê", "ÃŠ": "Ê", "Ã­": "í", "Ã": "Í", "Ã³": "ó", "Ã“": "Ó", "Ãµ": "õ", "Ã•": "Õ", "Ã´": "ô", "Ã”": "Ô", "Ãº": "ú", "Ãš": "Ú", "Ã¼": "ü", "Ãœ": "Ü", "â‚¬": "€", "â„¢": "™", "â€™": "’", "â€˜": "‘", "â€œ": "“", "â€": "”", "â€“": "–", "â€”": "—", "Âº": "º", "Âª": "ª",
};

const RSS_FEEDS = {
    Nacional: [
        { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/" },
        { name: "Valor Investe", url: "https://valorinveste.globo.com/rss/valor-investe/ultimas/" },
    ],
    Internacional: [
        { name: "Reuters Business", url: "http://feeds.reuters.com/reuters/businessNews" },
        { name: "Financial Times", url: "https://www.ft.com/rss/home" },
    ],
    Criptomoedas: [
        { name: "CoinDesk", url: "https://www.coindesk.com/feed" },
        { name: "Livecoins", url: "https://livecoins.com.br/feed/" },
    ],
};

const PROXY_URL = "https://corsproxy.io/?";
const KEYWORDS_URL = "https://docs.google.com/spreadsheets/d/1N7d_O0TERXXuQ1dBZQBuc96E6QdKRWmo164rUffb7TI/gviz/tq?tqx=out:csv&sheet=Sheet1";
 
export default class NewsService {
    
    sortNewsByDate(articles ) {
        return articles.sort((a, b) => {
            const dateA = new Date(a.pubDate);
            const dateB = new Date(b.pubDate);
            // Ordenação decrescente (mais recente primeiro)
            return dateB - dateA; 
        });
    }

    // NOVO MÉTODO: Agrupamento por Tópico
    groupNewsByTopic(articles) {
        const groups = [];
        const processedIndices = new Set();

        // Função auxiliar para simplificar o título
        const simplifyTitle = (title) => {
            return title.toLowerCase().split(/\s+/).slice(0, 5).join(' ');
        };

        for (let i = 0; i < articles.length; i++) {
            if (processedIndices.has(i)) continue;

            const currentArticle = articles[i];
            const currentTitleSimple = simplifyTitle(currentArticle.title);
            const currentGroup = {
                topicTitle: currentArticle.title,
                relevanceScore: currentArticle.relevanceScore,
                articles: [currentArticle],
                isHighRelevance: currentArticle.relevanceScore >= 90,
            };

            processedIndices.add(i);

            for (let j = i + 1; j < articles.length; j++) {
                if (processedIndices.has(j)) continue;

                const nextArticle = articles[j];
                const nextTitleSimple = simplifyTitle(nextArticle.title);

                // Lógica de Agrupamento:
                // 1. Títulos muito semelhantes (primeiras 5 palavras)
                const isSimilarTitle = currentTitleSimple === nextTitleSimple;
                
                // 2. Compartilham a mesma palavra-chave de alta relevância (se houver)
                const hasSharedKeyword = currentArticle.relevanceScore >= 90 && nextArticle.relevanceScore >= 90 && 
                                         currentArticle.title.toLowerCase().includes(this.keywords[0]) && 
                                         nextArticle.title.toLowerCase().includes(this.keywords[0]); // Simplificação: usa a primeira palavra-chave carregada

                if (isSimilarTitle || hasSharedKeyword) {
                    currentGroup.articles.push(nextArticle);
                    processedIndices.add(j);

                    // Atualiza o título do tópico para o mais relevante
                    if (nextArticle.relevanceScore > currentGroup.relevanceScore) {
                        currentGroup.topicTitle = nextArticle.title;
                        currentGroup.relevanceScore = nextArticle.relevanceScore;
                    }
                    if (nextArticle.relevanceScore >= 90) {
                        currentGroup.isHighRelevance = true;
                    }
                }
            }
            groups.push(currentGroup);
        }

        // Ordena os grupos pelo score de relevância do tópico principal
        return groups.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    constructor() {
        // Inicializa o parser DOM SOMENTE SE ESTIVER NO NAVEGADOR
        if (typeof window !== 'undefined') {
            this.parser = new DOMParser();
        }
        
        // 1. Binding dos métodos PRIMEIRO
        this.getFeedStatus = this.getFeedStatus.bind(this);
        this.getFeedsFromStorage = this.getFeedsFromStorage.bind(this);
        this.getKeywordsFromStorage = this.getKeywordsFromStorage.bind(this);

        // 2. Inicialização de variáveis DEPOIS
        this.feeds = this.getFeedsFromStorage();
        this.feedStatus = {};
        this.keywords = this.getKeywordsFromStorage();
    }

    // Métodos de Storage
    getFeedsFromStorage() {
        try {
            const feeds = localStorage.getItem('rssFeeds');
            return feeds ? JSON.parse(feeds) : RSS_FEEDS;
        } catch (e) {
            console.error("Erro ao carregar feeds do localStorage, usando feeds padrão.", e);
            return RSS_FEEDS;
        }
    }

    saveFeedsToStorage(feeds) {
        try {
            localStorage.setItem('rssFeeds', JSON.stringify(feeds));
            this.feeds = feeds;
        } catch (e) {
            console.error("Erro ao salvar feeds no localStorage.", e);
        }
    }

    getKeywordsFromStorage() {
        // Implementação simples, pode ser expandida
        return [];
    }

    // Métodos de Lógica
    async loadKeywords() {
        if (this.keywords.length > 0) return; 

        try {
            const proxiedUrl = PROXY_URL + encodeURIComponent(KEYWORDS_URL);
            const response = await fetch(proxiedUrl);
            const csvText = await response.text();

            const keywords = csvText
                .replace(/"/g, '')
                .split('\n')
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length > 0 && k !== 'palavra-chave'); 

            this.keywords = keywords;
            console.log(`[NewsService] ${keywords.length} palavras-chave carregadas.`);
        } catch (error) {
            console.error("Erro ao carregar palavras-chave do Google Sheets:", error);
            this.keywords = ['investimento', 'cripto', 'dólar', 'selic'];
        }
    }

    calculateRelevance(article) {
        let score = 50; 
        const title = article.title.toLowerCase();
        const description = article.description.toLowerCase();

        for (const keyword of this.keywords) {
            if (title.includes(keyword)) {
                score += 40; 
                break; 
            }
            else if (description.includes(keyword)) {
                score += 20; 
            }
        }

        return Math.min(score, 99);
    }

    cleanText(text) {
        let cleaned = text;
        
        cleaned = cleaned.replace(/<[^>]*>?/gm, ''); 
        cleaned = cleaned.replace(/Foto:.*?(\s*data-.*?=".*?").*?/g, '');
        cleaned = cleaned.replace(/data-.*?=".*?"/g, '');
        
        for (const [key, value] of Object.entries(encodingFixes)) {
            cleaned = cleaned.replace(new RegExp(key, 'g'), value);
        }
        
        cleaned = cleaned.trim().replace(/\s\s+/g, ' ');

        return cleaned;
    }

    translateToPortuguese(text) {
        const mapping = {
            'Business': 'Negócios',
            'Markets': 'Mercados',
            'Economy': 'Economia',
            'Stocks': 'Ações',
            'Investment': 'Investimento',
            'Bitcoin': 'Bitcoin',
            'Ethereum': 'Ethereum',
            'Crypto': 'Cripto',
            'Blockchain': 'Blockchain',
        };

        let translated = text;
        for (const [en, pt] of Object.entries(mapping)) {
            const regex = new RegExp(`\\b${en}\\b`, 'gi');
            translated = translated.replace(regex, pt);
        }
        return translated;
    }

    // MODIFICADO: Aceita o nome do feed cadastrado
    parseRSS(xmlText, registeredSourceName) {
        if (!this.parser) {
            console.error("DOMParser não está disponível.");
            return [];
        }
        const doc = this.parser.parseFromString(xmlText, "text/xml");
        const items = doc.querySelectorAll("item");
        const articles = [];

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent || '';
            const link = item.querySelector("link")?.textContent || '';
            const description = item.querySelector("description")?.textContent || '';
            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            // const source = item.closest('channel').querySelector('title')?.textContent || 'Desconhecida'; // LINHA REMOVIDA

            articles.push({
                title: this.cleanText(title),
                link: link,
                description: this.cleanText(description),
                pubDate: pubDate,
                source: registeredSourceName, // USANDO O NOME CADASTRADO
                category: 'Geral', 
            });
        });

        return articles;
    }
    
    addFeed(category, name, url) {

        const currentFeeds = this.getFeedsFromStorage(); 
        
        if (!currentFeeds[category]) {
            currentFeeds[category] = [];
        }
        
        const exists = currentFeeds[category].some(feed => feed.url === url);
        if (exists) {
            console.warn(`Feed ${url} já existe na categoria ${category}.`);
            return false; 
        }

        currentFeeds[category].push({ name, url });
        
        this.saveFeedsToStorage(currentFeeds);
        
        return true; // Retorna verdadeiro se for adicionado
    }

    removeFeed(urlToRemove) {
        const currentFeeds = this.getFeedsFromStorage();
        let removed = false;

        for (const category in currentFeeds) {
            const initialLength = currentFeeds[category].length;
            
            // Filtra o feed a ser removido
            currentFeeds[category] = currentFeeds[category].filter(feed => feed.url !== urlToRemove);
            
            if (currentFeeds[category].length < initialLength) {
                removed = true;
            }
        }

        if (removed) {
            this.saveFeedsToStorage(currentFeeds);
        }
        
        return removed;
    }

    // MODIFICADO: Aceita o nome do feed cadastrado
    async fetchFeed(feedUrl, feedName, retries = 3) {
        const proxiedUrl = PROXY_URL + encodeURIComponent(feedUrl);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const feedKey = feedUrl; 

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(proxiedUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlText = await response.text();
                
                // SUCESSO: Registra como ativo
                this.feedStatus[feedKey] = { status: 'Ativo', lastAttempt: new Date().toLocaleString(), error: null };
                
                // Passa o nome do feed cadastrado para o parser
                return this.parseRSS(xmlText, feedName); 
            } catch (error) {
                console.error(`Tentativa ${i + 1} falhou para ${feedUrl}:`, error.message);
                if (i < retries - 1) {
                    await delay(1000 * Math.pow(2, i)); 
                } else {
                    // FALHA FINAL: Registra como inativo
                    this.feedStatus[feedKey] = { status: 'Inativo', lastAttempt: new Date().toLocaleString(), error: error.message };
                    throw new Error(`Falha ao buscar feed após ${retries} tentativas: ${feedUrl}`);
                }
            }
        }
    }

    // MODIFICADO: Passa o nome do feed cadastrado para fetchFeed
    async fetchNewsByCategory(category) {
        await this.loadKeywords(); 
        
        // Usa this.feeds, que é carregado do localStorage no construtor
        const feeds = this.feeds[category] || []; 
        let allArticles = [];

        for (const feed of feeds) {
            try {
                // PASSA O feed.name AQUI
                const articles = await this.fetchFeed(feed.url, feed.name); 
                articles.forEach(article => {
                    article.category = category;
                    if (category === 'Internacional') {
                        article.title = this.translateToPortuguese(article.title);
                        article.description = this.translateToPortuguese(article.description);
                    }
                    article.relevanceScore = this.calculateRelevance(article);
                });
                allArticles = allArticles.concat(articles);
            } catch (error) {
                console.warn(`Não foi possível carregar o feed ${feed.name}: ${error.message}`);
            }
        }
        
        // Aplica a ordenação por data (mais recente primeiro)
        allArticles = this.sortNewsByDate(allArticles);
        
        // Limita a 50 notícias
        return allArticles.slice(0, 50);
    }

    getMockDataByCategory(category) {
        return [{
            title: `[MOCK] Notícia de Demonstração - ${category}`,
            link: '#',
            description: 'Esta é uma notícia de demonstração usada como fallback.',
            pubDate: new Date().toISOString(),
            source: 'Mock Data',
            category: category,
            relevanceScore: 95
        }];
    }

    getNewsStatsByCategory(articles) {
        const stats = {
            total: articles.length,
            bySource: {}
        };

        articles.forEach(article => {
            stats.bySource[article.source] = (stats.bySource[article.source] || 0) + 1;
        });

        return stats;
    }

    filterNews(articles, filters) {
        let filtered = articles;

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.source && filters.source !== 'all') {
            filtered = filtered.filter(article => article.source === filters.source);
        }

        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(article => article.category === filters.category);
        }

        return filtered;
    }

    getFeedStatus() {
        const allFeeds = this.getFeedsFromStorage();
        const statusList = [];

        for (const category in allFeeds) {
            allFeeds[category].forEach(feed => {
                const feedStatus = this.feedStatus[feed.url] || { status: 'Desconhecido', lastAttempt: 'N/A', error: null };
                statusList.push({
                    name: feed.name,
                    url: feed.url,
                    category: category,
                    ...feedStatus
                });
            });
        }

        return statusList;
    }
}
