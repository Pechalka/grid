var utils = require('./utils')
	, CollectionStore = utils.CollectionStore
	, ObjectStore   = utils.ObjectStore;






module.exports = {
	rows : CollectionStore([{
		content : [
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Title', id : utils.guid(), props : {}},
					{ componentClass : 'Text', id : utils.guid(), props : {}}
				], 
				id : utils.guid() 
			},
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Title', id : utils.guid(), props : {}},
					{ componentClass : 'Text', id : utils.guid(), props : {}}
				], id : utils.guid() },
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Title', id : utils.guid() , props : {} },
					{ componentClass : 'Text', id : utils.guid(), props : {}}
				], id : utils.guid() 
			}
		], 
		id : utils.guid()
	}]),

	selectedElementId : ObjectStore(null),

	//todo: fix name
	elementType : ObjectStore(null)// add new component or move exist
}