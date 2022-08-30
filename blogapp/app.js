// Carregando módulos    
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    const app = express();
    const admin = require('./routes/admin')
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');
    require('./models/Categoria');
    const Categoria = mongoose.model("categorias");
    require('./models/Usuario');
    const Usuario = mongoose.model("usuarios");
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)
    const {checkAdmin} = require('./helpers/checkAdmin')
    require('dotenv').config();
    const redis = require('./config/redis')


// Configurações
    // Sessão
        app.use(session({
            secret: 'KpdodlKspJDLjasdo',
            ressave: true,
            saveUninitialized: true
        }));
    // Passport
        app.use(passport.initialize())
        app.use(passport.session())
    // Flash
        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null;
            next();
        })    
    // Body-Parser
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());  
    // Handlebars (Template-Engine)
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            },
        }));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.connect(`mongodb://localhost/db3`).then(() => {
            console.log('Conectado ao MongoDb com sucesso!')
        }).catch((err) => {
            console.log('Erro ao se conectar ao MongoDB: '+err);
        })
    // Public (Arquivos estáticos)
        app.use(express.static(path.join(__dirname,'/public')))
        

// Rotas
    
    app.get('/', (req, res)=>{
        Postagem.find().populate({path: 'categoria', strictPopulate: false}).sort({data:"desc"}).lean().then((postagens)=>{
            res.render("index", {postagens: postagens});

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/404')
        })

    })        

    app.get('/404', (req, res)=>{
        res.send('Erro 404!')       
    })


    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Essa postagem não existe!')
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('categorias/index', {categorias: categorias})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao listar categorias')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){

                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{

                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})

                }).catch((err)=>{
                    req.flash('error_msg', 'Houve um erro ao listar as postagens!')
                    res.redirect('/')
                })

            }else{
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
        })
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log('Servidor rodando na porta 8081.. Ctrl + C para derrubar...');
    })

 