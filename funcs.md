# E-commerce
- Projeto de um e-commerce com login, cadastro, carrinho de compras, página de conta e página de produtos. Irá desenvolvido com a Next.js, tRPC, Drizzle, Supabase, Shadcn/UI e Tailwind CSS (T3 Stack).
- Teremos dois tipos de usuários: administradores e clientes.

## Funcionalidades

### Página inicial
- Uma lista de produtos que podem ser comprados (estão em estoque, quantidade do produto maior que zero)
- Uma área de única de login
    - Clientes e administradores podem usar essa área para se identificar no sistema (criar uma sessão de usuário e ter acesso aos recursos privados do seu perfil)
- Uma área ou link que remeta a outra página para que um novo cliente possa efetuar seu cadastro
- Uma área ou link que remeta a outra página para que o usuário possa ver seu carrinho de compras

Observação:
- Todos os itens supracitados são públicos (não precisa de sessão de usuário para acesso)

### Página de login
- Um formulário para que sejam informados os campos obrigatórios do cadastro cliente
- Um botão para enviar, ao servidor, os dados do cliente e efetivar a persistência em Banco de Dados
- Um link que leve o usuário a página inicial, caso seja uma outra página

Observação:
- Neste formulário aplique códigos JavaScript para que os dados só sejam enviados ao servidor se estiverem corretos e que todos os campos obrigatórios tenham sido preenchidos

### Página de cadastro
- Um formulário para que sejam informados os campos obrigatórios do cadastro cliente
- Um botão para enviar, ao servidor, os dados do cliente e efetivar a persistência em Banco de Dados

Observação:
- Neste formulário aplique códigos JavaScript para que os dados só sejam enviados ao servidor se estiverem corretos e que todos os campos obrigatórios tenham sido preenchidos

### Página de Conta
- Deve listar as compras efetivadas do cliente
- Deve ter um botão para o cliente efetuar logout

### Página de carrinho de compras
- Uma lista de produtos e suas respectivas quantidades que foram colocados no carrinho de compras
- Para cada item da lista de produtos deve ter uma opção de excluir o produto ou alterar sua quantidade
- Uma informação sobre o total, em valores monetários, dos itens do carrinho de compras
- Um link que leve o usuário a página inicial, caso seja uma outra página
- Um botão para efetuar a compra dos produtos do carrinho de compras
    - Essa ação só deve funcionar se o cliente estiver cadastrado e identificado com uma sessão válida de usuário

## Comportamentos do sistema

### Cliente efetua login com sucesso
- Visualizar suas compras anteriores (compras já efetivadas)
- Alterar seus dados pessoais ou excluir seu cadastro
- Gerenciar seu carrinho de compras e, opcionalmente, efetivar sua compra com os produtos que estão no carrinho de compras
    - As compras só poderão ser efetivadas se todas as quantidades dos produtos do carrinho estiverem disponíveis em estoque
    - Não esquecer de atualizar o estoque após a efetivação de cada compra
- Efetuar o logout

Observação:
- Todas essas ações só podem ser realizadas caso o cliente esteja cadastrado e identificado com uma sessão válida de usuário    

### Administrador efetua login com sucesso
- Visualizar ou remover as compras de qualquer cliente (compras já efetivadas)
- Alterar seus dados pessoais ou excluir seu cadastro
- Inserir, alterar, remover e listar categorias
- Inserir, alterar, remover e listar produtos
    - A ação de alterar pode ser utilizada para manutenção do estoque dos produtos
    - Nas inserções e alterações de produtos deve ser possível incluir, alterar ou remover uma foto destes produtos (use o recurso de upload de foto para o servidor)
- Ter acesso aos seguintes relatórios gerenciais:
    - Total de compras por cliente em um determinado período, exibindo o id do cliente, o nome do cliente e quantidade de compras que ele realizou
        - Faça uma ordenação do cliente que mais comprou para o que menos comprou
    - Produtos que estão faltando em estoque, exibindo o id, a descrição, o preço de cada produto
        - Faça uma ordenação do ascendente pela descrição do produto
    - Total de valor recebido por dia (valor monetário total de compras por dia) em um determinado período, exibindo a data e valor total recebido naquela data
        - Faça uma ordenação pela data de forma ascendente
- Efetuar o logout

Observação:
    - Todas essas ações de administrador só podem ser realizadas caso o administrador esteja cadastrado e identificado com uma sessão válida de usuário
    - Os resultados dos relatórios gerenciais podem ser disponibilizados em text/html, text/plain ou application/pdf
    - Não precisa criar uma interface para inserir um administrador, isso pode ser feito diretamente no Banco de Dados

## Tabelas do Banco de Dados

### Lista de Tabelas Necessárias

- **Usuario** (já existente)
  - Armazena informações de autenticação dos usuários
  - Diferencia entre clientes e administradores
  - Campos principais: id, email, senha, tipo (admin/cliente), createdAt, updatedAt

- **Perfil** (já existente)
  - Armazena dados pessoais do usuário
  - Campos principais: id, usuarioId, nome, endereco, telefone, dataNascimento, etc.

- **Produto**
  - Armazena informações sobre os produtos disponíveis
  - Campos principais: id, categoriaId, nome, descricao, preco, quantidadeEstoque, imagemUrl, createdAt, updatedAt

- **Categoria**
  - Armazena as categorias de produtos
  - Campos principais: id, nome, descricao, createdAt, updatedAt

- **Carrinho**
  - Armazena o carrinho de compras atual de cada usuário
  - Campos principais: id, usuarioId, createdAt, updatedAt

- **ItemCarrinho**
  - Armazena os itens individuais nos carrinhos
  - Campos principais: id, carrinhoId, produtoId, quantidade, precoUnitario, createdAt, updatedAt

- **Pedido**
  - Armazena as compras efetivadas
  - Campos principais: id, usuarioId, dataCompra, valorTotal, status, createdAt, updatedAt

- **ItemPedido**
  - Armazena os itens individuais de cada pedido
  - Campos principais: id, pedidoId, produtoId, quantidade, precoUnitario, createdAt, updatedAt

- **Venda**
  - Armazena registros financeiros de todas as vendas realizadas
  - Permite que administradores tenham acesso detalhado às transações
  - Campos principais: id, pedidoId, usuarioId, dataVenda, valorTotal, formaPagamento, status, createdAt, updatedAt

## Funções do Back-end

### Autenticação e Usuários
- **login** (já implementado)
- **signup** (já implementado)
- **logout** (já implementado)
- **getUserLogged** - obter dados do usuário atualmente logado
- **getUserProfile** - obter dados do perfil do usuário
- **updateUserProfile** - atualizar dados do perfil
- **deleteUserAccount** - excluir conta de usuário

### Produtos
- **getProducts** - listar produtos disponíveis/em estoque
- **getProductById** - obter detalhes de um produto
- **getProductsByCategory** - listar produtos por categoria
- **createProduct** (admin) - adicionar novo produto
- **updateProduct** (admin) - atualizar dados do produto
- **updateProductStock** (admin) - atualizar estoque do produto
- **deleteProduct** (admin) - remover produto
- **uploadProductImage** (admin) - enviar imagem de produto

### Categorias
- **getCategories** - listar todas as categorias
- **getCategoryById** - obter detalhes de uma categoria
- **createCategory** (admin) - adicionar nova categoria
- **updateCategory** (admin) - atualizar categoria
- **deleteCategory** (admin) - remover categoria

### Carrinho de Compras
- **getCart** - obter carrinho atual do usuário
- **addToCart** - adicionar produto ao carrinho
- **updateCartItem** - atualizar quantidade de um item
- **removeFromCart** - remover item do carrinho
- **clearCart** - limpar o carrinho

### Pedidos/Compras
- **createOrder** - criar pedido a partir do carrinho atual
- **getUserOrders** - listar pedidos do usuário atual
- **getOrderById** - obter detalhes de um pedido
- **getAllOrders** (admin) - listar todos os pedidos
- **deleteOrder** (admin) - remover um pedido

### Relatórios (Admin)
- **getOrdersByCustomer** - obter total de compras por cliente em período
- **getOutOfStockProducts** - listar produtos sem estoque
- **getDailyRevenue** - obter receita diária em período específico
