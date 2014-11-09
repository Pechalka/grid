/**
 * @jsx React.DOM
 */

var React = require('react');
var Bootstrap = require('react-bootstrap')
	, Grid = Bootstrap.Grid
	, Row = Bootstrap.Row
	, Col = Bootstrap.Col;

var Reflux = require('reflux');
var actions = require('../actions');
var stores = require('../stores');
var getCoords = require('../utils').getCoords;
var cx = React.addons.classSet;
var _ = require('lodash');
var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi, ut officia exercitationem magni modi magnam dolor labore iusto explicabo optio consequatur ad quo voluptatibus dolores enim, eveniet voluptatum neque perferendis?';


 
var Component = React.createClass({
    getInitialState: function() {
        return { 
            shiftX : 25,
            shiftY : 25,
            dragging : false
        }
    },
    onmousedown : function(e){
        var coords = getCoords(e.target);
        
        this.setState({
            shiftX : e.pageX - coords.left,
            shiftY : e.pageY - coords.top,
            dragging : true,

            startX : coords.left,
            startY : coords.top
        })
        document.body.addEventListener('mousemove', this.moveAt);
        
       
    },
    onmouseup : function(e){
    	this.setState({ 
    		left : this.state.startX,
    		top : this.state.startY,
    		dragging : false 
    	})
        document.body.removeEventListener('mousemove', this.moveAt);
        actions.drop(this.props.type);
    },
    moveAt : function(e){
        this.setState({
            left : e.pageX - this.state.shiftX + 'px',
            top : e.pageY - this.state.shiftY +'px'
        })
	 	var x = e.pageX - this.state.shiftX - 1;
	 	var y = e.pageY - this.state.shiftY-1;
	 	var el = document.elementFromPoint(x, y);

	   //	window.console.log(el);

	   	if (!el) return;

	   actions.hoverElement(el.id);

    },
    none : function(e){ return false; },
    render : function(){
    	var style = {
	        position : this.state.dragging ? 'absolute' : 'static',
	        zIndex : 100,
	        left : this.state.left,
	        top : this.state.top
	    }
    	return <div 
    		style={style}
    		onDragStart={this.none}
            onMouseUp={this.onmouseup}
            onMouseDown={this.onmousedown} 
            className="componentIcon">
			{this.props.type}
		</div>
    }
})

var c = {};

c['Title'] = React.createClass({
	doubleClick : function(){
		var data = {
			id : this.props.id,
			col_id : this.props.col_id,
			row_id : this.props.row_id
		}
		actions.removeComponent(data)
		return false;
	},
	render : function(){
		return <h1 className="component" onDoubleClick={this.doubleClick }>Title</h1>
	}
})


c['Text'] = React.createClass({
	doubleClick : function(){
		var data = {
			id : this.props.id,
			col_id : this.props.col_id,
			row_id : this.props.row_id
		}
		actions.removeComponent(data)
		return false;
	},
	render : function(){
		return <p  className="component" onDoubleClick={this.doubleClick }>{lorem}</p>
	}
})

var rowNode;
var Delemitor = React.createClass({
	getInitialState: function() {
        return { 
            shiftX : 25,
            dragging : false
        }
    },
    onmousedown : function(e){
    	var target = e.target;

    	if (target && target){
    		var colCoords = getCoords(target.parentNode);
	        var coords = getCoords(e.target);
	        
	        rowNode = target.parentNode.parentNode; //save current row
	    
	        this.setState({
	            shiftX :  e.pageX - coords.left,
	            dragging : true,

	            startX : coords.left,
	            parentLeft : colCoords.left
	        })
	        document.body.addEventListener('mousemove', this.moveAt);    		
	        document.body.addEventListener('mouseup', this.onmouseup);    		
		} 
    },
    onmouseup : function(e){
    	var widths = [];
        _.each(rowNode.childNodes, function(cellNode){
        	widths.push(cellNode.offsetWidth);
        })

        var data = {
        	cellIndex : this.props.index,
        	row_id : this.props.row_id,
        	newLeft : this.state.left,
        	widths : widths
        }
        if (this.state.left){
        	actions.recalculateCells(data);
		}

    	this.setState({ 
    	 	left : 0,
    	 	dragging : false 
    	})

        document.body.removeEventListener('mousemove', this.moveAt);
        document.body.removeEventListener('mouseup', this.onmouseup);
    },
    moveAt : function(e){
    	var newLeft = e.pageX - this.state.shiftX - this.state.parentLeft ;

        this.setState({
            left : newLeft + 'px'
        })

    },
    doubleClick : function(){
    	var widths = [];
        _.each(rowNode.childNodes, function(cellNode){
        	widths.push(cellNode.offsetWidth);
        })

        var data = {
        	cellIndex : this.props.index,
        	row_id : this.props.row_id,
        	col_id : this.props.col_id,
        	widths : widths
        }

    	actions.removeCell(data);

    	return false;
    },
    none : function(e){ return false; },
    render : function(){
    	var style = {
	       // position : this.state.dragging ? 'absolute' : 'static',
	        zIndex : 100,
	        left : this.state.left,
	        top : 0
	    }
    	return <div className="delemitor"
    		style={style}
    		onDoubleClick={this.doubleClick }
    		onDragStart={this.none}
            onMouseDown={this.onmousedown} >
			{this.props.type}
		</div>
    }

});


var Page = React.createClass({
	mixins : [
		Reflux.connect(stores.selectedElementId, "selected"),
		Reflux.connect(stores.rows, "rows")
	],
	getInitialState: function() {
		return {
			selected : null,
			rows : []
		};
	},
	render: function() {
		var selectedElementId = this.state.selected;
		var rows = this.state.rows.map(function(row){
			var row_id = row.id;
			var cols = row.content.map(function(col, i){
				var cellClasses = cx({ 'hover' : selectedElementId == col.id  });
				var components = col.content.map(function(component){
					var props = component.props;
					props.id = component.id;
					props.col_id = col.id;
					props.row_id = row_id;
					return c[component.componentClass](props) 
				}) 

				return <Col className={cellClasses} id={col.id} xs={col.props.xs}>
					<Delemitor index={i} row_id={row_id} col_id={col.id} />{components}
				</Col>
			})
			return <Row>
				{cols}	
			</Row>
		})
		var addClassName = cx({
			'hover' : selectedElementId == 'add-row',
			'new-row' : true
		})

		return <Grid  fluid={true} className='page text-center'>
				<Row className="ruler">
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
					<Col xs={1}></Col>
				</Row>
			{rows}
			<Row className={addClassName} >
				<Col id={'add-row'} xs={12}>new row</Col>	
			</Row>
		</Grid>
	}

});

var App = React.createClass({
	render: function() {
		return (<div>
			<Grid  fluid={true}>
				<Row>
					<Col xs={2}>
						<h4>Blocks</h4>
						<Component type="Title"/>
						<Component type="Text"/>	
					</Col>
					<Col xs={10}>
						<Page/>
					</Col>
				</Row>
			</Grid>
		</div>);
	}

});

module.exports = App;