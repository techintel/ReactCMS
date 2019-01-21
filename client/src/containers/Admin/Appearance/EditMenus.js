import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm, startSubmit, stopSubmit } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, Button, List, TextField } from '@material-ui/core';
import _ from 'lodash';
import { renderTextField, idNameToValueLabel, hasBeenText } from '../../../utils';
import { fetchPosts } from '../../../actions/fetchPosts';
import { editMenu, deleteMenu } from '../../../actions/fetchSite';
import { openSnackbar } from '../../../actions/openSnackbar';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import { textFieldButtonStyle } from '../../../assets/jss/styles';

import AddMenuItem from '../../../components/Menus/AddMenuItem';
import MenuItems from '../../../components/Menus/MenuItems';
import CheckboxGroup from '../../../components/Selections/CheckboxGroup';
import SelectField from '../../../components/Selections/SelectField';
import Loading from '../../../components/Loading';

const styles = theme => ({
  ...textFieldButtonStyle(theme),

  root: {
    flexGrow: 1,
    padding: theme.spacing.unit,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
  },
  menuSelection: {
    width: 250,
  },
  customTextField: {
    margin: theme.spacing.unit,
  },
});

const validate = values => {
  const errors = {};
  const requiredFields = [ 'name' ];

  requiredFields.forEach(field => {
    if (!values[field])
      errors[field] = 'Required';
  });

  return errors;
}

class EditMenus extends Component {
  state = {
    editingMenu: null,
    menuId: null,
    menuInitialized: false,
    openName: null,
    addItemName: null,
    selectedPages: {},
    selectedPosts: {},
    selectedCategories: {},
    customLinkUrl: '',
    customLinkText: '',
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;

    const { collectionPrefix } = this.props;
    const types = ['page', 'post', 'category'];
    let typesClone = [...types];

    types.forEach( val => {
      this.props.fetchPosts( val, { collectionPrefix },
        () => { // Initialize upon fetching completion of the post types
          typesClone = typesClone.filter(e => e !== val);
          if (!typesClone.length) this.initForm();
        }
      );
    } );
  }

  initForm(site) {
    const { menuId, menuInitialized } = this.state;
    const { menus } = site ? site : this.props.site;
    const length = menus.length;
    let editingMenu;

    if (length) {
      editingMenu = menuInitialized ?
        menus.find(el => el._id === menuId) :
        menus[length - 1];
    } else {
      editingMenu = null;
    }

    let newState = { editingMenu };
    if (!menuInitialized) newState.menuInitialized = true;

    if ( this._isMounted ) this.setState(newState);
    this.props.initialize(editingMenu);
  }

  onDelete = editingMenu => () => {
    this.props.handleSubmit(this.submit({
      ...editingMenu,
      type: 'delete',
    }));
  }

  onSubmit = values => {
    const { editingMenu } = this.state;
    if (editingMenu) values.items = editingMenu.items;

    this.submit(values);
  }

  stopSubmit() { this.props.stopSubmit('EditMenu'); }

  submit = values => {
    this.props.startSubmit('EditMenu');

    switch (values.type) {
      case 'delete':
        return this.props.deleteMenu( values._id, site => {
          this.initForm(site);
          this.props.openSnackbar(hasBeenText('Menu item', values.name, 'deleted'));
          stopSubmit();
        } );
      default:
        const { editingMenu, addItemName } = this.state;
        let newState = { menuId: editingMenu ? editingMenu._id : null };

        return this.props.editMenu( values, site => {

          if (addItemName) {
            if (addItemName === 'Custom Links') {
              Object.assign(newState, {
                customLinkUrl: '',
                customLinkText: '',
              });
            } else {
              Object.assign(newState, {
                [`selected${addItemName}`]: {},
                addItemName: null,
              });
            }
          }

          const { menus } = site;
          if (!newState.menuId) newState.menuId = menus[menus.length - 1]._id;
          this.setState(newState);

          this.initForm(site);
          this.props.openSnackbar(hasBeenText('Menu item', values.name, 'saved'));
          stopSubmit();
        } );
    }
  }

  onOpen = name => {
    this.setState({ openName: this.state.openName === name ? null : name });
  }

  onAdd = name => {
    const { pages, posts, categories, handleSubmit } = this.props;
    const { editingMenu, selectedPages, selectedPosts, selectedCategories, customLinkText, customLinkUrl } = this.state;
    let postType, postList, selectedList;

    switch (name) {
      case 'Pages':
        postType = 'page';
        postList = pages;
        selectedList = selectedPages;
        break;
      case 'Categories':
        postType = 'category';
        postList = categories;
        selectedList = selectedCategories;
        break;
      case 'Custom Links':
        postType = 'custom';
        postList = null;
        selectedList = null;
        break;
      default:
        postType = 'post';
        postList = posts;
        selectedList = selectedPosts;
    }

    let order = editingMenu.items.length;
    let addingItems;

    if (postType === 'custom') {
      addingItems = [{
        parent: null,
        order: ++order,
        label: customLinkText,
        type: postType,
        guid: customLinkUrl,
      }];
    } else {
      addingItems = _.filter( postList, post => {
        let returnFilter = false;

        _.forEach( selectedList, (itemLabel, itemId) => {
          if (itemLabel && post._id === itemId) {
            returnFilter = true;
            return false;
          }
        } );

        return returnFilter;
      } );

      addingItems = _.map( addingItems, item => ({
        parent: null,
        order: ++order,
        label: item.title !== undefined ? item.title : item.name,
        type: postType,
        guid: item._id,
      }) );
    }

    const editedMenu = { ...editingMenu, items: [...editingMenu.items, ...addingItems] };
    handleSubmit(this.submit( editedMenu ));

    this.setState({ addItemName: name });
  }

  onRemove = _id => {
    const { editingMenu } = this.state;
    let items = JSON.parse(JSON.stringify(editingMenu.items)); // Deep clone items
    const deletedItem = items.find( el => el._id === _id );

    items = items.filter( el => el._id !== _id ); // Exclude the deleting item
    items.filter(item => item.parent === deletedItem.parent) // Deleting item's siblings
      .sort((a, b) => a.order - b.order) // Sort array item positions based on `order` properties
      .forEach((o, i, a) => { // Order the items without the deleting item
        o.order = i + 1;
        a[i] = o;
      });

    let unexistedParentingItemsDeleted = false;
    let newItems = items = items.filter( item => item.parent !== _id ); // Items without the deleting parent

    do {
      // eslint-disable-next-line no-loop-func
      newItems = newItems.filter( item =>
        !item.parent ? true : // Include if the item doesn't have any parent
          newItems.some( itemDouble => item.parent === itemDouble._id ) // Include if the item parent exists
      );

      if ( newItems.length === items.length ) // Mark deleted if no item to delete
        unexistedParentingItemsDeleted = true;

      items = newItems; // Refilter newItems parents for the previously deleted items
    } while (!unexistedParentingItemsDeleted);

    this.setState({ editingMenu: { ...editingMenu, items } });
  }

  onCancel = _id => {
    const { menus } = this.props.site;
    const { editingMenu } = this.state;

    const origMenuIndex = menus.findIndex(el => el._id === editingMenu._id);
    const origItemIndex = menus[origMenuIndex].items.findIndex(el => el._id === _id);

    let items = JSON.parse(JSON.stringify(editingMenu.items));
    const currentItemIndex = items.findIndex(el => el._id === _id);

    delete menus[origMenuIndex].items[origItemIndex].parent;
    delete menus[origMenuIndex].items[origItemIndex].order;
    items[currentItemIndex] = { ...items[currentItemIndex], ...menus[origMenuIndex].items[origItemIndex] };

    this.setState({ editingMenu: { ...editingMenu, items } });
  }

  onField = (prop, _id, val) => {
    const { editingMenu } = this.state;

    let items = JSON.parse(JSON.stringify(editingMenu.items));
    const index = items.findIndex(el => el._id === _id);
    items[index][prop] = val;

    this.setState({ editingMenu: { ...editingMenu, items } });
  }

  moveItem = (drag, hover) => {
    const { editingMenu } = this.state;
    let items = JSON.parse(JSON.stringify(editingMenu.items));

    this.removeDragItem(items, drag.data);

    items.filter(obj => obj.parent === hover.data.parent)
      .forEach((o, i, a) => { // Increase the order of each coming higher-order sibling of the moving item
        if (o.order >= hover.data.order) {
          o.order = o.order + 1;
          a[i] = o;
        }
      });
    items.push({ ...drag.data, order: hover.data.order, parent: hover.data.parent });

    this.setState({ editingMenu: { ...editingMenu, items } });
  }

  moveAsChild = (drag, hover) => {
    const { editingMenu } = this.state;
    let items = JSON.parse(JSON.stringify(editingMenu.items));

    this.removeDragItem(items, drag.data);

    items.push({ ...drag.data, parent: hover.parent });
    items.filter(obj => obj.parent === hover.parent)
      .sort((a, b) => a.order - b.order) // Reorder the moving item with its new siblings
      .forEach((o, i, a) => {
        o.order = i + 1;
        a[i] = o;
      });

    this.setState({ editingMenu: { ...editingMenu, items } });
  }

  removeDragItem(items, dragData) {
    const dragIndex = items.findIndex(el => el._id === dragData._id);
    if (dragIndex !== -1) {
      items.splice(dragIndex, 1); // Remove the dragging item
      items.filter(obj => obj.parent === dragData.parent)
        .sort((a, b) => a.order - b.order) // Reorder the siblings without the dragging item
        .forEach((o, i, a) => {
          o.order = i + 1;
          a[i] = o;
        });
    }
  }

  handleCustomLinkUrl = e => { this.setState({ customLinkUrl: e.target.value }); }
  handleCustomLinkText = e => { this.setState({ customLinkText: e.target.value }); }

  onMenuItemSelect = (name, vals) => {
    const state = {};
    vals.forEach(val => state[val] = true);
    this.setState({ [`selected${name}`]: state });
  }

  render() {
    const { posts, categories, pages, handleSubmit, submitting, invalid, classes, site: { menus } } = this.props;
    const { editingMenu, menuId, menuInitialized, openName, customLinkUrl, customLinkText } = this.state;
    const isEditing = (editingMenu);
    const addMenuItemDisabled = submitting || !isEditing;
    const createMenuDisabled = submitting || !menuId;
    const saveDisabled = submitting || invalid;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>

          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <SelectField
                input={{
                  value: editingMenu ? editingMenu._id : '',
                  onChange: _id => {
                    this.setState({ menuId: _id });
                    setTimeout(() => this.initForm());
                  },
                }}
                options={[ {
                  value: '',
                  label: '(creating menu)'
                }, ...idNameToValueLabel(menus) ]}
                meta={{ submitting }}
                className={classes.menuSelection}
              />
              <Button onClick={() => {
                this.setState({ editingMenu: null });
                this.props.initialize();
              }} disabled={createMenuDisabled}>
                create a new menu
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <form onSubmit={handleSubmit(this.onSubmit)}>

              <Grid container spacing={24}>
                <Grid item xs={12} sm={4}>
                  <Paper className={classes.paper}>
                    <List>

                      <AddMenuItem
                        name="Pages"
                        openName={openName}
                        onOpen={this.onOpen}
                        onAdd={this.onAdd}
                        disabled={addMenuItemDisabled}
                      >
                        <CheckboxGroup
                          input={{
                            value: [],
                            onChange: vals => this.onMenuItemSelect("Pages", vals),
                          }}
                          meta={{ submitting }}
                          options={idNameToValueLabel(pages)}
                          selectedValues={this.state.selectedPages}
                        />
                      </AddMenuItem>

                      <AddMenuItem
                        name="Posts"
                        openName={openName}
                        onOpen={this.onOpen}
                        onAdd={this.onAdd}
                        disabled={addMenuItemDisabled}
                      >
                        <CheckboxGroup
                          input={{
                            value: [],
                            onChange: vals => this.onMenuItemSelect("Posts", vals),
                          }}
                          meta={{ submitting }}
                          options={idNameToValueLabel(posts)}
                          selectedValues={this.state.selectedPosts}
                        />
                      </AddMenuItem>

                      <AddMenuItem
                        name="Custom Links"
                        openName={openName}
                        onOpen={this.onOpen}
                        onAdd={this.onAdd}
                        disabled={addMenuItemDisabled}
                      >
                        <div>
                          <TextField label="URL" value={customLinkUrl} onChange={this.handleCustomLinkUrl} disabled={submitting} fullWidth className={classes.customTextField} />
                          <TextField label="Link Text" value={customLinkText} onChange={this.handleCustomLinkText} disabled={submitting} fullWidth className={classes.customTextField} />
                        </div>
                      </AddMenuItem>

                      <AddMenuItem
                        name="Categories"
                        openName={openName}
                        onOpen={this.onOpen}
                        onAdd={this.onAdd}
                        disabled={addMenuItemDisabled}
                      >
                        <CheckboxGroup
                          input={{
                            value: [],
                            onChange: vals => this.onMenuItemSelect("Categories", vals),
                          }}
                          meta={{ submitting }}
                          options={idNameToValueLabel(categories)}
                          selectedValues={this.state.selectedCategories}
                        />
                      </AddMenuItem>

                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper className={classes.paper}>

                    {!menuInitialized ? <Loading /> : (
                      <div>
                        <Field
                          name="name"
                          component={renderTextField}
                          startAdornment="Menu Name:"
                          className={classes.groupTextField}
                          fullWidth
                        />
                        <Button
                          type="submit"
                          disabled={saveDisabled}
                          variant="contained"
                          color="primary"
                          className={classes.groupButton}
                          fullWidth
                        >
                          {isEditing ? 'Save' : 'Create'} Menu
                        </Button>
                      </div>
                    )}

                    {isEditing ? (
                      <div>
                        <MenuItems
                          parent={null}
                          editingMenu={editingMenu}
                          onRemove={this.onRemove}
                          onCancel={this.onCancel}
                          onField={this.onField}
                          moveItem={this.moveItem}
                          moveAsChild={this.moveAsChild}
                        />
                        <div>
                          <Button
                            color="secondary"
                            onClick={this.onDelete(editingMenu)}
                            disabled={submitting}
                          >
                            Delete
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saveDisabled}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : null}

                  </Paper>
                </Grid>
              </Grid>

            </form>
          </Grid>

        </Grid>
      </div>
    );
  }
}

EditMenus.propTypes = {
  classes: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
  collectionPrefix: PropTypes.string.isRequired,
  posts: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
};

function mapStateToProps({ sites, info, posts, categories, pages }) {
  posts = _.omitBy( posts, item => ( item.status !== 'publish' ) );
  pages = _.omitBy( pages, item => ( item.status !== 'publish' ) );

  return {
    posts, categories, pages,
    site: sites[info.domain],
    collectionPrefix: info.collectionPrefix,
  };
}

export default reduxForm({
  form: 'EditMenu',
  validate
})(
  DragDropContext(HTML5Backend)(
    connect(mapStateToProps, { fetchPosts, editMenu, deleteMenu, openSnackbar, startSubmit, stopSubmit })(
      withStyles(styles)(EditMenus)
    )
  )
);
