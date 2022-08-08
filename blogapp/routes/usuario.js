const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model("usuarios");
const bcrypt = require('bcryptjs');
const passport = require('passport')


router.get('/registro', (req, res)=>{
    res.render('usuarios/registro')
})

router.post('/registro', (req, res)=>{
    let erros = []

    // Validação de dados
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errors.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        errors.push({texto: 'Senha inválida'})
    }
    if(req.body.senha.length < 6){
        erros.push({texto: 'Senha muito curta!'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'Senhas não coincidem, tente novamente!'})
    }
    
    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        //  Verifica se existe algum usuário já registrado no banco, através do email.
        Usuario.findOne({email: req.body.email}).lean().then((usuario)=>{
            if(usuario){
                req.flash('error_msg', "Já existe uma conta registrada com esse email")
                res.redirect('/usuarios/registro')
            }else{
                
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                    //checkAdmin: 1  (Ativar para criar um usuário como administrador)
                })

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                        if(err){
                            req.flash('error_msg', 'Ocorreu um erro ao tentar salvar o usuário')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso!')
                            res.redirect('/')
                        }).catch((err)=>{
                            req.flash('error_msg', 'Ocorreu um erro ao criar o usuário, tente novamente!')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })

            }
        }).catch((err)=>{
            req.flash('error_msg', 'Ocorreu um erro interno!')
        })
    }
})

router.get('/login', (req, res)=>{
    res.render('usuarios/login')
})

router.post('/login', (req, res, next)=>{

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err) }
        res.redirect('/')
      })
})


module.exports = router