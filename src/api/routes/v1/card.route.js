const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/card.controller');
const { logged } = require('../../middlewares/auth');
const {
  listCards,
  createCard,
  replaceCard,
  idsList,
} = require('../../validations/card.validation');

const router = express.Router();

router.param('cardId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/cards List Users
   * @apiDescription Get a list of cards
   * @apiVersion 1.0.0
   * @apiName ListCards
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Cards per page
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(logged(), validate(listCards), controller.list)
  /**
   * @api {post} v1/cards Create Card
   * @apiDescription Create a new card
   * @apiVersion 1.0.0
   * @apiName CreateCard
   * @apiGroup Card
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String{6..128}}     name      Cards's name
   * @apiParam  {String}             status    Cards's status
   * @apiParam  {String{..255}}      imagePath Cards's imagePath
   * @apiParam  {String}             rarity    Cards's rarity
   * @apiParam  {Integer}            limit     Cards's limit
   *
   * @apiSuccess (Created 201) {String}  id         Cards's id
   * @apiSuccess (Created 201) {String}  name       Cards's name
   * @apiSuccess (Created 201) {String}  status     Cards's status
   * @apiSuccess (Created 201) {String}  imagePath  Cards's role
   * @apiSuccess (Created 201) {String}  rarity     Cards's rarity
   * @apiSuccess (Created 201) {Integer} limit      Cards's limit
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(logged(), validate(createCard), controller.create);

router
  .route('/:cardId')
  /**
   * @api {get} v1/cards/:id Get card
   * @apiDescription Get Card information
   * @apiVersion 1.0.0
   * @apiName GetCard
   * @apiGroup Card
   * @apiPermission Card
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {Object}  id         Card's object
   *
   * @apiError (Unauthorized 401) Unauthorized Only owners can access draft cards
   */
  .get(logged(), controller.get)
  /**
   * @api {put} v1/cards/:id Replace card
   * @apiDescription Replace the whole card document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceCard
   * @apiGroup Card
   * @apiPermission Card
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Object}             Card's Object
   *
   * @apiSuccess {Object}  id         Card's object
   *
   * @apiError (Unauthorized 401) Unauthorized Only owners can edit cards
   * @apiError (Not Found 404)    NotFound     Card does not exist
   */
  .put(logged(), validate(replaceCard), controller.replace);

router
  .route('/publish')
/**
     * @api {get} v1/cards/publish publish cards
     * @apiDescription Get Card information
     * @apiVersion 1.0.0
     * @apiName GetCard
     * @apiGroup Card
     * @apiPermission Card
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiSuccess {Object}  id         Card's ids
     *
     * @apiError (Unauthorized 401) Unauthorized Only owners can access draft cards
     */
  .patch(logged(), validate(idsList), controller.bulkPublish);
router
  .route('/subscribe')
/**
     * @api {get} v1/cards/publish publish cards
     * @apiDescription Get Card information
     * @apiVersion 1.0.0
     * @apiName GetCard
     * @apiGroup Card
     * @apiPermission Card
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiSuccess {Object}  id         Card's ids
     *
     * @apiError (Unauthorized 401) Unauthorized Only owners can access draft cards
     */
  .patch(logged(), validate(idsList), controller.bulkSubscribe);
router
  .route('/use')
/**
     * @api {get} v1/cards/publish publish cards
     * @apiDescription Get Card information
     * @apiVersion 1.0.0
     * @apiName GetCard
     * @apiGroup Card
     * @apiPermission Card
     *
     * @apiHeader {String} Authorization   User's access token
     *
     * @apiSuccess {Object}  id         Card's ids
     *
     * @apiError (Unauthorized 401) Unauthorized Only owners can access draft cards
     */
  .patch(logged(), validate(idsList), controller.bulkUse);

module.exports = router;
