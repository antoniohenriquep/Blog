const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const bcrypt = require("bcryptjs")
const multer = require('multer')

const passport = require("passport")
const isAdmin = require("../helpers/isAdmin")

//Importando models
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

require('../models/Categoria')
const Categoria = mongoose.model("categorias")

require('../models/Postagem')
const Postagem = mongoose.model('postagens')

//Configurando multer para upload de arquivos
const storage = multer.memoryStorage()
const upload = multer({storage:storage})

router.get("/registro", (req,res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", upload.single("imagemPerfil"),(req,res)=>{
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null)
        erros.push({texto:"Nome invalido"})

    if(!req.body.email || req.body.email == undefined || req.body.email == null)
        erros.push({texto:"Email invalido"})

    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null || req.body.senha.length < 8)
        erros.push({texto:"Senha invalida"})

    if(req.body.senha != req.body.senha2)
        erros.push({texto:"Senhas diferentes! Tente Novamente!"})


    if(erros.length > 0)
    {
        res.render("usuarios/registro", {erros:erros})
    }
    else
    {
        Usuario.findOne({email:req.body.email}).then((usuario)=>{
            if(usuario)
            {
                req.flash("error_msg","Já existe uma conta com esse email")
                res.redirect("/usuario/registro")
            }
            else
            {
                
              

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email:req.body.email,
                    senha:req.body.senha,
                    admin:true,
                    imagemPerfil:{
                        dados:req.file.buffer,
                        contentType:req.file.mimetype
                    }
                })

                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (err,hash)=>{
                        if(err){
                            req.flash("error_msg","Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                            req.flash("success_msg","Usuario criado!")
                            res.redirect("/")
                        }).catch((err)=>{
                            req.flash("error_msg","Houve um erro interno")
                            res.redirect("/")
                        })
                    })
                })
            }
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/")
        })
    }

})

router.get("/login",(req,res)=>{
    res.render("usuarios/login")
})

router.post("/login",(req,res,next)=>{

    passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/usuario/login",
        failureFlash:true
    })(req,res,next)
})

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err)
        {
            
        }
        req.flash("success_msg", "Deslogado com sucesso")
        res.redirect("/")
    })
    
})

router.get("/perfil",(req,res)=>{
    res.render("usuarios/perfil")
})

router.get("/perfil/:id", (req,res)=>{
    Usuario.findOne({_id:req.params.id}).lean().populate({path:'postagens', strictPopulate:false, populate:{
        path:'categoria',strictPopulate:false}}).sort({data:'desc'}).then((usuario)=>{

        const imagem = {
            contentType: usuario.imagemPerfil.contentType,
            dados: usuario.imagemPerfil.dados.toString('base64')
        }
        res.render("usuarios/perfil", {usuario:usuario, imagem:imagem})
            
        
    }).catch((err)=>{
        req.flash("error_msg","Não foi possivel achar usuário")
        res.redirect("/")
    })
})

module.exports = router