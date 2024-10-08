import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cartsRouter = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer el archivo de carritos
const readCartsFile = () => {
  try {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error al leer el archivo de carritos:', error);
    return [];
  }
};

// Función para escribir en el archivo de carritos
const writeCartsFile = (data) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(data, null, 2));
};

// Función para leer el archivo de productos
const readProductsFile = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error al leer el archivo de productos:', error);
    return [];
  }
};

// Generar un ID único para un nuevo carrito
const generateCartId = () => {
  const carts = readCartsFile();
  if (carts.length === 0) return '1';
  const lastCart = carts[carts.length - 1];
  return (parseInt(lastCart.id) + 1).toString();
};

// Ruta para crear un nuevo carrito vacío
cartsRouter.post('/', (req, res) => {
  const carts = readCartsFile();
  const newCart = {
    id: generateCartId(),
    products: []
  };

  carts.push(newCart);
  writeCartsFile(carts);
  res.status(201).json(newCart);
});

// Ruta para obtener un carrito específico por ID
cartsRouter.get('/:cid', (req, res) => {
  const carts = readCartsFile();
  const cart = carts.find(c => c.id === req.params.cid);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Carrito no encontrado' });
  }
});

// Ruta para agregar un producto a un carrito específico
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const carts = readCartsFile();
  const products = readProductsFile();
  const cart = carts.find(c => c.id === req.params.cid);
  const productExists = products.some(p => p.id === req.params.pid);

  if (cart && productExists) {
    const cartProduct = cart.products.find(p => p.product === req.params.pid);
    if (cartProduct) {
      cartProduct.quantity += 1; 
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 }); 
    }
    writeCartsFile(carts);
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Carrito o producto no encontrado' });
  }
});

export default cartsRouter;
