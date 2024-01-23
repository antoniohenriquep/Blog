module.exports = {
    isUser: function(req,res,next){
        if(req.isAuthenticated()){
            return next()
        }

        req.flash("error_msg", "Voce precisa estar logado")
        res.redirect("/usuario/login")
    }
}