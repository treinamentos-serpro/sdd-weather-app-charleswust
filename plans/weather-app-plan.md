# Plano Técnico: Weather App

Este plano deriva de `specs/weather-app-spec.md` e define decisões de arquitetura e contratos para o MVP. Não inclui código final.

## Architecture

A aplicação usará quatro camadas leves:

- `components/`: apresentação e interação acessível. Recebe dados e callbacks por props; não acessa a API.
- `hooks/`: orquestração de busca, seleção, consulta, unidade, retry e estados assíncronos.
- `services/`: acesso à Open-Meteo, timeout, validação de respostas e normalização de erros.
- `lib/`: funções puras de normalização, conversão, formatação, tradução de códigos WMO e validação.
- `types/`: contratos compartilhados, sem dependências de React ou da rede.

`App` será o orquestrador da tela. Não haverá backend, autenticação, Redux, cache persistente, favoritos, histórico ou geolocalização no MVP.

A direção das dependências será:

```text
App -> components
App -> hooks -> services -> lib
components -> lib
components/hooks/services -> types
```

## Tech Stack

- TypeScript strict para contratos explícitos.
- React 19 com componentes funcionais e hooks.
- Vite para desenvolvimento e build.
- Tailwind CSS para layout responsivo e tema da aplicação.
- `fetch` nativo com `AbortController` para cancelamento e timeout.
- Vitest e Testing Library para testes unitários e de componentes.
- Playwright para fluxos E2E e validação mobile.
- Biome para lint e formatação.
- Open-Meteo Geocoding API e Forecast API, sem chave privada.
- `pt-BR` para textos, números, datas e horários.

## Project Structure

```text
src/
  App.tsx
  main.tsx
  components/
    SearchBar.tsx
    CityResults.tsx
    CurrentWeather.tsx
    ForecastList.tsx
    ForecastCard.tsx
    UnitToggle.tsx
    states/
      EmptyState.tsx
      LoadingState.tsx
      ErrorState.tsx
  hooks/
    useWeather.ts
  services/
    weatherService.ts
  lib/
    format.ts
    temperature.ts
    weatherCodes.ts
    validation.ts
  types/
    weather.ts

tests/
  setup.ts
  unit/
  e2e/
    weather.spec.ts
```

Responsabilidades principais:

- `App.tsx`: composição da tela e conexão do hook com os componentes.
- `SearchBar.tsx`: texto, submissão e feedback de validação/loading.
- `CityResults.tsx`: resultados acessíveis, país/região e seleção.
- `CurrentWeather.tsx`: cidade, condição, temperatura, unidade e horário.
- `ForecastList.tsx`/`ForecastCard.tsx`: cinco períodos válidos.
- `UnitToggle.tsx`: controle Celsius/Fahrenheit.
- `useWeather.ts`: estado, concorrência, retry e seleção.
- `weatherService.ts`: chamadas e normalização da Open-Meteo.
- `lib/`: regras determinísticas e testáveis isoladamente.

## Data Model

Os componentes não receberão o payload cru da Open-Meteo. O serviço o converterá para modelos internos.

```ts
export type Unit = "celsius" | "fahrenheit";

export interface City {
  id?: number;
  name: string;
  country?: string;
  countryCode?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureCelsius: number | null;
  weatherCode: number | null;
  condition: string | null;
  time: string | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  condition: string | null;
  temperatureMinCelsius: number | null;
  temperatureMaxCelsius: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string;
  utcOffsetSeconds?: number;
}
```

Contratos de erro e estado:

```ts
export type ErrorKind =
  | "validation"
  | "network"
  | "api"
  | "timeout"
  | "invalid-response"
  | "partial-response";

export interface AppError {
  kind: ErrorKind;
  message: string;
  retryable: boolean;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";
```

Temperaturas serão armazenadas em Celsius. A unidade só controla a apresentação. A previsão precisa ter pelo menos cinco datas diárias válidas; a interface exibirá exatamente os cinco primeiros períodos.

## Data Flow

1. O usuário informa o nome da cidade.
2. O hook remove espaços externos e valida pelo menos dois caracteres.
3. `searchCities(query, signal?)` consulta o endpoint de geocoding.
4. A UI exibe resultados, estado vazio ou erro.
5. O usuário seleciona um objeto `City`, usando coordenadas e id retornados.
6. `getWeather(city, signal?)` consulta o forecast com latitude e longitude.
7. O serviço valida e normaliza a resposta.
8. O hook aplica a resposta somente se o request id ainda for o mais recente.
9. Os componentes renderizam clima atual e cinco dias.
10. A troca de unidade converte os valores já carregados durante a renderização, sem nova chamada.

Respostas antigas devem ser abortadas quando possível e sempre descartadas por request id antes de atualizar o estado.

## External APIs

### Geocoding

URL: `https://geocoding-api.open-meteo.com/v1/search`

Parâmetros:

- `name`: busca normalizada.
- `count=10`: permite diferenciar cidades homônimas.
- `language=pt`: prioriza nomes em português quando disponíveis.
- `format=json`.

Mapeamento:

- `id` -> `City.id`
- `name` -> `City.name`
- `country` -> `City.country`
- `country_code` -> `City.countryCode`
- `admin1` -> `City.region`
- `latitude` -> `City.latitude`
- `longitude` -> `City.longitude`
- `timezone` -> `City.timezone`

`results` vazio produz o estado `empty` e não dispara forecast.

### Forecast

URL: `https://api.open-meteo.com/v1/forecast`

Parâmetros:

- `latitude` e `longitude`: coordenadas da cidade selecionada.
- `current=temperature_2m,weather_code`.
- `daily=weather_code,temperature_2m_min,temperature_2m_max`.
- `forecast_days=5`.
- `temperature_unit=celsius`.
- `timezone=auto`.

Mapeamento:

- `timezone` -> `WeatherData.timezone`
- `utc_offset_seconds` -> `WeatherData.utcOffsetSeconds`
- `current.temperature_2m` -> `CurrentWeather.temperatureCelsius`
- `current.weather_code` -> `CurrentWeather.weatherCode`
- `current.time` -> `CurrentWeather.time`
- código WMO traduzido -> `CurrentWeather.condition`
- `daily.time[index]` -> `ForecastDay.date`
- `daily.weather_code[index]` -> `ForecastDay.weatherCode`
- código WMO traduzido -> `ForecastDay.condition`
- `daily.temperature_2m_min[index]` -> `ForecastDay.temperatureMinCelsius`
- `daily.temperature_2m_max[index]` -> `ForecastDay.temperatureMaxCelsius`

Contratos de serviço:

```ts
searchCities(query: string, signal?: AbortSignal): Promise<City[]>
getWeather(city: City, signal?: AbortSignal): Promise<WeatherData>
```

## State Management

O estado ficará no hook `useWeather`, consumido por `App`. Busca e previsão terão status independentes:

```ts
interface SearchState {
  status: AsyncStatus | "empty";
  query: string;
  cities: City[];
  error: AppError | null;
}

interface WeatherState {
  status: AsyncStatus;
  selectedCity: City | null;
  data: WeatherData | null;
  error: AppError | null;
}
```

Estados explícitos:

- `idle`: nenhuma operação iniciada; orientação inicial.
- `loading`: operação pendente; indicador visível.
- `success`: dados válidos disponíveis.
- `empty`: busca concluída sem resultados.
- `error`: falha recuperável com retry.

A unidade começa em `celsius`. Os valores internos permanecem em Celsius e são derivados na renderização:

```ts
fahrenheit = celsius * 9 / 5 + 32
```

A conversão deve ser centralizada em função pura, arredondada para uma casa decimal e não deve chamar o serviço.

## Error Handling

O serviço converterá falhas externas em `AppError` seguro e traduzido para português.

- **Validação:** menos de dois caracteres; não chama a API.
- **Vazio:** informa que nenhuma cidade foi encontrada e mantém nova busca disponível.
- **Rede:** estado `error`, mensagem de conexão e retry.
- **API/HTTP:** não interpreta payload de erro; informa indisponibilidade e permite retry.
- **Timeout:** `AbortController` após 10 segundos; diferencia cancelamento intencional de timeout.
- **Resposta inválida:** rejeita payload sem campos essenciais ou arrays incompatíveis.
- **Resposta parcial:** menos de cinco datas válidas não pode virar sucesso; exibe erro recuperável.
- **Campos opcionais ausentes:** preserva a resposta quando possível e renderiza `Não disponível`.
- **Concorrência:** request id impede que respostas antigas alterem a interface.

Retry repete apenas a operação que falhou: busca com o texto normalizado ou forecast com a cidade selecionada. Troca de unidade nunca faz retry nem nova consulta.

## Testing Strategy

### Vitest

Testar funções puras para:

- normalização de entrada, espaços e acentos;
- mínimo de dois caracteres;
- conversão Celsius/Fahrenheit, negativos, zero e uma casa decimal;
- tradução de códigos WMO;
- formatação de datas e horários no timezone da cidade;
- validação de payload válido, inválido, desalinhado e incompleto.

Testar `weatherService` com `fetch` mockado para:

- URLs e parâmetros de geocoding e forecast;
- mapeamento para os modelos internos;
- lista vazia;
- erros HTTP e de rede;
- timeout de 10 segundos;
- JSON inválido e resposta parcial.

Testar hooks e componentes para:

- transições `idle`, `loading`, `success`, `empty` e `error`;
- retry;
- respostas fora de ordem;
- seleção por coordenadas;
- troca de unidade sem nova chamada;
- estados loading, erro, vazio e sucesso;
- teclado, labels, roles, foco e `Não disponível`.

### Playwright

Interceptar as chamadas da Open-Meteo para cenários determinísticos. Cobrir:

- fluxo completo de busca, seleção e previsão;
- exatamente cinco dias;
- busca inválida e sem resultados;
- erros de geocoding e forecast com retry;
- timeout/resposta lenta;
- respostas fora de ordem;
- troca de unidade sem nova chamada meteorológica;
- estado inicial sem previsão;
- navegação por teclado;
- viewports de 320 px, 768 px e desktop;
- ausência de rolagem horizontal.

Antes da entrega, executar `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`.

## Risks & Trade-offs

- **Indisponibilidade ou mudança da Open-Meteo:** adaptador isolado, timeout, validação e testes de payload. Não haverá segundo provedor no MVP.
- **Respostas fora de ordem:** request id obrigatório e `AbortController` quando possível.
- **Dados incompletos ou timezone inconsistente:** preservar timezone e referência temporal; rejeitar previsão sem cinco dias válidos.
- **Conversão local:** evita nova consulta e mantém fonte única em Celsius, mas exige testes de arredondamento.
- **Estado local:** simples para uma única tela, mas não suporta compartilhamento entre páginas; isso é aceitável no MVP.
- **Busca por submissão:** reduz chamadas e evita debounce, mas não oferece sugestões em tempo real; a spec deixa essa decisão aberta.
- **Mocks E2E:** garantem determinismo, mas não validam disponibilidade real; um smoke test externo pode ser executado separadamente.
- **Sem biblioteca de cache:** reduz dependências, mas abre mão de cache/deduplicação de requests; não é necessário para o escopo atual.
- **Observabilidade:** registrar somente latência, erros, timeouts e tentativas, sem dados pessoais e sem adicionar analytics detalhado ao MVP.
- **Acessibilidade/mobile:** exigem validação real em teclado, toque e telas estreitas; serão tratados como critérios de aceite.

Decisões adicionais: busca por submissão explícita, sem persistência local, sem previsão horária, sem offline, sem login, sem favoritos e com atribuição visível da Open-Meteo.
