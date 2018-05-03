import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import InfoReducer from './reducer_info';
import SitesReducer from './reducer_sites';
import AuthReducer from './reducer_auth';
import PostsReducer from './reducer_posts';

const rootReducer = combineReducers({
  form: formReducer,
  info: InfoReducer,
  sites: SitesReducer,
  auth: AuthReducer,
  posts: PostsReducer,
});

export default rootReducer;
