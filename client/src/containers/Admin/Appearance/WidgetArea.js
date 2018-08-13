import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Paper, ListSubheader, List } from '@material-ui/core';
import { WidgetTypes } from './Constants';
import { DropTarget } from 'react-dnd';
import { orderBy } from 'lodash';
import { moveWidget, saveMovedWidget } from '../../../actions/fetchSite';

import SortableWidget from './SortableWidget';

const styles = theme => ({
  root: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.unit,
  },
  rootIsOver: {
    backgroundColor: theme.palette.action.hover,
  },
});

const widgetAreaTarget = {
  hover(props, monitor, component) {
    const dragItem = monitor.getItem();

    if ( props.list.some(e => e._id === dragItem.data._id) ) {
      return;
    }

    props.moveWidget({
      domain: props.domain,
      data: dragItem.data,
    }, {
      domain: props.domain,
      area: props.area,
      data: { order: 1 },
    });
  },
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    const dragItem = monitor.getItem();
    props.saveMovedWidget(props.area, dragItem.data);
  },
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class WidgetArea extends Component {
  render() {
    const { area, header, list, connectDropTarget, isOver, classes } = this.props;

    return connectDropTarget(
      <div>
        <Paper className={classNames(classes.root, isOver && classes.rootIsOver)}>
          <List
            component="nav"
            subheader={<ListSubheader component="div">{header}</ListSubheader>}
          >
            {orderBy(list, 'order').map(el => {
              const id = `${el.type}-${el.order}`;
              return <SortableWidget key={id} area={area} data={el} />;
            })}
          </List>
        </Paper>
      </div>
    );
  }
}

WidgetArea.propTypes = {
  classes: PropTypes.object.isRequired,
  area: PropTypes.string.isRequired,
  header: PropTypes.string,
  list: PropTypes.array.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
  domain: PropTypes.string.isRequired,
  moveWidget: PropTypes.func.isRequired,
  saveMovedWidget: PropTypes.func.isRequired,
};

function mapStateToProps({ info: { domain } }) {
  return { domain };
}

export default connect(mapStateToProps, { moveWidget, saveMovedWidget })(
  DropTarget(WidgetTypes.MOVE, widgetAreaTarget, collect)(
    withStyles(styles)(WidgetArea)
  )
);
