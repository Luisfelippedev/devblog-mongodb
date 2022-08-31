const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model("categorias");
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const { checkAdmin } = require('../helpers/checkAdmin')
const cache = require('../config/redis')




router.get('/posts', checkAdmin, (req, res) => {
    res.send('Página de posts');
})

router.get('/categorias', checkAdmin, async (req, res) => {
    await cache.connect()
    const categoria = await cache.get("category")
    if (categoria == null) {
        await cache.disconnect()
    } else {
        async function setRedis(categorias) {
            await cache.set("category", JSON.stringify(categorias), {
                EX: 3600
            })
            await cache.disconnect()
        }
        Categoria.find().lean().sort({ date: 'desc' }).then((async categorias => {
            const cat = categorias
            setRedis(cat)
            res.render('admin/categorias', { categorias: cat });    
        })).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias!')
            res.redirect('/admin/categorias')
        })
    }
})


router.get('/categorias/add', checkAdmin, (req, res) => {
    res.render('admin/addcategoria');
})

router.post('/categorias/new', checkAdmin, (req, res) => {
    const newCategory = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(newCategory).save().then(() => {
        req.flash('success_msg', 'Categoria salva com sucesso!')
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao tentar salvar essa categoria!')
        res.redirect('/admin')
    })


})

router.get('/categorias/edit/:id', checkAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria });
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/admin/categorias');
    })

})

router.post('/categorias/edit', checkAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao tentar editar a categoria: ' + err);
            res.redirect('/admin/categorias');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar categoria: ' + err);
        res.redirect('/admin/categorias');
    })
})

router.post('/categorias/delete', checkAdmin, (req, res) => {

    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar categoria: ' + err);
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', checkAdmin, (req, res) => {
    Postagem.find().lean().populate({ path: 'categoria', strictPopulate: false }).sort({ data: "desc" }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar postagens')
        req.redirect('/admin')
    })


})

router.get('/postagens/add', checkAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário');
        res.redirect('/admin');
    })

})

router.post('/postagens/new', checkAdmin, (req, res) => {
    let erros = []

    if (req.body.categoria == '0') {
        erros.push({ text: 'Categoria invalida, registre uma nova categoria' })
    }

    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug

        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagerm criada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro na criação da postagem')
            res.redirect('/admin/postagens');
        })
    }

})

router.get('/postagens/edit/:id', checkAdmin, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).lean().then((postagens) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', { categorias: categorias, postagens: postagens })
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao listar categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao carregar o formulário de edição')
        res.redirect('/admnin/postagens')
    })


})

router.post('/postagens/edit', checkAdmin, (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Ocorreu um erro ao salvar a edição')
        res.redirect('/admin/postagens')
    })

})

router.get('/postagens/deletar/:id', checkAdmin, (req, res) => {
    Postagem.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('/admin/postagens')
    })
})


module.exports = router;