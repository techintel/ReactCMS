import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { TextField, InputAdornment, Paper, List, ListItem, Typography } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import _ from 'lodash';
import { fetchPosts } from '../../../actions/fetchPosts';
import { getPermalink } from '../../../utils';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.primary.light,
    position: 'relative',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,

    width: 180,
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  textFieldFocus: {
    width: 250,
  },
  result: {
    position: 'absolute',
    right: 0,
    marginTop: theme.spacing.unit,
    maxHeight: '89vh',
    overflowY: 'auto',

    [theme.breakpoints.down('xs')]: {
      marginRight: '-10vw',
      width: '80vw',
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: '-3vw',
      width: '45vw',
    },
  },
  listItem: {
    display: 'block',

    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
  },
  title: {
    paddingRight: theme.spacing.unit,
    fontWeight: 500,
  },
  foundWords: {
    maxHeight: 60,
    overflowY: 'auto',
    overflowX: 'hidden',

    '& > span': {
      paddingRight: theme.spacing.unit,
    },
  },
  noResult: {
    margin: theme.spacing.unit,
  },
});

class Search extends Component {
  state = {
    search: '',
    isFetched: false,
    showResults: false,
    isFocused: false,
  };

  insertPostsType = (collection, value) => _.map( collection,
    post => { return { ...post, type: value }; }
  );

  handleFocus = () => {
    let state = { isFocused: true };

    if ( !this.state.isFetched ) {
      const { collectionPrefix } = this.props.info;

      ['post', 'category', 'tag', 'page'].forEach( type => {
        this.props.fetchPosts(type, { collectionPrefix });
      } );
      state.isFetched = true;
    }

    if ( this.state.search ) state.showResults = true;
    this.setState(state);
  }

  handleBlur = () => { this.setState({ isFocused: false }); }
  handleChange = name => event => { this.setState({ [name]: event.target.value }); }
  handleKeyUp = () => event => { this.setState({ showResults: (event.keyCode === 27) ? false : this.state.search ? true : false }); }
  handleClick = () => { this.setState({ showResults: false }); }

  render() {
    const { classes, info: { domain } } = this.props;
    const { search, showResults, isFocused } = this.state;
    let { posts, categories, tags, pages } = this.props;

    // Remove "<", ">" and other symbols.
    let keywords = search.replace(/[^\w\s]/gi, '').split(" ");

    // Remove empty value and "u" from the array.
    let temp = [];
    for (let i of keywords) i && (i !== 'u') && temp.push(i);
    keywords = temp;

    posts      = this.insertPostsType(posts, 'post');
    categories = this.insertPostsType(categories, 'category');
    tags       = this.insertPostsType(tags, 'tag');
    pages      = this.insertPostsType(pages, 'page');

    const mergedPosts = [ ...posts, ...categories, ...tags, ...pages ];
    let results = [];

    mergedPosts.forEach( post => {
      delete post.status;

      switch (post.type) {
        case 'post':
          delete post.categories;
          delete post.tags;
          break;

        case 'page':
          delete post.parent;
          delete post.ancestors;
          break;

        default: break;
      }

      const postString = JSON.stringify(post);
      let foundWords = [];
      let count = 0;

      keywords.forEach( keyword => {
        const re = new RegExp(`([\\w\\s]*)\\b${_.escapeRegExp(keyword)}[\\b]?([\\w\\s]*)`, 'gi');
        const found = postString.match(re);
        if ( Array.isArray(found) ) {
          count += 1;
          foundWords = [ ...foundWords, ...found ];
        };
      } );

      if (count) {
        foundWords = [ ...new Set(foundWords) ]; // Remove array duplicates.
        keywords.forEach( keyword => {
          foundWords = foundWords.map( word => {
            const re = new RegExp(`\\b${_.escapeRegExp(keyword)}[\\b]?`, 'gi');
            return word.replace(re, `<u>${keyword}</u>`);
          } );
        } );

        results.push({ ...post, count, foundWords });
      }
    } );

    return (
      <div className={classes.root}>
        <TextField
          placeholder="Search..."
          className={classNames(classes.textField, isFocused && classes.textFieldFocus)}
          value={search}
          onChange={this.handleChange('search')}
          onKeyUp={this.handleKeyUp()}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onFocus={() => this.handleFocus()}
          onBlur={() => this.handleBlur()}
        />
        {showResults && (
          <Paper className={classes.result}>
            {results.length ? (
              <List disablePadding>
                {results.sort( (a, b) => b.count - a.count ).map( post => {
                  const isPost = post.type === 'post' || post.type === 'page';
                  let foundCount = 0;

                  return (
                    <ListItem key={post._id} className={classes.listItem} divider
                      component={Link}
                      to={getPermalink(domain, post.type, post, true)}
                      onClick={() => this.handleClick()}
                    >
                      <Typography color="textSecondary">
                        <span className={classes.title}>{isPost ? post.title : post.name}</span> {post.type}
                      </Typography>
                      <Typography component="p" className={classes.foundWords}>
                        {post.foundWords && post.foundWords.map( word => {
                          ++foundCount;
                          return <span
                            key={`${post._id}-${foundCount}`}
                            dangerouslySetInnerHTML={{ __html: `${word} ...` }}
                          />;
                        } )}
                      </Typography>
                    </ListItem>
                  );
                } )}
              </List>
            ) : (
              <Typography variant="caption" align="center" className={classes.noResult}>
                Your search did not match any documents.
              </Typography>
            )}
          </Paper>
        )}
      </div>
    );
  }
}

Search.propTypes = {
  classes: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  posts: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  fetchPosts: PropTypes.func.isRequired,
};

function mapStateToProps({ posts, categories, tags, pages, info }) {
  posts = _.omitBy( posts, (value, key) => ( value.status !== 'publish' ) );
  pages = _.omitBy( pages, (value, key) => ( value.status !== 'publish' ) );

  return { info, posts, categories, tags, pages };
}

export default connect(mapStateToProps, { fetchPosts })(
  withStyles(styles)(Search)
);
