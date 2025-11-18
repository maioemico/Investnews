import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NewsService from './services/newsService';
import './App.css';

// Inicialização da classe de serviço
const newsService = new NewsService();

// Componentes de UI (simulados, assumindo que você os tem)
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '' }) => {
    let baseStyle = 'px-4 py-2 rounded font-semibold transition-colors duration-200 ';
    if (variant === 'primary') baseStyle += 'bg-blue-600 text-white hover:bg-blue-700';
    if (variant === 'secondary') baseStyle += 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    if (variant === 'destructive') baseStyle += 'bg-red-600 text-white hover:bg-red-700';
    if (size === 'sm') baseStyle = baseStyle.replace('px-4 py-2', 'px-3 py-1 text-sm');
    return <button onClick={onClick} className={`${baseStyle} ${className}`}>{children}</button>;
};

const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {children}
    </span>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white shadow-lg rounded-xl ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const Alert = ({ children, className = '' }) => (
    <div className={`p-4 rounded-lg bg-yellow-100 text-yellow-800 ${className}`}>
        {children}
    </div>
);

const AlertDescription = ({ children }) => <p className="text-sm">{children}</p>;

const Input = ({ type = 'text', placeholder, value, onChange, className = '' }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
);

const Select = ({ value, onChange, options, className = '' }) => (
    <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
        {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
        ))}
    </select>
);

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} segundos atrás`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} dias atrás`;
    
    return past.toLocaleDateString('pt-BR');
};

const getRelevanceBadgeColor = (score) => {
    if (score >= 90) return 'bg-red-500 text-white';
    if (score >= 70) return 'bg-yellow-500 text-white';
    return 'bg-gray-500 text-white';
};

const getRelevanceLabel = (score) => {
    if (score >= 90) return 'Alta Relevância';
    if (score >= 70) return 'Média Relevância';
    return 'Baixa Relevância';
};

const ExternalLink = ({ href, children, className = '' }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:text-blue-800 ${className}`}>
        {children}
    </a>
);

// Componente principal
function App() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Nacional');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSource, setSelectedSource] = useState('all');
    const [isStatusPage, setIsStatusPage] = useState(false);
    const [stats, setStats] = useState({ total: 0, bySource: {} });

    const categories = useMemo(() => ['Nacional', 'Internacional', 'Criptomoedas'], []);

    const loadNews = useCallback(async (category) => {
        setLoading(true);
        try {
            const articles = await newsService.fetchNewsByCategory(category);
            setNews(articles);
            setStats(newsService.getNewsStatsByCategory(articles));
        } catch (error) {
            console.error("Erro ao carregar notícias:", error);
            setNews(newsService.getMockDataByCategory(category));
            setStats(newsService.getNewsStatsByCategory(newsService.getMockDataByCategory(category)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isStatusPage) {
            loadNews(selectedCategory);
        }
    }, [selectedCategory, loadNews, isStatusPage]);

    // Lógica de filtragem e agrupamento
    const filteredNews = useMemo(() => {
        const articles = newsService.filterNews(news, {
            search: searchTerm,
            source: selectedSource,
            category: selectedCategory,
        });
        
        // NOVO: Agrupamento por Tópico
        return newsService.groupNewsByTopic(articles);
    }, [news, searchTerm, selectedSource, selectedCategory]);

    const availableSources = useMemo(() => {
        const sources = new Set();
        (news || []).forEach(article => sources.add(article.source));
        return [{ value: 'all', label: 'Todas as Fontes' }, ...Array.from(sources).map(s => ({ value: s, label: s }))];
    }, [news]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSearchTerm('');
        setSelectedSource('all');
    };

    const handleRefresh = () => {
        loadNews(selectedCategory);
    };

    if (isStatusPage) {
        return <StatusPage setIsStatusPage={setIsStatusPage} newsService={newsService} />;
    }

    // Componente principal de renderização
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-blue-600 flex items-center">
                            <span className="mr-2">📈</span> Notícias de Investimentos
                        </h1>
                        <div className="hidden md:flex space-x-2">
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'primary' : 'secondary'}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={selectedCategory === cat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="bg-green-500 text-white">Online</Badge>
                        <Button variant="secondary" onClick={() => setIsStatusPage(true)}>
                            RSS Status
                        </Button>
                        <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
                            {loading ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:hidden mb-4">
                    <Select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        options={categories.map(cat => ({ value: cat, label: cat }))}
                    />
                </div>

                {/* Estatísticas e Filtros */}
                <Card className="mb-8">
                    <CardContent>
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">📊</span> Estatísticas da Categoria ({selectedCategory})
                            </h2>
                            <p className="text-sm text-gray-500">Última Atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                                <p className="text-sm text-gray-500">Notícias</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-blue-600">{Object.keys(stats.bySource).length}</p>
                                <p className="text-sm text-gray-500">Fontes</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-blue-600">{filteredNews.length}</p>
                                <p className="text-sm text-gray-500">Tópicos</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Buscar por título ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="md:col-span-2"
                            />
                            <Select
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                options={availableSources}
                            />
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                options={categories.map(cat => ({ value: cat, label: cat }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Notícias Agrupadas por Tópico */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">⭐</span> Notícias Agrupadas por Tópico
                </h2>

                {loading && (
                    <Alert className="animate-pulse">
                        <AlertDescription>Carregando notícias e aplicando agrupamento...</AlertDescription>
                    </Alert>
                )}

                {!loading && filteredNews.length === 0 && (
                    <Alert>
                        <AlertDescription>Nenhuma notícia encontrada para os filtros selecionados.</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-8">
                    {filteredNews.map((group, index) => (
                        <Card key={index} className="border-2 border-gray-200 hover:shadow-xl transition-shadow duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <Badge className={getRelevanceBadgeColor(group.relevanceScore)}>
                                        {getRelevanceLabel(group.relevanceScore)}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                        <ExternalLink href={group.articles[0].link}>
                                            {group.topicTitle}
                                        </ExternalLink>
                                    </h3>
                                </div>
                                
                                <p className="text-sm text-gray-700 mt-2 mb-4 line-clamp-3">
                                    {group.articles[0].description}
                                </p>

                                {/* Lista de Artigos no Tópico */}
                                <div className="space-y-2 border-t pt-4">
                                    {group.articles.map((article, artIndex) => (
                                        <div key={artIndex} className="flex justify-between items-center text-sm text-gray-600 hover:bg-gray-50 p-2 rounded">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-800">
                                                    <ExternalLink href={article.link} className="text-sm text-gray-800 hover:text-blue-600">
                                                        {article.source}
                                                    </ExternalLink>
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(article.pubDate)}
                                                </span>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {article.category}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}

// Componente StatusPage (mantido no App.jsx para simplificar)
function StatusPage({ setIsStatusPage, newsService }) {
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newFeed, setNewFeed] = useState({ name: '', url: '', category: 'Nacional' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const categories = useMemo(() => ['Nacional', 'Internacional', 'Criptomoedas'], []);

    const fetchStatus = useCallback(() => {
        setLoading(true);
        const status = newsService.getFeedStatus(); 
        setStatusList(status);
        setLoading(false);
    }, [newsService]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleAddFeed = () => {
        if (!newFeed.name || !newFeed.url || !newFeed.category) {
            setMessage({ type: 'error', text: 'Preencha todos os campos.' });
            return;
        }

        try {
            const added = newsService.addFeed(newFeed.category, newFeed.name, newFeed.url);
            if (added) {
                setMessage({ type: 'success', text: `Feed "${newFeed.name}" adicionado com sucesso!` });
                setNewFeed({ name: '', url: '', category: 'Nacional' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: 'Este feed já existe.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Erro ao adicionar feed. Verifique o console.' });
        }
    };

    const handleRemoveFeed = (url) => {
        try {
            const removed = newsService.removeFeed(url);
            if (removed) {
                setMessage({ type: 'success', text: 'Feed removido com sucesso!' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: 'Erro ao remover feed.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Erro ao remover feed. Verifique o console.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Visão Geral do RSS</h1>
                
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-600">Monitoramento em tempo real da conectividade dos feeds RSS.</p>
                    <Button variant="secondary" onClick={() => setIsStatusPage(false)}>
                        Voltar para Notícias
                    </Button>
                </div>

                {/* Formulário de Adição de Feed */}
                <Card className="mb-8">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Novo Feed RSS</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Nome da Fonte (Ex: CNN Brasil)"
                                value={newFeed.name}
                                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                                className="md:col-span-1"
                            />
                            <Input
                                placeholder="URL do Feed RSS (Ex: https://..."
                                value={newFeed.url}
                                onChange={(e ) => setNewFeed({ ...newFeed, url: e.target.value })}
                                className="md:col-span-2"
                            />
                            <Select
                                value={newFeed.category}
                                onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                                options={categories.map(cat => ({ value: cat, label: cat }))}
                            />
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            {message.text && (
                                <Alert className={message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    <AlertDescription>{message.text}</AlertDescription>
                                </Alert>
                            )}
                            <Button onClick={handleAddFeed} className="ml-auto">
                                Adicionar Feed
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Status dos Feeds */}
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Feeds Cadastrados</h2>
                        <div className="space-y-4">
                            {loading && (
                                <Alert className="animate-pulse">
                                    <AlertDescription>Carregando status dos feeds...</AlertDescription>
                                </Alert>
                            )}
                            {!loading && statusList.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600 truncate">{item.url}</p>
                                    </div>
                                    <div className="text-right flex items-center space-x-4">
                                        
                                        {/* Categoria como Badge */}
                                        <Badge className="bg-blue-100 text-blue-800">
                                            {item.category}
                                        </Badge>

                                        {/* Status e Última Tentativa */}
                                        <div>
                                            <Badge 
                                                className={`text-sm font-bold ${
                                                    item.status === 'Ativo' ? 'bg-green-500 text-white' : 
                                                    item.status === 'Inativo' ? 'bg-red-500 text-white' : 
                                                    'bg-gray-500 text-white'
                                                }`}
                                            >
                                                {item.status}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">Última Tentativa: {item.lastAttempt}</p>
                                            {item.error && (
                                                <p className="text-xs text-red-500 mt-1">Erro: {item.error.substring(0, 50)}...</p>
                                            )}
                                        </div>
                                        
                                        {/* Botão Remover */}
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => handleRemoveFeed(item.url)}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {!loading && statusList.length === 0 && (
                                <Alert>
                                    <AlertDescription>Nenhum feed RSS cadastrado. Use o formulário acima para adicionar.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App;
