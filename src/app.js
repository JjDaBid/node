import express from 'express';

const app = express();

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>console.log(`listening on port ${PORT}`));

app.get('/api/products', (req, res) => { res.send("Todos los productos") });

app.get('/api/products/:pid', (req, res) => { res.send("Producto por ID") });
