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