import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import { Grid, Button } from 'material-ui';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import { Public, VpnKey } from '@material-ui/icons';

import {
  renderComposedTextField, renderTextField, toSlug, slugNameToValueLabel, valueLabelToSlugName,
  POST_STATUSES
} from '../../../utils';
import { isUserCapable, renderSelectField } from '../../../utils/reactcms';
import NewCategory from './newCategory';
import { publishPost, editPost } from '../../../actions/publishPosts';
import { deletePost } from '../../../actions/fetchPosts';

import CheckboxesGroup from '../../../components/checkboxesGroup';
import ReactCmsEditor from '../../../components/reactcmsEditor';
import Loading from '../../../components/loading';

import { boxCardStyle, textFieldButtonStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...boxCardStyle(theme),
  ...textFieldButtonStyle(theme),

  container: {
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    }
  },
  textField: {
    padding: theme.spacing.unit,
  },
  checkboxesGroup: {
    margin: -theme.spacing.unit,
  },
  button: {
    textTransform: 'none',
  },
  textFieldSelect: {
    verticalAlign: 'bottom',
  },
});

class Post extends Component {
  constructor(props) {
    super(props);
    const { site } = props;

    this.state = {
      content: null,
      availableCategories: site.categories,
      selectedCategories: null,
      status: 'draft',
      isDeleteEnabled: null,
      isSubmitting: false,
      isInitialized: false,
    };
  }

  componentDidMount() {
    const {
      site, auth,
      match: { params: { _id } }
    } = this.props;

    document.title = `Add a new post - ${site.title}`;

    if (_id !== undefined) {
      editPost(_id, (
        { title, slug, content, categories, author, status }
      ) => {
        this.props.initialize({
          title, slug, status
        });

        const isDeleteEnabled = isUserCapable('deletePost', auth, author);

        this.setState({
          content,
          selectedCategories: categories,
          status,
          isDeleteEnabled,
          isInitialized: true,
        });
      });
    } else {
      this.props.initialize({ status: this.state.status }); // Select component's `value` with `native=false` (default) is required.
      this.setState({ isInitialized: true });
    }
  }

  onCategoriesSelect = selectedValueLabels => {
    this.setState({ selectedCategories: valueLabelToSlugName(selectedValueLabels) });
  }

  historyPushPosts() {
    const { info: { domain } } = this.props;
    this.props.history.push(`${domain ? '/' : ''}${domain}/admin/posts`);
  }

  onPublish(formData, status) {
    this.setState({ isSubmitting: true });

    formData.content = this.state.content;
    formData.categories = this.state.selectedCategories;
    if ( status ) formData.status = status;

    if (this.props.match.params._id !== undefined) {
      formData._id = this.props.match.params._id;
    }

    return publishPost(formData, isSucceed => {
      if (isSucceed) {
        this.historyPushPosts();
      } else {
        this.setState({ isSubmitting: false });
      }
    });
  }

  onPublishClick = formData => {
    return this.onPublish(formData, 'publish');
  }

  onSaveDraftClick = formData => {
    return this.onPublish(formData, 'draft');
  }

  onChangeStatusSubmit = formData => {
    return this.onPublish(formData);
  }

  onTitleChange(e) {
    this.props.change('slug', toSlug(e.target.value));
  }

  onEditorChange = content => {
    this.setState({ content });
  }

  onCategoryCreate = (addedCategory, availableCategories) => {
    availableCategories.push(addedCategory);
    this.setState({ availableCategories });
  }

  onDeleteClick() {
    const { _id } = this.props.match.params;
    this.props.deletePost(_id, () => this.historyPushPosts());
  }

  render () {
    const {
      handleSubmit, pristine, submitting, invalid, classes,
      match: { params: { _id } }
    } = this.props;
    const { content, availableCategories, selectedCategories, isDeleteEnabled, isSubmitting, isInitialized } = this.state;
    const isDraftPublishDisabled = (_id === undefined ? pristine : false) || submitting || invalid;

    return !isInitialized ? <Loading /> : (
      <Grid container className={classes.container}>
        <Grid item md={8}>

          <form>
            <Field
              name="title"
              component={renderComposedTextField}
              label="Post title"
              className={classes.textField}
              fullWidth
              required
              onChange={this.onTitleChange.bind(this)}
            />
            <Field
              name="slug"
              component={renderTextField}
              label="Slug"
              Icon={Public}
              className={classes.textField}
              fullWidth
              required
            />
            <ReactCmsEditor
              content={content}
              onChange={this.onEditorChange}
            />
          </form>

        </Grid>
        <Grid item md={4}>

          <Card className={classes.boxCard}>
            <CardHeader subheader="Categories" className={classes.boxCardHeader} />
            <CardContent>
              <CheckboxesGroup
                name="categories"
                options={slugNameToValueLabel(availableCategories)}
                selectedOptions={slugNameToValueLabel(selectedCategories)}
                className={classes.checkboxesGroup}
                onSelect={this.onCategoriesSelect}
                disabled={isSubmitting}
              />
            </CardContent>
            <CardActions>
              <NewCategory onCreate={addedCategory => this.onCategoryCreate(addedCategory, availableCategories)} />
            </CardActions>
          </Card>

          <Card className={classes.boxCard}>
            <CardHeader subheader="Publish" className={classes.boxCardHeader} />
            <CardContent>
              <Field
                name="status"
                component={renderSelectField}
                label="Status"
                Icon={VpnKey}
                options={POST_STATUSES}
                className={classNames(classes.groupTextField, classes.textFieldSelect)}
                fullWidth
                onChange={() => setTimeout(handleSubmit(params => this.onChangeStatusSubmit(params)))}
              />
              <Button
                type="submit"
                disabled={isDraftPublishDisabled}
                className={classes.groupButton}
                fullWidth
                onClick={handleSubmit(this.onSaveDraftClick)}
              >
                Save Draft
              </Button>
            </CardContent>
            <CardActions>
              <Button
                disabled={submitting || !isDeleteEnabled}
                color="secondary"
                className={classes.button}
                fullWidth
                onClick={this.onDeleteClick.bind(this)}
              >
                Delete
              </Button>
              <Button
                type="submit"
                disabled={isDraftPublishDisabled}
                variant="raised"
                size="large"
                color="primary"
                className={classes.button}
                fullWidth
                onClick={handleSubmit(this.onPublishClick)}
              >
                Publish
              </Button>
            </CardActions>
          </Card>

        </Grid>
      </Grid>
    );
  }
}

function validate(values) {
  const { title, slug } = values;
  const errors = {};

  if (!title) {
    errors.title = 'Please enter some title.';
  }
  if (
    !slug ||
    /[^\w-]+/g.test(slug) ||
    /[A-Z]/.test(slug)
  ) {
    errors.slug = 'Must only contain dash, underscore and lowercase alphanumeric characters.';
  }

  return errors;
}

function mapStateToProps({ auth, info, sites }) {
  return {
    auth, info,
    site: sites[info.domain]
  };
}

export default reduxForm({
  form: 'post',
  validate
})(
  connect(mapStateToProps, { deletePost })(
    withStyles(styles)(Post)
  )
);
