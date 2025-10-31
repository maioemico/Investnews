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

      const articles = await fetchNewsByCategory(category)
      
      if (articles && articles.length > 0) {
        setNews(articles)
        setStats(getNewsStatsByCategory(articles))
        setLastUpdate(new Date())
      } else {
        // Usar dados mock como fallback
        console.warn('Nenhuma notícia carregada dos RSS feeds, usando dados de demonstração')
        const mockData = getMockDataByCategory(category)
        setNews(mockData)
        setStats(getNewsStatsByCategory(mockData))
        setLastUpdate(new Date())
        setError('Usando dados de demonstração - alguns RSS feeds podem estar indisponíveis')
      }
    } catch (err) {
      console.error('Erro ao carregar notícias:', err)
      setError(err.message || 'Erro ao carregar notícias')
      // Usar dados mock como fallback em caso de erro
      const mockData = getMockDataByCategory(category)
      setNews(mockData)
      setStats(getNewsStatsByCategory(mockData))
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
  const filteredNews = filterNews(news, {
    search: searchTerm,
    source: selectedSource,
    category: selectedCategory,
    feedCategory: selectedFeedCategory
  })

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
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
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
                onClick={() => loadNews(selectedFeedCategory)} 
                variant="outline" 
                className="flex items-center space-x-2"
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
          <div className="flex flex-wrap gap-4 justify-center">
            {['Nacional', 'Internacional', 'Criptomoedas'].map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedFeedCategory(category)}
                className={`flex items-center space-x-2 px-6 py-3 text-lg font-semibold transition-all duration-200 ${
                  selectedFeedCategory === category
                    ? getCategoryColor(category) + ' shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {getCategoryIcon(category)}
                <span>{category}</span>
                {stats && stats.byFeedCategory[category] && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.byFeedCategory[category]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total de Notícias</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Alta Relevância</p>
                    <p className="text-2xl font-bold">{stats.byRelevance.high}</p>
                  </div>
                  <Star className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Média Relevância</p>
                    <p className="text-2xl font-bold">{stats.byRelevance.medium}</p>
                  </div>
                  <Filter className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Categoria Atual</p>
                    <p className="text-lg font-bold">{selectedFeedCategory}</p>
                  </div>
                  {getCategoryIcon(selectedFeedCategory)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar notícias..."/>
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* News Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="all">Todas as Notícias ({filteredNews.length})</TabsTrigger>
            <TabsTrigger value="top">Alta Relevância ({topNews.length})</TabsTrigger>
            <TabsTrigger value="regular">Outras ({regularNews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  {article.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getRelevanceBadgeColor(article.relevanceScore)}>
                        {getRelevanceLabel(article.relevanceScore)}
                      </Badge>
                      <div className="flex gap-1">
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={`${getCategoryColor(article.feedCategory)} text-xs`}>
                          {article.feedCategory}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </CardDescription>
                    <div className="flex items-center
                    justify-between text-gray-500 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>{article.source}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  {article.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getRelevanceBadgeColor(article.relevanceScore)}>
                        {getRelevanceLabel(article.relevanceScore)}
                      </Badge>
                      <div className="flex gap-1">
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={`${getCategoryColor(article.feedCategory)} text-xs`}>
                          {article.feedCategory}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </CardDescription>
                    <div className="flex items-center
                    justify-between text-gray-500 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>{article.source}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regular" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  {article.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getRelevanceBadgeColor(article.relevanceScore)}>
                        {getRelevanceLabel(article.relevanceScore)}
                      </Badge>
                      <div className="flex gap-1">
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={`${getCategoryColor(article.feedCategory)} text-xs`}>
                          {article.feedCategory}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </CardDescription>
                    <div className="flex items-center
                    justify-between text-gray-500 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>{article.source}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

