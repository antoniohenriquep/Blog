const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId, //Vai armazenar o id de outro Schema
        ref:"categorias",
        required: true
    },
    data:{
        type: Date,
        default:Date.now()
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref:"usuarios",
        required:true
    }
})

mongoose.model("postagens", Postagem)