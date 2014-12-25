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

var r = React.DOM;
 
var ComponentIcon = React.createClass({
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
    		left : this.state.startX ,
    		top : this.state.startY,
    		dragging : false 
    	})
        document.body.removeEventListener('mousemove', this.moveAt);
        actions.drop(this.props.type);
    },
    moveAt : function(e){

    	//TODO: fix magix 94

        var x = e.pageX - this.state.shiftX ;
	 	var y = e.pageY - this.state.shiftY - 94 ;
	 	
	 	this.setState({
            left : x + 'px',
            top : y  +'px'
        })
	 	
	 	var el = document.elementFromPoint(x-1, y-1 + 94);

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

var avatar = document.createElement("div");
avatar.id = "avatar";

var Block = React.createClass({
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
            shiftY : e.pageY - coords.top ,
            dragging : true,

            startX : coords.left,
            startY : coords.top,

            left : coords.left,
            top : coords.top
        })
        document.body.addEventListener('mousemove', this.moveAt);
        document.body.addEventListener('mouseup', this.onmouseup); 
        avatar.style.left = coords.left + 'px';
        avatar.style.top = coords.top + 'px';
        //i => div => component
        avatar.style.width = e.target.parentNode.parentNode.offsetWidth + 'px';
        avatar.style.height = e.target.parentNode.parentNode.offsetHeight + 'px';
        avatar.innerHTML =  '<i class="glyphicon glyphicon-arrow-down"></>block';

        document.body.appendChild(avatar)

        actions.drag();

    },
    onmouseup : function(e){
    	document.body.removeChild(avatar);

        document.body.removeEventListener('mousemove', this.moveAt);
        document.body.removeEventListener('mouseup', this.onmouseup);

    	console.log(this.state);

		var cansel = (Math.abs(this.state.left - this.state.startX)<25 &&
 			       	 Math.abs(this.state.top - this.state.startY) < 25)
        	
        

    	this.setState({ 
    		left : this.state.startX,
    		top : this.state.startY,
    		dragging : false 
    	})

  //   	if (Math.abs(this.state.x - e.pageX) < 25 && Math.abs(this.state.y)<25){
		// 	return;
		// }


		if (!cansel)
        	actions.drop(this.props);
        else
        	stores.dragHoverElementId.set(null);
    },
    moveAt : function(e){

	 	var x = e.pageX - this.state.shiftX ;
	 	var y = e.pageY - this.state.shiftY;
		
		this.setState({
			left : x,
			top : y
		})
		// console.log(this.state);
		// console.log(e);

		// if (Math.abs(this.state.x - e.pageX) < 25 && Math.abs(this.state.y)<25){
		// 	return;
		// }

		//move avatar
	  	avatar.style.left = x + 'px';
        avatar.style.top = y +'px';
	 	
	 	var el = document.elementFromPoint(x - 1, y - 1);

	   window.console.log(el);

	   	if (!el) return;

	   actions.hoverElement(el.id);

    },
    none : function(e){ return false; },
    align : function(value){
    	if (value == "level-reduce" || value == "level-increase"){
	    	var delte = value == "level-reduce" ? -1 : 1;

	    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	level : (this.props.level || 1) + delte
	        }
	    	actions.updateComponent(data);	
    	} else {
	    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	style : { 'text-align' : value },
	        	align : value
	        }
	    	actions.updateComponent(data);	
    	}
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
    remove : function(){
    	actions.removeComponent(this.props)
    	return false;
    },
    blockClick : function(){
    	actions.selectComponent(this.props.id);
    },
    render : function(){
    	var style = {
	         display : this.state.dragging ? 'none' : 'block',// hide component, move block avatar
	    }
	    
	    if (this.props.componentClass === "Image" && (this.props.align == "left" || this.props.align == "right")){
	    	style = {
	    		float : this.props.align,
	    		zIndex : 2000
	    	}
	    }

	    var size = null;
	    if (this.props.componentClass === "Title" ){
	    	var level = this.props.level || 1;

	    	size = [
		    	<button disabled={level <= 1  ? "disabled" : ""} onClick={this.align.bind(this, "level-reduce")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-plus"></span></button>,
		    	<button disabled={level >= 6 ? "disabled" : ""} onClick={this.align.bind(this, "level-increase")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-minus"></span></button>	
		    ] 
	    }  

	    var self = this;
	    var align = this.props.align || 'center';
	    var effect = this.props.effect || 'none';
	    var calculateBtnClass = function(v, a){
		    return cx({
		    	'active' : v == a ? 'active' : '',
		    	'btn' : true,
		    	'btn-default' : true,
		    	'btn-xs' : true
		    })	
	    }
	    

	    var toolbar = <div className="btn-group toolbar">
			    <button onClick={this.align.bind(this, "left")} type="button" className={calculateBtnClass(align, 'left')}><span className="glyphicon glyphicon-align-left"></span></button>
			    <button onClick={this.align.bind(this, "center")} type="button" className={calculateBtnClass(align, 'center')}><span className="glyphicon glyphicon-align-center"></span></button>
			    <button onClick={this.align.bind(this, "right")} type="button" className={calculateBtnClass(align, 'right')}><span className="glyphicon glyphicon-align-right"></span></button>
			    <button onClick={this.align.bind(this, "justify")} type="button" className={calculateBtnClass(align, 'justify')}><span className="glyphicon glyphicon-align-justify"></span></button>
				{size}
			</div>

		var secondToolBar = this.props.componentClass === "Image" ? <div className="btn-group toolbar toolbar2">
			    <button onClick={this.effect.bind(this, "none")} type="button" className={calculateBtnClass(effect, 'none')}>none</button>
			    <button onClick={this.effect.bind(this, "circle")} type="button" className={calculateBtnClass(effect, 'circle')}>circle</button>
			    <button onClick={this.effect.bind(this, "rounded")} type="button" className={calculateBtnClass(effect, 'rounded')}>rounded</button>
			    <button onClick={this.effect.bind(this, "thumbnail")} type="button" className={calculateBtnClass(effect, 'thumbnail')}>thumbnail</button>
				{size}
			</div> : null;

    	return <div 
    		style={style}
    		
            className={this.props.css} onClick={this.blockClick}>
            <div onDragStart={this.none}
            onMouseUp={this.onmouseup}
            onMouseDown={this.onmousedown}  className="handler left"><i className="glyphicon glyphicon-arrow-up"></i>
            </div>
            <div onClick={this.remove} className="handler right">
            	<i className="glyphicon glyphicon-remove"></i>
            </div>
			{toolbar}
			{secondToolBar}
			{this.props.children}
		</div>
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
			contentEditable : !this.state.drag , 
			id : this.props.id ,
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
				float : 'left'
			}
		}
		if (align == "right"){
			style = {
				float : 'right'
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
		

		return this.transferPropsTo(<p onBlur={this.emitChange} 
			onInput={this.emitChange}  contentEditable={!this.state.drag} id={this.props.id} >{text}</p>);
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
						? 	<Col xs={2}>
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