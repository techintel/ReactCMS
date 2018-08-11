import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { renderTextField, slashDomain, toSlug, idNameToValueLabel, hasBeenText, newCreatedText } from '../../../utils';
import { SERVER_ROOT_URL } from '../../../config';
import { addPost, editPost } from '../../../actions/addPosts';
import { addStateValues, fetchPosts } from '../../../actions/fetchPosts';
import { openSnackbar } from '../../../actions/openSnackbar';
import { omit } from 'lodash';

import Loading from '../../../components/Loading';
import SelectField from '../../../components/Selections/SelectField';

import { textFieldStyle } from '../../../assets/jss/styles';

function validate(values) {
  const { name } = values;
  const errors = {};

  if ( !name || !name.match(/[a-z]/i) )
    errors.name = 'Please enter some name.';

  return errors;
}

const styles = theme => ({
  ...textFieldStyle(theme),
});

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
          init.parent = tag.parent ? tag.parent : 0;

        this.props.initialize(init);
        this.setState({ tagInitialized: true });
      });
    } else { // Add new
      const init = {};

      if (type === 'category')
        init.parent = 0;

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
          history.push(`${slashDomain(domain)}/admin/${type === 'category' ? 'categorie' : type}s`);
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
          startAdornment={`${SERVER_ROOT_URL}${slashDomain(domain)}/blog/${type}/`}
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
            value: 0,
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
