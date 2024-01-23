const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    admin:{
        type: Boolean,
        default: false
    },
    senha:{
        type:String,
        required:true
    },
    postagens:[{
        type:Schema.Types.ObjectId,
        ref: "postagens"
    }],
    imagemPerfil:{
        dados:Buffer,
        contentType: String
    }
    
})

mongoose.model("usuarios",Usuario)