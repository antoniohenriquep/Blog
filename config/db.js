if(process.env.NODE_ENV == "production")
{
    module.exports = {mongoURI: "mongodb+srv://antoniohenriquep:<admin123>@blog.rrwl2jc.mongodb.net/?retryWrites=true&w=majority"}
}
else
{
    module.exports = {mongoURI:"mongodb+srv://antoniohenriquep:<admin123>@blog.rrwl2jc.mongodb.net/?retryWrites=true&w=majority"}
}

//"mongodb://localhost:27017/blogapp"