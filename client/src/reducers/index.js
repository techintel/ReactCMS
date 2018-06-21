import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import InfoReducer from './reducer_info';
import SitesReducer from './reducer_sites';
import AuthReducer from './reducer_auth';
import SnackbarReducer from './reducer_snackbar';
import PostsReducer from './reducer_posts';
import PagesReducer from './reducer_pages';
import CategoriesReducer from './reducer_categories';
import TagsReducer from './reducer_tags';

const rootReducer = combineReducers({
  form: formReducer,
  info: InfoReducer,
  sites: SitesReducer,
  auth: AuthReducer,
  snackbar: SnackbarReducer,
  posts: PostsReducer,
  pages: PagesReducer,
  categories: CategoriesReducer,
  tags: TagsReducer,
});

export default rootReducer;
