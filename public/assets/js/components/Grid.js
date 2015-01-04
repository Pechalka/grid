/**
 * @jsx React.DOM
 */

var React = require('react');
var Bootstrap = require('react-bootstrap')
	, Grid = Bootstrap.Grid
	, Row = Bootstrap.Row
	, Col = Bootstrap.Col
	, ButtonToolbar = Bootstrap.ButtonToolbar
	, DropdownButton = Bootstrap.DropdownButton
	, MenuItem = Bootstrap.MenuItem
	, ButtonGroup = Bootstrap.ButtonGroup
;



var Reflux = require('reflux');
var actions = require('../actions');
var stores = require('../stores');
var getCoords = require('../utils').getCoords;
var getSelectionText = require('../utils').getSelectionText;

var cx = React.addons.classSet;
var Draggable = require('../Draggable');

var _ = require('lodash');
var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi, ut officia exercitationem magni modi magnam dolor labore iusto explicabo optio consequatur ad quo voluptatibus dolores enim, eveniet voluptatum neque perferendis?';

var r = React.DOM;
 
var ComponentIcon = React.createClass({
  	dragEnd : function(){
  		actions.drop(this.props.type);
  	},
  	drag : function(x, y){
		var el = document.elementFromPoint(x-1, y-1 );

	    if (!el) return;

		actions.hoverElement(el.id);
  	},
  	dragStart : function(){  		
  		actions.drag();
  	},
  	render : function(){
  		return <Draggable delay={1} onStart={this.dragStart} onEnd={this.dragEnd} onDrag={this.drag}>
  			<div className="componentIcon">{this.props.type}</div>
  		</Draggable>
  	}
})


var ComponentToolBar = React.createClass({
	align : function(value){
    	var data = {
        	row_id : this.props.row_id,
        	col_id : this.props.col_id,
        	id : this.props.id,
        	style : { 'text-align' : value },
        	align : value
        }
    	actions.updateComponent(data);	
    	return false;
    },
    level : function(value){
    	var delte = value == "level-reduce" ? -1 : 1;
    	var data = {
        	row_id : this.props.row_id,
        	col_id : this.props.col_id,
        	id : this.props.id,
        	level : (this.props.level || 1) + delte
        }
    	actions.updateComponent(data);
    	return false;
    },
    effect : function(value){
    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	effect : value
	        }
	    actions.updateComponent(data);
	    return false;	
    },
	render: function() {
		var level = this.props.level || 1;	    
	    var size = this.props.componentClass === "Title" ? <div className="btn-group toolbar">
		    	<button disabled={level <= 1  ? "disabled" : ""} onClick={this.level.bind(this, "level-reduce")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-plus"></span></button>
		    	<button disabled={level >= 6 ? "disabled" : ""} onClick={this.level.bind(this, "level-increase")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-minus"></span></button>	
		    </div> : null;

	    var effect = this.props.effect || 'none';
		var shape = this.props.componentClass === "Image" ? <DropdownButton bsSize="xsmall" title="shape">
			          <MenuItem onSelect={this.effect.bind(this, "none")} eventKey="1" >none</MenuItem>
			          <MenuItem  divider />
			          <MenuItem onSelect={this.effect.bind(this, "circle")} eventKey="2" active="true" eventKey="2">circle</MenuItem>
			          <MenuItem divider />
			          <MenuItem onSelect={this.effect.bind(this, "rounded")}  eventKey="3">rounded</MenuItem>
			          <MenuItem divider />
			          <MenuItem onSelect={this.effect.bind(this, "thumbnail")}  eventKey="4">thumbnail</MenuItem>
			        </DropdownButton> : null;


	    var align = this.props.align || 'center';
		var calculateBtnClass = function(v, a){
		    return cx({
		    	'active' : v == a ? 'active' : '',
		    	'btn' : true,
		    	'btn-default' : true,
		    	'btn-xs' : true
		    })	
	    }
		var direction = <div className="btn-group toolbar">
					    <button onClick={this.align.bind(this, "left")} type="button" className={calculateBtnClass(align, 'left')}><span className="glyphicon glyphicon-align-left"></span></button>
					    <button onClick={this.align.bind(this, "center")} type="button" className={calculateBtnClass(align, 'center')}><span className="glyphicon glyphicon-align-center"></span></button>
					    <button onClick={this.align.bind(this, "right")} type="button" className={calculateBtnClass(align, 'right')}><span className="glyphicon glyphicon-align-right"></span></button>
					    <button onClick={this.align.bind(this, "justify")} type="button" className={calculateBtnClass(align, 'justify')}><span className="glyphicon glyphicon-align-justify"></span></button>
					</div>

	    return <ButtonGroup>
	        {direction}
			{size}
	        {shape}
		</ButtonGroup>
	}

});


var Block = React.createClass({
    remove : function(){
    	actions.removeComponent(this.props)
    	return false;
    },
    renderAvatar : function(){
    	var el = this.getDOMNode();
    	var style = {
    		width : el.offsetWidth,
    		height : el.offsetHeight
    	}

    	return <div style={style} ><i className="glyphicon glyphicon-arrow-down"></i>block</div>;
    },
    dragEnd : function(e, left, top, startX, startY){

  		var cansel = (Math.abs(left - startX)<25 &&
 			       	 Math.abs(top - startY) < 25)
		if (!cansel)
        	actions.drop(this.props);
        else{
        	stores.drag.set(false)
        	stores.dragHoverElementId.set(null);
        }
  	},
  	drag : function(x, y){
		var el = document.elementFromPoint(x-1, y-1 );

	    if (!el) return;

		actions.hoverElement(el.id);
  	},
  	mouseDown : function(){
  		actions.selectComponent(this.props.id);
  	},
  	dragStart : function(){
  		var selectedText = getSelectionText();
  		
  		if (selectedText) return false;
  		
  		actions.drag();
  	},
    render : function(){
    	var style = {}

	    if (this.props.componentClass === "Image" && (this.props.align == "left" || this.props.align == "right")){
	    	style = {
	    		float : this.props.align,
	    		clear : this.props.align,
	    		zIndex : 2000
	    	}

	    }

	    var toolbar = ComponentToolBar(this.props)
			       
		var removeBtn = <div onClick={this.remove} className="handler right">
            	<i className="glyphicon glyphicon-remove"></i>
            </div>
		


    	return <Draggable onMouseDown={this.mouseDown} onStart={this.dragStart} onDrag={this.drag} onEnd={this.dragEnd} avatar={this.renderAvatar}> 
    		<div 
	    		style={style} 	
	    		className={this.props.css} 
        	>
			{toolbar} {removeBtn}
			{this.props.children}
		</div>
		</Draggable>
    }
})

var c = {};

c['Title'] = React.createClass({
	mixins : [
		Reflux.connect(stores.drag, "drag")
	],
	getInitialState: function() {
		return {
			drag : false
		};
	},
	emitChange : function(){
		
		var props = this.props;
		props.text = this.getDOMNode().innerHTML;
		actions.updateComponent(props);
	},
	render : function(){
		var level = this.props.level || 1;
		var text = this.props.text || 'Title';
		var align = this.props.align || 'center';
		var Title = React.DOM['h' + level];
		return this.transferPropsTo(Title({ 
			onBlur : this.emitChange, 
			onInput : this.emitChange, 
			onChange : this.emitChange,
			contentEditable : !this.state.drag && !this.props.preview, 
			id : this.props.id ,
			onDragStart : this.none,
			draggable : false,
			style : {
				'text-align' : align
			}
		}, text));
	}
})

c['Image'] = React.createClass({
	none : function(e){ return false; },
	render : function(){
		var src = this.props.src || 'http://placehold.it/200x200';
		var align = this.props.align || "center";
		var effect = this.props.effect;

		var style = {}

		if (align == "center"){
			style = {
				margin : '0 auto'
			}
		}
		if (align == "left"){
			style = {
				float : 'left',
				clear : 'left'
			}
		}
		if (align == "right"){
			style = {
				float : 'right',
				clear : 'right'
			}
		}
		if (align == "justify"){
			style = {
				width : '100%'
			}
		}
		var css = cx({
			'img-responsive' : true,
			'img-rounded' : effect == "rounded",
			'img-circle' : effect == "circle",
			'img-thumbnail' : effect == "thumbnail"
		})
		return this.transferPropsTo(<img onDragStart={this.none} style={style} className={css} src={src}/>)
	}
})


c['Text'] = React.createClass({
	mixins : [
		Reflux.connect(stores.drag, "drag")
	],
	getInitialState: function() {
		return {
			drag : false
		};
	},
	emitChange : function(){
		var props = this.props;
		props.text = this.getDOMNode().innerHTML;
		actions.updateComponent(props);
	},
	render : function(){
		var text = this.props.text || lorem;
		

		return this.transferPropsTo(<p draggable={false} onDragStart={none} onBlur={this.emitChange} 
			onInput={this.emitChange}  contentEditable={!this.state.drag && !this.props.preview} id={this.props.id} >{text}</p>);
	}
})
var none = function(e){ return false; }

var getCelsWidth = function(rowNode){
	var widths = [];
    _.each(rowNode.childNodes, function(cellNode){
    	widths.push(cellNode.offsetWidth);
    })
    return widths;
}

var rowNode;
var Delemitor = React.createClass({
    onmousedown : function(e){
    	actions.drag();
    	var target = e.target;

    	if (target && target){
    	    rowNode = target.parentNode.parentNode; //save current row
	    } 
    },
    onmouseup : function(e, newLeft){
    	stores.drag.set(false)

    	if (newLeft){
	        var data = {
	        	cellIndex : this.props.index,
	        	row_id : this.props.row_id,
	        	newLeft : newLeft,
	        	widths : getCelsWidth(rowNode)
	        }
        	actions.recalculateCells(data);
		}
	},
    doubleClick : function(){
        var data = {
        	cellIndex : this.props.index,
        	row_id : this.props.row_id,
        	col_id : this.props.col_id,
        	widths : getCelsWidth(rowNode)
        }

    	actions.removeCell(data);

    	return false;
    },
 	render : function(){
 		return <Draggable axis="y" 
	 		mode="relative" 
	 		onEnd={this.onmouseup}
			onMouseDown={this.onmousedown}
			delay={1} >
 			<div  onDoubleClick={this.doubleClick} className="delemitor"></div>
 		</Draggable>
 	}
});


var Page = React.createClass({
	mixins : [
		Reflux.connect(stores.dragHoverElementId, "dragHoverElementId"),
		Reflux.connect(stores.selectedElementId, "selectedElementId"),
		Reflux.connect(stores.rows, "rows")
	],
	getInitialState: function() {
		return {
			dragHoverElementId : null,
			selectedElementId : null,
			rows : []
		};
	},
	render: function() {
		var dragHoverElementId = this.state.dragHoverElementId;
		var selectedElementId = this.state.selectedElementId;
		var preview = this.props.preview;

		var rows = this.state.rows.map(function(row){
			var row_id = row.id;
			var cols = row.content.map(function(col, i){
				var cellClasses = cx({ 'hover' : dragHoverElementId == col.id  });
				var components = col.content.map(function(component){
					var componentClasses = cx({ 
						'hover' : dragHoverElementId == component.id ,
						'component' : true ,
						'selected' : selectedElementId == component.id
					});

					var props = component.props;
					props.id = component.id;
					props.col_id = col.id;
					props.row_id = row_id;
					props.css = componentClasses;
					props.componentClass = component.componentClass;
					props.preview = preview;

					var element = c[component.componentClass](props);
					var blockWithElement = Block(props, element);

					return !this.props.preview ? blockWithElement : element;

				}.bind(this)) 

				var delemitor = !this.props.preview 
									? <Delemitor index={i} row_id={row_id} col_id={col.id} />
									: null;

				return <Col className={cellClasses} id={col.id} xs={col.props.xs}>
					{delemitor}{components}
				</Col>
			}.bind(this))
			return <Row>
				{cols}	
			</Row>
		}.bind(this))
		var addClassName = cx({
			'hover' : dragHoverElementId == 'add-row',
			'new-row' : true
		})

		//preview
		var addRow = !this.props.preview ?
					<Row className={addClassName} >
						<Col id={'add-row'} xs={12}>new row</Col>	
					</Row> : null;
		
		var ruler = !this.props.preview ?					
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
						</Row> : null;

		return <Grid  fluid={true} className={ !this.props.preview ? 'page text-center' : null }>
			{ruler}
			{rows}
			{addRow}
		</Grid>
	}

});

var App = React.createClass({
	getInitialState: function() {
		return {
			preview : false 
		};
	},
	preview : function(){
		this.setState({ preview : true })
		return false;
	},
	backToConstructor : function(){
		this.setState({ preview : false })
		return false;	
	},
	render: function() {
		var btn = !this.state.preview 
						? <a className="btn btn-success" onClick={this.preview}><i className="glyphicon glyphicon-fullscreen"></i> Preview</a>
						: <a className="btn btn-default" onClick={this.backToConstructor}><i className="glyphicon glyphicon-cog"></i> Back to constructor</a>
			
		var componentsPanel = !this.state.preview
						? 	<Col xs={2} style={{ position : 'static'}}>
								<h4>Blocks</h4>
								<ComponentIcon type="Title"/>
								<ComponentIcon type="Text"/>
								<ComponentIcon type="Image"/>
							</Col>
						: null;



		return (<div>
			<Grid  fluid={true}>
				<Row className="well">
					<Col xs={12}>{btn}</Col>
				</Row>								
				<Row>
					{componentsPanel}
					<Col xs={ !this.state.preview ? 10 : 12 }>
						<Page preview={this.state.preview}/>
					</Col>
				</Row>
			</Grid>

		</div>);
	}

});

module.exports = App;