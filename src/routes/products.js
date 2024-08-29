import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsRouter = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

// Funciones para leer y escribir en el archivo de productos
const readProductsFile = () => {
  try {
      const data = fs.readFileSync(productsFilePath, 'utf-8');
      return JSON.parse(data || '[]');
  } catch (error) {
      console.error('Error al leer el archivo de productos:', error);
      return []; 
  }
};

const writeProductsFile = (data) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
};

// Rutas del router de productos
productsRouter.get('/', (req, res) => {
    const products = readProductsFile();
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

productsRouter.get('/:pid', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

productsRouter.post('/', (req, res) => {
  const { title, description, code, price, status, stock, category } = req.body;

  // Validar que todos los campos estén presentes
  if (!title || !description || !code || !price || !status || !stock || !category) {
      return res.status(400).json({ status:`error`, message: 'Faltan datos requeridos para el producto' });
  }

  const products = readProductsFile();
  const newProduct = {

    id: (products.length + 1).toString(),
    title: req.body.title,
    description: req.body.description,
    code: req.body.code,
    price: req.body.price,
    status: req.body.status !== undefined ? req.body.status : true,
    stock: req.body.stock,
    category: req.body.category,
    thumbnails: req.body.thumbnails || []
  };
  products.push(newProduct);
  writeProductsFile(products);
  res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    const products = readProductsFile();
    const index = products.findIndex(p => p.id === req.params.pid);
    if (index !== -1) {
        const updatedProduct = {
            ...products[index],
            ...req.body,
            id: products[index].id
        };
        products[index] = updatedProduct;
        writeProductsFile(products);
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

productsRouter.delete('/:pid', (req, res) => {
    let products = readProductsFile();
    const newProducts = products.filter(p => p.id !== req.params.pid);
    if (newProducts.length !== products.length) {
        writeProductsFile(newProducts);
        res.json({ message: 'Producto eliminado' });
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

export default productsRouter;
