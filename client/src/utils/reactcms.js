import React from 'react';
import _ from 'lodash';
import SelectField from '../components/selectField';

import {
  EDIT_OTHERS_POSTS,
  EDIT_PUBLISHED_POSTS,
  DELETE_OTHERS_POSTS,
  DELETE_PUBLISHED_POSTS
} from '../containers/capabilities';

function isCapable(auth, author, capability_others, capability_published) {
  let isEnabled = false;

  if ( _.includes(capability_others, auth.user.role) ) {
    isEnabled = true;
  } else if ( _.includes(capability_published, auth.user.role) ) {
    if (author._id === auth.user.id) {
      isEnabled = true;
    }
  }

  return isEnabled;
}

export function isUserCapable(capabilityName, auth, author) {
  switch (capabilityName) {
    case 'editPost':
      return isCapable(auth, author, EDIT_OTHERS_POSTS, EDIT_PUBLISHED_POSTS);
    case 'deletePost':
      return isCapable(auth, author, DELETE_OTHERS_POSTS, DELETE_PUBLISHED_POSTS);
    default:
      return;
  }
}

export const renderSelectField = ({
  input,
  meta: { submitting },
  ...custom
}) => (
  <SelectField
    input={input}
    disabled={submitting}
    {...custom}
  />
);

export function onEditPost(post_id, props) {
  const { history, info: { domain } } = props;
  history.push(`${domain ? '/' : ''}${domain}/admin/post/${post_id}`);
}
