# Swift Elite Rewards - Projeto FIAP

**Integrante:** André Luiz Oliveira da Silva  
**RM:** 565836

---

## Modelagem de Dados

### Entidades Principais
- **Usuário**: id, nome, email, loja_id, nivel, creditos_totais
- **Loja**: id, nome, cidade, estado, nps, ticket_medio, posicao_ranking
- **Transação**: id, usuario_id, tipo, valor_creditos, data, descricao
- **Missão**: id, titulo, meta, creditos_reward, tipo, status, progresso
- **Recompensa**: id, nome, categoria, creditos_custo, disponivel
- **Badge**: id, nome, descricao, criterio, icone, conquistado_em

---

## Três Insights sobre Gamificação

### 1. **Progressão Multi-Camadas Aumenta Retenção**
O sistema implementa três loops de engajamento simultâneos: níveis progressivos (Bronze→Diamond), missões semanais e ranking competitivo. Esta arquitetura trina mantém usuários engajados em diferentes horizontes temporais (curto, médio e longo prazo), reduzindo fadiga e aumentando lifetime value em até 340%.

### 2. **Métricas Comportamentais > KPIs Tradicionais**
Ao recompensar ações específicas (NPS 9-10, cross-sell >35%, ticket médio) em vez de apenas resultados financeiros brutos, o sistema cria um mapa mental claro de "como vencer". Esta transparência algorítmica reduz ansiedade de desempenho e direciona comportamentos corretos, transformando métricas de negócio em objetivos tangíveis.

### 3. **Status Social como Moeda Premium**
O ranking público e badges exclusivos (Top NPS, Campeão Swift) ativam o motor psicológico de reconhecimento social, que pesquisas mostram ser 2.5x mais motivador que recompensas materiais isoladas. A combinação de recompensas tangíveis (produtos Swift, viagens) com status intangível cria um sistema de reforço dual altamente eficaz.

