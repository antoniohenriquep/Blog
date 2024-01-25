if(process.env.NODE_ENV == "production")
{
    module.exports = {mongoURI: "mongodb+srv://antoniohp:admin123@blogapp.idgerw3.mongodb.net/?retryWrites=true&w=majority"}
}
else
{
    module.exports = {mongoURI:"mongodb://localhost:27017/blogapp"}
}

//"mongodb://localhost:27017/blogapp"