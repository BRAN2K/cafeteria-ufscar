import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockAdjustment,
} from "../validations/product.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";

const router = Router();
const productController = new ProductController();

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: number
 *             required:
 *               - name
 *               - price
 *             example:
 *               name: "Café Premium"
 *               description: "Café gourmet torrado"
 *               price: 15.99
 *               stock_quantity: 10
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
router.post("/", validateCreateProduct, productController.createProduct);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retorna lista paginada de produtos
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filtro pelo campo nome
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     # $ref: '#/components/schemas/Product'
 *                     type: object
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
router.get("/", validatePagination, productController.getAllProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Retorna um produto específico
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       400:
 *         description: Parâmetro inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.get("/:id", validateIdParam, productController.getProductById);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Atualiza os dados de um produto
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: number
 *             example:
 *               name: "Café Premium - Atualizado"
 *               description: "Descrição atualizada"
 *               price: 18.99
 *               stock_quantity: 20
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.put(
  "/:id",
  validateIdParam,
  validateUpdateProduct,
  productController.updateProduct
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
 *       400:
 *         description: Parâmetro inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete("/:id", validateIdParam, productController.deleteProduct);

/**
 * @openapi
 * /products/{id}/increase:
 *   post:
 *     summary: Aumenta o estoque de um produto
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *             required:
 *               - quantity
 *             example:
 *               quantity: 5
 *     responses:
 *       200:
 *         description: Estoque aumentado com sucesso
 *       400:
 *         description: Parâmetro inválido ou falha ao ajustar estoque
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.post(
  "/:id/increase",
  validateIdParam,
  validateStockAdjustment,
  productController.increaseStock
);

/**
 * @openapi
 * /products/{id}/decrease:
 *   post:
 *     summary: Diminui o estoque de um produto
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *             required:
 *               - quantity
 *             example:
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Estoque diminuído com sucesso
 *       400:
 *         description: Parâmetro inválido ou estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.post(
  "/:id/decrease",
  validateIdParam,
  validateStockAdjustment,
  productController.decreaseStock
);

export default router;
