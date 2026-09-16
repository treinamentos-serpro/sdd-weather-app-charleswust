# Especificação de Produto: Weather App

## Overview

O Weather App é uma aplicação web de consulta meteorológica para verificar
rapidamente o clima de uma cidade. O MVP permite buscar e selecionar cidades,
consultar o clima atual, visualizar a previsão diária de hoje e dos quatro dias
seguintes e alternar entre Celsius e Fahrenheit.

O produto será disponibilizado em português do Brasil, usará a Open-Meteo como
fonte de geocodificação e previsão, não exigirá autenticação e não armazenará
dados de usuários em servidor.

## Functional Requirements

### FR01. Pesquisar cidades

O sistema deve permitir a busca por nome de cidade em entrada textual. Deve
remover espaços no início e no fim, aceitar acentos e bloquear buscas com menos
de 2 caracteres após a normalização.

### FR02. Exibir resultados de busca

O sistema deve apresentar resultados compatíveis para seleção. Cada resultado
deve exibir nome e, quando disponíveis, país e região para diferenciar cidades
homônimas.

### FR03. Informar busca sem resultados

Quando não houver cidade compatível, o sistema deve informar que nenhum
resultado foi encontrado, não iniciar consulta meteorológica e orientar nova
busca.

### FR04. Selecionar uma cidade

O usuário deve poder selecionar um resultado. A seleção deve usar os dados de
localização retornados, como identificador e coordenadas, e não somente o texto
digitado.

### FR05. Consultar clima da cidade selecionada

Após a seleção, o sistema deve consultar a Open-Meteo usando as coordenadas da
cidade escolhida. Somente a resposta associada à seleção mais recente pode
atualizar a interface.

### FR06. Exibir clima atual

O sistema deve exibir para a cidade selecionada:

- temperatura atual;
- condição climática legível em português;
- nome da cidade;
- unidade ativa;
- horário ou referência temporal, quando fornecido;
- `Não disponível` para campos opcionais ausentes.

### FR07. Exibir previsão de cinco dias

O sistema deve exibir cinco períodos diários: hoje e os quatro dias seguintes.
Cada período deve apresentar data ou dia, condição resumida e temperaturas
mínima e máxima quando disponíveis. Se houver menos de cinco datas válidas, o
sistema deve exibir erro recuperável, sem apresentar a previsão como completa.

### FR08. Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit. Celsius é a unidade
inicial, e a unidade ativa deve ser identificável no clima atual e na previsão.

### FR09. Atualizar valores após troca de unidade

Ao trocar a unidade, o sistema deve atualizar a temperatura atual e a previsão
sem nova consulta meteorológica e sem perder a cidade selecionada. Os valores
devem ser exibidos com uma casa decimal, mantendo datas e condições climáticas.

### FR10. Comunicar estados de carregamento

O sistema deve indicar carregamento durante busca e consulta meteorológica. O
indicador deve permanecer até sucesso ou erro, e dados de uma requisição
anterior não podem substituir a resposta da operação atual.

### FR11. Comunicar erros recuperáveis

Para erro de rede, erro HTTP, timeout ou resposta inválida, o sistema deve
exibir mensagem em português, remover o carregamento e oferecer nova tentativa.
O timeout da consulta é de 10 segundos.

### FR12. Apresentar estado inicial

Antes de selecionar uma cidade, o sistema deve orientar o usuário a iniciar uma
busca e não exibir previsão de uma cidade não selecionada.

### FR13. Permitir uso em dispositivos móveis

Busca, seleção, consulta e alternância de unidade devem funcionar em viewports
de 320 px a 768 px, com controles operáveis por toque e teclado e sem rolagem
horizontal.

## User Stories

As personas são Marina, viajante frequente; Carlos, profissional que trabalha
ao ar livre; e Renata, usuária planejadora, conforme definidas no discovery.

### US01. Buscar o destino

Como Marina, viajante frequente, quero buscar uma cidade pelo nome para consultar
o clima do meu destino antes de planejar a viagem. **[FR01]**

### US02. Selecionar a cidade correta

Como Marina, viajante frequente, quero ver país e região nos resultados para
selecionar a cidade correta quando houver nomes iguais. **[FR02, FR04]**

### US03. Ver as condições atuais

Como Carlos, profissional que trabalha ao ar livre, quero ver a temperatura e a
condição atual da cidade selecionada para decidir como me preparar para a
atividade do dia. **[FR05, FR06]**

### US04. Planejar os próximos cinco dias

Como Renata, usuária planejadora, quero ver a previsão de hoje e dos quatro dias
seguintes para organizar compromissos e deslocamentos. **[FR07]**

### US05. Usar a unidade de preferência

Como Renata, usuária planejadora, quero alternar entre Celsius e Fahrenheit para
interpretar as temperaturas na unidade com que estou familiarizada. **[FR08,
FR09]**

### US06. Recuperar uma consulta com falha

Como Carlos, profissional que trabalha ao ar livre, quero receber uma mensagem
clara e poder tentar novamente quando uma consulta falhar para obter a previsão
sem ficar sem orientação. **[FR10, FR11]**

### US07. Começar uma consulta

Como Marina, viajante frequente, quero receber orientação para iniciar uma busca
quando nenhuma cidade estiver selecionada para saber como consultar o clima.
**[FR12]**

### US08. Consultar pelo celular

Como Marina, viajante frequente, quero pesquisar e ler a previsão com controles
operáveis por toque e teclado para consultar o clima durante meus deslocamentos.
**[FR13]**

## Acceptance Criteria

Cada requisito funcional possui cenários objetivos no formato Given/When/Then.

### AC-FR01. Pesquisar cidades

**Given** que a tela de busca está disponível;
**When** o usuário informa ` São Paulo ` e executa a busca;
**Then** o sistema consulta a Open-Meteo usando `São Paulo` sem espaços
externos e exibe o estado de busca até receber uma resposta.

**Given** que o texto contém menos de 2 caracteres após a normalização;
**When** o usuário tenta executar a busca;
**Then** o sistema não chama a API e orienta o usuário a informar uma cidade
válida.

### AC-FR02. Exibir resultados de busca

**Given** que a Open-Meteo retorna ao menos dois locais compatíveis com
`Springfield`;
**When** os resultados são exibidos;
**Then** cada resultado apresenta nome e, quando disponíveis, país e região.

### AC-FR03. Informar busca sem resultados

**Given** que a Open-Meteo retorna uma lista vazia;
**When** a busca é concluída;
**Then** o sistema informa que nenhuma cidade foi encontrada, não chama o
serviço meteorológico e permite nova busca.

### AC-FR04. Selecionar uma cidade

**Given** que um resultado possui identificador e coordenadas;
**When** o usuário seleciona o resultado;
**Then** a consulta meteorológica usa o identificador ou as coordenadas do
resultado selecionado, e não apenas o texto digitado.

### AC-FR05. Consultar clima da cidade selecionada

**Given** que o usuário selecionou uma cidade com coordenadas válidas;
**When** a consulta meteorológica é iniciada;
**Then** o sistema solicita dados à Open-Meteo para essas coordenadas e exibe o
resultado associado à cidade quando a resposta é válida.

**Given** que duas consultas estão em andamento;
**When** a resposta da consulta mais antiga chega depois da mais recente;
**Then** a resposta antiga não altera os dados exibidos.

### AC-FR06. Exibir clima atual

**Given** que a Open-Meteo retorna temperatura, condição e referência temporal;
**When** os dados atuais são carregados;
**Then** o sistema exibe cidade, temperatura, condição, unidade e referência
temporal. Campos opcionais ausentes aparecem como `Não disponível`.

### AC-FR07. Exibir previsão de cinco dias

**Given** que a Open-Meteo retorna dados diários para hoje e os quatro dias
seguintes;
**When** a previsão é carregada;
**Then** o sistema exibe exatamente cinco períodos diários com data ou dia,
condição e mínimas e máximas quando disponíveis.

**Given** que a resposta contém menos de cinco datas diárias válidas;
**When** a aplicação valida a resposta;
**Then** o sistema não apresenta a previsão como completa e exibe erro
recuperável com opção de nova tentativa.

### AC-FR08. Alternar unidade de temperatura

**Given** que uma previsão foi carregada em Celsius;
**When** o usuário seleciona Fahrenheit;
**Then** o sistema identifica Fahrenheit como unidade ativa no clima atual e nos
cinco períodos da previsão.

### AC-FR09. Atualizar valores após troca de unidade

**Given** que a cidade e sua previsão estão exibidas em Celsius;
**When** o usuário alterna para Fahrenheit;
**Then** os valores são atualizados, a cidade permanece selecionada e nenhuma
nova consulta meteorológica ocorre.

**Given** que a temperatura Celsius é `20,0`;
**When** o usuário alterna para Fahrenheit;
**Then** o valor exibido é `68,0 °F`, com uma casa decimal.

### AC-FR10. Comunicar estados de carregamento

**Given** que uma busca ou consulta foi iniciada e não terminou;
**When** o sistema aguarda a resposta;
**Then** um indicador de carregamento fica visível e os dados pendentes não são
apresentados como concluídos.

### AC-FR11. Comunicar erros recuperáveis

**Given** que a Open-Meteo retorna erro, resposta inválida ou não responde;
**When** a falha é detectada ou o limite de 10 segundos é atingido;
**Then** o sistema remove o carregamento, exibe mensagem em português e oferece
uma ação de nova tentativa.

### AC-FR12. Apresentar estado inicial

**Given** que nenhuma cidade foi selecionada;
**When** a tela inicial é exibida;
**Then** o sistema orienta o usuário a iniciar uma busca e não exibe previsão.

### AC-FR13. Permitir uso em dispositivos móveis

**Given** que a aplicação está em uma viewport de 320 px a 768 px;
**When** o usuário busca, seleciona uma cidade, lê a previsão e alterna a
unidade usando toque ou teclado;
**Then** todas as ações são concluídas sem interação exclusiva de mouse e sem
rolagem horizontal.

## Non-Functional Requirements

### NFR01. Responsividade

A interface deve manter conteúdo legível e não exigir rolagem horizontal entre
320 px e 768 px, em orientações retrato e paisagem.

### NFR02. Acessibilidade

A interface deve atender WCAG 2.2 nível AA, incluindo teclado, foco visível,
rótulos associados, contraste adequado, mensagens compreensíveis e alternativas
textuais para conteúdo visual.

### NFR03. Usabilidade

O fluxo de consulta deve ser previsível, com rótulos claros e feedback visual
durante operações assíncronas. A troca de unidade deve ser compreensível sem
conhecimento técnico.

### NFR04. Desempenho

Em dispositivo móvel de referência e conexão 4G, o conteúdo inicial deve estar
disponível em até 2,5 segundos e os resultados da busca devem ser renderizados
em até 2 segundos após a resposta da API. Operações pendentes devem exibir
carregamento e não bloquear controles não relacionados.

### NFR05. Disponibilidade e resiliência

Falhas da Open-Meteo não devem quebrar a aplicação. Erros de rede, HTTP,
timeout de 10 segundos e respostas inválidas devem resultar em estado de erro
recuperável.

### NFR06. Qualidade e transparência dos dados

O produto deve preservar a consistência entre cidade, data, unidade e condição
meteorológica. Deve exibir a referência temporal quando fornecida e não ocultar
informações necessárias para interpretar a previsão.

### NFR07. Segurança e privacidade

O sistema deve coletar somente dados necessários à consulta, não exigir
autenticação e não expor credenciais privadas. Entradas do usuário devem ser
tratadas com segurança.

### NFR08. Compatibilidade

A aplicação deve funcionar nas duas versões estáveis mais recentes dos
navegadores baseados em Chromium, Firefox e Safari, em desktop e mobile.

### NFR09. Idioma e formatação

Textos, mensagens, rótulos e formatação devem estar em português do Brasil.
Datas e horários devem usar o fuso horário retornado para a cidade; temperaturas
devem usar Celsius inicialmente e uma casa decimal.

### NFR10. Operabilidade

Falhas de integração, latência e disponibilidade devem ser observáveis sem
registrar dados pessoais desnecessários. Devem ser monitorados, no mínimo,
latência, erros, timeouts e tentativas de consulta.

## Traceability Matrix

A tabela relaciona cada User Story aos critérios de aceite que demonstram seu
comportamento e aos requisitos não-funcionais que devem ser considerados na
implementação e nos testes.

| User Story | Requisitos funcionais | Acceptance Criteria | Requisitos não-funcionais relevantes |
|---|---|---|---|
| US01. Buscar o destino | FR01 | AC-FR01 | NFR02, NFR03, NFR04, NFR07, NFR08, NFR09 |
| US02. Selecionar a cidade correta | FR02, FR04 | AC-FR02, AC-FR04 | NFR02, NFR03, NFR04, NFR06, NFR08, NFR09 |
| US03. Ver as condições atuais | FR05, FR06 | AC-FR05, AC-FR06 | NFR02, NFR03, NFR04, NFR05, NFR06, NFR09, NFR10 |
| US04. Planejar os próximos cinco dias | FR07 | AC-FR07 | NFR02, NFR03, NFR04, NFR05, NFR06, NFR09 |
| US05. Usar a unidade de preferência | FR08, FR09 | AC-FR08, AC-FR09 | NFR02, NFR03, NFR04, NFR06, NFR09 |
| US06. Recuperar uma consulta com falha | FR10, FR11 | AC-FR10, AC-FR11 | NFR02, NFR03, NFR04, NFR05, NFR07, NFR10 |
| US07. Começar uma consulta | FR12 | AC-FR12 | NFR02, NFR03, NFR08, NFR09 |
| US08. Consultar pelo celular | FR13 | AC-FR13 | NFR01, NFR02, NFR03, NFR04, NFR08, NFR09 |

## Edge Cases

- Busca vazia, apenas espaços, com menos de 2 caracteres ou com caracteres não
  suportados.
- Cidade inexistente, nome com erro, acento ausente ou nome parcial.
- Múltiplas cidades com o mesmo nome.
- Resultado sem coordenadas, país, região ou identificador estável.
- Seleção durante busca anterior e respostas fora de ordem.
- Nova busca durante carregamento da previsão anterior.
- Resposta lenta, timeout, erro HTTP, limite temporário ou perda de conexão.
- Resposta sem temperatura, condição, datas ou mínimas e máximas.
- Previsão com menos de cinco datas válidas.
- Virada de data, fuso diferente do dispositivo e horário de verão.
- Valores negativos, zero, extremos ou decimais.
- Alternância repetida de unidade durante carregamento.
- Tela estreita, orientação paisagem, zoom ou teclado virtual aberto.

## Assumptions

- A Open-Meteo fornece geocodificação e dados suficientes para o clima atual e
  cinco períodos diários.
- A aplicação depende de internet; offline completo não faz parte do MVP.
- O usuário informa a cidade manualmente; geolocalização não faz parte do MVP.
- O MVP não terá login, favoritos, histórico ou persistência em servidor.
- A persistência local da unidade ou última cidade não é necessária para aceite.
- A cidade é identificada por dados retornados pela geocodificação, incluindo
  coordenadas e identificador quando disponível.
- O idioma inicial e único é português do Brasil.
- A Open-Meteo permite o uso previsto e seus requisitos de atribuição serão
  respeitados.

## Risks

| ID | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R01 | Indisponibilidade ou mudança de contrato da Open-Meteo | Média | Alto | Isolar integração, validar respostas, usar timeout e monitorar falhas. |
| R02 | Seleção incorreta de cidade homônima | Alta | Alto | Exibir país/região e usar identificador e coordenadas. |
| R03 | Dados desatualizados, incompletos ou com fuso incorreto | Média | Alto | Validar campos, exibir referência temporal e usar fuso da cidade. |
| R04 | Conversão inconsistente de temperatura | Baixa | Médio | Centralizar conversão, arredondar a uma casa e testar ambas as unidades. |
| R05 | Latência ou excesso de chamadas | Média | Alto | Validar entrada, evitar duplicidade, monitorar latência e limitar tentativas. |
| R06 | Experiência ruim em mobile ou falhas de acessibilidade | Média | Alto | Testar viewports, teclado, toque, contraste e tecnologia assistiva. |
| R07 | Baixa confiança na precisão dos dados | Média | Alto | Exibir referência temporal e comunicar campos indisponíveis. |
| R08 | Requisitos operacionais insuficientemente definidos | Média | Médio | Monitorar métricas e validar metas antes do lançamento. |

## Out of Scope

- Autenticação, cadastro e gerenciamento de conta.
- Persistência de preferências, favoritos ou histórico em servidor.
- Geolocalização automática.
- Alertas meteorológicos e notificações push.
- Funcionamento offline completo.
- Dados horários detalhados e histórico meteorológico.
- Integração com calendários, mapas ou serviços de viagem.
- Compartilhamento social e exportação.
- Administração ou edição manual de dados meteorológicos.
- Suporte multilíngue além de português do Brasil.

## Open Questions

1. A busca será somente por submissão ou também durante a digitação?
2. Quais dados adicionais devem aparecer no clima atual?
3. Qual idade máxima torna os dados meteorológicos desatualizados?
4. A atribuição exigida pela Open-Meteo deve aparecer em uma área específica?
5. Qual meta mensal de disponibilidade será adotada?
6. A unidade ou última cidade serão persistidas localmente no dispositivo?
7. Quais métricas de sucesso e requisitos de analytics a empresa exige?
8. Existe identidade visual ou design system obrigatório?