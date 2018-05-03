import React, { Component } from 'react';
import { TextField } from 'material-ui';
import { MenuItem } from 'material-ui/Menu';
import { InputAdornment } from 'material-ui/Input';

class SelectField extends Component {
  constructor(props) {
    super(props);
    const { input, value } = props;

    this.state = {
      selected: input.value ? input.value : value
    };
  }

  handleChange = event => {
    const targetVal = event.target.value;
    const { input, onChange } = this.props;

    this.setState({
      selected: targetVal
    });

    if ( input ) input.onChange(targetVal);
    if (onChange) onChange(); // Can be used as callback
  };

  render () {
    const { label, Icon, options, className, fullWidth, disabled } = this.props;

    return (
      <TextField
        select
        label={label}
        value={this.state.selected}
        onChange={this.handleChange}
        InputProps={{
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon />
            </InputAdornment>
          ) : null
        }}
        className={className}
        fullWidth={fullWidth}
        disabled={disabled}
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

export default SelectField;
