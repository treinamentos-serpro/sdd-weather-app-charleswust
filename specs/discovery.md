# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para permitir que usuários consultem as condições meteorológicas de cidades de seu interesse. O produto deve atender a um cenário de uso rápido e recorrente, apresentando o clima atual e uma visão de curto prazo, com suporte a diferentes preferências de unidade e a dispositivos móveis.

O escopo inicial caracteriza um MVP de consulta, sem indicação de funcionalidades de conta, personalização persistente ou alertas. O fluxo principal esperado é:

1. Usuário informa o nome de uma cidade.
2. A aplicação apresenta resultados compatíveis para desambiguação, quando necessário.
3. Usuário seleciona a cidade.
4. A aplicação exibe o clima atual e a previsão dos próximos cinco dias.
5. Usuário pode alternar entre Celsius e Fahrenheit.

## Personas

### Marina, viajante frequente

- **Objetivo principal:** verificar rapidamente o clima do destino para planejar roupas, deslocamentos e atividades.
- **Contexto de uso:** principalmente mobile, durante deslocamentos ou com conexão instável.
- **Métrica de sucesso:** consegue buscar a cidade e interpretar a previsão de cinco dias em menos de um minuto.

### Carlos, profissional que trabalha ao ar livre

- **Objetivo principal:** conferir as condições meteorológicas antes de iniciar atividades externas.
- **Contexto de uso:** mobile pela manhã e ao longo do dia, com consultas recorrentes para diferentes cidades.
- **Métrica de sucesso:** encontra temperatura, condição climática e previsão sem repetir a busca ou navegar por várias telas.

### Renata, usuária planejadora

- **Objetivo principal:** comparar a previsão dos próximos dias para organizar compromissos pessoais e viagens.
- **Contexto de uso:** principalmente desktop em casa, com consultas ocasionais pelo mobile.
- **Métrica de sucesso:** consulta a previsão de cinco dias, identifica mínimas e máximas e alterna a unidade sem confusão.

## Requisitos Funcionais

### RF01. Buscar cidades

O sistema deve permitir que o usuário pesquise uma cidade por nome.

- A busca deve aceitar entrada textual e ser acionável em dispositivos móveis.
- O sistema deve apresentar resultados para seleção quando houver mais de uma cidade compatível.
- Os resultados devem identificar a cidade de forma suficiente para diferenciá-la de homônimas, preferencialmente com país e/ou região.
- Para uma busca sem resultados, o sistema deve informar que nenhuma cidade foi encontrada e orientar uma nova tentativa.

### RF02. Selecionar uma cidade

O usuário deve poder selecionar uma cidade entre os resultados da busca para consultar sua previsão.

- A seleção deve iniciar a consulta dos dados meteorológicos correspondentes à cidade escolhida.
- O sistema deve evitar apresentar dados de uma cidade diferente da selecionada.

### RF03. Exibir clima atual

O sistema deve exibir as condições meteorológicas atuais da cidade selecionada.

No mínimo, a apresentação deve contemplar:

- temperatura atual;
- condição climática legível;
- cidade consultada;
- unidade de temperatura ativa;
- horário ou referência temporal da medição, quando fornecido pela fonte de dados.

### RF04. Exibir previsão de cinco dias

O sistema deve exibir a previsão meteorológica para os cinco dias seguintes à consulta.

Para cada dia, deve apresentar, no mínimo:

- dia ou data;
- condição climática resumida;
- temperatura mínima e máxima, quando disponíveis;
- unidade de temperatura aplicada.

### RF05. Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit.

- A unidade selecionada deve ser claramente identificável.
- Os valores exibidos no clima atual e na previsão devem ser convertidos ou recarregados de forma consistente.
- A troca de unidade não deve exigir uma nova busca de cidade.

### RF06. Tratar estados da aplicação

A aplicação deve comunicar adequadamente os estados do fluxo:

- carregamento durante busca e consulta meteorológica;
- erro quando a fonte de dados estiver indisponível ou retornar uma resposta inválida;
- ausência de resultados para cidades não encontradas;
- estado inicial antes de uma cidade ser selecionada.

### RF07. Permitir uso em dispositivos móveis

As funcionalidades de busca, seleção, visualização e alternância de unidade devem estar disponíveis em telas móveis, com controles operáveis por toque e teclado.

## Requisitos Não-Funcionais

### RNF01. Responsividade

A interface deve se adaptar a diferentes larguras de tela, priorizando legibilidade, navegação vertical e ausência de rolagem horizontal em dispositivos móveis.

### RNF02. Usabilidade

O fluxo de consulta deve ser simples, previsível e concluído com poucos passos. Os rótulos dos campos e controles devem ser claros, e o usuário deve receber feedback visual durante operações assíncronas.

### RNF03. Acessibilidade

A aplicação deve seguir boas práticas de acessibilidade, incluindo:

- navegação por teclado;
- foco visível;
- associação entre rótulos e campos;
- contraste suficiente entre texto e fundo;
- mensagens de erro compreensíveis;
- alternativas textuais para ícones ou representações visuais;
- estrutura semântica compatível com leitores de tela.

### RNF04. Desempenho

A aplicação deve iniciar e responder às interações principais de forma rápida em conexões móveis comuns. Indicadores de carregamento devem aparecer quando uma operação não puder ser concluída imediatamente.

### RNF05. Disponibilidade e resiliência

Falhas temporárias da fonte meteorológica não devem quebrar a interface. O sistema deve exibir uma mensagem orientativa e permitir que o usuário tente novamente.

### RNF06. Qualidade dos dados

A aplicação deve indicar a origem temporal dos dados quando essa informação estiver disponível e não deve ocultar unidades, datas ou condições necessárias para interpretar a previsão corretamente.

### RNF07. Segurança e privacidade

A aplicação deve evitar coletar dados pessoais desnecessários. Entradas de busca devem ser tratadas com segurança, e chaves ou credenciais de serviços externos não devem ser expostas no cliente quando a arquitetura exigir segredo.

### RNF08. Compatibilidade

A aplicação deve funcionar nas versões atuais dos principais navegadores em desktop e mobile, incluindo navegadores baseados em Chromium, Firefox e Safari.

## Riscos

| ID | Risco | Impacto | Probabilidade | Mitigação inicial |
|---|---|---|---|---|
| R01 | A fonte de dados pode ficar indisponível, limitar requisições ou alterar seu contrato. | Alto | Média | Isolar a integração, tratar erros, definir timeout e avaliar cache ou fonte alternativa. |
| R02 | Nomes de cidades podem ser ambíguos ou existir em múltiplos países e regiões. | Médio | Alta | Exibir país/região nos resultados e exigir seleção explícita quando necessário. |
| R03 | Dados meteorológicos podem estar defasados, incompletos ou usar fusos horários diferentes. | Alto | Média | Exibir timestamp/fuso quando possível, validar respostas e comunicar limitações dos dados. |
| R04 | A previsão de cinco dias pode ser interpretada de forma diferente pela fonte, por exemplo, dias corridos ou períodos de 24 horas. | Médio | Média | Definir o contrato de dados e documentar claramente as datas apresentadas. |
| R05 | Conversões de temperatura inconsistentes podem gerar perda de confiança. | Médio | Média | Centralizar a conversão, aplicar arredondamento definido e testar ambas as unidades. |
| R06 | Layout ou controles podem ficar difíceis de usar em telas pequenas. | Médio | Média | Validar em dispositivos móveis reais e testar diferentes larguras e orientações. |
| R07 | Mensagens de erro pouco claras podem impedir a recuperação do usuário. | Médio | Média | Definir estados de erro com causa compreensível e ação de tentar novamente. |
| R08 | Consultas repetidas podem elevar latência e consumo da API. | Médio | Média | Debounce na busca, evitar chamadas duplicadas e considerar cache por cidade/unidade. |

## Perguntas em Aberto

1. Qual fonte de dados meteorológicos será utilizada e quais são seus limites, termos de uso e disponibilidade?
2. A busca deve iniciar enquanto o usuário digita, ao submeter o formulário ou nos dois momentos?
3. Quais dados adicionais devem aparecer no clima atual, como sensação térmica, umidade, vento e precipitação?
4. A previsão deve representar cinco dias completos a partir do dia atual ou os cinco próximos dias do calendário?
5. O dia atual deve aparecer também na lista de previsão ou somente no painel de clima atual?
6. Qual é a definição de “cidade” para a busca: município, região metropolitana, localidade ou coordenada?
7. Como a aplicação deve se comportar quando houver múltiplos resultados com o mesmo nome?
8. A cidade e a unidade escolhidas devem ser mantidas entre sessões ou apenas durante a sessão atual?
9. É necessário permitir cidades favoritas, histórico de buscas, geolocalização ou alertas em versões futuras?
10. Qual tempo de resposta é considerado aceitável para busca e carregamento da previsão?
11. A aplicação precisa oferecer suporte a mais de um idioma ou apenas português do Brasil?
12. Há requisitos de conformidade, analytics, observabilidade ou métricas de sucesso do produto?
13. Quais navegadores, versões mínimas e tamanhos de tela precisam ser oficialmente suportados?
14. Existe um design system, identidade visual ou requisito de marca que deve orientar a interface?
15. Qual comportamento esperado para uma nova consulta quando a aplicação já exibe dados de outra cidade?

## Decisões

### D01. Fonte de dados: Open-Meteo

Será utilizada a Open-Meteo como fonte de geocodificação e previsão meteorológica, sem necessidade de API key.

**Justificativa:** reduz a complexidade inicial de configuração, elimina o gerenciamento de credenciais no MVP e permite validar o produto com uma fonte pública adequada ao escopo definido.

**Perguntas resolvidas:** define a fonte de dados, elimina a necessidade inicial de autenticação com o provedor e orienta a avaliação de cobertura, limites de uso e contrato da API.

### D02. Janela da previsão: hoje + quatro dias

A previsão de cinco dias será composta pelo dia atual e pelos quatro dias seguintes, em visão diária.

**Justificativa:** estabelece uma interpretação objetiva para “5 dias” e mantém a informação compacta para consulta rápida em desktop e mobile.

**Perguntas resolvidas:** define se o dia atual participa da contagem, elimina a ambiguidade entre cinco dias corridos e cinco dias futuros e orienta o formato da previsão.

### D03. Unidade padrão: Celsius

A aplicação exibirá temperaturas em Celsius por padrão, mantendo Fahrenheit como alternativa por meio do controle de unidade previsto no MVP.

**Justificativa:** Celsius é a convenção mais adequada ao público inicial em português do Brasil, sem impedir o uso por pessoas que prefiram Fahrenheit.

**Perguntas resolvidas:** define a unidade inicial e estabelece a necessidade de manter a alternância entre Celsius e Fahrenheit.

### D04. Acesso sem autenticação e sem persistência de servidor

O MVP não terá login, contas de usuário nem armazenamento de preferências, histórico ou favoritos em servidor.

**Justificativa:** mantém o fluxo de consulta direto, reduz o escopo técnico e evita coletar dados pessoais enquanto essas funcionalidades não forem validadas.

**Perguntas resolvidas:** define o modelo de acesso, confirma que a experiência será anônima e delimita a persistência fora do servidor. Persistência local no dispositivo permanece uma decisão posterior, caso seja necessária para a unidade ou a última cidade.

### D05. Idioma da interface: português do Brasil

Todos os textos da interface, mensagens de erro e rótulos do MVP serão fornecidos em português do Brasil.

**Justificativa:** alinha a experiência ao público inicial e evita incluir internacionalização como requisito obrigatório nesta etapa.

**Perguntas resolvidas:** define o idioma inicial da interface e adia o suporte multilíngue para uma decisão futura, caso o escopo geográfico seja ampliado.

## Suposições

- O MVP será uma aplicação de consulta, sem autenticação e sem necessidade de cadastro.
- O usuário informará a cidade manualmente; geolocalização não faz parte do escopo inicial.
- Uma API externa fornecerá os dados de geocodificação e previsão, sem necessidade de edição manual por parte dos usuários.
- Celsius será a unidade inicial padrão para usuários no Brasil, com Fahrenheit disponível como alternativa.
- A consulta exige conectividade com a internet; não há requisito confirmado de funcionamento offline.
- A previsão será apresentada em dias, e a fonte de dados disponibilizará informação suficiente para compor cinco dias.
- A cidade selecionada será identificada por um conjunto estável de dados, como identificador, coordenadas, país e região, e não apenas pelo texto digitado.
- A interface será responsiva e terá como alvo principal navegadores modernos em smartphones e desktops.
- Erros de rede, ausência de resultados e respostas inválidas serão tratados na interface, sem expor detalhes técnicos ao usuário final.
- A persistência de preferências, favoritos e histórico está fora do escopo até que seja confirmada pelos stakeholders.
- O idioma inicial da interface será português do Brasil.
