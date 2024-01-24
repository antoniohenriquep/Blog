const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const db = require("./config/db")

const admin = require('./routes/admin')
const usuario = require("./routes/usuario")

const flash = require('connect-flash')
const port = 8081

require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require('./models/Categoria')
const Categoria = mongoose.model("categorias")

require('./models/Usuario')
const Usuario = mongoose.model("usuarios")

const passport = require("passport")
require("./config/auth")(passport)

const {isUser} = require("./helpers/isUser")

//Configs
    //Sessao
app.use(session({
    secret:'random',
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

    //Middleware
app.use((req,res,next) =>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    if(req.user)
    res.locals.admin = req.user.admin || null
    
    next()
})
    //BodyParser
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
    //Handlebars
app.engine('handlebars', handlebars.engine({defaultLayout:'main'}))
app.set('view engine', 'handlebars')


    //Mongoose
mongoose.Promise = global.Promise

mongoose.connect(db.mongoURI).then(()=>{
    console.log("Conectou ao banco de dados")
}).catch((err)=>{
    console.log("Nao foi possivel conectar-se ao banco de dados! Erro: "+ err)
})


    //Public
app.use(express.static(path.join(__dirname,'public')))

    //Rotas
app.use('/admin',admin)
app.use('/usuario',usuario)


app.get('/',(req,res)=>{
    Postagem.find().lean().populate({path: 'categoria', strictPopulate: false}).sort({data:'desc'}).then((postagens)=>{
        res.render('index',{postagens:postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
    
})

app.get("/postagem/add",isUser,(req,res) =>{
    Categoria.find().lean().then((categorias)=>{
        res.render("postagem/add", {categorias:categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/")
    })
})

app.post("/postagem/nova", isUser, (req,res)=>{
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
                    res.redirect("/")
                })
            })
            
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro!")
            res.redirect("/")
        })
})

app.get("/postagem/:id", (req,res)=>{

    Postagem.findOne({_id:req.params.id}).lean().populate(
        {path:'usuario',strictPopulate:false}
        ).sort({data:'desc'}).then((postagem)=>{

        if(postagem)
        {

            res.render("postagem/index",{postagem:postagem})
        }
        else
        {
            req.flash("error_msg","Essa postagem não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/404",(req,res)=>{
    res.send("Error 404")
})

app.get("/categorias", (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("categorias/index",{categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req,res)=>{
    //Pesquisar a categoria pelo slug
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{

        if(categoria){
            //Pesquisar as postagens que estao nessa categoria
            Postagem.find({categoria:categoria._id}).lean().then((postagens)=>{
                res.render("categorias/postagens",{postagens:postagens, categoria:categoria})

            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
            
        }
        else
        {
            req.flash("error_msg", "Categoria inexistente")
            res.redirect("/")
        }
        
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})


const PORT = process.env.PORT || 8081
app.listen(PORT,()=>{
    console.log("O ambiente eh:"+process.env.NODE_ENV)
    console.log("A porta eh"+PORT)
    //console.log("Servidor rodando em http://127.0.0.0:8081/")
})