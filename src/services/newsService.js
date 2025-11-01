export const encodingFixes = {
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

export default class NewsService {
    constructor( ) {
        this.parser = new DOMParser();
    }

cleanText(text) {
    let cleaned = text;
    
    // 1. Remove tags HTML remanescentes (mantendo a lógica anterior)
    cleaned = cleaned.replace(/<[^>]*>?/gm, ''); 

    // 2. Remove atributos de dados do WordPress (data-medium-file, data-large-file, etc.)
    // Este regex remove qualquer atributo que comece com 'data-' seguido por aspas e o conteúdo até o fechamento das aspas.
    // Também remove o padrão 'Foto: ...' que costuma vir antes.
    cleaned = cleaned.replace(/Foto:.*?(\s*data-.*?=".*?").*?/g, '');
    cleaned = cleaned.replace(/data-.*?=".*?"/g, '');
    
    // 3. Aplica as correções de codificação (mantendo a lógica anterior)
    for (const [key, value] of Object.entries(encodingFixes)) {
        cleaned = cleaned.replace(new RegExp(key, 'g'), value);
    }
    
    // 4. Remove espaços em branco extras
    cleaned = cleaned.trim().replace(/\s\s+/g, ' ');

    return cleaned;
}

    translateToPortuguese(text) {
        // Mapeamento de termos financeiros comuns para simular tradução
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
                category: 'Geral', // Será definido na fetchNewsByCategory
                relevanceScore: Math.floor(Math.random() * 50) + 50, // 50 a 99
            });
        });

        return articles;
    }

    async fetchFeed(feedUrl, retries = 3) {
        const proxiedUrl = PROXY_URL + encodeURIComponent(feedUrl);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(proxiedUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlText = await response.text();
                return this.parseRSS(xmlText);
            } catch (error) {
                console.error(`Tentativa ${i + 1} falhou para ${feedUrl}:`, error.message);
                if (i < retries - 1) {
                    await delay(1000 * Math.pow(2, i)); // Exponential backoff
                } else {
                    throw new Error(`Falha ao buscar feed após ${retries} tentativas: ${feedUrl}`);
                }
            }
        }
    }

    async fetchNewsByCategory(category) {
        const feeds = RSS_FEEDS[category] || [];
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
                });
                allArticles = allArticles.concat(articles);
            } catch (error) {
                console.warn(`Não foi possível carregar o feed ${feed.name}: ${error.message}`);
            }
        }
        
        // Simplesmente ordena por data de publicação
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        return allArticles;
    }

    getMockDataByCategory(category) {
        // Retorna dados mock simples para fallback
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

        // O filtro por feedCategory já foi feito na fetchNewsByCategory, mas mantemos aqui para consistência.
        if (feedCategory && feedCategory !== 'all') {
             filtered = filtered.filter(article => article.category === feedCategory);
        }

        return filtered;
    }
}

