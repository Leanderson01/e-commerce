# TODO - E-commerce Project

## 📋 Visão Geral do Projeto

**Objetivo:** Criar um e-commerce completo com Next.js, Shadcn/ui, TanStack Form, tRPC, Drizzle e Supabase. Estamos usando o Bun como gerenciador de pacotes.

**Tipos de Usuário:**

- **Non-Logged:** Home, Categorias, Carrinho, Login, Cadastro
- **Customer:** Home, Categorias, Carrinho, Perfil, Pedidos + Pode comprar
- **Admin:** Tudo do Customer + Gerenciar Categorias/Produtos

## ⚡ FASE 1: Componentes Base e Layout

### 1.1 Header/Navbar

**Referência:** Aparece em todos os Figmas

- [x] Criar componente `Header/Navbar`
  - [x] Logo/Brand
  - [x] Menu de navegação principal
  - [x] Ícone carrinho com contador
  - [x] Menu de usuário (dropdown)
  - [x] Botão login/logout
- [x] Implementar navegação responsiva
  - [x] Menu mobile (hamburguer)
  - [x] Sheet/Modal para mobile
- [x] Implementar controle de permissões
  - [x] Mostrar/ocultar itens baseado no role
  - [x] Menu diferente para admin

### 1.2 Footer

- [x] Criar componente `Footer`
  - [x] Links institucionais
  - [x] Redes sociais
  - [x] Copyright
- [x] Tornar responsivo

### 1.3 Layout Principal

- [x] Criar `MainLayout` component
- [x] Integrar Header + Footer
- [x] Configurar container principal
- [x] Adicionar loading states globais
- [x] Adicionar error boundaries

### 1.4 Sistema de Navegação

- [x] Criar HOC/middleware para proteção de rotas
- [x] Implementar redirecionamentos baseados em role
- [x] Criar componente `ProtectedRoute`
- [x] Criar componente `AdminRoute`

---

## 🎯 FASE 2: Páginas Principais

### 2.1 Homepage

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=739-21982

- [ ] Hero Section
  - [ ] Banner principal
  - [ ] Call-to-action
  - [ ] Imagem/video de destaque
- [ ] Seção Produtos em Destaque
  - [ ] Grid de produtos
  - [ ] Cards de produto (shadcn/ui)
  - [ ] Integração com tRPC `product.list.getProducts`
- [ ] Seção Categorias
  - [ ] Grid de categorias
  - [ ] Links para páginas específicas
  - [ ] Integração com tRPC `category.list.getCategories`
- [ ] Otimizações
  - [ ] SSG/ISR
  - [ ] Lazy loading de imagens
  - [ ] SEO meta tags

### 2.2 Página de Categorias (Geral)

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=938-4215

- [x] Layout com filtros laterais
  - [x] Filtro por categoria
  - [x] Filtro por preço
  - [x] Filtro por disponibilidade
- [x] Grid de produtos
  - [x] Cards responsivos
  - [x] Paginação (shadcn/ui)
  - [x] Loading states
- [x] Integração tRPC
  - [x] `category.list.getCategories`
  - [x] `product.list.getProducts`
- [x] Funcionalidades
  - [x] Busca/filtro em tempo real
  - [x] Ordenação (preço, nome, data)

### 2.3 Página de Categoria Específica

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=938-3075

- [x] Header da categoria
  - [x] Nome e descrição
  - [] Breadcrumb (shadcn/ui)
- [x] Grid de produtos da categoria
  - [x] Mesmo layout da página geral
  - [x] Filtros específicos
- [x] Integração tRPC
  - [x] `product.list.getProductsByCategory`
  - [x] `category.list.getCategoryById`

### 2.4 Detalhes do Produto

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=739-20512

- [ ] Layout do produto
  - [ ] Galeria de imagens
  - [ ] Informações principais
  - [ ] Preço e disponibilidade
  - [ ] Descrição detalhada
- [ ] Funcionalidades de compra
  - [ ] Seletor de quantidade
  - [ ] Botão "Adicionar ao Carrinho"
  - [ ] Verificação de estoque
- [ ] Integração tRPC
  - [ ] `product.list.getProductById`
  - [ ] `cart.form.addToCart`
- [ ] SEO
  - [ ] Meta tags dinâmicas
  - [ ] Schema markup

### 2.5 Carrinho

- [ ] Lista de itens
  - [ ] Imagem, nome, preço
  - [ ] Controles quantidade
  - [ ] Remover item
- [ ] Resumo do pedido
  - [ ] Subtotal
  - [ ] Total
  - [ ] Botão finalizar compra
- [ ] Integração tRPC
  - [ ] `cart.list.getCart`
  - [ ] `cart.form.updateCartItem`
  - [ ] `cart.form.removeFromCart`
  - [ ] `cart.form.clearCart`
- [ ] Estados
  - [ ] Carrinho vazio
  - [ ] Loading states
  - [ ] Error states

---

## 👤 FASE 3: Área do Cliente

### 3.1 Perfil do Cliente

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=739-20894

- [ ] Dashboard principal
  - [ ] Overview de pedidos
  - [ ] Informações pessoais
- [ ] Tabs/Seções (shadcn/ui)
  - [ ] Dados pessoais
  - [ ] Endereços
  - [ ] Histórico de pedidos
  - [ ] Configurações
- [ ] Forms de edição (TanStack Form)
  - [ ] Editar perfil com TanStack Form
  - [ ] Alterar senha
  - [ ] Validações
- [ ] Integração tRPC

  - [ ] `auth.user.getUserProfile`
  - [ ] `auth.form.updateUserProfile`

  ### 3.2 Página de Pedidos

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=852-2589

- [ ] Lista de pedidos
  - [ ] Status visual (badges shadcn/ui)
  - [ ] Data, valor, itens
  - [ ] Paginação
- [ ] Detalhes do pedido
  - [ ] Dialog/Modal ou página separada
  - [ ] Lista de itens
  - [ ] Informações de entrega
- [ ] Integração tRPC
  - [ ] `order.list.getUserOrders`
  - [ ] `order.list.getOrderById`
- [ ] Funcionalidades
  - [ ] Filtrar por status
  - [ ] Buscar pedidos

---

## 🔧 FASE 4: Área Admin

### 4.1 Perfil Admin

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=938-6143

- [ ] Dashboard administrativo
  - [ ] Métricas gerais (cards shadcn/ui)
  - [ ] Links rápidos
- [ ] Menu admin específico
  - [ ] Gerenciar produtos
  - [ ] Gerenciar categorias
  - [ ] Relatórios
- [ ] Integração tRPC
  - [ ] Usar procedures admin existentes

### 4.2 Gerenciar Produtos

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=938-6208

- [ ] Lista de produtos
  - [ ] Table com ações (shadcn/ui)
  - [ ] Busca e filtros
  - [ ] Paginação
- [ ] CRUD Produtos
  - [ ] Criar produto
  - [ ] Editar produto
  - [ ] Deletar produto
  - [ ] Upload de imagens
- [ ] Integração tRPC
  - [ ] `product.list.getProducts`
  - [ ] `product.form.createProduct`
  - [ ] `product.form.updateProduct`
  - [ ] `product.form.deleteProduct`
  - [ ] `product.form.uploadProductImage`

### 4.3 Adicionar/Editar Produtos e Categorias

**Referência:** https://www.figma.com/design/8knRdcH1dxOOhxPhNasxJb/Ecommerce?node-id=962-1737

- [ ] Form de produto (TanStack Form + shadcn/ui)
  - [ ] Campos básicos
  - [ ] Upload de imagem
  - [ ] Select de categoria
  - [ ] Validações
- [ ] Form de categoria (TanStack Form + shadcn/ui)
  - [ ] Nome, descrição
  - [ ] Validações
- [ ] Integração tRPC
  - [ ] `category.form.createCategory`
  - [ ] `category.form.updateCategory`

---

## 🚀 FASE 5: Otimizações e Deploy

### 5.1 Performance

- [ ] Lazy loading de componentes
- [ ] Otimização de imagens (Next Image)
- [ ] Bundle analysis
- [ ] Core Web Vitals

### 5.2 SEO

- [ ] Meta tags dinâmicas
- [ ] Sitemap
- [ ] Robots.txt
- [ ] Schema markup

### 5.3 Deploy Vercel

- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio
- [ ] SSL/HTTPS
- [ ] Analytics

### 5.4 Testes

- [ ] Fluxo completo de compra
- [ ] Todas as funcionalidades admin
- [ ] Responsividade
- [ ] Cross-browser

---

## 📝 Notas de Desenvolvimento

### Convenções

- **Componentes:** PascalCase
- **Arquivos:** kebab-case
- **Pastas:** kebab-case
- **TanStack Form:** Usar com Zod validation + shadcn/ui
- **Estado:** Considerar Zustand para carrinho global

### Prioridades

1. **Funcionalidade** antes de perfeição visual
2. **Mobile-first** approach
3. **Acessibilidade** básica
4. **Performance** core

### Stack Final

- **UI:** Shadcn/ui (mantido)
- **Forms:** TanStack Form (novo)
- **Backend:** tRPC + Drizzle + Supabase
- **Package Manager:** Bun

---

## ✅ Status Geral

**Progresso Atual:**

- [x] Backend completo e funcional
- [x] Auth básico funcionando (react-hook-form)
- [x] Shadcn/ui configurado
- [x] Migration TanStack Form
- [ ] Frontend principal

**Estimativa:** 2-3 semanas para MVP completo
