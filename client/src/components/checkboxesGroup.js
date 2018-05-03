import React, { Component } from 'react';
import { FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText } from 'material-ui/Form';
import { Checkbox } from 'material-ui';
import _ from 'lodash';

class CheckboxesGroup extends Component {
  state = {};

  static getDerivedStateFromProps(nextProps, prevState){
    const { selectedOptions } = nextProps;

    if (selectedOptions !== undefined) {
      selectedOptions.forEach(o => {
        prevState[o.value] = true;
      });
    }

    return prevState;
  }

  getLabelByValue = (options, value) => {
    return _.find(options, { value }).label;
  }

  handleChange = name => event => {
    const { options } = this.props;
    const { target: { checked } } = event;

    const selectedValueLabels = _.map(
      _.pickBy( _.merge(this.state, { [name]: checked }), _.identity ),
      (value, key) => {
        return {
          value: key,
          label: this.getLabelByValue(options, key)
        };
      }
    );

    this.props.onSelect(selectedValueLabels);
    this.setState({ [name]: checked });
  };

  renderCheckboxes() {
    const { options, disabled } = this.props;

    return _.map(options, option => {
      return (
        <FormControlLabel key={option.value}
          control={
            <Checkbox
              onChange={this.handleChange(option.value)}
              value={option.value}
              disabled={disabled}
              checked={this.state[option.value]}
            />
          }
          label={option.label}
        />
      );
    });
  }

  render() {
    const { label, helperText, className } = this.props;

    return (
      <FormControl component="fieldset" className={className}>
        {label ? (
          <FormLabel component="legend">{label}</FormLabel>
        ) : null}
        <FormGroup row>
          {this.renderCheckboxes()}
        </FormGroup>
        {helperText ? (
          <FormHelperText>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
}

export default CheckboxesGroup;
