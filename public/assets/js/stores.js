var utils = require('./utils')
	, CollectionStore = utils.CollectionStore
	, ObjectStore   = utils.ObjectStore;






module.exports = {
	rows : CollectionStore([{
		content : [
			{ props : { xs : 3 }, content : [], id : utils.guid() },
			{ props : { xs : 3 }, content : [{ componentClass : 'Text'}], id : utils.guid() },
			{ props : { xs : 3 }, content : [{ componentClass : 'Title'}], id : utils.guid() },
			{ props : { xs : 3 }, content : [], id : utils.guid() }	
		], 
		id : utils.guid()
	}]),

	selectedElementId : ObjectStore(null)
}