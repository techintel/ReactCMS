import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { renderTextField, slashDomain, toSlug, idNameToValueLabel, hasBeenText, newCreatedText, getPermalink } from '../../../utils';
import { addPost, editPost } from '../../../actions/addPosts';
import { addStateValues, fetchPosts } from '../../../actions/fetchPosts';
import { openSnackbar } from '../../../actions/openSnackbar';
import { omit } from 'lodash';

import Loading from '../../../components/Loading';
import SelectField from '../../../components/Selections/SelectField';

import { textFieldStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...textFieldStyle(theme),
});

function validate(values) {
  const { name } = values;
  const errors = {};

  if ( !name || !name.match(/[a-z]/i) )
    errors.name = 'Please enter some name.';

  return errors;
}

class Tag extends Component {
  state = {
    tagInitialized: false,
    categoriesInitialized: false
  };

  componentDidMount() {
    const { type, match } = this.props;
    const _id = match ? match.params._id : null;

    if ( type === 'category' ) {
      const { info: { collectionPrefix } } = this.props;
      this.props.fetchPosts( type, { collectionPrefix },
        () => this.setState({ categoriesInitialized: true })
      );
    }

    // Fetch existing tag
    if (_id) {
      editPost( type, _id, tag => {
        const { name, slug, description } = tag;
        const init = { name, slug, description };

        if (type === 'category')
          init.parent = tag.parent ? tag.parent : '';

        this.props.initialize(init);
        this.setState({ tagInitialized: true });
      });
    } else { // Add new
      const init = {};

      if (type === 'category')
        init.parent = '';

      this.props.initialize(init);
      this.setState({ tagInitialized: true });
    }
  }

  onSubmit = values => {
    const { type, history, match, info: { domain } } = this.props;
    values._id = match ? match.params._id : null;

    return addPost( type, values, res => {
      if (res) {
        const text = values._id
          ? hasBeenText(type, values.name, 'updated')
          : newCreatedText(type, values.name);

        this.props.openSnackbar(text);
        this.props.addStateValues( type, res );

        if (history)
          history.push(`${slashDomain(domain)}/admin/posts/${type === 'category' ? 'categorie' : type}s`);
        else
          this.props.reset();
      }
    });
  }

  onNameChange(e) {
    this.props.change('slug', toSlug(e.target.value));
  }

  render() {
    const {
      type, categories, match, handleSubmit, pristine, submitting, invalid, classes,
      info: { domain }
    } = this.props;
    const _id = match ? match.params._id : null;
    const { tagInitialized, categoriesInitialized } = this.state;

    return !tagInitialized || ( type === 'category' && !categoriesInitialized ) ? <Loading /> : (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Field
          name="name"
          component={renderTextField}
          label="Name"
          className={classes.textField}
          fullWidth
          required
          onChange={this.onNameChange.bind(this)}
        />
        <Field
          name="slug"
          component={renderTextField}
          label="Slug"
          startAdornment={getPermalink(domain, type, null)}
          className={classes.textField}
          fullWidth
          required
        />
        <Field
          name="description"
          component={renderTextField}
          label="Description"
          multiline
          rows={4}
          className={classes.textField}
          fullWidth
        />
        {type === 'category' && <Field
          name="parent"
          component={SelectField}
          label="Parent"
          options={[{
            value: '',
            label: '(no parent)'
          }, ...idNameToValueLabel(omit(categories, _id)) ]}
          className={classes.textField}
          fullWidth
        />}
        <Button
          type="submit"
          disabled={pristine || submitting || invalid }
          variant="raised"
          size="large"
          color="primary"
        >
          {_id ? 'Update' : 'Add New'} {type}
        </Button>
      </form>
    );
  }
}

Tag.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  match: PropTypes.object,
  history: PropTypes.object,

  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,

  categories: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  openSnackbar: PropTypes.func.isRequired,
  addStateValues: PropTypes.func.isRequired,
  fetchPosts: PropTypes.func.isRequired,
};

function mapStateToProps({ categories, info }) {
  return { categories, info };
}

export default reduxForm({
  form: 'Tag',
  validate
})(
  connect(mapStateToProps, { openSnackbar, addStateValues, fetchPosts })(
    withStyles(styles)(Tag)
  )
);
