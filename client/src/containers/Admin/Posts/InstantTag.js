import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { isUserCapable } from '../../../utils/reactcms';
import { renderTextField, newCreatedText } from '../../../utils';
import { addPost } from '../../../actions/addPosts';
import { addStateValues } from '../../../actions/fetchPosts';
import { openSnackbar } from '../../../actions/openSnackbar';

import { textFieldButtonStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...textFieldButtonStyle(theme),

  root: {
    width: '100%',
  },
});

class InstantTag extends Component {
  onSubmit(values) {
    const { type } = this.props;

    return addPost( type, values, res => {
      if (res) {
        this.props.openSnackbar(newCreatedText(type, values.name));
        this.props.addStateValues( type, res );
        this.props.reset();
      }
    });
  }

  render() {
    if ( !isUserCapable('manage', 'category', this.props.user) )
      return null;

    const { type, handleSubmit, pristine, submitting, invalid, classes } = this.props;

    return (
      <div className={classes.root}>
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field
            name="name"
            component={renderTextField}
            label={`Enter new ${type}`}
            className={classes.groupTextField}
            fullWidth
          />
          <Button
            type="submit"
            disabled={pristine || submitting || invalid}
            variant="raised"
            size="medium"
            className={classes.groupButton}
            fullWidth
          >
            Add New
          </Button>
        </form>
      </div>
    );
  }
}

InstantTag.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

function mapStateToProps({ auth: { user } }) {
  return { user };
}

export default reduxForm({
  form: 'InstantTag'
})(
  connect(mapStateToProps, { openSnackbar, addStateValues })(
    withStyles(styles)(InstantTag)
  )
);
