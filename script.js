// ---------- 1. Capturar os elementos do HTML (getElementById) ----------
const formulario = document.getElementById("formulario");
const entrada = document.getElementById("entrada");
const lista = document.getElementById("lista");
const erro = document.getElementById("erro");
const resumo = document.getElementById("resumo");
const barra = document.getElementById("barra");
const vazio = document.getElementById("vazio");
const botaoLimpar = document.getElementById("limpar");
const botoesFiltro = document.querySelectorAll(".filtro");

// ---------- 2. Estado da aplicação ----------
// Cada tarefa é um objeto: { id, texto, concluida }
let tarefas = [];
let filtroAtual = "todas";

// ---------- 3. Salvar e carregar (localStorage) ----------
// Assim as tarefas continuam na tela mesmo depois de fechar o navegador.
function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregar() {
  const guardado = localStorage.getItem("tarefas");
  if (guardado) {
    tarefas = JSON.parse(guardado);
  }
}

// ---------- 4. Desenhar a lista na tela ----------
function mostrarTarefas() {
  lista.innerHTML = ""; // limpa a lista antes de redesenhar

  // Aplica o filtro escolhido
  const visiveis = tarefas.filter(function (tarefa) {
    if (filtroAtual === "pendentes") return !tarefa.concluida;
    if (filtroAtual === "concluidas") return tarefa.concluida;
    return true;
  });

  visiveis.forEach(function (tarefa) {
    // Cria os elementos (createElement)
    const item = document.createElement("li");

    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.checked = tarefa.concluida;
    caixa.setAttribute("aria-label", "Concluir: " + tarefa.texto);

    const texto = document.createElement("span");
    texto.className = "texto";
    texto.textContent = tarefa.texto;

    const remover = document.createElement("button");
    remover.className = "remover";
    remover.textContent = "×";
    remover.setAttribute("aria-label", "Remover: " + tarefa.texto);

    // Estilo de tarefa concluída (classList)
    if (tarefa.concluida) {
      item.classList.add("concluida");
    }

    // Eventos de cada tarefa (addEventListener)
    caixa.addEventListener("change", function () {
      tarefa.concluida = caixa.checked;
      salvar();
      mostrarTarefas();
    });

    remover.addEventListener("click", function () {
      tarefas = tarefas.filter(function (t) {
        return t.id !== tarefa.id;
      });
      salvar();
      mostrarTarefas();
    });

    // Monta o item e coloca na lista (appendChild)
    item.appendChild(caixa);
    item.appendChild(texto);
    item.appendChild(remover);
    lista.appendChild(item);
  });

  atualizarResumo(visiveis.length);
}

// ---------- 5. Contador e barra de progresso ----------
function atualizarResumo(quantidadeVisivel) {
  const total = tarefas.length;
  const feitas = tarefas.filter(function (t) {
    return t.concluida;
  }).length;

  if (total === 0) {
    resumo.textContent = "Nenhuma tarefa ainda.";
    barra.style.width = "0%";
  } else {
    resumo.textContent = feitas + " de " + total + " concluídas";
    barra.style.width = (feitas / total) * 100 + "%";
  }

  // Mensagem de lista vazia
  if (quantidadeVisivel === 0 && total > 0) {
    vazio.textContent = "Nenhuma tarefa neste filtro.";
  } else {
    vazio.textContent =
      "Sua lista está vazia. Digite uma tarefa acima e clique em Adicionar.";
  }
  vazio.style.display = quantidadeVisivel === 0 ? "block" : "none";
}

// ---------- 6. Adicionar tarefa (evento submit) ----------
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // impede a página de recarregar

  const texto = entrada.value.trim();

  // Validação simples
  if (texto === "") {
    erro.textContent = "Digite uma tarefa antes de adicionar.";
    return;
  }

  // Impede tarefas repetidas
  const repetida = tarefas.some(function (t) {
    return t.texto.toLowerCase() === texto.toLowerCase();
  });
  if (repetida) {
    erro.textContent = "Essa tarefa já está na lista.";
    return;
  }

  erro.textContent = "";
  tarefas.push({ id: Date.now(), texto: texto, concluida: false });
  entrada.value = "";
  entrada.focus();
  salvar();
  mostrarTarefas();
});

// ---------- 7. Filtros ----------
botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    filtroAtual = botao.dataset.filtro;

    botoesFiltro.forEach(function (b) {
      b.classList.remove("filtro--ativo");
    });
    botao.classList.add("filtro--ativo");

    mostrarTarefas();
  });
});

// ---------- 8. Remover todas as concluídas ----------
botaoLimpar.addEventListener("click", function () {
  tarefas = tarefas.filter(function (t) {
    return !t.concluida;
  });
  salvar();
  mostrarTarefas();
});

// ---------- 9. Início ----------
carregar();
mostrarTarefas();