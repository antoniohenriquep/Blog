module.exports = {
    isAdmin: function(req,res,next){
        if(req.isAuthenticated()&& req.user.admin == true){
            return next()
        }

        req.flash("error_msg", "Voce precisa ser administrador")
        res.redirect("/usuario/login")
    }
}