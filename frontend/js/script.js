const API_URL = "http://localhost:3001/api/registros";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const btnFiltrar = document.getElementById("btnFiltrar");

  if (form) {
    form.addEventListener("submit", salvarRegistro);
  }

  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", carregarRegistros);
  }

  carregarRegistros();
});

async function salvarRegistro(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const dados = Object.fromEntries(formData.entries());

  normalizarCamposNumericos(dados);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensagem || "Erro ao salvar registro");
    }

    alert("Registro salvo com sucesso!");
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

  const params = new URLSearchParams();

  if (filtroDia) {
    params.append("dia_analisado", filtroDia);
  }

  if (filtroProcesso) {
    params.append("processo", filtroProcesso);
  }

  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;

  try {
    const response = await fetch(url);
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.mensagem || "Erro ao carregar registros");
    }

    tabela.innerHTML = "";

    if (!Array.isArray(dados) || dados.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;">Nenhum registro encontrado.</td>
        </tr>
      `;
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
        <td>
          <button type="button" onclick="abrirRegistro(${item.id})">Abrir</button>
        </td>
      `;

      tabela.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar registros:", erro);
    tabela.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">Erro ao carregar registros.</td>
      </tr>
    `;
  }
}

function abrirRegistro(id) {
  window.open(`mascara.html?id=${id}`, "_blank");
}

function formatarData(data) {
  if (!data) return "";

  const d = new Date(data);

  if (isNaN(d.getTime())) {
    return data;
  }

  return d.toLocaleDateString("pt-BR");
}

function escapeHtml(valor) {
  if (valor === null || valor === undefined) return "";

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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