var _ = require('lodash');
var stores = require('./stores');
var Reflux = require('reflux');
var http = require('./utils').http;

var guid = require('./utils').guid;
var _ = require('lodash');

var actions = Reflux.createActions([
    "hoverElement",
    "drop",
    "recalculateCells",
    "removeCell"
]);


actions.removeCell.listen(function(data){
	if (!confirm("Remove cell?")) return;
	
	var rows = stores.rows.get();
	var row = _.find(rows, { id : data.row_id });
	
	var widths = data.widths; 
	var delta = widths[data.cellIndex];
	widths[data.cellIndex+1] += delta;

	widths.splice(data.cellIndex, 1);
	
	
	row.content = _.reject(row.content, { id : data.col_id })
	var new_xs = converToXs(widths);
	_.each(row.content, function(cell, index){
		cell.props.xs = new_xs[index];
	})


	stores.rows.update(row);
})

actions.hoverElement.listen(function(id){
	stores.selectedElementId.set(id);
})

var converToXs = function(widths){
	var totalWidht = 0;
	_.each(widths, function(w){ totalWidht += w; });
	var p = totalWidht / 12;
	return _.map(widths, function(w){ return Math.round(w / p); });
}

actions.recalculateCells.listen(function(data){
	window.console.log(data);

	var widths = data.widths;
	var currentCellWidth = widths[data.cellIndex];
	var delta = parseInt(data.newLeft.split('px')[0]);

	if (data.cellIndex === 0){//new cell
		widths[data.cellIndex] = currentCellWidth - delta;
		widths.splice(data.cellIndex, 0, delta);
	} else { //resize
		widths[data.cellIndex-1] += delta;
		widths[data.cellIndex] -= delta;
	}

	var new_xs = converToXs(widths);
	console.log(widths, new_xs);
	
	//update model
	var rows = stores.rows.get();
	var row = _.find(rows, { id : data.row_id });
	//console.log(row)

	if (data.cellIndex === 0){//add cell
		row.content.unshift({ id : guid(), content : [], props : { xs : 0 } }) //xs updated in next loop	
	}
	_.each(row.content, function(cell, index){
		cell.props.xs = new_xs[index];
	})

	stores.rows.update(row);
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