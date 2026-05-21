import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas com sucesso!");
  })
  .catch((erro) => {
    console.error("Erro ao conectar ao banco de dados:", erro);
  });

// ==========================================
// MODELO DE DADOS DO BANCO
// ==========================================

const jogoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
  nota: { type: Number, required: true },
  review: { type: String, required: true }
}, { versionKey: false });

jogoSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
  }
});

const Jogo = mongoose.model('Jogo', jogoSchema);

// ==========================================
// ROTAS DA API
// ==========================================

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === "usuario@esoft.com" && password === "Abc123") {
    return res.status(200).json({ token: uuidv4() });
  }
    return res.status(401).json({ erro: "Credenciais inválidas" });
});


// ==========================================
// ROTAS DE JOGOS
// ==========================================

//Post

app.post('/jogos', async (req, res) => {
  try {
    const { nome, tipo, nota, review } = req.body;

    const ultimoJogo = await Jogo.findOne().sort('-id');
    
    const novoId = ultimoJogo && ultimoJogo.id ? ultimoJogo.id + 1 : 1;

    const novoJogo = new Jogo({
      id: novoId,
      nome,
      tipo,
      nota,
      review
    });

    await novoJogo.save();

    res.status(201).json(novoJogo);

  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar o jogo", detalhes: error.message });
  }
});

//Get-geral
app.get('/jogos', async (req, res) => {
  try {
    const jogos = await Jogo.find();
    res.status(200).json(jogos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar os jogos" });
  }
});

// Get-Id
app.get('/jogos/:id', async (req, res) => {
  try {
    const idBusca = Number(req.params.id);
    const jogo = await Jogo.findOne({ id: idBusca });
    
    if (!jogo) {
      return res.status(404).json({ erro: "Jogo não encontrado" });
    }
    res.status(200).json(jogo);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o jogo" });
  }
});

//Put
app.put('/jogos/:id', async (req, res) => {
  try {
    const idBusca = Number(req.params.id);
    const { nome, tipo, nota, review } = req.body;

    if (!nome || !tipo || nota === undefined || !review) {
      return res.status(400).json({ erro: "Obrigatório preencher todos os campos" });
    }

    const jogoAtualizado = await Jogo.findOneAndUpdate(
      { id: idBusca },
      { nome, tipo, nota, review },
      { new: true }
    );

    if (!jogoAtualizado) {
      return res.status(404).json({ erro: "Jogo não encontrado" });
    }

    res.status(200).json(jogoAtualizado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar o jogo" });
  }
});

// DELETE
app.delete('/jogos/:id', async (req, res) => {
  try {
    const idBusca = Number(req.params.id);

    const jogoDeletado = await Jogo.findOneAndDelete({ id: idBusca });

    if (!jogoDeletado) {
      return res.status(404).json({ erro: "Jogo não encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar o jogo" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

