import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField, MenuItem, InputAdornment } from '@material-ui/core';

class SelectField extends Component {
  state = { selected: null };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { input, value } = nextProps;

    prevState.selected = input ? input.value : value;
    return prevState;
  }

  handleChange = event => {
    const targetVal = event.target.value;
    const { input, onChange } = this.props;

    this.setState({ selected: targetVal });

    if ( input ) input.onChange(targetVal);
    if (onChange) onChange(); // Can be used as callback
  };

  render() {
    const {
      label, icon, options, className, fullWidth,
      meta: { submitting, error }
    } = this.props;

    return (
      <TextField
        select
        label={label}
        value={this.state.selected}
        onChange={this.handleChange}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ) : null
        }}
        className={className}
        fullWidth={fullWidth}
        disabled={submitting}
        error={error !== undefined}
        helperText={error}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
}

SelectField.propTypes = {
  input: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,

  label: PropTypes.string,
  icon: PropTypes.element,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default SelectField;
