

module.exports = {
    checkAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.checkAdmin == 1){
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um administrador para realizar essa ação')
        res.redirect('/')
    }   
}