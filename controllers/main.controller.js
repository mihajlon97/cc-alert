const { ReE, ReS, to, asyncForEach }         = require('../services/UtilService');
const axios = require('axios');

/** POST Body Example
 {
		"timestamp":"2010-10-14T11:19:18.039111Z",
		"section": 1,
		"event": "entry",
		"image": "<base64-encoded-string>" (where the person was detected)
		persons":[
			{
				"name":"Ms.X",
			}
		],
		"extra-info": "" (optional)
	 }
 */
const create = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')

	const adapter = new FileSync('db.json')
	const db = low(adapter)

	const body = req.body;
	if (!body.timestamp || !body.section || !body.event || !body.image || !body.persons)
		return ReE(res, { message: 'INVALID_DATA' });

	try {
		db.get('alerts').push({
			id: parseInt(parseInt(db.get('alerts').size().value()) + 1),
			...body
		}).write();
	} catch (e) {
		return ReE(res, { message: 'ERROR_INSERT' });
	}
	return ReS(res, {message: 'Created Alert'});
};
module.exports.create = create;


/**
 * Get Alerts
 * Example: /?from={from}&to={to}&aggregate=count
 */
const get = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')

	const adapter = new FileSync('db.json')
	const db = low(adapter)

	var alerts = db.get('alerts').value();
	var result = [];

	alerts.forEach(alert => {

		if (
			// Time filter
			(req.query.from === undefined || req.query.from && new Date(req.query.from) <= new Date(alert.timestamp)) &&
			(req.query.to === undefined || req.query.to && new Date(req.query.to) >= new Date(alert.timestamp)) &&

			// Filter Departed
			(
				req.query.departed === undefined ||
				(req.query.departed === false && alert.event === 'entry') ||
				(req.query.departed === true && alert.event === 'exit')
			)
		) {
			result.push(alert);
		}
	});

	// Aggregate response
	if (req.query.aggregate === 'count') result = result.length;

	return ReS(res, {alerts: result});
};
module.exports.get = get;


/**
 * Get Alert by id
 */
const getById = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')
	const adapter = new FileSync('db.json')
	const db = low(adapter)

	var alert = db.get('alerts').find({ id: parseInt(req.params.id) }).value();
	return ReS(res, {alert});
}
module.exports.getById = getById;


/**
 * Delete Alert by id
 */
const deleteById = async function(req, res){
	const low = require('lowdb')
	const FileSync = require('lowdb/adapters/FileSync')

	const adapter = new FileSync('db.json')
	const db = low(adapter)

	try {
		db.get('alerts').remove({ id: parseInt(req.params.id) }).write()
	} catch (e) {
		return ReE(res, { message: 'ERROR_DELETE' });
	}
	return ReS(res, {message: 'Successfully Deleted'});
}
module.exports.deleteById = deleteById;
