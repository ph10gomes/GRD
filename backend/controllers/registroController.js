const Registro = require("../models/registroModel");

const CAMPOS_OBRIGATORIOS = [
  "data_reuniao",
  "dia_reuniao",
  "data_analisada",
  "dia_analisado",
  "uo",
  "processo",
  "participante",
  "funcao"
];

async function salvar(req, res) {
  try {
    const camposFaltantes = CAMPOS_OBRIGATORIOS.filter((campo) => {
      const valor = req.body?.[campo];
      return valor === undefined || valor === null || String(valor).trim() === "";
    });

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Campos obrigatorios ausentes: ${camposFaltantes.join(", ")}`
      });
    }

    const result = await Registro.criarRegistro(req.body);

    res.status(201).json({
      sucesso: true,
      mensagem: "Registro salvo com sucesso",
      id: result.insertId
    });
  } catch (erro) {
    console.error("Erro ao salvar registro:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao salvar registro"
    });
  }
}

async function listar(req, res) {
  try {
    const filtros = {
      dia_analisado: req.query.dia_analisado || "",
      processo: req.query.processo || "",
      uo: req.query.uo || "",
      participante: req.query.participante || ""
    };

    const registros = await Registro.listarRegistros(filtros);
    res.json(registros);
  } catch (erro) {
    console.error("Erro ao listar registros:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar registros"
    });
  }
}

async function buscar(req, res) {
  try {
    const registro = await Registro.buscarPorId(req.params.id);

    if (!registro) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Registro nao encontrado"
      });
    }

    res.json(registro);
  } catch (erro) {
    console.error("Erro ao buscar registro:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar registro"
    });
  }
}

module.exports = {
  salvar,
  listar,
  buscar
};
