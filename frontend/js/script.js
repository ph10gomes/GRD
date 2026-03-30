const API_URL = "/api/registros";
const AUTH_URL = "/api/auth";
const TOKEN_KEY = "grd_auth_token";
const USER_KEY = "grd_auth_user";

const COLUNAS_TABELA = 9;
let usuarioAtual = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const btnFiltrar = document.getElementById("btnFiltrar");
  const btnLogout = document.getElementById("btnLogout");

  if (form) {
    form.addEventListener("submit", salvarRegistro);
    form.addEventListener("reset", () => {
      window.setTimeout(configurarDiasAutomaticos, 0);
      window.setTimeout(atualizarDesviosCalculados, 0);
    });
  }

  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", carregarRegistros);
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", encerrarSessao);
  }

  configurarModalRegistros();
  configurarDiasAutomaticos();
  configurarCalculoDesvios();
  inicializarAplicacao();
});

async function inicializarAplicacao() {
  try {
    usuarioAtual = await validarSessao();
    atualizarInterfaceUsuario();
    carregarRegistros();
  } catch (erro) {
    console.error("Sessao nao validada:", erro);
    encerrarSessao(false);
  }
}

async function salvarRegistro(event) {
  event.preventDefault();

  if (usuarioAtual?.role !== "admin") {
    alert("Somente administradores podem salvar registros.");
    return;
  }

  const form = event.target;
  const formData = new FormData(form);
  const dados = Object.fromEntries(formData.entries());

  normalizarCamposNumericos(dados);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...obterHeadersAuth()
      },
      body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensagem || "Erro ao salvar registro");
    }

    alert("Registro salvo com sucesso.");
    form.reset();
    carregarRegistros();
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert(erro.message || "Erro ao salvar registro.");
  }
}

async function carregarRegistros() {
  const tabela = document.getElementById("tabelaRegistros");
  if (!tabela) return;

  const filtroDia = document.getElementById("filtroDia")?.value?.trim() || "";
  const filtroProcesso = document.getElementById("filtroProcesso")?.value?.trim() || "";
  const filtroUO = document.getElementById("filtroUO")?.value?.trim() || "";
  const filtroParticipante = document.getElementById("filtroParticipante")?.value?.trim() || "";

  const params = new URLSearchParams();

  if (filtroDia) params.append("dia_analisado", filtroDia);
  if (filtroProcesso) params.append("processo", filtroProcesso);
  if (filtroUO) params.append("uo", filtroUO);
  if (filtroParticipante) params.append("participante", filtroParticipante);

  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;

  try {
    const response = await fetch(url, {
      headers: obterHeadersAuth()
    });
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.mensagem || "Erro ao carregar registros");
    }

    tabela.innerHTML = "";

    if (!Array.isArray(dados) || dados.length === 0) {
      renderizarMensagemTabela(tabela, "Nenhum registro encontrado.");
      return;
    }

    dados.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id ?? ""}</td>
        <td>${formatarData(item.data_reuniao)}</td>
        <td>${escapeHtml(item.dia_reuniao)}</td>
        <td>${formatarData(item.data_analisada)}</td>
        <td>${escapeHtml(item.dia_analisado)}</td>
        <td>${escapeHtml(item.uo)}</td>
        <td>${escapeHtml(item.processo)}</td>
        <td>${escapeHtml(item.participante)}</td>
        <td><button type="button" data-id="${item.id}">Abrir</button></td>
      `;

      tr.querySelector("button")?.addEventListener("click", () => abrirRegistro(item.id));
      tabela.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar registros:", erro);
    renderizarMensagemTabela(tabela, "Erro ao carregar registros.");
  }
}

function renderizarMensagemTabela(tabela, mensagem) {
  tabela.innerHTML = `
    <tr>
      <td colspan="${COLUNAS_TABELA}" style="text-align:center;">${escapeHtml(mensagem)}</td>
    </tr>
  `;
}

function configurarModalRegistros() {
  const btnAbrir = document.getElementById("btnAbrirRegistros");
  const btnFechar = document.getElementById("btnFecharRegistros");
  const modal = document.getElementById("modalRegistros");

  btnAbrir?.addEventListener("click", abrirModalRegistros);
  btnFechar?.addEventListener("click", fecharModalRegistros);

  modal?.addEventListener("click", (event) => {
    const alvo = event.target;
    if (alvo instanceof HTMLElement && alvo.dataset.closeModal === "true") {
      fecharModalRegistros();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharModalRegistros();
    }
  });
}

function abrirModalRegistros() {
  const modal = document.getElementById("modalRegistros");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  carregarRegistros();
}

function fecharModalRegistros() {
  const modal = document.getElementById("modalRegistros");
  if (!modal || modal.classList.contains("hidden")) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function configurarCalculoDesvios() {
  configurarCalculoDesvio("us_programada_wm", "us_realizada_wm", "desvio_wm");
  configurarCalculoDesvio("us_programada_lt", "us_realizada_lt", "desvio_lt");
}

function configurarDiasAutomaticos() {
  configurarDiaAutomatico("data_analisada", "dia_analisado");
  configurarDiaAutomatico("data_reuniao", "dia_reuniao");
}

function configurarDiaAutomatico(idData, idDia) {
  const inputData = document.getElementById(idData);
  const inputDia = document.getElementById(idDia);

  if (!inputData || !inputDia) return;

  const atualizar = () => {
    inputDia.value = obterDiaDaSemana(inputData.value);
  };

  if (!inputData.dataset.weekdayBound) {
    inputData.addEventListener("input", atualizar);
    inputData.addEventListener("change", atualizar);
    inputData.dataset.weekdayBound = "true";
  }

  atualizar();
}

function atualizarDesviosCalculados() {
  atualizarDesvioCalculado("us_programada_wm", "us_realizada_wm", "desvio_wm");
  atualizarDesvioCalculado("us_programada_lt", "us_realizada_lt", "desvio_lt");
}

function configurarCalculoDesvio(idProgramada, idRealizada, idDesvio) {
  const inputProgramada = document.getElementById(idProgramada);
  const inputRealizada = document.getElementById(idRealizada);
  const inputDesvio = document.getElementById(idDesvio);

  if (!inputProgramada || !inputRealizada || !inputDesvio) return;

  const recalcular = () => calcularDesvio(inputProgramada, inputRealizada, inputDesvio);

  inputProgramada.addEventListener("input", recalcular);
  inputRealizada.addEventListener("input", recalcular);
  recalcular();
}

function calcularDesvio(inputProgramada, inputRealizada, inputDesvio) {
  const valorProgramada = converterParaNumero(inputProgramada.value);
  const valorRealizada = converterParaNumero(inputRealizada.value);

  inputDesvio.classList.remove("desvio-positivo", "desvio-negativo", "desvio-neutro");

  if (valorProgramada === null || valorRealizada === null) {
    inputDesvio.value = "";
    return;
  }

  const desvio = Number((valorRealizada - valorProgramada).toFixed(2));
  inputDesvio.value = desvio.toFixed(2);

  if (desvio > 0) {
    inputDesvio.classList.add("desvio-positivo");
    return;
  }

  if (desvio < 0) {
    inputDesvio.classList.add("desvio-negativo");
    return;
  }

  inputDesvio.classList.add("desvio-neutro");
}

function atualizarDesvioCalculado(idProgramada, idRealizada, idDesvio) {
  const inputProgramada = document.getElementById(idProgramada);
  const inputRealizada = document.getElementById(idRealizada);
  const inputDesvio = document.getElementById(idDesvio);

  if (!inputProgramada || !inputRealizada || !inputDesvio) return;
  calcularDesvio(inputProgramada, inputRealizada, inputDesvio);
}

function converterParaNumero(valor) {
  const texto = String(valor ?? "").trim().replace(",", ".");
  if (texto === "") return null;

  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

function obterDiaDaSemana(data) {
  if (!data) return "";

  const dias = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERCA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SABADO"
  ];

  const referencia = new Date(`${data}T00:00:00`);
  if (Number.isNaN(referencia.getTime())) return "";

  return dias[referencia.getDay()] || "";
}

function abrirRegistro(id) {
  if (!id) return;
  window.open(`/app/mascara.html?id=${encodeURIComponent(id)}`, "_blank", "noopener");
}

function formatarData(data) {
  if (!data) return "";

  const valor = typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data)
    ? `${data}T00:00:00`
    : data;

  const d = new Date(valor);

  if (Number.isNaN(d.getTime())) {
    return data;
  }

  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function escapeHtml(valor) {
  if (valor === null || valor === undefined) return "";

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarCamposNumericos(dados) {
  const camposNumericos = [
    "us_programada_wm",
    "us_realizada_wm",
    "desvio_wm",
    "us_programada_lt",
    "us_realizada_lt",
    "desvio_lt",
    "mf_us_dia",
    "mt_us_dia",
    "equipes_d_moto",
    "equipes_d_equipe",
    "equipe_orcada_d1",
    "equipe_total_d1",
    "equipe_programada_d1",
    "equipe_efetiva_d1",
    "plataforma_qtd_eqp",
    "almoxarifado_qtd_eqp",
    "absenteismo_atestado_qtd",
    "absenteismo_falta_qtd",
    "oficina_qtd_d1",
    "equipe_programada_hoje",
    "equipe_prevista_hoje",
    "atestado_qtd_hoje",
    "falta_hoje",
    "oficina_qtd_hoje",
    "treinamento_qtd_hoje"
  ];

  camposNumericos.forEach((campo) => {
    if (!(campo in dados)) return;

    const valor = String(dados[campo]).trim();

    if (valor === "") {
      dados[campo] = null;
      return;
    }

    dados[campo] = valor.replace(",", ".");
  });
}

function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function obterHeadersAuth() {
  const token = obterToken();
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

async function validarSessao() {
  const token = obterToken();

  if (!token) {
    throw new Error("Token ausente");
  }

  const response = await fetch(`${AUTH_URL}/me`, {
    headers: obterHeadersAuth()
  });
  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(resultado.mensagem || "Sessao invalida");
  }

  localStorage.setItem(USER_KEY, JSON.stringify(resultado.usuario));
  return resultado.usuario;
}

function atualizarInterfaceUsuario() {
  const usuarioLogado = document.getElementById("usuarioLogado");
  const statusAcesso = document.getElementById("statusAcesso");
  const botaoSalvar = document.querySelector(".btn-salvar");
  const formulario = document.getElementById("formRegistro");

  if (usuarioLogado) {
    usuarioLogado.textContent = usuarioAtual
      ? `${usuarioAtual.nome} | ${usuarioAtual.role}`
      : "";
  }

  if (statusAcesso) {
    statusAcesso.textContent = usuarioAtual?.role === "admin"
      ? "Sessao autenticada com perfil administrador."
      : "Sessao autenticada. Apenas administradores podem criar registros.";
  }

  if (botaoSalvar) {
    botaoSalvar.disabled = usuarioAtual?.role !== "admin";
  }

  if (formulario && usuarioAtual?.role !== "admin") {
    formulario.querySelectorAll("input, select, textarea, button[type='reset']").forEach((campo) => {
      campo.disabled = true;
    });
  }
}

function encerrarSessao(redirecionar = true) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (redirecionar) {
    window.location.href = "/login";
  }
}
