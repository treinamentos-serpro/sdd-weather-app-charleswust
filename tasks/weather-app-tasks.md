# Backlog de Tarefas — Weather App (revisado)

Este documento deriva do plano técnico em `plans/weather-app-plan.md` e foi refinado para que cada item tenha critérios de aceite objetivos, verificáveis e rastreáveis aos requisitos da spec quando aplicável.

## Entrega 1 — Base, contratos e infraestrutura

### T-01 — Configurar estrutura base do projeto
- ID: T-01
- Título: Configurar estrutura base do projeto
- Descrição curta: Preparar a base do projeto React + Vite + TypeScript + Tailwind e garantir que o ambiente de build e teste funcione.
- Critérios de aceite:
  - `pnpm install` e `pnpm build` concluem com exit code 0;
  - a estrutura de pastas inclui `src/components`, `src/hooks`, `src/services`, `src/lib`, `src/types` e `tests/`;
  - a configuração do projeto inclui scripts de `dev`, `build`, `lint` e `test` no `package.json`;
  - a aplicação inicial renderiza sem erros de configuração em `src/main.tsx` e `src/App.tsx`;
  - o projeto suporta Tailwind e Vitest/Playwright conforme o plano.
- Dependências: nenhuma
- Arquivos prováveis: `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `biome.json`, `src/main.tsx`, `src/App.tsx`
- Tipo: Infra
- Rastreio: plano técnico + stack do projeto

### T-02 — Definir tipos do domínio
- ID: T-02
- Título: Definir tipos do domínio
- Descrição curta: Centralizar contratos de dados para busca, clima atual, previsão, erro e estados assíncronos.
- Critérios de aceite:
  - `src/types/weather.ts` define `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `AppError`, `AsyncStatus` e `Unit`;
  - os tipos refletem a regra de que temperaturas internas são armazenadas em Celsius e convertidas somente na apresentação;
  - os campos obrigatórios e opcionais são explícitos em TypeScript, sem uso de `any` em contratos públicos;
  - o módulo compila sem erros em strict mode do TypeScript.
- Dependências: T-01
- Arquivos prováveis: `src/types/weather.ts`
- Tipo: Data
- Rastreio: FR05, FR06, FR07, FR08, FR09, FR11

## Entrega 2 — Funções puras e utilitários

### T-03 — Validar query de busca
- ID: T-03
- Título: Validar query de busca
- Descrição curta: Implementar a regra mínima de busca para impedir consultas vazias ou insuficientes.
- Critérios de aceite:
  - a função de validação rejeita strings em branco e com menos de 2 caracteres após normalização;
  - a função remove espaços em início/fim antes da validação, conforme FR01;
  - a função retorna mensagem em português para uso em UI e em erros de validação;
  - testes unitários cobrem casos válidos e inválidos com entradas reais (`"São Paulo"`, `"S"`, `" "`, `"SP"`).
- Dependências: T-02
- Arquivos prováveis: `src/lib/validation.ts`
- Tipo: Data
- Rastreio: FR01, AC-FR01

### T-04 — Traduzir códigos WMO para texto em português
- ID: T-04
- Título: Traduzir códigos WMO para texto em português
- Descrição curta: Mapear códigos WMO para descrições legíveis do clima.
- Critérios de aceite:
  - a função recebe um código WMO e retorna texto em português como `Ensolarado`, `Nublado`, `Chuva`, `Neve` ou `Tempestade` quando aplicável;
  - códigos desconhecidos retornam `Não disponível` ou valor neutro definido pela regra da aplicação;
  - a conversão é determinística e não depende de estado global ou rede;
  - testes unitários cobrem ao menos 5 códigos WMO comuns e 1 código desconhecido.
- Dependências: T-02
- Arquivos prováveis: `src/lib/weatherCodes.ts`
- Tipo: Data
- Rastreio: FR06, FR07, AC-FR06, AC-FR07

### T-05 — Implementar conversão de temperatura
- ID: T-05
- Título: Implementar conversão de temperatura
- Descrição curta: Centralizar a conversão de Celsius para Fahrenheit sem alterar o armazenamento interno.
- Critérios de aceite:
  - a função de conversão aplica exatamente a fórmula `celsius * 9 / 5 + 32`;
  - o valor resultante é arredondado para uma casa decimal;
  - a conversão de `20`°C produz `68`°F ao longo do fluxo de UI conforme AC-FR09;
  - testes unitários validam valores negativos, zero e positivos.
- Dependências: T-02, T-03, T-04
- Arquivos prováveis: `src/lib/temperature.ts`
- Tipo: Data
- Rastreio: FR08, FR09, AC-FR08, AC-FR09

### T-06 — Implementar formatação de data, hora e temperatura
- ID: T-06
- Título: Implementar formatação de data, hora e temperatura
- Descrição curta: Padronizar como valores de data, hora e temperatura são exibidos em português do Brasil.
- Critérios de aceite:
  - `formatDate` e `formatTime` produzem saídas legíveis em pt-BR conforme payload de API e apresentação da UI;
  - `formatTemperature` imprime um valor com uma casa decimal quando a temperatura estiver disponível;
  - os utilitários não fazem chamadas de rede e não dependem do componente em execução;
  - testes unitários validam pelo menos 3 cenários de data/hora e 2 de temperatura.
- Dependências: T-02, T-05
- Arquivos prováveis: `src/lib/format.ts`
- Tipo: Data
- Rastreio: FR06, FR07, FR09, AC-FR06, AC-FR07, AC-FR09

## Entrega 3 — Services e dados remotos

### T-07 — Implementar consulta de geocoding
- ID: T-07
- Título: Implementar consulta de geocoding
- Descrição curta: Criar a chamada ao endpoint de geocoding com `AbortController` e retorno bruto pronto para mapeamento.
- Critérios de aceite:
  - `searchCities(query, signal?)` usa a URL do endpoint de geocoding com `name`, `count=10`, `language=pt` e `format=json`;
  - a função usa `fetch` com `AbortController` e respeita timeout de 10 segundos;
  - `query` com menos de 2 caracteres não dispara a chamada; o erro de validação é tratado antes do request;
  - em caso de rede, timeout ou resposta inválida, a função rejeita com `AppError` e `kind` válido.
- Dependências: T-03, T-06
- Arquivos prováveis: `src/services/weatherService.ts`
- Tipo: Data
- Rastreio: FR01, FR02, FR03, FR11, AC-FR01, AC-FR11

### T-08 — Mapear payload de geocoding para `City`
- ID: T-08
- Título: Mapear payload de geocoding para `City`
- Descrição curta: Normalizar o payload da API em objetos `City` com dados de localização e país/região.
- Critérios de aceite:
  - o mapper transforma `id`, `name`, `country`, `country_code`, `admin1`, `latitude`, `longitude` e `timezone` em `City`;
  - resultados vazios retornam `[]` e não disparam a consulta meteorológica;
  - quando há dados incompletos ou ausência de campos essenciais, a função lança `AppError` com `kind` apropriado;
  - testes unitários validam pelo menos 2 payloads com sucesso e 2 payloads inválidos.
- Dependências: T-02, T-07
- Arquivos prováveis: `src/services/weatherService.ts`
- Tipo: Data
- Rastreio: FR02, FR03, FR04, AC-FR02, AC-FR03, AC-FR04

### T-09 — Implementar consulta de forecast
- ID: T-09
- Título: Implementar consulta de forecast
- Descrição curta: Criar a chamada ao endpoint meteorológico com latitude e longitude da cidade selecionada.
- Critérios de aceite:
  - `getWeather(city, signal?)` usa os campos `latitude` e `longitude` da cidade selecionada;
  - a chamada inclui `current`, `daily`, `forecast_days=5`, `temperature_unit=celsius` e `timezone=auto`;
  - a função recebe `AbortSignal` e cancela requests em andamento;
  - falhas de rede, timeout e resposta inválida são convertidas em `AppError` com `kind` rastreável.
- Dependências: T-02, T-08, T-06
- Arquivos prováveis: `src/services/weatherService.ts`
- Tipo: Data
- Rastreio: FR05, FR10, FR11, AC-FR05, AC-FR10, AC-FR11

### T-10 — Normalizar resposta de forecast para `WeatherData`
- ID: T-10
- Título: Normalizar resposta de forecast para `WeatherData`
- Descrição curta: Transformar o payload bruto da API em `WeatherData` com clima atual e cinco dias.
- Critérios de aceite:
  - `current.temperature_2m`, `current.weather_code` e `current.time` são convertidos para `CurrentWeather`;
  - os cinco primeiros dias válidos são mapeados em `ForecastDay` com data, código e temperaturas mín/max;
  - `timezone` e `utc_offset_seconds` são preservados quando existirem;
  - se houver menos de cinco datas válidas, o serviço rejeita a resposta com erro recuperável;
  - testes unitários cobrem payloads válidos e incompletos.
- Dependências: T-09, T-04, T-06
- Arquivos prováveis: `src/services/weatherService.ts`
- Tipo: Data
- Rastreio: FR05, FR06, FR07, AC-FR05, AC-FR06, AC-FR07

## Entrega 4 — Hook e estado da aplicação

### T-11 — Implementar hook de busca e seleção de cidade
- ID: T-11
- Título: Implementar hook de busca e seleção de cidade
- Descrição curta: Centralizar busca, estado de resultados, seleção e descartes de respostas obsoletas.
- Critérios de aceite:
  - o hook expõe `query`, `cities`, `status`, `error` e `selectedCity`;
  - o estado de busca usa `idle`, `loading`, `success`, `empty` e `error` conforme o plano;
  - quando a consulta retorna lista vazia, `status` muda para `empty` e não inicia previsão;
  - quando duas buscas são iniciadas, a resposta mais antiga é descartada antes de atualizar o estado;
  - a seleção da cidade usa coordenadas e id do resultado, não apenas o texto digitado.
- Dependências: T-07, T-08
- Arquivos prováveis: `src/hooks/useWeather.ts`
- Tipo: Data
- Rastreio: FR01, FR02, FR03, FR04, FR05, AC-FR01, AC-FR02, AC-FR03, AC-FR04, AC-FR05

### T-12 — Atualizar hook de clima e retry
- ID: T-12
- Título: Atualizar hook de clima e retry
- Descrição curta: Adicionar estado de previsão, seleção ativa e retry para o carregamento do clima.
- Critérios de aceite:
  - o hook mantém `status`, `selectedCity`, `data` e `error` para o clima;
  - ao selecionar a cidade, a consulta é disparada e a interface só atualiza com a resposta mais recente;
  - `retry` dispara novamente a última consulta sem duplicar estados;
  - a resposta antiga é descartada antes de escrever no estado global;
  - o hook expõe estado de carregamento e erro em conformidade com FR10 e FR11.
- Dependências: T-09, T-10, T-11
- Arquivos prováveis: `src/hooks/useWeather.ts`
- Tipo: Data
- Rastreio: FR05, FR10, FR11, AC-FR05, AC-FR10, AC-FR11

## Entrega 5 — Componentes e integração de UI

### T-13 — Construir `SearchBar` e feedback de status
- ID: T-13
- Título: Construir `SearchBar` e feedback de status
- Descrição curta: Implementar a entrada de busca, a validação visual e os indicadores de carregamento/erro.
- Critérios de aceite:
  - o campo aceita texto com acentos e espaços e dispara a busca somente quando a query normalizada tem pelo menos 2 caracteres;
  - a UI mostra indicador de carregamento enquanto a busca está pendente;
  - erros de validação e rede aparecem em português e com ação de retry quando aplicável;
  - o componente usa `label` ou `aria-label` e é operável por teclado, conforme acessibilidade do projeto.
- Dependências: T-03, T-11
- Arquivos prováveis: `src/components/SearchBar.tsx`
- Tipo: UI
- Rastreio: FR01, FR11, AC-FR01, AC-FR11, FR13

### T-14 — Construir `CityResults` e estados vazios
- ID: T-14
- Título: Construir `CityResults` e estados vazios
- Descrição curta: Exibir cidades retornadas com nome, país e região e manter a seleção acessível.
- Critérios de aceite:
  - cada item mostra nome da cidade e, quando disponíveis, país e região;
  - a seleção por clique ou teclado funciona em elementos acessíveis;
  - quando não há resultados, o componente mostra o estado vazio com texto em português;
  - a lista não renderiza cidades duplicadas por nome/país sem distinção importante.
- Dependências: T-11, T-13
- Arquivos prováveis: `src/components/CityResults.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`
- Tipo: UI
- Rastreio: FR02, FR03, FR04, AC-FR02, AC-FR03, AC-FR04, FR13

### T-15 — Construir painel de clima atual
- ID: T-15
- Título: Construir painel de clima atual
- Descrição curta: Exibir temperatura, condição e horário local da cidade selecionada.
- Critérios de aceite:
  - o componente mostra cidade, temperatura atual, condição climática e referência temporal quando disponíveis;
  - campos opcionais ausentes são exibidos como `Não disponível` conforme FR06;
  - a unidade ativa é refletida no texto da temperatura e na condição atual;
  - o componente é responsivo para viewports de 320–768 px e usa layout sem rolagem horizontal.
- Dependências: T-10, T-12, T-06
- Arquivos prováveis: `src/components/CurrentWeather.tsx`
- Tipo: UI
- Rastreio: FR06, FR08, FR13, AC-FR06, AC-FR08, AC-FR13

### T-16 — Implementar toggle de unidade
- ID: T-16
- Título: Implementar toggle de unidade
- Descrição curta: Permitir alternância entre Celsius e Fahrenheit sem alterar a fonte interna de dados.
- Critérios de aceite:
  - o componente alterna entre `celsius` e `fahrenheit` com controle operável por toque e teclado;
  - os valores internos continuam armazenados em Celsius;
  - a conversão usa a fórmula da regra de negócio e arredonda para uma casa decimal;
  - ao trocar a unidade, a temperatura atual e a previsão são atualizadas sem nova consulta meteorológica;
  - testes cobrem a troca de unidade e o valor de `20°C → 68°F`.
- Dependências: T-05, T-15
- Arquivos prováveis: `src/components/UnitToggle.tsx`, `src/lib/temperature.ts`
- Tipo: UI
- Rastreio: FR08, FR09, AC-FR08, AC-FR09, FR13

### T-17 — Construir lista de previsão de 5 dias
- ID: T-17
- Título: Construir lista de previsão de 5 dias
- Descrição curta: Exibir os cinco períodos diários com mínimo, máximo e condição.
- Critérios de aceite:
  - a UI renderiza exatamente 5 períodos diários quando a resposta for válida;
  - cada card mostra data/dia, condição resumida, mínima e máxima;
  - se menos de 5 datas válidas forem recebidas, a previsão é tratada como erro recuperável e não apresentada como completa;
  - a unidade ativa é aplicada a todos os valores exibidos;
  - os cards usam o modelo interno e não o payload bruto da API.
- Dependências: T-10, T-16, T-04
- Arquivos prováveis: `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`
- Tipo: UI
- Rastreio: FR07, FR08, FR09, AC-FR07, AC-FR08, AC-FR09

### T-18 — Orquestrar `App` e a tela principal
- ID: T-18
- Título: Orquestrar `App` e a tela principal
- Descrição curta: Montar a tela principal com busca, seleção, clima atual, previsão e troca de unidade.
- Critérios de aceite:
  - `App.tsx` compõe `SearchBar`, `CityResults`, `CurrentWeather`, `ForecastList` e `UnitToggle` na sequência correta;
  - a tela inicial orienta o usuário a buscar antes da seleção, conforme FR12;
  - os estados `idle`, `loading`, `empty`, `success` e `error` são renderizados de forma consistente;
  - o layout suporta 320–768 px sem rolagem horizontal e seguindo tema dark glassmorphism.
- Dependências: T-13, T-14, T-15, T-16, T-17
- Arquivos prováveis: `src/App.tsx`
- Tipo: UI
- Rastreio: FR10, FR12, FR13, AC-FR10, AC-FR12, AC-FR13

## Entrega 6 — Testes

### T-19 — Testes unitários de utilitários e validação
- ID: T-19
- Título: Testes unitários de utilitários e validação
- Descrição curta: Validar regras puras e determinísticas que sustentam a busca e a apresentação da UI.
- Critérios de aceite:
  - existem testes para `validation.ts`, `weatherCodes.ts`, `format.ts` e `temperature.ts`;
  - casos de sucesso e falha são cobertos com entradas reais e não com mocks de comportamento de UI;
  - a execução de `pnpm test -- --run` passa sem falhas para essa suíte;
  - ao menos 80% das linhas das funções de utilidade são exercitadas pelos testes.
- Dependências: T-03, T-04, T-05, T-06
- Arquivos prováveis: `tests/unit/**`, `tests/setup.ts`
- Tipo: Test
- Rastreio: FR01, FR06, FR07, FR08, FR09, AC-FR01, AC-FR06, AC-FR07, AC-FR08, AC-FR09

### T-20 — Testes unitários da conversão de unidade
- ID: T-20
- Título: Testes unitários da conversão de unidade
- Descrição curta: Verificar a regra de conversão em Celsius/Fahrenheit com cenários de borda e arredondamento.
- Critérios de aceite:
  - existem testes específicos para `toFahrenheit` em `src/lib/temperature.ts`;
  - os casos cobrem `0°C`, `20°C`, `-10°C`, e valores decimais como `12.5°C`;
  - a saída é validada com arredondamento de uma casa decimal;
  - o teste confirma que a conversão e a renderização não alteram o valor interno em Celsius.
- Dependências: T-05
- Arquivos prováveis: `tests/unit/temperature.test.ts`
- Tipo: Test
- Rastreio: FR08, FR09, AC-FR08, AC-FR09

### T-21 — Testes do service com mock de `fetch`
- ID: T-21
- Título: Testes do service com mock de `fetch`
- Descrição curta: Validar `searchCities` e `getWeather` isolando a resposta da API com mock de `fetch`.
- Critérios de aceite:
  - os testes mockam `global.fetch` para payloads válidos, vazios, inválidos e de erro HTTP;
  - pelo menos 1 caso valida `AbortController` e o cancelamento de requisição;
  - o teste verifica que `AppError.kind` e mensagem são mapeados corretamente para `network`, `timeout`, `api` e `invalid-response`;
  - o service continua funcionando sem chamadas reais à Open-Meteo.
- Dependências: T-07, T-08, T-09, T-10
- Arquivos prováveis: `tests/unit/weatherService.test.ts`
- Tipo: Test
- Rastreio: FR05, FR11, AC-FR05, AC-FR11

### T-22 — Testes de componentes nos estados loading, erro e vazio
- ID: T-22
- Título: Testes de componentes nos estados loading, erro e vazio
- Descrição curta: Cobrir os estados visuais de busca e clima em componentes UI essenciais.
- Critérios de aceite:
  - existem testes para `SearchBar`, `CityResults`, `EmptyState`, `LoadingState` e `ErrorState`;
  - o teste verifica renderização de carregamento, mensagem de erro e estado vazio sem dados;
  - ações de clique e tecla são validadas quando o componente é interativo;
  - os componentes são testados sem mock do comportamento interno e sem depender de dados da rede.
- Dependências: T-13, T-14
- Arquivos prováveis: `tests/unit/components/*.test.tsx`
- Tipo: Test
- Rastreio: FR02, FR03, FR10, FR11, FR13, AC-FR02, AC-FR03, AC-FR10, AC-FR11, AC-FR13

### T-23 — Testes E2E do fluxo principal
- ID: T-23
- Título: Testes E2E do fluxo principal
- Descrição curta: Validar a aplicação em navegador desde a busca até a troca de unidade.
- Critérios de aceite:
  - o cenário cobre busca por cidade, seleção, carregamento, apresentação de clima e previsão;
  - o teste verifica que a troca de unidade atualiza a UI sem nova consulta meteorológica;
  - o cenário valida pelo menos um caso de erro recuperável e um caso sem resultados;
  - o Playwright executa em viewport mobile e desktop sem falhas de interações por toque/teclado;
  - o teste usa viewport de 375 px para validar mobile conforme FR13.
- Dependências: T-18, T-19, T-20, T-21, T-22
- Arquivos prováveis: `tests/e2e/weather.spec.ts`, `playwright.config.ts`
- Tipo: Test
- Rastreio: FR01–FR13, AC-FR01–AC-FR13

## Entrega 7 — Hardening e revisão final

### T-24 — Revisão final de qualidade e hardening
- ID: T-24
- Título: Revisão final de qualidade e hardening
- Descrição curta: Validar qualidade, acessibilidade e comportamento em produção do MVP.
- Critérios de aceite:
  - `pnpm lint`, `pnpm build` e `pnpm test` passam sem erros críticos em clean install;
  - labels e foco são verificados em componentes de busca e seleção, conforme FR13;
  - estados de erro, carregamento e vazio são consistentes com a UX em português;
  - a tela final atende ao tema dark glassmorphism e aos critérios de aceitação da spec.
- Dependências: T-18, T-19, T-20, T-21, T-22, T-23
- Arquivos prováveis: `src/**`, `tests/**`, `package.json`
- Tipo: Infra
- Rastreio: FR10, FR11, FR12, FR13, AC-FR10–AC-FR13

## Ordem resumida de execução

1. T-01 → T-02
2. T-03 → T-04 → T-05 → T-06
3. T-07 → T-08 → T-09 → T-10
4. T-11 → T-12
5. T-13 → T-14 → T-15 → T-16 → T-17 → T-18
6. T-19 → T-20 → T-21 → T-22 → T-23
7. T-24

Essa sequência respeita a ordem de implementação: tipos → funções puras → services → hook → componentes → integração → testes → hardening.
