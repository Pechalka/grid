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
            className="component">
			{this.props.type}
		</div>
    }
})

var c = {};

c['block1'] = React.createClass({
	render : function(){
		return <div>block 1</div>
	}
})


c['block2'] = React.createClass({
	render : function(){
		return <div>block 2</div>
	}
})

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
			var cols = row.content.map(function(col){
				var cellClasses = cx({ 'hover' : selectedElementId == col.id  });
				var components = col.content.map(function(component){
					return c[component.componentClass](component.props) 
				}) 

				return <Col className={cellClasses} id={col.id} xs={col.props.xs}>{components}</Col>
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
						<Component type="block1"/>
						<Component type="block2"/>	
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