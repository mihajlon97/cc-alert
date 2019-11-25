const MainController = require('../controllers/main.controller');

module.exports = function (express) {
	const router = express.Router();

	// ----------- Routes -------------
	router.post('/',           MainController.create);
	router.get('/',            MainController.get);
	router.get('/:id',         MainController.getById);
	router.delete('/:id',      MainController.deleteById);

	return router;
};
