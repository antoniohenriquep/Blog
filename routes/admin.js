const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../models/Categoria')
const Categoria = mongoose.model('categorias')

require('../models/Postagem')
const Postagem= mongoose.model('postagens')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

const {isAdmin} = require("../helpers/isAdmin")


router.get('/',isAdmin,(req,res) =>{
    res.render('admin/index')
})

router.get('/categorias', isAdmin, (req,res) =>{
    Categoria.find().lean().then((categorias) =>{
        //console.log(categorias)
        res.render('admin/categorias', {categorias:categorias})
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
    
})


router.get('/categorias/add', isAdmin, (req,res) =>{
    res.render('admin/addcategorias')
})

router.get('/categorias/edit/:id', (req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias',{categoria:categoria})
    }).catch((err) =>{
        req.flash('error_msg', "Essa categoria não existe!")
        res.redirect('/admin/categorias')
    })
    
})

router.post('/categorias/edit', isAdmin, (req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash('success_msg', "Categoria editada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg',"Houve um erro ao editar a categoria")
            res.redirect('/admin/categorias')
        })

    }).catch((err)=>{
        req.flash('error_msg',"Houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
    })
})


router.post('/categorias/novacategoria', isAdmin,(req,res)=>{

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
    {
        erros.push({texto: 'Nome invalido'})
    }

    if(req.body.nome.length < 2)
    {
        erros.push({texto:"Nome muito pequeno"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null )
    {
        erros.push({texto: 'Slug invalido'})
    }

    if(req.body.slug.length < 2)
    {
        erros.push({texto:"Slug muito pequeno"})
    }

    if(erros.length > 0)
    {
        res.render('admin/addcategorias', {erros:erros})
    }

    else
    {
        const novaCategoria = {
        nome:req.body.nome,
        slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err)=> {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria. Tente novamente!')
            res.redirect('/admin')    
        })

    }
})


router.post('/categorias/deletar', isAdmin, (req,res)=>{
    Categoria.findOneAndRemove({_id:req.body.id}).then(()=>{
        req.flash('success_msg','Categoria deletada!')
        res.redirect('/admin/categorias')
    }).catch((err) =>{
        req.flash('error_msg', 'Nao foi possivel deletar categoria')
        res.redirect('/admin/categorias')
    })
})

router.get("/postagens", isAdmin, (req,res) =>{
    Postagem.find().lean().populate([
        {path: 'categoria', strictPopulate: false},
        {path:'usuario',strictPopulate:false}]).sort({data:'desc'}).then((postagens)=>{

        res.render("admin/postagens",{postagens:postagens})
    })
    
})

router.get('/postagens/add', isAdmin, (req,res) =>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias:categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
    
})

router.post("/postagens/nova", isAdmin, (req,res)=>{
    const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug,
        usuario:req.user._id
    }

    const postagem = new Postagem(novaPostagem)
    postagem.save().then(()=>{

            Usuario.findOne({_id:req.user._id}).then((usuario)=>{
                usuario.postagens.push(postagem._id)

                usuario.save().then(()=>{
                    req.flash("success_msg", "Postagem criada com sucesso!")
                    res.redirect("/admin/postagens")
                })
            })
            
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro!")
            res.redirect("/admin/postagens")
        })
})

router.get("/postagens/edit/:id", isAdmin, (req,res)=>{
    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias, postagem:postagem})
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao listar categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", isAdmin, (req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "Postagem editada")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg","Houve um erro")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", isAdmin, (req,res)=>{
    Postagem.findOneAndRemove({_id:req.params.id}).then(()=>{
        req.flash("success_msg","A postagem foi deletada")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg","Nao foi possivel deletar")
    })
})

module.exports = router 