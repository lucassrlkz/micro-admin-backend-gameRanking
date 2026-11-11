# Micro Admin Backend - Game Ranking

Microsserviço de administração do sistema de ranking de jogos. A aplicação recebe mensagens do RabbitMQ através de um [API-GATEWAY](https://github.com/lucassrlkz/api-gateway-gameRanking) , persiste categorias no MongoDB e disponibiliza operações de consulta de categorias por mensageria.

## Tecnologias

- Node.js e TypeScript
- NestJS para módulos, injeção de dependências e handlers de mensagens
- RabbitMQ como transporte do microsserviço (`@nestjs/microservices`)
- MongoDB com Mongoose para persistência
- Jest para testes e Oxlint para lint

## Como funciona

O ponto de entrada em `src/main.ts` inicializa um microsserviço NestJS com o transporte RabbitMQ. Ele monta a URL de conexão com as variáveis `RABBITMQ_*`, conecta à fila configurada e aguarda mensagens. Não inicializa um servidor HTTP.

O `AppController` define os padrões de mensagem e encaminha as operações para o `AppService`:

| Padrão | Tipo | Payload | Comportamento |
| --- | --- | --- | --- |
| `criar-categoria` | Evento (`EventPattern`) | Objeto de categoria | Persiste uma categoria no MongoDB. Como é um evento, não há resposta de consulta. |
| `consultar-categorias` | Mensagem (`MessagePattern`) | ID como string ou payload vazio | Com ID, consulta uma categoria; sem ID, retorna todas as categorias. |

Exemplo de payload para `criar-categoria`:

```json
{
  "category": "arcade",
  "description": "Jogos de arcade",
  "events": [
    {
      "name": "victory",
      "operation": "sum",
      "value": 10
    }
  ],
  "players": []
}
```

Para consultar uma categoria, envie o ID do MongoDB como payload de `consultar-categorias`. Para listar todas, envie um payload vazio ou sem ID.

Erros nas operações de persistência e consulta são registrados pelo serviço e encaminhados como `RpcException`.

## Modelos de dados

Os schemas estão em `src/interfaces` e são registrados pelo `AppModule`:

- **Categoria** (`categories`): nome (`category`, único), `description`, lista de `events` (cada evento tem `name`, `operation` e `value`) e referências a jogadores. O schema habilita `createdAt` e `updatedAt`.
- **Jogador** (`players`): `name`, `email` (único), `phoneNumber`, referência à categoria, `ranking`, `positionRanking` e `urlPhoto`. O schema habilita `createdAt` e `updatedAt`.

As referências entre categorias e jogadores usam os nomes de modelo `categories` e `players`. Os modelos e coleções são registrados mesmo que operações de jogador ainda não estejam implementadas no serviço.

## Estrutura do projeto

```text
.
├── src/
│   ├── main.ts                          # Inicialização do microsserviço RabbitMQ
│   ├── app.module.ts                    # Configuração global, MongoDB e schemas
│   ├── app.controller.ts                # Padrões e handlers de mensagens
│   ├── app.service.ts                   # Persistência e consultas de categorias
│   ├── app.controller.spec.ts            # Teste unitário (scaffold legado)
│   └── interfaces/
│       ├── event.interface.ts            # Tipo de evento de categoria
│       ├── categories/
│       │   ├── category.interface.ts     # Tipo de categoria
│       │   └── category.schema.ts        # Schema Mongoose de categoria
│       └── players/
│           ├── player.interface.ts       # Tipo de jogador
│           └── player.schema.ts          # Schema Mongoose de jogador
├── test/
│   ├── app.e2e-spec.ts                   # Teste end-to-end (scaffold legado)
│   └── jest-e2e.json                    # Configuração do Jest end-to-end
├── package.json                          # Dependências e comandos npm
├── package-lock.json                     # Versões resolvidas das dependências
├── nest-cli.json                         # Configuração da CLI Nest
├── tsconfig.json                         # Configuração do TypeScript
├── tsconfig.build.json                   # Configuração de compilação
├── jest.config.ts                        # Configuração do Jest
└── .oxlintrc.json                        # Configuração do Oxlint
```

## Pré-requisitos

- Node.js e npm compatíveis com as dependências do projeto
- Uma instância acessível de MongoDB
- Uma instância acessível de RabbitMQ e uma fila configurada

## Configuração

Crie um arquivo `.env` na raiz do projeto. Ele é carregado pelo `ConfigModule`; não coloque credenciais reais no controle de versão.

```dotenv
DB_CONNECTION=mongodb://<usuario>:<senha>@<host>:<porta>/<banco>

RABBITMQ_PROTOCOL=amqp://
RABBITMQ_USER=<usuario>
RABBITMQ_PASSWORD=<senha>
RABBITMQ_HOST=<host>:<porta>
RABBITMQ_VIRTUAL_HOST=<caminho-do-vhost-na-url>
RABBITMQ_QUEUE=<nome-da-fila>
```

`DB_CONNECTION` deve ser uma URI válida do MongoDB. O serviço falha explicitamente ao iniciar se essa variável estiver ausente.

O endereço RabbitMQ é montado concatenando protocolo, usuário, senha, host e virtual host nesta ordem: `RABBITMQ_PROTOCOL + usuário + ":" + senha + "@" + RABBITMQ_HOST + RABBITMQ_VIRTUAL_HOST`. Portanto, configure os componentes para formar uma URL AMQP válida e codifique caracteres especiais usados em credenciais ou no caminho do virtual host. `RABBITMQ_QUEUE` define a fila consumida pelo microsserviço.

Em ambientes de produção, as mesmas variáveis podem ser fornecidas pelo ambiente de execução, sem arquivo `.env`.

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Inicie em desenvolvimento, com reinicialização automática:

```bash
npm run start:dev
```

Outros comandos disponíveis:

```bash
npm run start       # Inicialização normal
npm run start:debug # Inicialização em modo de depuração
npm run build       # Compilação para dist/
npm run start:prod  # Execução de dist/main após compilar
npm run lint        # Oxlint em src/ e test/
```

O serviço só fica pronto quando consegue conectar ao RabbitMQ; as operações de dados também dependem da conexão com o MongoDB.

## Testes

Comandos definidos no projeto:

```bash
npm run test       # Testes unitários
npm run test:e2e   # Testes end-to-end
npm run test:cov   # Testes com cobertura
```

Os testes existentes ainda são os scaffolds HTTP gerados pelo Nest: o teste unitário espera um método `getHello()` que não existe no controller atual, e o teste end-to-end tenta acessar uma rota HTTP, embora a aplicação inicialize somente o transporte RabbitMQ. Esses testes precisam ser atualizados para os handlers do microsserviço antes de serem usados como validação do comportamento atual.

## Comandos de desenvolvimento

```bash
npm run format
```

Formata os arquivos TypeScript em `src/` e `test/` com Prettier.
