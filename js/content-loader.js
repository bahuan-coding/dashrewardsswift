/**
 * Content Loader - Swift Elite Rewards
 * Carrega e aplica conteúdo textual do arquivo YAML
 * 
 * Este script permite que o conteúdo textual seja gerenciado externamente
 * através de um arquivo YAML, facilitando a manutenção e reutilização.
 */

class ContentLoader {
    constructor() {
        this.content = null;
        this.isLoaded = false;
    }

    /**
     * Carrega o conteúdo do arquivo YAML
     * @returns {Promise<Object>} Conteúdo carregado
     */
    async loadContent() {
        if (this.isLoaded && this.content) {
            return this.content;
        }

        try {
            // Tenta múltiplos caminhos para encontrar o arquivo YAML
            const possiblePaths = [
                'content.yaml',
                './content.yaml',
                '/content.yaml',
                `${window.location.origin}/content.yaml`
            ];
            
            console.log('🔍 Tentando carregar content.yaml...');
            console.log('📍 URL atual:', window.location.href);
            console.log('🗂️ Caminhos a testar:', possiblePaths);
            
            let response = null;
            let successPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`🔄 Testando caminho: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        successPath = path;
                        console.log(`✅ Arquivo encontrado em: ${path}`);
                        break;
                    } else {
                        console.log(`❌ Falha em ${path}: ${response.status} ${response.statusText}`);
                    }
                } catch (fetchError) {
                    console.log(`❌ Erro de fetch em ${path}:`, fetchError.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Arquivo content.yaml não encontrado em nenhum dos caminhos testados: ${possiblePaths.join(', ')}`);
            }
            
            const yamlText = await response.text();
            console.log('📄 Conteúdo YAML carregado, tamanho:', yamlText.length, 'caracteres');
            
            this.content = this.parseYAML(yamlText);
            this.isLoaded = true;
            
            console.log('✅ Conteúdo YAML parseado com sucesso');
            console.log('📊 Seções encontradas:', Object.keys(this.content));
            return this.content;
        } catch (error) {
            console.error('❌ Erro ao carregar conteúdo YAML:', error);
            console.error('🔧 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                url: window.location.href
            });
            throw new Error('Arquivo content.yaml não encontrado ou inválido. Verifique se o arquivo existe e está acessível.');
        }
    }

    /**
     * Parser robusto de YAML para objetos JavaScript
     * @param {string} yamlText - Texto YAML
     * @returns {Object} Objeto JavaScript
     */
    parseYAML(yamlText) {
        try {
            const lines = yamlText.split('\n');
            const result = {};
            
            // Primeiro, faz um parse básico
            const basicResult = this.parseYAMLBasic(lines);
            
            // Depois, processa listas especiais (como as opções de loja)
            const processedResult = this.processSpecialLists(lines, basicResult);
            
            console.log('✅ YAML parseado com sucesso');
            console.log('📊 Estrutura final:', Object.keys(processedResult));
            
            return processedResult;
        } catch (error) {
            console.error('❌ Erro ao fazer parse do YAML:', error);
            throw new Error('Erro ao processar arquivo YAML: ' + error.message);
        }
    }

    /**
     * Parse básico do YAML
     */
    parseYAMLBasic(lines) {
        const result = {};
        const stack = [result];
        const indentStack = [0];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Pula linhas vazias, comentários e listas (processadas separadamente)
            if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('-')) {
                continue;
            }

            const indent = line.search(/\S/);
            const trimmedLine = line.trim();
            
            // Verifica se é um par chave-valor
            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex === -1) continue;
            
            const key = trimmedLine.substring(0, colonIndex).trim();
            const value = trimmedLine.substring(colonIndex + 1).trim();
            
            // Ajusta o stack baseado na indentação
            while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
                indentStack.pop();
                stack.pop();
            }
            
            const currentObj = stack[stack.length - 1];
            
            if (value === '') {
                // É um objeto
                currentObj[key] = {};
                stack.push(currentObj[key]);
                indentStack.push(indent);
            } else {
                // É um valor
                const cleanValue = value.replace(/^["']|["']$/g, '');
                currentObj[key] = cleanValue;
            }
        }

        return result;
    }

    /**
     * Processa listas especiais do YAML
     */
    processSpecialLists(lines, result) {
        console.log('🔄 Processando listas especiais do YAML...');
        
        const processedPaths = new Set(); // Para evitar processar a mesma lista múltiplas vezes
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Procura por linhas que iniciam listas
            if (trimmedLine.startsWith('-')) {
                const indent = line.search(/\S/);
                
                // Encontra o contexto da lista (qual propriedade ela pertence)
                let contextPath = this.findListContext(lines, i, indent);
                
                if (contextPath && !processedPaths.has(contextPath)) {
                    console.log(`📋 Processando lista em: ${contextPath}`);
                    const listItems = this.extractListItems(lines, i, indent);
                    
                    if (listItems.length > 0) {
                        this.setNestedProperty(result, contextPath, listItems);
                        console.log(`✅ Lista aplicada: ${contextPath} (${listItems.length} itens)`);
                        processedPaths.add(contextPath); // Marca como processado
                        
                        // Pula para o final desta lista para evitar reprocessamento
                        while (i < lines.length - 1) {
                            const nextLine = lines[i + 1];
                            const nextIndent = nextLine.search(/\S/);
                            if (nextIndent <= indent && nextLine.trim() && !nextLine.trim().startsWith('#')) {
                                break;
                            }
                            i++;
                        }
                    }
                } else if (contextPath) {
                    console.log(`⏭️ Lista já processada: ${contextPath}`);
                } else {
                    console.warn(`⚠️ Contexto não encontrado para lista na linha ${i + 1}: ${trimmedLine}`);
                }
            }
        }
        
        console.log('✅ Processamento de listas concluído');
        return result;
    }

     /**
      * Encontra o contexto de uma lista (a qual propriedade ela pertence)
      */
     findListContext(lines, startIndex, listIndent) {
         const path = [];
         let currentIndent = listIndent;
         
         // Volta nas linhas para encontrar as propriedades pai
         for (let i = startIndex - 1; i >= 0; i--) {
             const line = lines[i];
             if (!line.trim() || line.trim().startsWith('#')) continue;
             
             const indent = line.search(/\S/);
             const trimmedLine = line.trim();
             
             if (indent < currentIndent && trimmedLine.includes(':')) {
                 const key = trimmedLine.split(':')[0].trim();
                 path.unshift(key);
                 
                 // Continue procurando propriedades pai
                 currentIndent = indent;
             }
         }
         
         const contextPath = path.length > 0 ? path.join('.') : null;
         console.log('🔍 Contexto da lista encontrado:', contextPath, 'para indentação:', listIndent);
         return contextPath;
     }

     /**
      * Extrai itens de uma lista YAML
      */
     extractListItems(lines, startIndex, baseIndent) {
         const items = [];
         let currentItem = null;
         
         for (let i = startIndex; i < lines.length; i++) {
             const line = lines[i];
             const trimmedLine = line.trim();
             
             if (!trimmedLine || trimmedLine.startsWith('#')) continue;
             
             const indent = line.search(/\S/);
             
             // Se a indentação voltou ao nível anterior, saímos da lista
             if (indent < baseIndent) break;
             
             if (trimmedLine.startsWith('-')) {
                 // Novo item da lista
                 if (currentItem) {
                     items.push(currentItem);
                 }
                 
                 const content = trimmedLine.substring(1).trim();
                 if (content.includes(':')) {
                     // Item com propriedades
                     currentItem = {};
                     const keyValue = content.split(':');
                     const key = keyValue[0].trim();
                     const value = keyValue.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
                     currentItem[key] = value;
                 } else {
                     // Item simples
                     currentItem = content.replace(/^["']|["']$/g, '');
                 }
             } else if (currentItem && typeof currentItem === 'object' && indent > baseIndent) {
                 // Propriedade adicional do item atual
                 if (trimmedLine.includes(':')) {
                     const keyValue = trimmedLine.split(':');
                     const key = keyValue[0].trim();
                     const value = keyValue.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
                     currentItem[key] = value;
                 }
             }
         }
         
         // Adiciona o último item
         if (currentItem) {
             items.push(currentItem);
         }
         
         console.log('📋 Lista extraída:', items);
         return items;
     }

    /**
     * Define uma propriedade aninhada usando notação de ponto
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
    }



    /**
     * Aplica o conteúdo carregado aos elementos da página
     */
    async applyContent() {
        if (!this.isLoaded) {
            await this.loadContent();
        }

        // Aplica conteúdo usando data attributes
        this.applyContentToElements();
        
        // Aplica conteúdo específico do formulário
        this.applyFormContent();
        
        console.log('✅ Todo o conteúdo YAML aplicado com sucesso');
    }

    /**
     * Aplica conteúdo aos elementos com data-content
     */
    applyContentToElements() {
        console.log('🔄 Aplicando conteúdo YAML aos elementos...');
        
        // Aplica título da página
        const titleElement = document.querySelector('title[data-content]');
        if (titleElement) {
            const content = this.getContentByPath(titleElement.getAttribute('data-content'));
            if (content) {
                document.title = content;
                console.log('📄 Título da página aplicado:', content);
            }
        }

        // Aplica meta description
        const metaDesc = document.querySelector('meta[name="description"][data-content]');
        if (metaDesc) {
            const content = this.getContentByPath(metaDesc.getAttribute('data-content'));
            if (content) {
                metaDesc.setAttribute('content', content);
                console.log('📝 Meta description aplicada:', content);
            }
        }

        // Aplica conteúdo a todos os elementos com data-content
        const contentElements = document.querySelectorAll('[data-content]');
        console.log(`📋 Encontrados ${contentElements.length} elementos com data-content`);
        
        contentElements.forEach(element => {
            const contentPath = element.getAttribute('data-content');
            const content = this.getContentByPath(contentPath);
            if (content) {
                element.textContent = content;
                console.log(`✅ Aplicado: ${contentPath} = "${content}"`);
            } else {
                console.warn(`⚠️ Conteúdo não encontrado para: ${contentPath}`);
            }
        });

        // Aplica placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder]');
        console.log(`📝 Encontrados ${placeholderElements.length} elementos com data-placeholder`);
        
        placeholderElements.forEach(element => {
            const contentPath = element.getAttribute('data-placeholder');
            const content = this.getContentByPath(contentPath);
            if (content) {
                element.setAttribute('placeholder', content);
                console.log(`✅ Placeholder aplicado: ${contentPath} = "${content}"`);
            }
        });

        // Aplica opções de select
        const selectElements = document.querySelectorAll('[data-options]');
        console.log(`📋 Encontrados ${selectElements.length} elementos select com data-options`);
        
        selectElements.forEach(element => {
            const contentPath = element.getAttribute('data-options');
            const options = this.getContentByPath(contentPath);
            console.log(`🔍 Buscando opções em: ${contentPath}`);
            console.log(`📄 Opções encontradas:`, options);
            
            if (options && Array.isArray(options)) {
                this.populateSelectOptions(element, options);
                console.log(`✅ Opções aplicadas ao select: ${contentPath} (${options.length} opções)`);
            } else {
                console.warn(`⚠️ Opções não encontradas para: ${contentPath}`, {
                    path: contentPath,
                    found: options,
                    type: typeof options,
                    isArray: Array.isArray(options)
                });
                
                // Debug: mostra toda a estrutura disponível
                console.log('🔧 Estrutura YAML disponível:', this.content);
            }
        });

        // Aplica tooltips
        const tooltipElements = document.querySelectorAll('[data-title]');
        console.log(`💬 Encontrados ${tooltipElements.length} elementos com data-title (tooltips)`);
        
        tooltipElements.forEach(element => {
            const contentPath = element.getAttribute('data-title');
            const content = this.getContentByPath(contentPath);
            if (content) {
                element.setAttribute('title', content);
                console.log(`✅ Tooltip aplicado: ${contentPath} = "${content}"`);
            }
        });

        // Aplica aria-labels
        const ariaLabelElements = document.querySelectorAll('[data-aria-label]');
        console.log(`🔊 Encontrados ${ariaLabelElements.length} elementos com data-aria-label`);
        
        ariaLabelElements.forEach(element => {
            const contentPath = element.getAttribute('data-aria-label');
            const content = this.getContentByPath(contentPath);
            if (content) {
                // Para aria-label de slides do carousel, adiciona o número do slide
                if (contentPath.includes('slide_label_prefix')) {
                    const slideNumber = element.getAttribute('data-bs-slide-to');
                    const ariaLabel = `${content} ${parseInt(slideNumber) + 1}`;
                    element.setAttribute('aria-label', ariaLabel);
                    console.log(`✅ Aria-label aplicado: ${contentPath} = "${ariaLabel}"`);
                } else {
                    element.setAttribute('aria-label', content);
                    console.log(`✅ Aria-label aplicado: ${contentPath} = "${content}"`);
                }
            }
        });
    }

    /**
     * Obtém conteúdo por caminho (ex: 'login.branding.title')
     * @param {string} path - Caminho para o conteúdo
     * @returns {any} Conteúdo encontrado
     */
    getContentByPath(path) {
        if (!this.content || !path) return null;

        const keys = path.split('.');
        let current = this.content;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }

        return current;
    }

    /**
     * Aplica conteúdo do formulário
     */
    applyFormContent() {
        // Esta função agora é chamada automaticamente pelo applyContentToElements()
        // Mantida para compatibilidade com código existente
    }

    /**
     * Aplica conteúdo dos campos do formulário
     * @param {Object} fields - Campos do formulário
     */
    applyFormFields(fields) {
        if (!fields) return;

        // Campo Email
        if (fields.email) {
            const emailLabel = document.querySelector('label[for="emailInput"]');
            if (emailLabel && fields.email.label) {
                emailLabel.innerHTML = `<i class="${fields.email.icon} me-2"></i>${fields.email.label}`;
            }

            const emailInput = document.getElementById('emailInput');
            if (emailInput && fields.email.placeholder) {
                emailInput.placeholder = fields.email.placeholder;
            }
        }

        // Campo Loja
        if (fields.store) {
            const storeLabel = document.querySelector('label[for="lojaSelect"]');
            if (storeLabel && fields.store.label) {
                storeLabel.innerHTML = `<i class="${fields.store.icon} me-2"></i>${fields.store.label}`;
            }

            const storeSelect = document.getElementById('lojaSelect');
            if (storeSelect) {
                // Aplica placeholder
                const firstOption = storeSelect.querySelector('option[value=""]');
                if (firstOption && fields.store.placeholder) {
                    firstOption.textContent = fields.store.placeholder;
                }

                // Aplica opções se disponíveis
                if (fields.store.options && Array.isArray(fields.store.options)) {
                    this.populateStoreOptions(storeSelect, fields.store.options);
                }
            }
        }
    }

    /**
     * Popula as opções do select
     * @param {HTMLSelectElement} select - Elemento select
     * @param {Array} options - Array de opções
     */
    populateSelectOptions(select, options) {
        console.log('🔧 Populando select com opções:', options);
        
        // Preserva a opção placeholder original
        const firstOption = select.querySelector('option[value=""]');
        const placeholderText = firstOption ? firstOption.textContent : 'Selecione uma opção';
        
        // Limpa todas as opções
        select.innerHTML = '';
        
        // Recria a opção placeholder
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholderText;
        select.appendChild(placeholderOption);

        // Adiciona novas opções
        options.forEach((option, index) => {
            console.log(`📝 Processando opção ${index}:`, option);
            
            const optionElement = document.createElement('option');
            
            // Suporta diferentes formatos de opção
            if (typeof option === 'object' && option !== null) {
                if (option.value && option.text) {
                    // Formato: {value: "...", text: "..."}
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                } else {
                    // Formato alternativo: pega a primeira propriedade como value e segunda como text
                    const keys = Object.keys(option);
                    if (keys.length >= 2) {
                        optionElement.value = option[keys[0]];
                        optionElement.textContent = option[keys[1]];
                    } else if (keys.length === 1) {
                        optionElement.value = keys[0];
                        optionElement.textContent = option[keys[0]];
                    }
                }
            } else if (typeof option === 'string') {
                // Formato simples: string
                optionElement.value = option;
                optionElement.textContent = option;
            }
            
            if (optionElement.value) {
                select.appendChild(optionElement);
                console.log(`✅ Opção adicionada: ${optionElement.value} = "${optionElement.textContent}"`);
            } else {
                console.warn(`⚠️ Opção ignorada (formato inválido):`, option);
            }
        });
        
        console.log(`🎉 Select populado com ${options.length} opções`);
    }

    /**
     * Aplica conteúdo do botão
     * @param {Object} button - Configurações do botão
     */
    applyButtonContent(button) {
        if (!button) return;

        const buttonText = document.querySelector('.btn-text');
        if (buttonText && button.text) {
            buttonText.textContent = button.text;
        }
    }

    /**
     * Obtém uma mensagem específica
     * @param {string} path - Caminho para a mensagem (ex: 'messages.validation.email_required')
     * @returns {string} Mensagem
     */
    getMessage(path) {
        if (!this.content) return '';

        const keys = path.split('.');
        let current = this.content;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return '';
            }
        }

        return typeof current === 'string' ? current : '';
    }

    /**
     * Obtém dados mock
     * @returns {Object} Dados mock
     */
    getMockData() {
        return this.content?.mock_data || {};
    }

    /**
     * Obtém configurações
     * @returns {Object} Configurações
     */
    getConfig() {
        return this.content?.config || {};
    }
}

// Instância global do ContentLoader
window.contentLoader = new ContentLoader();

// Auto-aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.contentLoader.applyContent();
        console.log('✅ Conteúdo YAML aplicado com sucesso');
        
        // Remove qualquer erro anterior se o carregamento foi bem-sucedido
        const existingError = document.querySelector('.yaml-error-banner');
        if (existingError) {
            existingError.remove();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar conteúdo YAML:', error);
        console.warn('⚠️ Usando conteúdo de fallback dos elementos HTML');
        
        // Só exibe erro se não houver conteúdo de fallback
        const hasContent = document.querySelector('[data-content]')?.textContent?.trim();
        
        if (!hasContent) {
            // Exibe erro na página para o usuário
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger position-fixed top-0 start-0 w-100 m-0 rounded-0 yaml-error-banner';
            errorDiv.style.zIndex = '9999';
            errorDiv.innerHTML = `
                <div class="container">
                    <strong>Erro de Configuração:</strong> Arquivo content.yaml não encontrado. 
                    Verifique se o arquivo existe e está acessível.
                    <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;
            document.body.insertBefore(errorDiv, document.body.firstChild);
        } else {
            // Só mostra um aviso discreto no console
            console.warn('🔄 Aplicação funcionando com conteúdo de fallback');
        }
    }
});

// Exporta para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
}
