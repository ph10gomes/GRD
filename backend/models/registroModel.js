const db = require("../config/db");

async function criarRegistro(dados) {
  const colunas = [
    "data_reuniao",
    "dia_reuniao",
    "data_analisada",
    "dia_analisado",
    "uo",
    "processo",
    "participante",
    "funcao",

    "us_programada_wm",
    "us_realizada_wm",
    "desvio_wm",
    "us_programada_lt",
    "us_realizada_lt",
    "desvio_lt",
    "complemento_lancado",
    "mf_us_dia",
    "mt_us_dia",
    "equipes_d_moto",
    "equipes_d_equipe",

    "equipe_orcada_d1",
    "equipe_total_d1",
    "equipe_programada_d1",
    "equipe_efetiva_d1",

    "plataforma_qtd_eqp",
    "plataforma_hora_liberada",
    "almoxarifado_qtd_eqp",
    "almoxarifado_hora_liberacao",
    "absenteismo_atestado_qtd",
    "previsao_retorno_atestado_d1",
    "absenteismo_falta_qtd",
    "motivo_falta_d1",
    "oficina_qtd_d1",
    "oficina_hora_liberacao_d1",
    "motivo_perda_1",
    "motivo_perda_2",
    "motivo_perda_3",
    "motivo_perda_4",
    "motivo_perda_5",

    "equipe_programada_hoje",
    "equipe_prevista_hoje",
    "atestado_qtd_hoje",
    "atestado_previsao_retorno_hoje",
    "falta_hoje",
    "motivo_falta_hoje",
    "oficina_qtd_hoje",
    "oficina_previsao_liberacao_hoje",
    "treinamento_qtd_hoje",
    "treinamento_finalidade_hoje",
    "foco_prioridade_1",
    "foco_prioridade_2",
    "foco_prioridade_3",
    "foco_prioridade_4",
    "foco_prioridade_5"
  ];

  const valores = [
    dados.data_reuniao,
    dados.dia_reuniao,
    dados.data_analisada,
    dados.dia_analisado,
    dados.uo,
    dados.processo,
    dados.participante,
    dados.funcao,

    dados.us_programada_wm || null,
    dados.us_realizada_wm || null,
    dados.desvio_wm || null,
    dados.us_programada_lt || null,
    dados.us_realizada_lt || null,
    dados.desvio_lt || null,
    dados.complemento_lancado || null,
    dados.mf_us_dia || null,
    dados.mt_us_dia || null,
    dados.equipes_d_moto || null,
    dados.equipes_d_equipe || null,

    dados.equipe_orcada_d1 || null,
    dados.equipe_total_d1 || null,
    dados.equipe_programada_d1 || null,
    dados.equipe_efetiva_d1 || null,

    dados.plataforma_qtd_eqp || null,
    dados.plataforma_hora_liberada || null,
    dados.almoxarifado_qtd_eqp || null,
    dados.almoxarifado_hora_liberacao || null,
    dados.absenteismo_atestado_qtd || null,
    dados.previsao_retorno_atestado_d1 || null,
    dados.absenteismo_falta_qtd || null,
    dados.motivo_falta_d1 || null,
    dados.oficina_qtd_d1 || null,
    dados.oficina_hora_liberacao_d1 || null,
    dados.motivo_perda_1 || null,
    dados.motivo_perda_2 || null,
    dados.motivo_perda_3 || null,
    dados.motivo_perda_4 || null,
    dados.motivo_perda_5 || null,

    dados.equipe_programada_hoje || null,
    dados.equipe_prevista_hoje || null,
    dados.atestado_qtd_hoje || null,
    dados.atestado_previsao_retorno_hoje || null,
    dados.falta_hoje || null,
    dados.motivo_falta_hoje || null,
    dados.oficina_qtd_hoje || null,
    dados.oficina_previsao_liberacao_hoje || null,
    dados.treinamento_qtd_hoje || null,
    dados.treinamento_finalidade_hoje || null,
    dados.foco_prioridade_1 || null,
    dados.foco_prioridade_2 || null,
    dados.foco_prioridade_3 || null,
    dados.foco_prioridade_4 || null,
    dados.foco_prioridade_5 || null
  ];

  const placeholders = colunas.map(() => "?").join(", ");

  const sql = `
    INSERT INTO registros (
      ${colunas.join(", ")}
    ) VALUES (${placeholders})
  `;

  const [result] = await db.execute(sql, valores);
  return result;
}

async function listarRegistros(filtros = {}) {
  let sql = `
    SELECT
      id,
      data_reuniao,
      dia_reuniao,
      data_analisada,
      dia_analisado,
      uo,
      processo,
      participante,
      created_at
    FROM registros
    WHERE 1=1
  `;

  const params = [];

  if (filtros.dia_analisado) {
    sql += ` AND dia_analisado = ?`;
    params.push(filtros.dia_analisado);
  }

  if (filtros.processo) {
    sql += ` AND processo LIKE ?`;
    params.push(`%${filtros.processo}%`);
  }

  sql += ` ORDER BY data_reuniao DESC, id DESC`;

  const [rows] = await db.execute(sql, params);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.execute(
    `SELECT * FROM registros WHERE id = ?`,
    [id]
  );
  return rows[0];
}

module.exports = {
  criarRegistro,
  listarRegistros,
  buscarPorId
};