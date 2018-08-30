import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { Paper, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { WidgetTypes } from './Constants';
import { AVAILABLE_WIDGETS } from './Widgets/';
import { DropTarget, DragSource } from 'react-dnd';
import { flow } from 'lodash';
import { moveWidget, saveMovedWidget } from '../../../actions/fetchSite';
import { openSnackbar } from '../../../actions/openSnackbar';
import { hasBeenText } from '../../../utils';

const styles = theme => ({
  root: {
    direction: 'rtl',
  },
  paper: {
    margin: theme.spacing.unit,
    direction: 'ltr',

    [theme.breakpoints.up('md')]: {
      width: '94%',
      marginLeft: 'auto',
      marginRight: 'auto',

      transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
  },
  paperOpen: {
    [theme.breakpoints.up('md')]: {
      width: '40vw',
      zIndex: 1200,
      position: 'relative',
    },
  },
  listItem: {
    backgroundColor: theme.palette.background.default,
    border: `solid 1px ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  listItemText: {
    overflowX: 'hidden',
  }
});

const widgetTarget = {
  hover(props, monitor, component) {
    const drag = monitor.getItem();
    const hover = props;

    // Don't replace items with themselves
    if ( drag.data._id === hover.data._id ) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = (findDOMNode(
      component,
    )).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = (clientOffset).y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (drag.data.order < hover.data.order && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (drag.data.order > hover.data.order && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveWidget(drag, hover);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().data.order = hover.data.order;
  },
  drop(props, monitor, component) {
    props.saveMovedWidget(props.area, props.data, () => {
      props.openSnackbar(hasBeenText(props.data.type, 'widget', 'sorted'));
    });
  },
};

const widgetSource = {
  beginDrag(props) {
    return props;
  },
};

class SortableWidget extends Component {
  state = {};

  handleClick = openId => {
    this.setState(state => ({ [openId]: !state[openId] }));
  };

  render() {
    const { area, data, connectDragSource, connectDropTarget, classes } = this.props;
    const foundWidget = AVAILABLE_WIDGETS.find( widget => widget.type === data.type );
    const formId = `${data.type}-${data.order}`;
    const openId = `open_${formId}`;

    return ( connectDragSource && connectDropTarget &&
      connectDragSource(
        connectDropTarget(
          <div className={classes.root}>
            <Paper className={classNames(classes.paper, this.state[openId] && classes.paperOpen)}>
              <ListItem button disableRipple onClick={() => this.handleClick(openId)} className={classes.listItem}>
                <ListItemText primary={foundWidget.name} className={classes.listItemText} />
                {this.state[openId] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state[openId]} timeout="auto" unmountOnExit>
                <foundWidget.Component form={formId} area={area} data={data} />
              </Collapse>
            </Paper>
          </div>
        ),
      )
    );
  }
}

SortableWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  area: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  domain: PropTypes.string.isRequired, // Needed for reducer: `stateDeepCopy[hover.domain][hover.area]`
  moveWidget: PropTypes.func.isRequired,
  saveMovedWidget: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

function mapStateToProps({ info: { domain } }) {
  return { domain };
}

export default connect(mapStateToProps, { moveWidget, saveMovedWidget, openSnackbar })(
  flow(
    DragSource(
      WidgetTypes.MOVE,
      widgetSource,
      (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
      }),
    ),
    DropTarget(WidgetTypes.MOVE, widgetTarget, (connect) => ({
      connectDropTarget: connect.dropTarget(),
    }))
  )( withStyles(styles)(SortableWidget) )
);
