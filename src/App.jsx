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
import NewsService from './services/newsService';
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
  // CORREÇÃO: Usando newsService.filterNews
  const filteredNews = newsService.filterNews(news, { 
    search: searchTerm,
    source: selectedSource,
    category: selectedCategory,
    feedCategory: selectedFeedCategory
  }) || [] 

  const topNews = filteredNews.filter(article => article.relevanceScore >= 90)
  const regularNews = filteredNews.filter(article => article.relevanceScore < 90)

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
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100>
     
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
             onClick={() => setIsStatusPage(true)} // <--- NOVO BOTÃO
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
  // Removemos o w-full e usamos w-48 no mobile também, mas com mx-auto para centralizar
  // Usaremos w-full apenas se for realmente necessário.
  <div key={category} className="flex items-center space-x-2 w-full sm:w-auto"> 
    <Button
      onClick={() => setSelectedFeedCategory(category)}
      // Mantenha a largura fixa de 192px (w-48)
      className={`flex items-center space-x-2 w-48 justify-start px-6 py-3 text-lg font-semibold transition-all duration-200 ${
        selectedFeedCategory === category
          ? getCategoryColor(category) + ' shadow-lg scale-105'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {getCategoryIcon(category)}
      <span>{category}</span>
      {/* O Badge foi removido daqui */}
    </Button>
    
    {/* O Badge de contagem agora está FORA do botão */}
    {stats && stats.byFeedCategory[category] && (
      <Badge 
        variant="secondary" 
        className="text-sm font-bold bg-gray-300 text-gray-800"
      >
        {stats.byFeedCategory[category]}
      </Badge>
    )}
  </div>
))}

          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedSource}
            onValueChange={setSelectedSource}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fontes ({uniqueSources.length + 1})</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias ({uniqueCategories.length + 1})</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notícias de Alta Relevância */}
        {topNews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <span>Alta Relevância</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topNews.map((article, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-700">{article.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(article.pubDate)}</span>
                      <span>•</span>
                      <span>{article.source}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{article.description}</p>
                    <div className="flex flex-wrap items-center space-x-2">
                      <Badge className={getRelevanceBadgeColor(article.relevanceScore)}>
                        {getRelevanceLabel(article.relevanceScore)}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                        {article.category}
                      </Badge>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm font-medium"
                      >
                        <span>Leia Mais</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notícias Regulares */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Filter className="h-6 w-6 text-gray-600" />
            <span>Outras Notícias</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(article.pubDate)}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">{article.description}</p>
                  <div className="flex flex-wrap items-center space-x-2 justify-start sm:justify-center">
                    <Badge className={getRelevanceBadgeColor(article.relevanceScore)}>
                      {getRelevanceLabel(article.relevanceScore)}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                      {article.category}
                    </Badge>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm font-medium"
                    >
                      <span>Leia Mais</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredNews.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-xl">Nenhuma notícia encontrada com os filtros atuais.</p>
              <p className="text-sm mt-2">Tente ajustar a pesquisa ou os filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Investnews. Agregador de Notícias de Investimentos.</p>
          <p className="mt-1">Desenvolvido com React, Vite e Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  )
}

// NOVO COMPONENTE: Página de Status do RSS
const StatusPage = ({ setIsStatusPage, newsService }) => {
    const [statusList, setStatusList] = useState([]);
    
    useEffect(() => {
        // A lista de status só é preenchida após a primeira busca de notícias
        setStatusList(newsService.getFeedStatus());
    }, [newsService]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Status dos Feeds RSS</h1>
                    <Button onClick={() => setIsStatusPage(false)}>
                        Voltar para Notícias
                    </Button>
                </div>

                <p className="text-gray-600 mb-6">
                    Monitoramento da última tentativa de conexão com os feeds. O status é atualizado a cada clique no botão "Atualizar".
                </p>

                {statusList.length === 0 ? (
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Status não disponível. Por favor, volte para a página principal e clique em "Atualizar" para iniciar a busca dos feeds.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-6">
                        {['Nacional', 'Internacional', 'Criptomoedas'].map(category => (
                            <div key={category}>
                                <h2 className="text-xl font-semibold text-blue-700 mb-3">{category}</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Tentativa</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {statusList.filter(s => s.category === category).map((feed, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feed.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge className={`text-xs font-semibold ${feed.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {feed.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feed.lastAttempt}</td>
                                                    <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-xs">
                                                        <a href={feed.url} target="_blank" rel="noopener noreferrer">{feed.url}</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default App

