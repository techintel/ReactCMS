import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';

import WidgetArea from './WidgetArea';
import AvailableWidgets from '../../../components/Lists/AvailableWidgets';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
});

class Widgets extends Component {
  render() {
    const { classes, site: {
      content, left_sidebar, right_sidebar, footer
    } } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12} sm={3} md={2}>
            <AvailableWidgets />
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Grid container spacing={8}>

              <Grid item xs={12} md={3}>
                <WidgetArea area="left_sidebar" header="Left Sidebar" list={left_sidebar} />
              </Grid>

              <Grid item xs={12} md={6}>
                <WidgetArea area="content" header="Content" list={content} />
                <WidgetArea area="footer" header="Footer" list={footer} />
              </Grid>

              <Grid item xs={12} md={3}>
                <WidgetArea area="right_sidebar" header="Right Sidebar" list={right_sidebar} />
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Widgets.propTypes = {
  classes: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
};

function mapStateToProps({ sites, info: { domain } }) {
  return { site: sites[domain] };
}

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps)(
    withStyles(styles)(Widgets)
  )
);
