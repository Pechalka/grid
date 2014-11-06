var _ = require('lodash');
var stores = require('./stores');
var Reflux = require('reflux');
var http = require('./utils').http;

var guid = require('./utils').guid;
var _ = require('lodash');

var actions = Reflux.createActions([
    "hoverElement",
    "drop"
]);


actions.hoverElement.listen(function(id){
	stores.selectedElementId.set(id);
})

actions.drop.listen(function(type){
	var id = stores.selectedElementId.get();
	
	if (!id) return;

	if (id === 'add-row'){
		stores.rows.add({ content : [{ props : { xs : 12 } , content : [{ componentClass : type }], id : guid() }] });		
	} else {
		var rows = stores.rows.get();
		_.each(rows, function(row){
			var selectedCell = _.find(row.content, function(cell){
				return cell.id == id;
			})

			if (selectedCell){
				selectedCell.content.push({ componentClass : type });
				stores.rows.update(selectedCell)
			}
		})		
	}
	stores.selectedElementId.set(null);
})

 module.exports = actions;