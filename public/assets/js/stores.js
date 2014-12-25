var utils = require('./utils')
	, CollectionStore = utils.CollectionStore
	, ObjectStore   = utils.ObjectStore;






module.exports = {
	rows : CollectionStore([{
		content : [
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Image', id : utils.guid(), props : { align : 'left', effect : 'circle' }},
					{ componentClass : 'Title', id : utils.guid(), props : { align : 'left'}},
					{ componentClass : 'Text', id : utils.guid(), props : {}}
				], 
				id : utils.guid() 
			},
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Title', id : utils.guid(), props : {}},
					{ componentClass : 'Image', id : utils.guid(), props : { align : 'center', effect : 'rounded' }}
				], id : utils.guid() },
			{ 
				props : { xs : 4 }, 
				content : [
					{ componentClass : 'Image', id : utils.guid(), props : { align : 'right', effect : 'thumbnail' }},
					{ componentClass : 'Title', id : utils.guid() , props : { align : 'right', level : 4 } },
					{ componentClass : 'Text', id : utils.guid(), props : {}}
				], id : utils.guid() 
			}
		], 
		id : utils.guid()
	}]),

	drag : ObjectStore(false),

	selectedElementId : ObjectStore(null),

	dragHoverElementId : ObjectStore(null),

	//todo: fix name
	elementType : ObjectStore(null)// add new component or move exist
}