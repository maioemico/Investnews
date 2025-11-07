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
    constructor() {
        // Inicializa o parser DOM
        this.parser = new DOMParser();
        
        // 1. Binding dos métodos PRIMEIRO (para resolver o TypeError no construtor)
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

    parseRSS(xmlText) {
        const doc = this.parser.parseFromString(xmlText, "text/xml");
        const items = doc.querySelectorAll("item");
        const articles = [];

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent || '';
            const link = item.querySelector("link")?.textContent || '';
            const description = item.querySelector("description")?.textContent || '';
            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            const source = item.closest('channel').querySelector('title')?.textContent || 'Desconhecida';

            articles.push({
                title: this.cleanText(title),
                link: link,
                description: this.cleanText(description),
                pubDate: pubDate,
                source: source,
                category: 'Geral', 
            });
        });

        return articles;
    }

    async fetchFeed(feedUrl, retries = 3) {
        const proxiedUrl = PROXY_URL + encodeURIComponent(feedUrl);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const feedName = feedUrl; 

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(proxiedUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlText = await response.text();
                
                // SUCESSO: Registra como ativo
                this.feedStatus[feedName] = { status: 'Ativo', lastAttempt: new Date().toLocaleString(), error: null };
                return this.parseRSS(xmlText);
            } catch (error) {
                console.error(`Tentativa ${i + 1} falhou para ${feedUrl}:`, error.message);
                if (i < retries - 1) {
                    await delay(1000 * Math.pow(2, i)); 
                } else {
                    // FALHA FINAL: Registra como inativo
                    this.feedStatus[feedName] = { status: 'Inativo', lastAttempt: new Date().toLocaleString(), error: error.message };
                    throw new Error(`Falha ao buscar feed após ${retries} tentativas: ${feedUrl}`);
                }
            }
        }
    }

    async fetchNewsByCategory(category) {
        await this.loadKeywords(); 
        
        // Usa this.feeds, que é carregado do localStorage no construtor
        const feeds = this.feeds[category] || []; 
        let allArticles = [];

        for (const feed of feeds) {
            try {
                const articles = await this.fetchFeed(feed.url);
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
        
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        return allArticles;
    }

    getMockDataByCategory(category) {
        return [{
            title: `[MOCK] Notícia de Demonstração - ${category}`,
            link: '#',
            description: 'Esta é uma notícia de demonstração porque os feeds RSS estão indisponíveis.',
            pubDate: new Date().toISOString(),
            source: 'Mock Data',
            category: category,
            relevanceScore: 99,
        }];
    }

    getNewsStatsByCategory(articles) {
        const total = articles.length;
        const bySource = articles.reduce((acc, article) => {
            acc[article.source] = (acc[article.source] || 0) + 1;
            return acc;
        }, {});
        const byFeedCategory = articles.reduce((acc, article) => {
            acc[article.category] = (acc[article.category] || 0) + 1;
            return acc;
        }, {});

        return { total, bySource, byFeedCategory };
    }

    filterNews(articles, { search, source, category, feedCategory }) {
        let filtered = articles;

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(lowerSearch) ||
                article.description.toLowerCase().includes(lowerSearch)
            );
        }

        if (source && source !== 'all') {
            filtered = filtered.filter(article => article.source === source);
        }

        if (category && category !== 'all') {
            filtered = filtered.filter(article => article.category === category);
        }

        if (feedCategory && feedCategory !== 'all') {
             filtered = filtered.filter(article => article.category === feedCategory);
        }

        return filtered;
    }

    getFeedStatus() {
        // Garante que a lista de feeds esteja carregada do localStorage
        if (!this.feeds || Object.keys(this.feeds).length === 0) {
             this.feeds = this.getFeedsFromStorage();
        }

        const statusList = [];
        for (const category in this.feeds) {
            this.feeds[category].forEach(feed => {
                const status = this.feedStatus[feed.url] || { status: 'Não Verificado', lastAttempt: 'N/A', error: null };
                statusList.push({
                    category: category,
                    name: feed.name,
                    url: feed.url,
                    status: status.status,
                    lastAttempt: status.lastAttempt,
                    error: status.error
                });
            });
        }
        return statusList;
    }
}

