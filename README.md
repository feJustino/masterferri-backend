# MasterFerri Backend

Backend Node.js com Express e TypeScript para integração com a API do Bling, seguindo padrões SOLID e arquitetura limpa.

## 🚀 Características

- **Arquitetura SOLID** com Dependency Injection
- **Integração completa com API do Bling** (OAuth2)
- **Cache inteligente** com TTL configurável
- **Rate limiting** e proteção contra DDoS
- **Logs estruturados** com Pino
- **Documentação automática** com Swagger
- **Testes unitários** com Jest
- **Docker ready** para desenvolvimento e produção
- **Monitoramento** com métricas e health checks
- **Retry automático** em falhas temporárias
- **Validação robusta** de entrada com Zod

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Credenciais da API do Bling (Client ID e Secret)
- Docker (opcional)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd masterferri-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
BLING_CLIENT_ID=seu_client_id_aqui
BLING_CLIENT_SECRET=seu_client_secret_aqui
BLING_API_URL=https://api.bling.com.br/v3
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3000

## 📚 Documentação da API

Acesse a documentação Swagger em: http://localhost:3000/api-docs

### Endpoints principais:

- `GET /api/v1/products` - Listar produtos com filtros
- `GET /api/v1/products/:id` - Buscar produto por ID
- `GET /api/v1/products/search` - Buscar produtos por termo
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/refresh` - Forçar refresh do token

## 🏗️ Arquitetura

### Estrutura de pastas:
```
src/
├── config/           # Configurações e DI
├── controllers/      # Controllers HTTP
├── services/         # Lógica de negócio
├── repositories/     # Acesso a dados
├── interfaces/       # Contratos TypeScript
├── middleware/       # Middlewares Express
├── routes/           # Definição de rotas
├── utils/           # Utilitários
├── types/           # Tipos TypeScript
└── server.ts        # Entry point
```

### Padrões implementados:

- **Repository Pattern** - Abstração do acesso a dados
- **Service Layer** - Lógica de negócio separada
- **Dependency Injection** - Baixo acoplamento
- **Factory Pattern** - Criação de instâncias
- **Strategy Pattern** - Algoritmos de retry e cache

## 🐳 Docker

### Desenvolvimento:
```bash
docker-compose up -d
```

### Produção:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar coverage
npm run test:coverage
```

## 📊 Monitoramento

### Health Check:
- **Básico**: `GET /api/v1/health`
- **Detalhado**: `GET /api/v1/health/detailed`

### Métricas disponíveis:
- Total de requests
- Taxa de erro
- Tempo médio de resposta
- Taxa de cache hit/miss
- Status dos serviços externos

## 🔒 Segurança

- **Helmet.js** - Headers de segurança
- **CORS** configurável
- **Rate limiting** por IP
- **Validação de entrada** rigorosa
- **Sanitização de erros** para produção
- **Tokens nunca expostos** nas respostas

## ⚡ Performance

- **Cache em memória** com TTL configurável
- **Compressão gzip** habilitada
- **Conexões keep-alive**
- **Retry automático** com backoff exponencial
- **Paginação** eficiente
- **Otimização de queries** para Bling API

## 🔧 Scripts disponíveis

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm run start        # Iniciar servidor em produção
npm test             # Executar testes
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas de lint
```

## 📈 Configurações

### Cache:
- `CACHE_DEFAULT_TTL=300` - TTL padrão (5 min)
- `CACHE_PRODUCTS_TTL=600` - TTL para produtos (10 min)
- `CACHE_TOKENS_TTL=3300` - TTL para tokens (55 min)

### Rate Limiting:
- `RATE_LIMIT_WINDOW_MS=900000` - Janela de tempo (15 min)
- `RATE_LIMIT_MAX=100` - Máximo de requests por janela

### Retry:
- `RETRY_MAX_ATTEMPTS=3` - Tentativas máximas
- `RETRY_DELAY=1000` - Delay inicial (1s)
- `RETRY_BACKOFF=exponential` - Estratégia de backoff

## 🚨 Troubleshooting

### Problemas comuns:

1. **Token expirado**:
   - O sistema faz refresh automático
   - Para forçar refresh: `POST /api/v1/auth/refresh`

2. **Rate limit da API Bling**:
   - Configurado retry automático
   - Verifique logs para detalhes

3. **Cache não funcionando**:
   - Verifique health check: `/api/v1/health`
   - Logs mostrarão problemas específicos

4. **Erro de autenticação**:
   - Verifique credenciais no `.env`
   - Confirme se tokens são válidos

## 📞 Suporte

Para suporte e dúvidas:
- Crie uma issue no repositório
- Consulte a documentação da API do Bling
- Verifique os logs da aplicação

## 📄 Licença

Este projeto está sob a licença MIT.

---

**🔥 Production Ready** - Este backend está preparado para deploy imediato em produção!
