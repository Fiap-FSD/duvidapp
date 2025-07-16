<p align="center">
  <img src="public/Fiap-logo.jpg" width="400" /></a>
</p>

# ✨ Implementação do Front-End do DuvidApp

Este é um projeto de aplicativo de respostas a dúvidas colaborativas onde os usuários podem criar, editar e visualizar dúvidas e respostas. A aplicação foi construída utilizando o framework vue.js, JavaScript, tailwindcss, React Context API, Fetch API para chamadas a APIs externas, e autenticação com JWT armazenado em cookies. O design do projeto segue uma arquitetura moderna e modular, com foco na escalabilidade e na experiência do usuário.

Será apresentada a maneira de execução de cada step do projeto contendo informações cruciais sobre como configurar, usar e contribuir com o projeto.

## 🎯 Objetivos do Projeto

- Desenvolver uma interface gráfica para aplicação de blogging, utilizando React.js.
- Aplicação deve ser responsiva, acessível e fácil de usar.
- Implementar o uso de endpoints REST para permitir a interação entre os usuários e o conteúdo do blog.

## 🛠️ Ferramentas Utilizadas

A equipe utilizou as seguintes ferramentas durante o desenvolvimento do projeto:

- **Visual Studio Code**: Ferramenta utilizada para escrita e execução de código, com extensões específicas para JavaScript e Node.js. Sua integração com o terminal permite rodar o servidor diretamente dentro do editor, facilitando o desenvolvimento, testes e depuração de endpoints.

- **GitHub**: O GitHub ofereceu controle de versão, permitindo que cada membro da equipe trabalhasse em diferentes funcionalidades sem afetar o código principal. A utilização de pull requests facilitou a revisão de código e a integração das mudanças, garantindo qualidade e consistência.

- **Vue.js**: Framework em JavaScript progressivo  que permite rapidamente criar interfaces de usuário (IU). 

- **React**: Biblioteca JavaScript para construção de interfaces de usuário. O React foi utilizado para criar a interação dinâmica da aplicação, permitindo atualizações eficientes do DOM e gerenciamento de estado de forma reativa.

- **Tailwindcss**: Biblioteca que permite escrever CSS dentro de componentes React, criando componentes de estilo com escopo isolado.

- **Radix UI**: Uma biblioteca de componentes de interface do usuário (UI) de código aberto, focada em acessibilidade e personalização, que permite construir sistemas de design e aplicações web de alta qualidade. Ela oferece componentes básicos, como formulários, acordeões e modais, que podem ser usados como base para um sistema de design personalizado, sem estilização prévia, priorizando a acessibilidade e a independência de tecnologia assistiva. 

- **JWT (JSON Web Token)**: Utilizado para autenticação e autorização de usuários. O JWT é um token seguro transmitido entre o cliente e o servidor, permitindo que o usuário acesse áreas protegidas com base na autenticação bem-sucedida.

- **js-cookie**: Biblioteca utilizada para manipulação de cookies no lado do cliente. Foi utilizada para armazenar e recuperar o token JWT de maneira eficiente, garantindo que o estado de autenticação fosse mantido durante a navegação.

- **Fetch API**: Usada para fazer requisições HTTP e buscar dados de uma API externa. A Fetch API foi utilizada para buscar os posts do servidor e enviar as informações do usuário, permitindo uma integração fluida com a API do backend.



## 🏗️ Arquitetura da Aplicação

🏛️ Arquitetura Completa (Full Stack)
O projeto duvidapp utiliza uma arquitetura Cliente-Servidor (Client-Server), onde o frontend e o backend são aplicações completamente independentes e desacopladas, comunicando-se através de uma API RESTful.

A solução inteira é hospedada na nuvem da Render, que serve tanto os arquivos estáticos do frontend quanto a aplicação do backend.



O frontend é uma Single Page Application (SPA) moderna, responsável por toda a interface e experiência do usuário.

Framework: React 19 com o build tool Vite.

Roteamento: React Router DOM para navegação no lado do cliente.

UI & Estilização: Construído com primitivos de UI acessíveis da Radix UI e estilizado com a abordagem utility-first do Tailwind CSS. A arquitetura de componentes é altamente modular, seguindo a filosofia do shadcn/ui.

Formulários e Validação: React Hook Form para gerenciamento de formulários e Zod para validação dos schemas de dados, garantindo consistência com o backend.

Hospedagem: Servido como um Site Estático na Render.


O backend é uma API robusta e escalável, responsável pela lógica de negócio, autenticação e comunicação com o banco de dados.

Framework: NestJS, um framework Node.js que utiliza TypeScript e é executado sobre a plataforma Express.

Arquitetura Interna: Fortemente modular, organizada em Modules, Controllers (para receber requisições) e Services (para a lógica de negócio), o que facilita a manutenção e o crescimento da aplicação.

Autenticação: O sistema de autenticação é baseado em JSON Web Tokens (JWT), com senhas seguramente hasheadas usando BcryptJS.

Validação de Dados: Utiliza Zod para validar os dados que chegam nas rotas da API, garantindo que apenas dados válidos e seguros sejam processados.

Documentação da API: A API é autodocumentada usando Swagger (OpenAPI), permitindo visualizar e testar os endpoints de forma interativa.

Hospedagem: Implantado como um Web Service na Render.

Banco de Dados
Tecnologia: MongoDB, um banco de dados NoSQL orientado a documentos, ideal para flexibilidade de esquemas e escalabilidade.

Acesso aos Dados: A comunicação entre a API e o banco de dados é gerenciada pelo Mongoose, um ODM (Object Data Modeling) que facilita a modelagem e a interação com os dados.

### 📖 Estrutura dos diretórios:

A estrutura utilizada segue as convenções do Next.js para separação de componentes, páginas e contextos, mantendo o código modular e escalável.

```
src/
  app/
    components/
      Hero.tsx       Componente Hero utilizado para criar uma espécie de introdução ao portal
      Navbar.tsx     Componente Navbar cria os componentes na barra de navegação do portal
      PostCard.tsx   Componente PostCard exibe um cartão de post na Home e o acesso ao seu conteúdo
      Separator.tsx  Componente Separator utilizado para separar visualmente as seções de conteúdo
    context/
      authContext.tsx Contexto de autenticação centralizado
    componentStyles/
      globalStyles.ts Componente utilizado para adicionar a imagem de fundo e configurar o layout o ambiente
    styles/
      global.css     Estilos globais do projeto
    register/
      StyledComponentsRegistry.tsx      Componente para garantir a renderização dos estilos
    utils/
      authUtils.ts      Componente gerencia o token de autenticação usando cookies
      extractYouTubeId.ts Componente extrai o ID do youtube de uma URL
    layout.tsx       Layout principal da aplicação
    page.css         Estilos específicos da página
    page.tsx         Página principal (Home)
  pages/
    admin/
      index.tsx      Página administrativa
    create/
      index.tsx      Página de criação de post
    edit/
      [id].tsx       Página de edição de post (roteamento dinâmico)
    login/
      index.tsx      Página de login
    post/
      [id].tsx       Página de detalhes do post (roteamento dinâmico)
    _app.tsx         Componente principal da aplicação  
package.json
```

### 🖌️ Funcionalidades
1. Página de Login:

  - O usuário pode inserir um email e senha para se autenticar.
  - O sistema redireciona o usuário para a página correta após a autenticação (/admin ou /create).

2. Página de Criação de Post:

  - Os usuários autenticados podem criar novos posts. O título, conteúdo, autor, introdução, imagem e link de vídeo podem ser definidos.

3. Página de Edição de Post:

  - Os usuários podem editar posts existentes acessando a URL /edit/[id], onde [id] é o identificador do post.
  - A edição é feita por meio de um formulário onde o usuário pode atualizar os campos.

4. Página de Detalhes do Post:

  - A página exibe os detalhes de um post específico, acessado pela URL /post/[id]

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js instalado (versão recomendada: 20.x ou superior).
- npm instalado.

### Passos:

#### Clone este repositório:

```bash
git clone https://github.com/Fiap-FSD/duvidapp.git
cd duvidapp
```

#### Instale as bibliotecas:

No terminal do projeto, rode:

```bash
 npm install
```

#### Rodando Localmente:

No terminal do projeto, rode:

```bash
 npm run dev
```

### Fluxo de Navegação
- A página de login será carregada automaticamente.
- Para fazer login, digite o exemplo dado.
- Após o login, o usuário será redirecionado para a página home.
- Para editar uma dúvida, acesse /edit/[id], onde [id] é o identificador do post.
- Para visualizar os detalhes de uma dúvida, acesse /duvida/[id].

### Fluxo de Autenticação

A autenticação é feita usando JWT. Quando o usuário faz login, o token JWT é armazenado em um cookie e enviado com cada requisição subsequente. Caso o token não seja encontrado ou seja inválido, o usuário será redirecionado para a página de login.

#### Abra no seu navegador

Com o link que aparecerá no seu terminal, copie e cole no seu navegador.

## 💥 Deploy

O deploy é essencial para disponibilizar a aplicação para os usuários finais, garantindo que qualquer pessoa possa acessá-la diretamente pela internet, sem precisar instalar nada.

Optou-se pela Vercel porque ela possui suporte nativo ao Next.js, o framework utilizado no projeto. Além disso, o processo de deploy é extremamente simples e rápido.

Outro ponto importante é que a integração com o GitHub permite que o deploy seja automatizado, ou seja, sempre que realizamos um push na branch principal, a Vercel detecta as mudanças, faz o build e atualiza automaticamente a aplicação em produção.

👉 **[Link para o site](https://blog-post-tech3.vercel.app/)**  

👉 **[Link para o vídeo](https://www.youtube.com/watch?v=bK5arno51pw)**  

## 📜 Conclusão

Este projeto foi uma excelente oportunidade para aprimorar habilidades no desenvolvimento front-end, utilizando tecnologias modernas e robustas como React.js, Next.js, Axios, TailwindCSS e Styled-components. Durante o desenvolvimento, conseguimos criar uma interface gráfica dinâmica, responsiva e intuitiva para a aplicação de blog, garantindo uma experiência de usuário fluida e uma integração eficiente com a API do back-end.

A arquitetura adotada baseada no padrão NextJS que trouxe vantagens significativas, como modularidade, escalabilidade e alta performance, permitindo um desenvolvimento ágil e bem estruturado. Além dessas vantagens, existe a facilidade no deploy do projeto, na vercel, pois oferece uma integração nativa que automatiza grande parte do processo. A integração do Axios facilitou a comunicação com a API, enquanto TailwindCSS e Styled-components garantiram um design coeso, flexível e de fácil manutenção.

O projeto reforçou a importância das boas práticas de desenvolvimento, como controle de versão pelo GitHub, organização modular do código e foco na usabilidade. O resultado é uma aplicação funcional e bem estruturada, pronta para ser utilizada por docentes e alunos, oferecendo um ambiente de leitura e interação intuitivo.

