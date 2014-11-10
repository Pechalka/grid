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
    "removeCell",
    "removeComponent",
    "dropComponent",
    "updateComponent"
]);

actions.removeComponent.listen(function(data){
	if (!confirm("Remove component?")) return;

	var rows = stores.rows.get();
	var row = _.find(rows, { id : data.row_id });
	var col = _.find(row.content, { id : data.col_id })
	col.content = _.reject(col.content, { id : data.id })

	stores.rows.update(row);
})

actions.updateComponent.listen(function(data){
	var rows = stores.rows.get();
	var row = _.find(rows, { id : data.row_id });
	var col = _.find(row.content, { id : data.col_id })
	var component = _.find(col.content, { id : data.id })
	component.props.style = data.style;

	stores.rows.update(row);	
})

var findComponentById = function(id){
	var rows = stores.rows.get();

	return null;
}

actions.drop.listen(function(type){

	//TODO: refactoring!!!!
	var id = stores.selectedElementId.get();
	
	if (!type.id){ //drop new component
		
		if (!id) return;

		if (id === 'add-row'){
			stores.rows.add({ content : [{ props : { xs : 12 } , content : [{ componentClass : type , id : guid() , props : {} }], id : guid() }], id : guid() });		
		} else {
			var rows = stores.rows.get();
			_.each(rows, function(row, i){
				var selectedCell = _.find(row.content, function(cell){
					return cell.id == id;
				})
				if (selectedCell){
					selectedCell.content.push({ componentClass : type , id : guid() , props : {}});
					stores.rows.update(selectedCell)
				} else {
					var row_index = -1;
					var col_index = -1;
					var component_index = -1; 
					_.each(row.content, function(col, j){
						_.each(col.content, function(component, k){
							if (component.id == id){
								row_index = i;
								col_index = j;
								component_index = k;
							}
						})
					})

					if (component_index != -1){
						var components = rows[row_index].content[col_index].content;
						components.splice(component_index, 0, { componentClass : type , id : guid() , props : {}});

						stores.rows.update(rows[row_index]);
					}
				}
			})		
		}
	} else { //move exist component
		var data = type;
		//remove component from old position
		var rows = stores.rows.get();
		var row = _.find(rows, { id : data.row_id });
		var col = _.find(row.content, { id : data.col_id })
		var component = _.find(col.content, { id : data.id })//get component
		col.content = _.reject(col.content, { id : data.id })
		stores.rows.update(row);

		//inser component in new position
		var row_index = -1;
		var col_index = -1;
		var component_index = -1; 

		_.each(rows, function(row, i){
			_.each(row.content, function(col, j){
				if (col.id == id){//element drop in col
					row_index = i;
					col_index = j;
				} else {
					_.each(col.content, function(component, k){//element drop in Component
						if (component.id === id){
							row_index = i;
							col_index = j;
							component_index = k;
						}
					})		
				}
			})
		})	
		if (col_index !== -1){
			var components = rows[row_index].content[col_index].content;

			if (component_index == -1)
				components.push(component)	
			else
				components.splice(component_index, 0, component);

			stores.rows.update(rows[row_index]);	
		}
	}

	stores.selectedElementId.set(null);
})


actions.removeCell.listen(function(data){
	if (!confirm("Remove cell?")) return;

	var rows = stores.rows.get();
	var row = _.find(rows, { id : data.row_id });
	
	var widths = data.widths; 
	var delta = widths[data.cellIndex];

	if (widths.length == 1){ //last cell in row
		stores.rows.remove(row)
		return;
	}

	if (data.cellIndex == widths.length - 1){//last col
		widths[data.cellIndex-1] += delta;
	} else {
		widths[data.cellIndex+1] += delta;
	
	}
	
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



 module.exports = actions;