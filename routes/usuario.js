const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const bcrypt = require("bcryptjs")

require("../models/Usuario")
const Usuario = mongoose.model("usuarios")


router.get("/registro", (req,res)=>{
    res.render("usuarios/registro")
})

router.post("/registro",(req,res)=>{
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
                    senha:req.body.senha
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
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/")
        })
    }

})

router.get("/login",(req,res)=>{
    res.render("usuarios/login")
})

module.exports = router