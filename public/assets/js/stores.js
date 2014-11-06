var utils = require('./utils')
	, CollectionStore = utils.CollectionStore
	, ObjectStore   = utils.ObjectStore;






module.exports = {
	rows : CollectionStore([{
		content : [
			{ props : { xs : 3 }, content : [], id : utils.guid() },
			{ props : { xs : 3 }, content : [{ componentClass : 'block1'}], id : utils.guid() },
			{ props : { xs : 3 }, content : [{ componentClass : 'block2'}], id : utils.guid() },
			{ props : { xs : 3 }, content : [], id : utils.guid() }	
		]
	}]),

	selectedElementId : ObjectStore(null)
}