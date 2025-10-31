export const encodingFixes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&#039;": "'",
      "&apos;": "'",
      "&mdash;": "—",
      "&ndash;": "–",
      "&nbsp;": " ",
      "&laquo;": "«",
      "&raquo;": "»",
      "&lsquo;": "‘",
      "&rsquo;": "’",
      "&ldquo;": "“",
      "&rdquo;": "”",
      "&bull;": "•",
      "&hellip;": "…",
      "&trade;": "™",
      "&reg;": "®",
      "&copy;": "©",
      "&euro;": "€",
      "&pound;": "£",
      "&yen;": "¥",
      "&cent;": "¢",
      "&sect;": "§",
      "&para;": "¶",
      "&deg;": "°",
      "&plusmn;": "±",
      "&frac12;": "½",
      "&frac14;": "¼",
      "&frac34;": "¾",
      "&times;": "×",
      "&divide;": "÷",
      "&ne;": "≠",
      "&le;": "≤",
      "&ge;": "≥",
      "&infin;": "∞",
      "&sum;": "∑",
      "&prod;": "∏",
      "&pi;": "π",
      "&int;": "∫",
      "&radic;": "√",
      "&asymp;": "≈",
      "&delta;": "δ",
      "&Delta;": "Δ",
      "&omega;": "ω",
      "&Omega;": "Ω",
      "&alpha;": "α",
      "&beta;": "β",
      "&gamma;": "γ",
      "&lambda;": "λ",
      "&mu;": "μ",
      "&nu;": "ν",
      "&xi;": "ξ",
      "&rho;": "ρ",
      "&sigma;": "σ",
      "&tau;": "τ",
      "&phi;": "φ",
      "&chi;": "χ",
      "&psi;": "ψ",
      "&zeta;": "ζ",
      "&theta;": "θ",
      "&epsilon;": "ε",
      "&eta;": "η",
      "&iota;": "ι",
      "&kappa;": "κ",
      // Caracteres de codificação incorreta
      "Ã§": "ç",
      "Ã‡": "Ç",
      "Ã¡": "á",
      "Ã": "Á",
      "Ã£": "ã",
      "Ãƒ": "Ã",
      "Ã¢": "â",
      "Ã‚": "Â",
      "Ã©": "é",
      "Ã‰": "É",
      "Ãª": "ê",
      "ÃŠ": "Ê",
      "Ã­": "í",
      "Ã": "Í",
      "Ã³": "ó",
      "Ã“": "Ó",
      "Ãµ": "õ",
      "Ã•": "Õ",
      "Ã´": "ô",
      "Ã”": "Ô",
      "Ãº": "ú",
      "Ãš": "Ú",
      "Ã¼": "ü",
      "Ãœ": "Ü",
      "â‚¬": "€",
      "â„¢": "™",
      "â€™": "’",
      "â€˜": "‘",
      "â€œ": "“",
      "â€": "”",
      "â€“": "–",
      "â€”": "—",
      "Âº": "º",
      "Âª": "ª",
};

export default class NewsService {

    // 3. O construtor (se houver)
    constructor() {
        // ...
    }

    // 4. As funções (métodos) que o App.jsx chama:
    async fetchNewsByCategory(category) {
        // ... CÓDIGO COMPLETO DA FUNÇÃO AQUI
    }

    getNewsStatsByCategory(articles) {
        // ... CÓDIGO COMPLETO DA FUNÇÃO AQUI
    }

    getMockDataByCategory(category) {
        // ... CÓDIGO COMPLETO DA FUNÇÃO AQUI
    }

    filterNews(news, filters) {
        // ... CÓDIGO COMPLETO DA FUNÇÃO AQUI
    }

    // ... e todas as outras funções auxiliares (cleanText, translateToPortuguese, etc.)
}

