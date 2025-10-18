// chave para identificar os dados salvos pela nossa aplicação no browser
const STORAGE_KEY = "prompts_storage"

// estado para carregar os prompsts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
}

// Seleção dos elementos do DOM
// getElementById() retorna um elemento do documento que possui o ID especificado
const elements = {
  promptTitle: document.getElementById("title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),

  // buttons
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  btnCopy: document.getElementById("btn-copy"),

  // lista
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
}

// Função para atualizar o estado do wrapper editável
// trim () remnove espaços em branco do início e do fim de uma string
// .length retorna o tamanho da string
// console.log() exibe mensagens no console do navegador para depuração
// toggle() adiciona ou remove uma classe com base em uma condição
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  console.log(hasText)
  wrapper.classList.toggle("is-empty", !hasText)
}

// Função para atualizar todos os estados editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Função para configurar os manipuladores de eventos
// addEventListener() conecta uma função a um evento específico em um elemento
// => é a sintaxe de uma função arrow (função de seta) em JavaScript, que é uma forma concisa de escrever funções anônimas
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })

  // Atualiza o estado inicial
  updateAllEditableStates()
}

// Função para gerenciar a visibilidade da sidebar
function toggleSidebar() {
  const app = document.querySelector(".app")
  const isOpen = app.classList.toggle("sidebar-closed")

  // Atualiza a visibilidade dos botões
  elements.btnOpen.style.display = isOpen ? "block" : "none"
  elements.btnCollapse.parentElement.parentElement.style.display = isOpen
    ? "none"
    : "flex"
}

// Adiciona os event listeners dos botões da sidebar
function setupSidebarHandlers() {
  elements.btnOpen.addEventListener("click", toggleSidebar)
  elements.btnCollapse.addEventListener("click", toggleSidebar)
}

// Função para salvar o prompt atual
function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.textContent.trim()
  const hasContent = elements.promptContent.textContent.trim()

  // validação simples para garantir que título e conteúdo não estejam vazios
  if (!title || !hasContent) {
    alert("Título e conteúdo não podem estar vazios.")
    return
  }

  // id: date.now() retorna o número de milissegundos desde 1 de janeiro de 1970 00:00:00 UTC
  // tostring() converte o número para string
  // unshift() adiciona um novo elemento no início do array
  if (state.selectedId) {
    // editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)
    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }

  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

// persist() salva o estado atual dos prompts no localStorage do navegador
// try...catch para capturar erros ao persistir dados
// localStorage.setItem() armazena dados no armazenamento local do navegador
// JSON.stringify() converte um objeto JavaScript em uma string JSON
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.error("Erro ao persistir dados: ", error)
  }
}

// ? if ternário
// se tiver algo em storage, faz o parse, senão retorna um array vazio
// JSON.parse() converte uma string JSON em um objeto JavaScript
function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.error("Erro ao carregar do localStorage: ", error)
  }
}

// adicionar novo prompt
// .focus() define o foco no elemento especificado
function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

// copiar conteúdo selecionado para a área de transferência
// navigator é o objeto global que representa o navegador
// clipboard é a API de área de transferência do navegador
// writeText() escreve o texto fornecido na área de transferência
function copySelected() {
  try {
    const content = elements.promptContent.textContent.trim()
    navigator.clipboard.writeText(content)
    alert("Conteúdo copiado para a área de transferência!")
  } catch (error) {
    console.error("Erro ao copiar para a área de transferência: ", error)
  }
}

// eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

// evento de input no campo de busca
// event.target.value obtém o valor atual do campo de entrada
elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})
elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest('button[data-action="remove"]')
  const item = event.target.closest("li[data-id]")

  // getAttribute() retorna o valor de um atributo especificado em um elemento
  if (!item) return
  const id = item.getAttribute("data-id")
  state.selectedId = id

  // remover prompt
  // renderList() atualiza a lista de prompts exibida
  // elements.search.value obtém o valor atual do campo de busca
  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  // selecionar prompt
  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// função para criar um item de prompt na lista
// data-id é um atributo personalizado usado para armazenar o ID do prompt
// data-action é um atributo personalizado usado para identificar a ação a ser executada
function createPromptListItem(prompt) {
  return `
          <li class="prompt-item" data-id="${prompt.id}">
              <div data-action="select">
                <h2 class="prompt-item-title">${prompt.title}</h2>
                <p class="prompt-item-description">
                  ${prompt.content}
                </p>
              </div>
              <button class="btn-icon" title="Remover" data-action="remove">
                <img
                  src="assets/assets/remove.svg"
                  alt="Remover"
                  class="icon icon-trash"
                />
              </button>
           </li>
         `
}

// função para renderizar a lista de prompts
// filteredPrompts armazena os prompts filtrados com base no texto de filtro fornecido
// filter() cria um novo array com todos os elementos que passam no teste implementado pela função fornecida
// toLowerCase() converte uma string para letras minúsculas
// includes() verifica se uma string contém outra string
// map() cria um novo array com os resultados da chamada de uma função para cada elemento do array
// join() junta todos os elementos de um array em uma string
function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptListItem(p))
    .join("")
  elements.list.innerHTML = filteredPrompts
}

// função de inicialização
function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()

  // evento inicial: sidebar aberta, botão de abrir oculto
  elements.sidebar.style.display = ""
  elements.btnOpen.style.display = "none"

  // eventos para abrir e fechar a sidebar
  // usa o helper que já adiciona os event listeners corretamente
  setupSidebarHandlers()
}

init()

// DOM é um modelo de texto editável, esta é a implementação básica para gerenciar o estado "is-empty" dos wrappers editáveis com base no conteúdo dos elementos editáveis.

// recadinho pra sempre se lembrar do seu poder e capacidade de realizar tudo o que desejar!
console.log("Arrasou muito diva!🎉")
