import React, { Component } from 'react';
import Dygraph from 'dygraphs';
import data from '../sample-data.json';
import config from '../sample-config.json';
import './chart.css';

class Chart extends Component {
	constructor(props) {
    	super(props);
    	this.state = {
    		id: 'div_g', 
    		data: data,
    		config: config
    	};
	}

	componentDidMount() {
		var pressureData = this.recurParseData(this.state.data, {});
		this.graph(this.state.id, this.state.config, pressureData);
	}

	recurParseData(_data, _current) {
		for(var i in _data) {
			if(Array.isArray(_data[i])){
				this.recurParseData(_data[i], _current);
			}

			if(Date.parse(_data[i])){
				_data[i] = this.convertToDate(_data[i]);
			}else {
				this.updatePressureData(_data[i], _data[i-1], _current);
			}
		}

		return _current;
	}

	updatePressureData(_value, _date, _current) {
		var headLoss = 5;
		var pressureData = {
			value: _value,
			date: _date
		}

		if(Object.keys(_current).length < 1) {
			_current = Object.assign(_current, pressureData);
		}			

		var val = (_current.isFound) ? _current.initialData : _current.value;
		var difference = this.findAbsValue(val, _value);

		if(difference > headLoss) {
			if(!_current.isFound) {
				pressureData['isFound'] = true;
				pressureData['initialData'] = _current.value;
				_current = Object.assign(_current, pressureData);
			}

			if(_value < _current.value){
				_current = Object.assign(_current, pressureData);
			}
		}
	}

	findAbsValue(_valueA, _valueB) {
		return Math.abs(_valueA - _valueB);
	}

	convertToDate(_data) {
		return new Date (_data);
	}

  	graph(_id, _config, _pressureDate) {
  		var highlight_start = this.getHighlightStartDate(_pressureDate.date);
  		var highlight_end = _pressureDate.date;

  		const defaultConfig = {
        	height: 500,
        	legend: "always",
        	underlayCallback: function(canvas, area, g) {
				var bottom_left = g.toDomCoords(highlight_start);
				var top_right = g.toDomCoords(highlight_end);

				var left = bottom_left[0];
				var right = top_right[0];

				canvas.fillStyle = "rgb(255, 165, 0)";
				canvas.fillRect(left, area.y, right - left, area.h);
            }
  		}

  		const newConfig = Object.assign(defaultConfig, _config);

		new Dygraph(
			_id,
			data,
			newConfig
		);
	}

	getHighlightStartDate(_date) {
  		var t = new Date(_date);
		t.setSeconds(t.getSeconds() - 16);

		return t;
	}

  	render() {
	    return (
	    	<div id={this.state.id}></div>
	    );
  	}
}

export default Chart;