import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText } from '@material-ui/core';
import { WidgetTypes } from './Constants';
import { DragSource } from 'react-dnd';

const styles = theme => ({
  listItem: {
    marginBottom: theme.spacing.unit,
    backgroundColor: theme.palette.background.default,
    border: `solid 1px ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    cursor: 'grab',
  },
});

const widgetSource = {
  beginDrag(props) {
    return {
      domain: props.domain,
      data: {
        type: props.type,
        order: 1,
      },
    };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
  }
}

class DraggableWidget extends Component {
  render() {
    const { type, name, connectDragSource, classes } = this.props;

    return connectDragSource(
      <div type={type}>
        <ListItem button disableRipple className={classes.listItem}>
          <ListItemText primary={name} />
        </ListItem>
      </div>
    );
  }
}

DraggableWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  domain: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

function mapStateToProps({ info: { domain } }) {
  return { domain };
}

export default connect(mapStateToProps)(
  DragSource(WidgetTypes.MOVE, widgetSource, collect)(
    withStyles(styles)(DraggableWidget)
  )
);
