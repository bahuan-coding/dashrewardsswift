/**
 * Ranking Gamification Module - Swift Elite Rewards
 * Sistema de gamificação para engajamento de funcionários
 */

class RankingGamification {
  constructor() {
    this.achievements = [];
    this.badges = [];
    this.motivationalMessages = this.getMotivationalMessages();
    this.insights = this.getInsights();
  }

  /**
   * Mensagens motivacionais contextualizadas
   */
  getMotivationalMessages() {
    return {
      top3: [
        { title: '🏆 Vocês são imbatíveis!', subtitle: 'Seu time está no Top 3 da rede Swift' },
        { title: '⭐ Estrelas em ação!', subtitle: 'Vocês estão brilhando no pódio' },
        { title: '🎯 Campeões do atendimento!', subtitle: 'Seu time está no Top 3 nacional' }
      ],
      top10: [
        { title: '🚀 Rumo ao topo!', subtitle: 'Seu time está no Top 10% da rede Swift' },
        { title: '💪 Time de elite!', subtitle: 'Vocês estão entre os melhores' },
        { title: '🌟 Brilhando forte!', subtitle: 'Seu desempenho está acima da média' }
      ],
      top25: [
        { title: '📈 Em ascensão!', subtitle: 'Seu time está no Top 25% da rede' },
        { title: '💫 Crescimento constante!', subtitle: 'Vocês estão evoluindo bem' },
        { title: '🎪 Show de resultados!', subtitle: 'Continue assim, vocês vão longe!' }
      ],
      default: [
        { title: '💪 Juntos somos mais fortes!', subtitle: 'Cada atendimento conta para o sucesso do time' },
        { title: '🎯 Foco no objetivo!', subtitle: 'Vamos subir no ranking juntos' },
        { title: '⚡ Energia positiva!', subtitle: 'Seu esforço faz a diferença' }
      ]
    };
  }

  /**
   * Insights para ajudar a subir no ranking
   */
  getInsights() {
    return [
      'Para subir 2 posições, melhore o NPS médio em +0.7 pontos',
      'Mantenha o ritmo! Você está a apenas 1.2 pontos do Top 5',
      'Aumente cross-sell em 15% para ganhar +50 créditos Swift',
      'NPS acima de 90 garante posição no pódio este mês',
      'Feedback positivo dos clientes = mais pontos no ranking',
      'Próxima meta: alcançar 3 avaliações 10⭐ esta semana'
    ];
  }

  /**
   * Calcula e retorna badges baseados na performance
   */
  calculateBadges(storeData, networkData) {
    const badges = [];
    
    if (!storeData || !networkData) return badges;

    const { posicao, nps, npsAnterior } = storeData;
    const totalStores = networkData.totalStores || 15;
    const networkAverage = networkData.average || 88.5;

    // Badge: Top 3
    if (posicao <= 3) {
      badges.push({
        icon: 'trophy',
        text: 'Top 3 Nacional',
        color: '#ffd700'
      });
    }

    // Badge: Subiu posições
    if (npsAnterior && nps > npsAnterior) {
      const delta = (nps - npsAnterior).toFixed(1);
      badges.push({
        icon: 'trending-up',
        text: `+${delta} vs mês anterior`,
        color: '#28a745'
      });
    }

    // Badge: Acima da média
    if (nps > networkAverage) {
      badges.push({
        icon: 'star',
        text: 'Acima da Média',
        color: '#ffc107'
      });
    }

    // Badge: Destaque de atendimento
    if (nps >= 92) {
      badges.push({
        icon: 'award',
        text: 'Excelência em NPS',
        color: '#007bff'
      });
    }

    return badges;
  }

  /**
   * Retorna mensagem motivacional baseada na posição
   */
  getMotivationalMessage(position, totalStores) {
    const percentile = (position / totalStores) * 100;
    
    let messageGroup;
    if (position <= 3) {
      messageGroup = this.motivationalMessages.top3;
    } else if (percentile <= 10) {
      messageGroup = this.motivationalMessages.top10;
    } else if (percentile <= 25) {
      messageGroup = this.motivationalMessages.top25;
    } else {
      messageGroup = this.motivationalMessages.default;
    }

    return messageGroup[Math.floor(Math.random() * messageGroup.length)];
  }

  /**
   * Calcula progresso para próxima posição
   */
  calculateProgress(myStore, nextStore, networkData) {
    if (!myStore || !nextStore) {
      return {
        percent: 0,
        insight: 'Continue melhorando para subir no ranking!'
      };
    }

    const currentNPS = myStore.nps;
    const targetNPS = nextStore.nps;
    const gap = targetNPS - currentNPS;
    
    // Simula progresso baseado em tendência
    const trend = myStore.npsAnterior ? (currentNPS - myStore.npsAnterior) : 0;
    const estimatedProgress = Math.min(Math.max((1 - (gap / 5)) * 100, 0), 100);
    
    let insight;
    if (gap < 0.5) {
      insight = `Falta muito pouco! Apenas +${gap.toFixed(1)} pontos para ultrapassar ${nextStore.lojaNome}`;
    } else if (gap < 1.5) {
      insight = `Para subir 1 posição, melhore o NPS em +${gap.toFixed(1)} pontos`;
    } else {
      insight = `Foco no atendimento! +${gap.toFixed(1)} pontos separam você do ${nextStore.posicao}º lugar`;
    }

    return {
      percent: Math.round(estimatedProgress),
      insight
    };
  }

  /**
   * Calcula créditos ganhos no mês (simulado)
   */
  calculateCredits(storeData) {
    if (!storeData) return 0;
    
    const { posicao, nps, npsAnterior } = storeData;
    
    // Base de créditos por posição
    let credits = 100;
    if (posicao <= 3) credits += 150;
    else if (posicao <= 10) credits += 75;
    else if (posicao <= 20) credits += 30;
    
    // Bonus por NPS alto
    if (nps >= 95) credits += 100;
    else if (nps >= 92) credits += 50;
    else if (nps >= 90) credits += 25;
    
    // Bonus por melhoria
    if (npsAnterior && nps > npsAnterior) {
      const improvement = nps - npsAnterior;
      credits += Math.round(improvement * 20);
    }
    
    return credits;
  }

  /**
   * Mostra conquista em toast
   */
  showAchievement(title, description, icon = 'trophy') {
    const container = document.getElementById('achievementContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="achievement-icon">
        <i data-lucide="${icon}" style="width: 24px; height: 24px;"></i>
      </div>
      <div class="achievement-content">
        <h6>${title}</h6>
        <p>${description}</p>
      </div>
    `;

    container.appendChild(toast);

    // Reinitialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto remove após 5 segundos
    setTimeout(() => {
      toast.classList.add('closing');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Simula feedback em tempo real (exemplo)
   */
  simulateRealTimeFeedback() {
    // Exemplo de feedback que apareceria ao receber NPS 10
    setTimeout(() => {
      this.showAchievement(
        '⭐ NPS 10 Recebido!',
        '+30 créditos Swift adicionados pelo atendimento excepcional',
        'star'
      );
    }, 2000);
  }

  /**
   * Renderiza hero motivacional
   */
  renderHero(storeData, totalStores) {
    if (!storeData) return;

    const message = this.getMotivationalMessage(storeData.posicao, totalStores);
    
    document.getElementById('heroTitle').textContent = message.title;
    document.getElementById('heroSubtitle').textContent = message.subtitle;
  }

  /**
   * Renderiza badges no hero
   */
  renderBadges(badges) {
    const container = document.getElementById('heroBadges');
    if (!container) return;

    container.innerHTML = badges.map(badge => `
      <div class="hero-badge">
        <i data-lucide="${badge.icon}" style="width: 16px; height: 16px; color: ${badge.color};"></i>
        <span>${badge.text}</span>
      </div>
    `).join('');

    // Reinitialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Atualiza métricas expandidas da "Minha Loja"
   */
  updateExpandedMetrics(storeData, networkData, allStores) {
    if (!storeData || !networkData) return;

    // NPS Atual
    document.getElementById('myStoreNps').textContent = storeData.nps.toFixed(1);
    
    // Delta NPS
    const deltaElement = document.getElementById('myStoreNpsDelta');
    if (storeData.npsAnterior) {
      const delta = (storeData.nps - storeData.npsAnterior).toFixed(1);
      deltaElement.textContent = `${delta > 0 ? '+' : ''}${delta}`;
      deltaElement.className = `metric-delta ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}`;
    } else {
      deltaElement.textContent = 'Nova loja';
      deltaElement.className = 'metric-delta neutral';
    }

    // Média da Rede
    document.getElementById('networkAverage').textContent = networkData.average.toFixed(1);
    
    // Comparativo
    const compareElement = document.getElementById('compareNetwork');
    const diff = storeData.nps - networkData.average;
    compareElement.textContent = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} vs rede`;
    compareElement.className = `metric-compare ${diff > 0 ? 'positive' : 'negative'}`;

    // Evolução de posições (simulado)
    const posChange = storeData.npsAnterior && storeData.nps > storeData.npsAnterior ? '+3' : storeData.nps < storeData.npsAnterior ? '-1' : '0';
    document.getElementById('positionChange').textContent = posChange;
    document.getElementById('positionChange').className = `metric-value ${posChange.includes('+') ? 'text-success' : posChange.includes('-') ? 'text-danger' : ''}`;

    // Créditos ganhos
    const credits = this.calculateCredits(storeData);
    document.getElementById('creditsEarned').textContent = `+${credits}`;

    // Progress bar
    const nextStore = allStores.find(s => s.posicao === storeData.posicao - 1);
    const progress = this.calculateProgress(storeData, nextStore, networkData);
    
    document.getElementById('progressPercent').textContent = `${progress.percent}%`;
    document.getElementById('progressFill').style.width = `${progress.percent}%`;
    document.getElementById('insightText').textContent = progress.insight;
  }

  /**
   * Inicializa gamificação completa
   */
  initialize(storeData, allStores, networkData) {
    if (!storeData) return;

    // Renderiza hero motivacional
    this.renderHero(storeData, allStores.length);

    // Calcula e renderiza badges
    const badges = this.calculateBadges(storeData, networkData);
    this.renderBadges(badges);

    // Atualiza métricas expandidas
    this.updateExpandedMetrics(storeData, networkData, allStores);

    // Simula feedback (exemplo - pode ser removido em produção)
    // this.simulateRealTimeFeedback();
  }
}

// Export para uso global
window.RankingGamification = RankingGamification;

