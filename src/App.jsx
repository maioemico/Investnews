import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import {
  TrendingUp,
  Search,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Flag,
  Globe,
  Bitcoin,
  BarChart3,
  Star,
  Filter
} from 'lucide-react'
import './App.css'

// Importação da CLASSE NewsService e criação da instância
import NewsService from './services/newsService.js'; 
const newsService = new NewsService(); 


function App() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFeedCategory, setSelectedFeedCategory] = useState('Nacional')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [stats, setStats] = useState(null)
	const [isStatusPage, setIsStatusPage] = useState(false)

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Carregar notícias por categoria
  const loadNews = useCallback(async (category) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!isOnline) {
        throw new Error('Sem conexão com a internet')
      }

      // CORREÇÃO: Usando newsService.fetchNewsByCategory
      const articles = await newsService.fetchNewsByCategory(category) 
      
      if (articles && articles.length > 0) {
        setNews(articles)
        // CORREÇÃO: Usando newsService.getNewsStatsByCategory
        setStats(newsService.getNewsStatsByCategory(articles)) 
        setLastUpdate(new Date())
      } else {
        // Usar dados mock como fallback
        console.warn('Nenhuma notícia carregada dos RSS feeds, usando dados de demonstração')
        // CORREÇÃO: Usando newsService.getMockDataByCategory
        const mockData = newsService.getMockDataByCategory(category) 
        setNews(mockData)
        // CORREÇÃO: Usando newsService.getNewsStatsByCategory
        setStats(newsService.getNewsStatsByCategory(mockData)) 
        setLastUpdate(new Date())
        setError('Usando dados de demonstração - alguns RSS feeds podem estar indisponíveis')
      }
    } catch (err) {
      console.error('Erro ao carregar notícias:', err)
      setError(err.message || 'Erro ao carregar notícias')
      // Usar dados mock como fallback em caso de erro
      // CORREÇÃO: Usando newsService.getMockDataByCategory
      const mockData = newsService.getMockDataByCategory(category) 
      setNews(mockData)
      // CORREÇÃO: Usando newsService.getNewsStatsByCategory
      setStats(newsService.getNewsStatsByCategory(mockData)) 
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [isOnline])

  // Carregar notícias quando a categoria de feed muda
  useEffect(() => {
    loadNews(selectedFeedCategory)
  }, [selectedFeedCategory, loadNews])

  // Filtrar notícias
  // CORREÇÃO: Adicionando (news || []) para evitar TypeError: Cannot read properties of undefined (reading 'filter')
  const filteredNews = newsService.filterNews(news || [], { 
    search: searchTerm,
    source: selectedSource,
    category: selectedCategory,
    feedCategory: selectedFeedCategory
  }) || [] 

  // CORREÇÃO: Adicionando (filteredNews || []) para evitar TypeError: Cannot read properties of undefined (reading 'filter')
  const topNews = (filteredNews || []).filter(article => article.relevanceScore >= 90)
  const regularNews = (filteredNews || []).filter(article => article.relevanceScore < 90)


  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInHours = Math.floor((now - publishedDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours === 1) return 'Há 1 hora'
    if (diffInHours < 24) return `Há ${diffInHours} horas`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Há 1 dia'
    return `Há ${diffInDays} dias`
  }

  const getRelevanceBadgeColor = (score) => {
    if (score >= 90) return 'bg-red-500 text-white'
    if (score >= 80) return 'bg-orange-500 text-white'
    return 'bg-blue-500 text-white'
  }

  const getRelevanceLabel = (score) => {
    if (score >= 90) return 'Alta Relevância'
    if (score >= 80) return 'Média Relevância'
    return 'Relevante'
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Nacional':
        return <Flag className="h-5 w-5" />
      case 'Internacional':
        return <Globe className="h-5 w-5" />
      case 'Criptomoedas':
        return <Bitcoin className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Nacional':
        return 'bg-green-500 hover:bg-green-600 text-white'
      case 'Internacional':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'Criptomoedas':
        return 'bg-orange-500 hover:bg-orange-600 text-white'
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  // Obter fontes únicas para o filtro
  const uniqueSources = [...new Set(news.map(article => article.source))].sort()
  const uniqueCategories = [...new Set(news.map(article => article.category))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Carregando notícias...</h2>
          <p className="text-gray-500 mt-2">
            Agregando conteúdo da categoria: <strong>{selectedFeedCategory}</strong>
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isStatusPage) {
    return <StatusPage setIsStatusPage={setIsStatusPage} newsService={newsService} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notícias de Investimentos</h1>
                <p className="text-gray-600 mt-1">Nacional • Internacional • Criptomoedas</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Offline</span>
                  </>
                )}
              </div>
              <Button 
             onClick={() => setIsStatusPage(true)} 
             variant="outline" 
	           className="flex items-center space-x-2"
              >
             <Wifi className="h-4 w-4" />
             <span>RSS Status</span>
             </Button>
              <Button 
                onClick={() => loadNews(selectedFeedCategory)} 
                variant="outline" 
                className="flex items-right space-x-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Category Selection */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-start sm:justify-center">
{['Nacional', 'Internacional', 'Criptomoedas'].map((category) => (
  <div key={category} className="flex items-center space-x-2 w-full sm:w-auto"> 
    <Button
      onClick={() => setSelectedFeedCategory(category)}
      className={`w-full sm:w-48 ${getCategoryColor(category)}`}
      disabled={loading}
    >
      {getCategoryIcon(category)}
      <span className="ml-2">{category}</span>
    </Button>
  </div>
))}
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <Card className="mb-6 shadow-md border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Estatísticas da Categoria ({selectedFeedCategory})
              </CardTitle>
              <span className="text-xs text-gray-500">Última Atualização: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-500">Notícias</div>
                <div className="text-sm text-gray-500">Fontes: {Object.keys(stats.bySource).length}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-1/3"
            icon={<Search className="h-4 w-4 text-gray-500" />}
          />
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="sm:w-1/3">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fontes</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="sm:w-1/3">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* News List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Notícias de Alta Relevância
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topNews.map((item, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-red-300 border-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getRelevanceBadgeColor(item.relevanceScore)}>
                    {getRelevanceLabel(item.relevanceScore)}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(item.pubDate)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    {item.title}
                    <ExternalLink className="h-4 w-4 ml-2 text-blue-500" />
                  </a>
                </h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {item.source}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {item.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Outras Notícias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularNews.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getRelevanceBadgeColor(item.relevanceScore)}>
                    {getRelevanceLabel(item.relevanceScore)}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(item.pubDate)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    {item.title}
                    <ExternalLink className="h-4 w-4 ml-2 text-blue-500" />
                  </a>
                </h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                    {item.source}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {item.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusPage({ setIsStatusPage, newsService }) {
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newFeed, setNewFeed] = useState({ name: '', url: '', category: 'Nacional' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchStatus = useCallback(() => {
        setLoading(true);
        // Chama o método corrigido que carrega os feeds do localStorage e verifica o status
        const status = newsService.getFeedStatus(); 
        setStatusList(status);
        setLoading(false);
    }, [newsService]);

    const handleAddFeed = () => {
        if (!newFeed.name || !newFeed.url || !newFeed.category) {
            setMessage({ type: 'error', text: 'Preencha todos os campos.' });
            return;
        }
        
        const added = newsService.addFeed(newFeed.category, newFeed.name, newFeed.url);
        
        if (added) {
            setMessage({ type: 'success', text: `Feed "${newFeed.name}" adicionado com sucesso!` });
            setNewFeed({ name: '', url: '', category: newFeed.category }); // Limpa o formulário
            fetchStatus(); // Atualiza a lista
        } else {
            setMessage({ type: 'error', text: `Feed "${newFeed.name}" já existe.` });
        }
    };

    const handleRemoveFeed = (url) => {
        const removed = newsService.removeFeed(url);
        if (removed) {
            setMessage({ type: 'success', text: 'Feed removido com sucesso.' });
            fetchStatus(); // Atualiza a lista
        } else {
            setMessage({ type: 'error', text: 'Erro ao remover feed.' });
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Status dos Feeds RSS</h1>
                
                <div className="flex justify-between items-center mb-6">
                    <Button onClick={() => setIsStatusPage(false)} variant="outline">
                        Voltar para Notícias
                    </Button>
                    <Button onClick={fetchStatus} disabled={loading} className="flex items-center space-x-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Atualizando...' : 'Atualizar Status'}</span>
                    </Button>
                </div>

                {/* Formulário de Adição de Feed */}
                <Card className="shadow-lg mt-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Adicionar Novo Feed RSS</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {message.text && (
                            <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                                <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                    {message.text}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Nome da Fonte (Ex: CNN Brasil)"
                                value={newFeed.name}
                                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                                className="md:col-span-2"
                            />
                            <Input
                                placeholder="URL do Feed RSS (Ex: https://cnnbrasil.com.br/feed)"
                                value={newFeed.url}
                                onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                                className="md:col-span-2"
                            />
                            <Select value={newFeed.category} onValueChange={(value) => setNewFeed({ ...newFeed, category: value })}>
                                <SelectTrigger className="md:col-span-1">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Nacional', 'Internacional', 'Criptomoedas'].map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddFeed} className="md:col-span-1">
                                Adicionar Feed
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg mt-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Visão Geral</CardTitle>
                        <CardDescription>Monitoramento em tempo real da conectividade dos feeds RSS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statusList.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                                    {/* Bloco 1: Nome e URL */}
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600 truncate">{item.url}</p>
                                    </div>
                                    
                                    {/* Bloco 2: Status, Categoria e Botão Remover */}
                                    <div className="text-right flex items-center space-x-4">
                                        
                                        {/* Categoria como Badge */}
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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
                            {statusList.length === 0 && !loading && (
                                <Alert>
                                    <AlertDescription>Nenhum feed RSS encontrado. Adicione feeds para monitorar.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default App
