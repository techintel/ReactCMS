import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { renderComposedTextField } from '../../../utils';
import { withStyles } from 'material-ui/styles';
import { Button, Input, Snackbar } from 'material-ui';
import { MANAGE_CATEGORIES } from '../../capabilities';
import { includes } from 'lodash';
import { addCategory } from '../../../actions/manageCategories';

import { textFieldButtonStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...textFieldButtonStyle(theme),

  root: {
    width: '100%',
  },
});

class NewCategory extends Component {
  state = {
    openSnackbar: false,
    vertical: null,
    horizontal: null,
    submittedName: null
  };

  componentWillMount() {
    const { info } = this.props;

    this.props.initialize({
      domain: info.domain
    });
  }

  handleOpen = state => {
    this.setState({ openSnackbar: true, ...state });
  };

  handleClose = () => {
    this.setState({ openSnackbar: false });
  };

  onSubmit(formData) {
    return addCategory(formData, addedCategory => {
      this.handleOpen({
        vertical: 'bottom',
        horizontal: 'right',
        submittedName: formData.name
      });
      this.props.onCreate(addedCategory);

      this.props.reset();
    });
  }

  render () {
    const { user } = this.props;

    if ( !includes(MANAGE_CATEGORIES, user.role) )
      return null;

    const { handleSubmit, pristine, submitting, invalid, classes } = this.props;
    const { vertical, horizontal, openSnackbar, submittedName } = this.state;

    return (
      <div className={classes.root}>
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>

          <Field name="domain" type="hidden" component={Input} />
          <Field
            name="name"
            component={renderComposedTextField}
            label="Enter New Category"
            className={classes.groupTextField}
            fullWidth
          />
          <Button
            type="submit"
            disabled={pristine || submitting || invalid}
            variant="raised"
            size="medium"
            color="default"
            className={classes.groupButton}
            fullWidth
          >
            Add New
          </Button>
        </form>

        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={openSnackbar}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">New category named "{submittedName}" is created</span>}
        />

      </div>
    );
  }
}

function mapStateToProps({ info, auth }) {
  return {
    info,
    user: auth.user
  };
}

export default reduxForm({
  form: 'newCategory'
})(
  connect(mapStateToProps)(
    withStyles(styles)(NewCategory)
  )
);
