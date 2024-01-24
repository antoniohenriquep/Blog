if(process.env.NODE_ENV == "production")
{
    module.exports = {mongoURI: "mongodb+srv://antoniohenriquep:<PCJmf3028>@blog.rrwl2jc.mongodb.net/?retryWrites=true&w=majority"}
}
else
{
    module.exports = {mongoURI:"mongodb://localhost:27017/blogapp"}
}