const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()  // Caso o usuário não passe algum valor para o campo date, o default será preenchido por padrão date.now()
    }
})

mongoose.model("categorias", Categoria);