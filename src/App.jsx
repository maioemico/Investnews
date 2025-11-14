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
// Usando o nome original, pois o newsService_final.js usa export default
import NewsService from './services/newsService.js'; // Ou './services/newsService'
const newsService = new NewsService(); // O nome da classe deve ser NewsService


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
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Estatísticas da Categoria ({selectedFeedCategory})</CardTitle>
              <CardDescription className="text-gray-600">Visão geral das notícias agregadas.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg bg-blue-50">
                <p className="text-3xl font-extrabold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Notícias Agregadas</p>
              </div>
              <div className="text-center p-3 border rounded-lg bg-green-50">
                <p className="text-xl font-bold text-green-600">Fontes:</p>
                {Object.entries(stats.bySource).map(([source, count]) => (
                  <p key={source} className="text-sm text-gray-700">{source} ({count})</p>
                ))}
              </div>
              <div className="text-center p-3 border rounded-lg bg-yellow-50">
                <p className="text-xl font-bold text-yellow-600">Categorias:</p>
                {Object.entries(stats.byFeedCategory).map(([category, count]) => (
                  <p key={category} className="text-sm text-gray-700">{category} ({count})</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-full md:w-[180px] shadow-sm">
              <Filter className="h-4 w-4 mr-2" />
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
            <SelectTrigger className="w-full md:w-[180px] shadow-sm">
              <Flag className="h-4 w-4 mr-2" />
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
        <div className="space-y-6">
          {/* Top News */}
          {topNews.length > 0 && (
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2 fill-red-600 text-red-600" />
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
			</div> 
</div>
</div>		  
	      ) 
	    } 

function StatusPage({ setIsStatusPage, newsService }) {
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(() => {
        setLoading(true);
        // Chama o método corrigido que carrega os feeds do localStorage e verifica o status
        const status = newsService.getFeedStatus(); 
        setStatusList(status);
        setLoading(false);
    }, [newsService]);

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

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Visão Geral</CardTitle>
                        <CardDescription>Monitoramento em tempo real da conectividade dos feeds RSS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statusList.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.name} ({item.category})</p>
                                        <p className="text-sm text-gray-600 truncate">{item.url}</p>
                                    </div>
                                    <div className="text-right">
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
