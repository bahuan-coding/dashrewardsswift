/**
 * Swift Elite Rewards - Aplicação de Login
 * Funcionalidades baseadas no content.yaml
 */

// =============================================================================
// CONFIGURAÇÕES E DADOS MOCK
// =============================================================================

// Dados mock dos usuários - carregados do content.yaml
let mockUsers = {};

// Dados mock das lojas - carregados do content.yaml
let mockLojas = {};

// Dados mock do dashboard - carregados do content.yaml
let dashboardMockData = {};

// Mensagens do sistema - carregadas do content.yaml
let messages = {};

// Configurações - carregadas do content.yaml
let config = {};

/**
 * Mapeia cidades para estados
 */
function getEstadoFromCidade(cidade) {
    const cidadeEstado = {
        'São Paulo': 'SP',
        'Rio de Janeiro': 'RJ',
        'Belo Horizonte': 'MG',
        'Brasília': 'DF',
        'Salvador': 'BA',
        'Fortaleza': 'CE',
        'Recife': 'PE',
        'Porto Alegre': 'RS',
        'Curitiba': 'PR',
        'Goiânia': 'GO'
    };
    return cidadeEstado[cidade] || '';
}

/**
 * Carrega todos os dados do content.yaml
 */
async function loadContentFromYAML() {
    try {
        if (window.contentLoader && window.contentLoader.content) {
            const content = window.contentLoader.content;
            
            // Carrega mensagens
            if (content.messages) {
                messages = content.messages;
            }
            
            // Carrega configurações
            if (content.config) {
                config = content.config;
            }
            
            // Carrega dados mock dos usuários
            if (content.mock_data && content.mock_data.users) {
                mockUsers = content.mock_data.users;
            }
            
            // Carrega dados mock das lojas a partir das opções do dropdown
            if (content.login && content.login.form && content.login.form.fields && content.login.form.fields.store && content.login.form.fields.store.options) {
                const storeOptions = content.login.form.fields.store.options;
                mockLojas = {};
                storeOptions.forEach(option => {
                    // Extrai cidade e estado do nome da loja
                    const parts = option.text.split(' - ');
                    const cidade = parts[1] || '';
                    const estado = getEstadoFromCidade(cidade);
                    
                    mockLojas[option.value] = {
                        nome: option.text,
                        cidade: cidade,
                        estado: estado
                    };
                });
            }
            
            // Carrega dados mock do dashboard
            if (content.dashboard_mock_data) {
                dashboardMockData = content.dashboard_mock_data;
            }
            
            console.log('✅ Todos os dados carregados do YAML com sucesso');
            console.log('📊 Usuários carregados:', Object.keys(mockUsers).length);
            console.log('🏪 Lojas carregadas:', Object.keys(mockLojas).length);
            console.log('📈 Dados do dashboard carregados:', !!dashboardMockData.transactions);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar conteúdo do YAML:', error);
        throw error;
    }
}

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

/**
 * Exibe um alerta na tela
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    
    if (!alertContainer) {
        console.warn('⚠️ Container de alertas não encontrado');
        return;
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, config.timing.notification_duration);
}

/**
 * Valida um email usando regex
 */
function isValidEmail(email) {
    // Use a simple, reliable regex directly instead of relying on YAML config
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = emailRegex.test(email);
    
    // Debug logging to understand what's happening
    console.log('🔍 isValidEmail DEBUG:');
    console.log('  Email:', JSON.stringify(email));
    console.log('  Email type:', typeof email);
    console.log('  Email length:', email ? email.length : 'null/undefined');
    console.log('  Regex:', emailRegex);
    console.log('  Test result:', result);
    console.log('  Expected for colaborador@swift.com.br: true');
    
    return result;
}

/**
 * Simula uma requisição de login
 */
async function simulateLogin(email, store) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = Object.values(mockUsers).find(u => u.email === email);
            
            if (user && user.loja === store) {
                resolve({
                    success: true,
                    user: user,
                    message: messages.success.login_success
                });
            } else {
                reject({
                    success: false,
                    message: messages.error.login_failed
                });
            }
        }, config.timing.loading_delay);
    });
}

/**
 * Ativa/desativa estado de loading no botão
 */
function setLoadingState(loading) {
    const btn = document.querySelector('.btn-login');
    if (!btn) {
        console.warn('⚠️ Botão de login não encontrado');
        return;
    }
    
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    if (!btnText || !btnLoading) {
        console.warn('⚠️ Elementos do botão não encontrados');
        return;
    }
    
    if (loading) {
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        btn.disabled = true;
    } else {
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
        btn.disabled = false;
    }
}

/**
 * Valida o formulário de login
 */
function validateForm() {
    const email = document.getElementById('email').value.trim();
    const store = document.getElementById('store').value;
    
    const errors = [];
    
    if (!email) {
        errors.push({
            field: 'email',
            message: messages.validation.email_required
        });
    } else if (!isValidEmail(email)) {
        errors.push({
            field: 'email',
            message: messages.validation.email_invalid
        });
    }
    
    if (!store) {
        errors.push({
            field: 'store',
            message: messages.validation.store_required
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**fa
 */
function showValidationErrors(errors) {
    document.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid', 'is-valid');
    });
    
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('is-invalid');
            const feedback = field.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = error.message;
            }
        }
    });
}

/**
 * Limpa erros de validação do formulário
 */
function clearValidationErrors() {
    document.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid', 'is-valid');
    });
}

/**
 * Processa o login do usuário
 */
async function processLogin(email, store) {
    try {
        setLoadingState(true);
        clearValidationErrors();
        
        const result = await simulateLogin(email, store);
        
        if (result.success) {
            // Set fresh login flag first
            sessionStorage.setItem('swift_fresh_login', '1');
            
            // Save session data
            saveSession(result.user);
            
            console.log('Redirecionando para inicio...', result.user);
            console.log('Dados da sessão salvos:', result.user);
            console.log('Fresh login flag set:', sessionStorage.getItem('swift_fresh_login'));
            
            // Show loading overlay before redirect
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                // Force a reflow to ensure the display change takes effect
                loadingOverlay.offsetHeight;
                // Add visible class to trigger fade in
                loadingOverlay.classList.add('visible');
            }
            
            // Wait for fade in animation
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Redirect to inicio.html
            window.location.href = 'inicio.html';
        }
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoadingState(false);
    }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Iniciando Swift Elite Rewards...');
        console.log('📍 URL atual:', window.location.href);
        console.log('📄 Página atual:', document.title);
        
        // Detecta qual página estamos
        const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
        const isDashboardPage = window.location.pathname.includes('dashboard.html');
        const isHomePage = window.location.pathname.includes('inicio.html');
        const isWalletPage = window.location.pathname.includes('carteira.html');
        
        console.log('🔍 Detecção de página:', {
            isLoginPage,
            isDashboardPage,
            isHomePage,
            isWalletPage,
            currentPath: window.location.pathname
        });
        
        // Aguarda o content loader carregar o YAML
        if (window.contentLoader) {
            await window.contentLoader.applyContent();
        }
        
        // Carrega dados do YAML para as variáveis globais
        await loadContentFromYAML();
        
        console.log('✅ Sistema inicializado com dados do YAML');
        
        // Se estamos na página do dashboard, não precisamos dos elementos de login
        if (isDashboardPage) {
            console.log('ℹ️ Página do dashboard detectada - inicializando dashboard...');
            initializeDashboard();
            return;
        }
        
        // Se estamos na página inicial, inicializa a página home
        if (isHomePage) {
            console.log('ℹ️ Página inicial detectada - inicializando home...');
            initializeHomePage();
            return;
        }

        // Se estamos na página da carteira, inicializa a página da carteira
        if (isWalletPage) {
            console.log('ℹ️ Página da carteira detectada - inicializando carteira...');
            initializeWalletPage();
            return;
        }
        
        // Se estamos na página de login, inicializa o formulário
        if (isLoginPage) {
            console.log('ℹ️ Página de login detectada - inicializando formulário...');
            initializeLoginForm();
            return;
        }
        
        console.warn('⚠️ Página não reconhecida - nenhuma inicialização específica será executada');
        
    } catch (error) {
        console.error('❌ Erro crítico na inicialização:', error);
        showAlert('Erro ao carregar a aplicação. Verifique o console para mais detalhes.', 'danger');
    }
});

/**
 * Inicializa o formulário de login
 */
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('email');
    const storeField = document.getElementById('store');
    
    console.log('🔍 Verificando elementos do formulário de login:', {
        loginForm: !!loginForm,
        emailField: !!emailField,
        storeField: !!storeField
    });
    
    // Verifica se os elementos existem antes de adicionar event listeners
    if (!loginForm || !emailField || !storeField) {
        console.error('❌ Elementos do formulário de login não encontrados:', {
            loginForm: !!loginForm,
            emailField: !!emailField,
            storeField: !!storeField
        });
        return;
    }
    
    // Validação em tempo real do email
    emailField.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            this.classList.add('is-invalid');
        } else if (email && isValidEmail(email)) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });
    
    // Validação em tempo real da loja
    storeField.addEventListener('change', function() {
        if (this.value) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        }
    });
    
    // Limpa validação quando o usuário começa a digitar
    emailField.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
            this.classList.remove('is-invalid');
        }
    });
    
    // Submissão do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailField.value.trim();
        const store = storeField.value;
        
        const validation = validateForm();
        
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
        
        await processLogin(email, store);
    });
    
    loginForm.classList.add('was-validated');
    
    console.log('🎉 Swift Elite Rewards - Sistema de Login carregado com sucesso!');
    console.log('📊 Dados carregados:', {
        users: Object.keys(mockUsers).length,
        stores: Object.keys(mockLojas).length,
        messages: Object.keys(messages).length,
        config: Object.keys(config).length
    });
}

/**
 * Gerencia o overlay de loading
 */
function handleLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    // Check if this is a fresh login
    const isFreshLogin = sessionStorage.getItem('swift_fresh_login') === '1';
    
    if (!isFreshLogin) {
        hideLoadingOverlay();
        return;
    }
    
    // Set up timeout for safety (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
        hideLoadingOverlay();
    }, 3000);
    
    // Handle both cases: page already loaded or still loading
    if (document.readyState === 'complete') {
        clearTimeout(timeoutId);
        setTimeout(hideLoadingOverlay, 500);
    } else {
        window.addEventListener('load', () => {
            clearTimeout(timeoutId);
            setTimeout(hideLoadingOverlay, 500);
        });
    }
    
    // Clear the flag
    sessionStorage.removeItem('swift_fresh_login');
}

/**
 * Esconde o overlay de loading
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    // Remove visible class to trigger fade out
    overlay.classList.remove('visible');
    
    // Wait for fade out animation to complete before hiding
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 500);
}

/**
 * Inicializa a página inicial (home)
 */
function initializeHomePage() {
    console.log('🏠 Inicializando página inicial...');
    
    // Initialize loading overlay
    handleLoadingOverlay();
    
    console.log('✅ Página inicial inicializada com sucesso!');
}

/**
 * Inicializa o dashboard
 */
function initializeDashboard() {
    console.log('🎯 Inicializando dashboard...');
    
    // Verifica se o usuário está logado
    if (!checkIfLoggedIn()) {
        console.log('❌ Usuário não logado, redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Dashboard inicializado com sucesso!');
    // Aqui você pode adicionar lógica específica do dashboard se necessário
}

/**
 * Inicializa a página da carteira
 */
function initializeWalletPage() {
    console.log('💳 Inicializando página da carteira...');
    
    // A página da carteira não requer autenticação específica
    // pois já tem sua própria lógica de inicialização
    
    console.log('✅ Página da carteira inicializada com sucesso!');
    // A lógica específica da carteira está no próprio HTML
}

// =============================================================================
// FUNÇÕES PARA TRABALHAR COM DADOS MOCK
// =============================================================================

/**
 * Obtém dados de uma loja específica
 * @param {string} lojaId - ID da loja
 * @returns {Object|null} - Dados da loja ou null se não encontrada
 */
function getLojaData(lojaId) {
    return mockLojas[lojaId] || null;
}

/**
 * Obtém dados de um usuário específico
 * @param {string} email - Email do usuário
 * @returns {Object|null} - Dados do usuário ou null se não encontrado
 */
function getUserData(email) {
    return Object.values(mockUsers).find(user => user.email === email) || null;
}

/**
 * Obtém todas as transações mock
 * @returns {Array} - Lista de transações
 */
function getMockTransactions() {
    return dashboardMockData.transactions;
}

/**
 * Obtém estatísticas do usuário
 * @returns {Object} - Estatísticas mock
 */
function getUserStats() {
    return dashboardMockData.user_stats;
}

/**
 * Obtém configurações de polling
 * @returns {Object} - Configurações de polling
 */
function getPollingConfig() {
    return dashboardMockData.polling;
}

/**
 * Simula uma nova transação
 * @param {Object} transactionData - Dados da transação
 * @returns {Object} - Transação criada
 */
function simulateNewTransaction(transactionData) {
    const newTransaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ...transactionData
    };
    
    dashboardMockData.transactions.unshift(newTransaction);
    return newTransaction;
}

/**
 * Simula atualização de saldo
 * @param {number} amount - Valor a ser adicionado/subtraído
 * @returns {number} - Novo saldo
 */
function simulateBalanceUpdate(amount) {
    dashboardMockData.user_stats.total_credits += amount;
    return dashboardMockData.user_stats.total_credits;
}

/**
 * Verifica se o usuário já está logado (simulação)
 * @returns {boolean} - True se logado, false caso contrário
 */
function checkIfLoggedIn() {
    const sessionData = localStorage.getItem('swift_session');
    return sessionData !== null;
}

/**
 * Salva dados da sessão (simulação)
 * @param {Object} user - Dados do usuário
 */
function saveSession(user) {
    localStorage.setItem('swift_session', JSON.stringify({
        user: user,
        timestamp: Date.now()
    }));
}

/**
 * Remove dados da sessão
 */
function clearSession() {
    localStorage.removeItem('swift_session');
}

// =============================================================================
// WALLET BALANCE FUNCTIONS
// =============================================================================

/**
 * Inicializa o wallet balance
 * @param {Object} vm - ViewModel do wallet balance
 */
function initWalletBalance(vm) {
    console.log('💳 Inicializando wallet balance:', vm);
    
    // Renderiza componentes
    renderWalletBalance(vm);
    
    // Configura toggle de visibilidade
    setupBalanceToggle();
    
    // Configura CTAs
    setupWalletCTAs(vm);
    
    // Aplica estado inicial de visibilidade
    applyInitialVisibility();
    
    // Mostra delta se presente
    if (vm.lastDelta && vm.lastDelta > 0) {
        showDeltaAnimation(vm.lastDelta);
    }
    
    console.log('✅ Wallet balance inicializado');
}

/**
 * Renderiza os componentes do wallet balance
 */
function renderWalletBalance(vm) {
    renderXPBar(vm);
    renderMeta(vm);
    renderCTAs(vm);
}

/**
 * Renderiza a barra de XP
 */
function renderXPBar(vm) {
    const container = document.getElementById('wallet-xp-container');
    if (!container) return;
    
    const levelClass = `level-${vm.level.toLowerCase()}`;
    
    container.innerHTML = `
        <div class="d-flex align-items-center gap-2 mt-2">
            <span class="level-badge ${levelClass}">${vm.level}</span>
            <div class="xp-track flex-grow-1" 
                 role="progressbar"
                 aria-label="Progresso para o próximo nível"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-valuenow="${vm.xpPercent}">
                <div class="xp-fill" style="width: ${vm.xpPercent}%"></div>
            </div>
            <span class="text-muted small">${vm.xpPercent}%</span>
        </div>
    `;
}

/**
 * Renderiza a meta
 */
function renderMeta(vm) {
    const container = document.getElementById('wallet-meta-container');
    if (!container) return;
    
    const amount = vm.amountToNextLevel;
    
    container.innerHTML = `
        <div class="small text-muted mt-1">
            Faltam ${amount} créditos para o próximo nível
        </div>
    `;
}

/**
 * Renderiza os CTAs
 */
function renderCTAs(vm) {
    const container = document.getElementById('wallet-cta-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="d-flex gap-2">
            <button id="btn-redeem" class="btn btn-primary btn-sm">
                <i data-lucide="gift" style="width: 14px; height: 14px;" class="me-1"></i>
                Resgatar
            </button>
            <button id="btn-missions" class="btn btn-link btn-sm text-muted p-0">
                <i data-lucide="target" style="width: 14px; height: 14px;" class="me-1"></i>
                Ver missões
            </button>
        </div>
    `;
    
    // Reinicializa ícones Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Configura o toggle de visibilidade
 */
function setupBalanceToggle() {
    const toggleBtn = document.getElementById('btn-toggle-visibility');
    const balanceValue = document.getElementById('wallet-balance-value');
    
    if (!toggleBtn || !balanceValue) {
        console.warn('⚠️ Elementos do toggle não encontrados');
        return;
    }
    
    toggleBtn.addEventListener('click', function() {
        const isRevealed = JSON.parse(localStorage.getItem('wallet.balance.revealed') || 'false');
        const newState = !isRevealed;
        
        // Salva estado
        localStorage.setItem('wallet.balance.revealed', JSON.stringify(newState));
        
        // Atualiza interface
        updateVisibilityState(newState, toggleBtn, balanceValue);
    });
}

/**
 * Atualiza o estado de visibilidade
 */
function updateVisibilityState(isRevealed, toggleBtn, balanceValue) {
    const icon = toggleBtn.querySelector('svg') || toggleBtn.querySelector('i');

    // Atualiza ícone usando SVG direto
    if (icon) {
        if (isRevealed) {
            // Eye icon
            icon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.7;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        } else {
            // Eye-off icon
            icon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.7;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        }
    }

    // Atualiza aria attributes
    toggleBtn.setAttribute('aria-label', isRevealed ? 'Ocultar saldo' : 'Mostrar saldo');
    toggleBtn.setAttribute('aria-pressed', isRevealed.toString());

    // Atualiza blur
    if (isRevealed) {
        balanceValue.classList.remove('balance-blur');
    } else {
        balanceValue.classList.add('balance-blur');
    }
}

/**
 * Aplica estado inicial de visibilidade
 */
function applyInitialVisibility() {
    // Default to revealed (not blurred) if no state is saved
    const isRevealed = JSON.parse(localStorage.getItem('wallet.balance.revealed') || 'true');
    const toggleBtn = document.getElementById('btn-toggle-visibility');
    const balanceValue = document.getElementById('wallet-balance-value');
    
    if (toggleBtn && balanceValue) {
        // Remove blur class initially if revealed
        if (isRevealed) {
            balanceValue.classList.remove('balance-blur');
        }
        updateVisibilityState(isRevealed, toggleBtn, balanceValue);
    }
}

/**
 * Configura os CTAs
 */
function setupWalletCTAs(vm) {
    const redeemBtn = document.getElementById('btn-redeem');
    const missionsBtn = document.getElementById('btn-missions');
    
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            if (vm.onRedeem) {
                vm.onRedeem();
            } else {
                showAlert('Funcionalidade de resgate em desenvolvimento', 'info');
            }
        });
    }
    
    if (missionsBtn) {
        missionsBtn.addEventListener('click', function() {
            if (vm.onViewMissions) {
                vm.onViewMissions();
            } else {
                showAlert('Funcionalidade de missões em desenvolvimento', 'info');
            }
        });
    }
}

/**
 * Mostra animação de delta
 */
function showDeltaAnimation(delta) {
    const balanceValue = document.getElementById('wallet-balance-value');
    if (!balanceValue) return;
    
    // Adiciona pulse ao valor
    balanceValue.classList.add('balance-pulse');
    setTimeout(() => {
        balanceValue.classList.remove('balance-pulse');
    }, 600);
    
    // Cria elemento flutuante
    const deltaEl = document.createElement('span');
    deltaEl.className = 'delta-float';
    deltaEl.textContent = `+${delta}`;
    
    // Adiciona ao container (precisa ser relative)
    const container = balanceValue.parentElement;
    container.style.position = 'relative';
    container.appendChild(deltaEl);
    
    // Anima
    setTimeout(() => deltaEl.classList.add('show'), 100);
    
    // Remove
    setTimeout(() => {
        if (deltaEl.parentElement) {
            deltaEl.remove();
        }
    }, 600);
}

/**
 * Função de resgate (wallet)
 */
function redeem() {
    console.log('🎁 Executando resgate...');
    showAlert('Funcionalidade de resgate em desenvolvimento', 'info');
}

/**
 * Função para visualizar missões (wallet)
 */
function viewMissions() {
    console.log('🎯 Executando visualização de missões...');
    showAlert('Funcionalidade de missões em desenvolvimento', 'info');
}

// Exporta funções para uso global
window.SwiftEliteRewards = {
    showAlert,
    validateForm,
    processLogin,
    checkIfLoggedIn,
    saveSession,
    clearSession,
    // Funções para dados mock
    getLojaData,
    getUserData,
    getMockTransactions,
    getUserStats,
    getPollingConfig,
    simulateNewTransaction,
    simulateBalanceUpdate,
    // Funções do wallet balance
    initWalletBalance,
    renderWalletBalance,
    // Funções de ações do wallet
    redeem,
    viewMissions,
    // Dados mock expostos
    mockUsers,
    mockLojas,
    dashboardMockData
};