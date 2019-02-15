import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import Head from '../../Parts/Head';
import WidgetArea from './WidgetArea';
import AvailableWidgets from '../../../components/Lists/AvailableWidgets';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    backgroundColor: theme.palette.background.default
  }
});

class Widgets extends Component {
  render() {
    const {
      classes,
      site: {
        header,
        top_content,
        bottom_content,
        left_sidebar,
        right_sidebar,
        footer
      }
    } = this.props;

    return (
      <div className={classes.root}>
        <Head name="Widgets" />
        <Grid container spacing={16}>
          <Grid item xs={12} sm={3} md={2}>
            <AvailableWidgets />
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Grid container spacing={8}>
              <Grid item xs={12} md={12}>
                <WidgetArea area="header" header="Header" list={header} />
              </Grid>

              <Grid item xs={12} md={3}>
                <WidgetArea
                  area="left_sidebar"
                  header="Left Sidebar"
                  list={left_sidebar}
                  expandable
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <WidgetArea
                  area="top_content"
                  header="Top Content"
                  list={top_content}
                  expandable
                />

                <Paper className={classes.paper}>
                  <Typography variant="subtitle2" gutterBottom>
                    Page Content
                  </Typography>
                  <Typography>
                    Any main content, such as page, blog, posts or tagged blogs.
                  </Typography>
                </Paper>

                <WidgetArea
                  area="bottom_content"
                  header="Bottom Content"
                  list={bottom_content}
                  expandable
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <WidgetArea
                  area="right_sidebar"
                  header="Right Sidebar"
                  list={right_sidebar}
                  expandable
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <WidgetArea area="footer" header="Footer" list={footer} />
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
  site: PropTypes.object.isRequired
};

function mapStateToProps({ sites, info: { domain } }) {
  return { site: sites[domain] };
}

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps)(withStyles(styles)(Widgets))
);
