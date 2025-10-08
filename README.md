# Quiz de Imigração para o Canadá

Um quiz interativo para ajudar pessoas a descobrir os melhores programas de imigração canadense baseado em seus perfis pessoais.

**URL**: https://lovable.dev/projects/ec587b2f-b360-447b-afee-f65d37a2365e

## Funcionalidades

- Quiz personalizado com 11 perguntas sobre perfil de imigração
- Sistema de pontuação baseado nas regras de 2025 do governo canadense
- Análise de compatibilidade com diferentes programas (Express Entry, PNP, etc.)
- Interface responsiva e acessível
- Sistema de PDF para resultados
- Integração com email para envio de relatórios
- **Express Entry Draws**: Visualização de draws recentes com gráficos e atualização automática

## Express Entry Draws

### Funcionalidades
- **Gráfico interativo**: CRS mínimo e número de ITAs ao longo do tempo
- **Tabela completa**: Histórico detalhado de todos os draws
- **Filtros**: Por período (6m, 12m, todos) e tipo (geral, PNP, CEC, categoria)
- **Links oficiais**: Acesso direto às páginas do IRCC para cada draw
- **Atualização automática**: Sincronização a cada 6 horas via cron job

### Rotas da API

#### Listar Draws
```bash
GET /api-draws?limit=20&type=general&category=Healthcare
```

**Parâmetros:**
- `limit`: Número de draws a retornar (1-100, padrão: 20)
- `type`: Filtrar por tipo (general, pnp, cec, category)
- `category`: Filtrar por categoria (quando type=category)

**Resposta:**
```json
{
  "draws": [
    {
      "id": 325,
      "date": "2025-10-01T14:12:29Z",
      "type": "category",
      "category": "Healthcare occupations",
      "invitations": 2500,
      "crs_min": 470,
      "source_url": "https://..."
    }
  ],
  "count": 1
}
```

#### Dados para Gráfico
```bash
GET /api-draws-series?window=12m&type=general
```

**Parâmetros:**
- `window`: Período (6m, 12m, all)
- `type`: Filtrar por tipo (opcional)

**Resposta:**
```json
{
  "labels": ["2025-08-19", "2025-09-02"],
  "crs": [470, 486],
  "itas": [2500, 4500],
  "items": [
    {
      "date": "2025-08-19",
      "title": "Category: Healthcare",
      "points": 470,
      "invitations": 2500,
      "category": "Healthcare occupations",
      "source_url": "https://...",
      "type": "category"
    }
  ],
  "updatedAt": "2025-10-08T12:00:00Z"
}
```

### Sincronização Manual

Para forçar uma sincronização imediata:
```bash
curl -X POST "https://ulwatxrssexhbxuhapbb.supabase.co/functions/v1/sync-express-entry" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Arquitetura

1. **Database**: Tabela `express_entry_draws` armazena todos os draws
2. **Edge Function**: `sync-express-entry` faz scraping incremental do site do IRCC
3. **Cron Job**: Executa sync a cada 6 horas automaticamente
4. **APIs Públicas**: `api-draws` e `api-draws-series` servem dados ao frontend
5. **Frontend**: React com Recharts para visualização

### Fonte de Dados

Os dados são coletados diretamente das páginas oficiais do IRCC:
```
https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations-{ID}.html
```

## PDF de Resultados

### Fluxo
1. **Preview**: Usuários podem visualizar resultados em `/pdf/preview?resultId=DEMO`
2. **API PDF**: Endpoint `/functions/v1/generate-pdf` gera PDF usando Puppeteer
3. **Envio Email**: Endpoint `/functions/v1/send-welcome-email` envia PDF por email via Resend

### Funcionalidades do PDF
- Layout idêntico ao app web
- Otimizado para impressão A4
- Inclui disclaimer oficial do IRCC
- Data de atualização das regras
- Attachment automático por email

### Como testar localmente

#### Preview do PDF
```bash
# Acesse no navegador
http://localhost:5173/pdf/preview?resultId=DEMO
```

#### Gerar PDF via API
```bash
# POST request para gerar PDF
curl -X POST "http://localhost:54321/functions/v1/generate-pdf" \
  -H "Content-Type: application/json" \
  -d '{"resultId": "DEMO"}' \
  --output resultado.pdf
```

#### Enviar por email
```bash
# POST request para enviar email com PDF
curl -X POST "http://localhost:54321/functions/v1/send-welcome-email" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "resultId": "DEMO"}'
```

## Variáveis de Ambiente

### Obrigatórias
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Para funcionalidade de PDF/Email
```env
# Resend (para envio de emails)
RESEND_API_KEY=re_your_api_key
MAIL_FROM="Canada Immigration Quiz <noreply@yourdomain.com>"
```

### Opcional
```env
# Para ambientes de produção
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **PDF**: Puppeteer (via Supabase Edge Functions)
- **Email**: Resend
- **Deploy**: Lovable (auto-deploy)

## Sistema de Pontuação

O sistema segue as regras oficiais de imigração canadense de 2025:

### Programas Suportados
- **Express Entry**: FSW, CEC, FST
- **Provincial Nominee Programs (PNP)**
- **Quebec Immigration**
- **Family Sponsorship**
- **Study Permit → Work → PR**
- **Start-Up Visa**
- **Self-Employed Persons**

### Fatores de Pontuação
- Idade (máximo 25 pontos)
- Educação (máximo 15 pontos)
- Idiomas (CLB - máximo 30 pontos)
- Experiência de trabalho (máximo 35 pontos)
- Experiência canadense (máximo 30 pontos)
- Vínculos provinciais (máximo 15 pontos)

### Regras de Elegibilidade
- **FSW**: CLB 7 mínimo, 1 ano contínuo TEER 0-3, ECA, fundos
- **CEC**: 12 meses no Canadá, CLB conforme TEER
- **FST**: Ocupação trade, CLB 5 L/S e 4 R/W
- **Category-Based Selection**: Bônus para STEM, Healthcare, Trades, French

## Como editar o código

### Use o Lovable
Simplesmente visite o [Projeto Lovable](https://lovable.dev/projects/ec587b2f-b360-447b-afee-f65d37a2365e) e comece a fazer prompts.

### Use seu IDE preferido
```sh
# Passo 1: Clone o repositório
git clone <SUA_URL_GIT>

# Passo 2: Navegue para o diretório
cd <NOME_DO_PROJETO>

# Passo 3: Instale dependências
npm install

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

### Via GitHub diretamente
- Navegue para o arquivo desejado
- Clique no botão "Edit" (ícone de lápis)
- Faça suas mudanças e commit

### GitHub Codespaces
- Vá para a página principal do repositório
- Clique no botão "Code" (verde)
- Selecione a aba "Codespaces"
- Clique em "New codespace"

## Deploy

Abra [Lovable](https://lovable.dev/projects/ec587b2f-b360-447b-afee-f65d37a2365e) e clique em Share → Publish.

### Domínio Customizado
Para conectar um domínio, navegue para Project > Settings > Domains e clique Connect Domain.

## Disclaimer Importante

Esta ferramenta é **apenas informativa**. Regras, valores e prazos mudam com frequência no sistema de imigração canadense. 

**Sempre consulte**:
- Site oficial do IRCC: [canada.ca](https://canada.ca)
- Profissional de imigração licenciado (RCIC)

### Responsabilidades de Manutenção
- Manter tabelas de fundos mínimos atualizadas
- Acompanhar mudanças nos cortes de CLB
- Atualizar regras de Category-Based Selection
- Verificar novos programas provinciais

---

© 2025 Canada Immigration Quiz - Baseado em dados oficiais do governo canadense