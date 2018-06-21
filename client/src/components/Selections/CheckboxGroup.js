import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText, Checkbox } from '@material-ui/core';
import _ from 'lodash';

class CheckboxGroup extends Component {
  constructor(props) {
    super(props);
    const { input } = props;
    const state = {};

    if (input.value !== "")
      input.value.forEach(val => state[val] = true);

    this.state = state;
  }

  handleChange = name => event => {
    const { input } = this.props;
    const { target: { checked } } = event;
    const newStateProp = { [name]: checked };

    const selectedValueLabels = _.map(
      _.pickBy(
        _.merge(this.state, newStateProp), _.identity
      ),
      (value, key) => key
    );

    this.setState(newStateProp);
    return input.onChange(selectedValueLabels);
  };

  renderCheckboxes() {
    const { options, meta: { submitting } } = this.props;

    return _.map(options, option => {
      return (
        <FormControlLabel key={option.value}
          control={
            <Checkbox
              onChange={this.handleChange(option.value)}
              value={option.value}
              disabled={submitting}
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
        {label && (
          <FormLabel component="legend">{label}</FormLabel>
        )}
        <FormGroup row>
          {this.renderCheckboxes()}
        </FormGroup>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
}

CheckboxGroup.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  options: PropTypes.array,
  label: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default CheckboxGroup;
