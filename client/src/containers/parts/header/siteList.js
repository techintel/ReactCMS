import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { Domain } from '@material-ui/icons';
import { Divider } from 'material-ui';

class SiteList extends Component {
  renderItems() {
    return map(this.props.sites, site => {
      const { title, _id: { domain } } = site;

      return (
        <ListItem button component="a" href={`/${domain}`} key={domain}>
          <ListItemIcon>
            <Domain />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>
      );
    });
  }

  render () {
    return (
      <div>
        <Divider />
        <List>
          {this.renderItems()}
        </List>
      </div>
    );
  }
}

function mapStateToProps({ sites }) {
  return { sites };
}

export default connect(mapStateToProps)(SiteList);
