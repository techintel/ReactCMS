import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core';
import { VpnKey } from '@material-ui/icons';

import { renderTextField, slashDomain, toSlug, idNameToValueLabel, hasBeenText, capitalizeFirstLetter, getPermalink } from '../../../utils';
import { isUserCapable, getPostStatuses, documentTitle, onEditPost } from '../../../utils/reactcms';
import { addPost, editPost } from '../../../actions/addPosts';
import { deletePost, fetchPosts } from '../../../actions/fetchPosts';
import { openSnackbar } from '../../../actions/openSnackbar';
import _ from 'lodash';

import Loading from '../../../components/Loading';
import SelectField from '../../../components/Selections/SelectField';
import CheckboxGroup from '../../../components/Selections/CheckboxGroup';
import Autocomplete from '../../../components/Selections/Autocomplete';
import ReactCmsEditor from '../../../components/ReactCmsEditor';
import InstantTag from './InstantTag';

import { boxCardStyle, textFieldButtonStyle, textFieldStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...boxCardStyle(theme),
  ...textFieldButtonStyle(theme),
  ...textFieldStyle(theme),

  container: {
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    }
  },
  checkboxesGroup: {
    margin: -theme.spacing.unit,
  },
  textFieldSelect: {
    verticalAlign: 'bottom',
  },
});

function validate(values) {
  const { title, slug } = values;
  const errors = {};

  if ( !title )
    errors.title = 'Please enter some title.';
  if ( !slug || /[^\w-]+/g.test(slug) || /[A-Z]/.test(slug) )
    errors.slug = 'Must only contain dash, underscore and lowercase alphanumeric characters.';

  return errors;
}

class Post extends Component {
  constructor(props) {
    super(props);
    const { user, match } = props;
    const dirs = match.path.split('/');
    const type = dirs[ dirs.length-2 ].replace(/s$/, "");

    this.state = {
      type,
      content: null,
      status: 'draft',
      statuses: null,
      date: null,
      isDeleteEnabled: null,
      isPublishEnabled: isUserCapable('publish', type, user),
      postInitialized: false,
      categoriesInitialized: false,
      tagsInitialized: false,
      pagesInitialized: false,
    };
  }

  componentDidMount() {
    const { user, info: { collectionPrefix },
      match: { params: { _id } }
    } = this.props;
    const { type } = this.state;

    switch (type) {
      case 'post':
        this.props.fetchPosts( 'category', { collectionPrefix },
          () => this.setState({ categoriesInitialized: true })
        );
        this.props.fetchPosts( 'tag', { collectionPrefix },
          () => this.setState({ tagsInitialized: true })
        );
        break;

      case 'page':
        this.props.fetchPosts( 'page', { collectionPrefix },
          () => this.setState({ pagesInitialized: true })
        );
        break;

      default: break;
    }

    if (_id) {
      editPost( type, _id, post => {
        const { title, slug, content, status } = post;
        const init = { title, slug, status };
        const state = {
          content, status,
          statuses: getPostStatuses(type, user, post),
          isDeleteEnabled: isUserCapable('delete', type, user, post),
          postInitialized: true,
        };

        switch (type) {
          case 'post':
            init.categories = _.map(post.categories, o => o._id);
            init.tags = _.map(post.tags, o => o._id);
            state.date = post.date;
            break;

          case 'page':
            init.parent = post.parent ? post.parent : '';
            break;

          default: break;
        }

        this.props.initialize(init);
        this.setState(state);
        documentTitle('Edit post');
      });
    } else {
      const init = { status: this.state.status };
      const state = {
        statuses: getPostStatuses(type, user),
        postInitialized: true,
      };

      switch (type) {
        case 'page':
          init.parent = '';
          break;

        default: break;
      }

      this.props.initialize(init);
      this.setState(state);
      documentTitle('Add a new post');
    }
  }

  pushToList = type => {
    const { info: { domain } } = this.props;
    this.props.history.push(`${slashDomain(domain)}/admin/${type}s`);
  }

  onPublish(values, status, willRedirect = false) {
    const { type, content } = this.state;
    const { match: { params } } = this.props;
    let snackbarActionText;

    values.content = content;
    if ( status )
      values.status = status;
    if ( params._id )
      values._id = params._id;

    switch (values.status) {
      case 'draft':
        snackbarActionText = 'put to draft';
        break;

      case 'publish':
        snackbarActionText = 'published';
        break;

      case 'trash':
        snackbarActionText = 'put to bin';
        break;

      default: break;
    }

    return addPost( type, values, res => {
      if (res) {
        if (willRedirect) {
          this.pushToList(type);
        } else if (!params._id) {
          const { info: { domain } } = this.props;
          const { data } = res;
          onEditPost(type, data._id, domain, this.props.history);
        }

        this.props.openSnackbar(hasBeenText(type, values.title, snackbarActionText));
      }
    });
  }

  onPublishClick = values => {
    return this.onPublish(values, 'publish', true);
  }
  onSaveDraftClick = values => {
    return this.onPublish(values, 'draft');
  }
  onChangeStatusSubmit = values => {
    this.setState({ status: values.status });
    return this.onPublish(values);
  }

  onTitleChange(e) {
    this.props.change('slug', toSlug(e.target.value));
  }

  onEditorChange = content => this.setState({ content });

  onDeleteClick() {
    const { type, status } = this.state;
    const { title, match: { params: { _id } } } = this.props;

    this.props.deletePost( type, _id, () => {
      this.pushToList(type);

      const action = (status === 'trash') ? 'deleted' : 'put to bin';
      this.props.openSnackbar(hasBeenText(type, title, action));
    });
  }

  render() {
    const {
      categories, tags, pages, handleSubmit, pristine, submitting, invalid, classes,
      match: { params: { _id } },
      info: { domain }
    } = this.props;
    const {
      type, content, statuses, date, isDeleteEnabled, isPublishEnabled,
      postInitialized, categoriesInitialized, tagsInitialized, pagesInitialized
    } = this.state;
    const isDraftPublishDisabled = (_id === undefined ? pristine : false) || submitting || invalid;

    return !postInitialized ||
    ( type === 'post' && ( !categoriesInitialized || !tagsInitialized ) ) ||
    ( type === 'page' && !pagesInitialized ) ? <Loading /> : (
      <Grid container className={classes.container}>
        <Grid item md={8}>

          <form>
            <Field
              name="title"
              component={renderTextField}
              label={`${capitalizeFirstLetter(type)} title`}
              className={classes.textField}
              fullWidth
              required
              onChange={this.onTitleChange.bind(this)}
            />
            <Field
              name="slug"
              component={renderTextField}
              label="Slug"
              startAdornment={getPermalink( domain, type, { date } )}
              className={classes.textField}
              fullWidth
              required
            />
            <ReactCmsEditor content={content} onChange={this.onEditorChange} />
          </form>

        </Grid>
        <Grid item md={4}>

          <Card className={classes.boxCard}>
            <CardHeader subheader="Publish" className={classes.boxCardHeader} />
            <CardContent>
              <Field
                name="status"
                component={SelectField}
                label="Status"
                icon={<VpnKey />}
                options={statuses}
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
                fullWidth
                onClick={this.onDeleteClick.bind(this)}
              >
                Delete
              </Button>
              <Button
                type="submit"
                disabled={!isPublishEnabled || isDraftPublishDisabled}
                variant="contained"
                size="large"
                color="primary"
                fullWidth
                onClick={handleSubmit(this.onPublishClick)}
              >
                Publish
              </Button>
            </CardActions>
          </Card>

          { type === 'post' ? (
            <div>
              <Card className={classes.boxCard}>
                <CardHeader subheader="Categories" className={classes.boxCardHeader} />
                <CardContent>
                  <Field
                    name="categories"
                    component={CheckboxGroup}
                    options={idNameToValueLabel(categories)}
                    className={classes.checkboxesGroup}
                  />
                </CardContent>
                <CardActions>
                  <InstantTag type="category" />
                </CardActions>
              </Card>
              <Card className={classes.boxCard}>
                <CardHeader subheader="Tags" className={classes.boxCardHeader} />
                <CardContent>
                  <Field
                    name="tags"
                    component={Autocomplete}
                    options={idNameToValueLabel(tags)}
                  />
                </CardContent>
                <CardActions>
                  <InstantTag type="tag" />
                </CardActions>
              </Card>
            </div>
          ) : ( // type !== 'post'
            <Card className={classes.boxCard}>
              <CardHeader subheader="Page Attributes" className={classes.boxCardHeader} />
              <CardContent>
                <Field
                  name="parent"
                  component={SelectField}
                  label="Parent"
                  options={[{
                    value: '',
                    label: '(no parent)'
                  }, ..._.map( _.omit(pages, _id), o => {
                    return { value: o._id, label: o.title };
                  } )]}
                  fullWidth
                />
              </CardContent>
            </Card>
          )}

        </Grid>
      </Grid>
    );
  }
}

Post.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,

  info: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  title: PropTypes.string,
  deletePost: PropTypes.func.isRequired,
  fetchPosts: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

const selector = formValueSelector('Post');
function mapStateToProps(state) {
  const { info, categories, tags, pages, auth: { user } } = state;
  const title = selector(state, 'title');

  return { info, user, categories, tags, pages, title };
}

export default reduxForm({
  form: 'Post',
  validate
})(
  connect(mapStateToProps, { deletePost, fetchPosts, openSnackbar })(
    withStyles(styles)(Post)
  )
);
